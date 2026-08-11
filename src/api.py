from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import faiss
import pickle
import joblib
import os
from sentence_transformers import SentenceTransformer
from google import genai
from dotenv import load_dotenv

cleaned_df = pd.read_csv('../data/processed/cleaned.csv')

load_dotenv()

app = FastAPI()

# Allow React frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load everything once at startup
print("Loading models and vector store...")

ridge = joblib.load('../models/ridge_final.pkl')
scaler = joblib.load('../models/scaler.pkl')

index = faiss.read_index('../data/vector_store/houses.index')
with open('../data/vector_store/documents.pkl', 'rb') as f:
    documents = pickle.load(f)

embedder = SentenceTransformer('all-MiniLM-L6-v2')
X_train = pd.read_csv('../data/processed/X_train.csv')
feature_cols = X_train.columns.tolist()

gemini_client = genai.Client(api_key=os.environ['GEMINI_API_KEY'])

print("All loaded — API ready")

# Input schema
class PropertyInput(BaseModel):
    gr_liv_area: int
    overall_qual: int
    year_built: int
    full_bath: int
    bedroom_abvgr: int
    garage_cars: int
    total_bsmt_sf: int
    asking_price: int
    neighborhood: str = "NAmes"
    kitchen_qual: str = "TA"


def predict_price(inputs: PropertyInput) -> float:
    # Work on a copy of the full dataset
    df = cleaned_df.copy()
    
    # Modify the first row with user inputs
    df.loc[0, 'Gr Liv Area'] = inputs.gr_liv_area
    df.loc[0, 'Overall Qual'] = inputs.overall_qual
    df.loc[0, 'Year Built'] = inputs.year_built
    df.loc[0, 'Full Bath'] = inputs.full_bath
    df.loc[0, 'Bedroom AbvGr'] = inputs.bedroom_abvgr
    df.loc[0, 'Garage Cars'] = inputs.garage_cars
    df.loc[0, 'Total Bsmt SF'] = inputs.total_bsmt_sf
    df.loc[0, 'Neighborhood'] = inputs.neighborhood
    df.loc[0, 'Kitchen Qual'] = inputs.kitchen_qual

    # Drop target
    df = df.drop(columns=['SalePrice'], errors='ignore')

    # Ordinal encoding
    quality_map = {'Ex': 5, 'Gd': 4, 'TA': 3, 'Fa': 2, 'Po': 1, 'No': 0}
    ordinal_cols = [
        'Exter Qual', 'Exter Cond', 'Bsmt Qual', 'Bsmt Cond',
        'Heating QC', 'Kitchen Qual', 'Fireplace Qu',
        'Garage Qual', 'Garage Cond'
    ]
    for col in ordinal_cols:
        if col in df.columns:
            df[col] = df[col].map(quality_map)

    df['Bsmt Exposure'] = df['Bsmt Exposure'].map(
        {'Gd': 4, 'Av': 3, 'Mn': 2, 'No': 1, 'no': 0}
    )
    df['Garage Finish'] = df['Garage Finish'].map(
        {'Fin': 3, 'RFn': 2, 'Unf': 1, 'No': 0}
    )
    df['BsmtFin Type 1'] = df['BsmtFin Type 1'].map(
        {'GLQ': 6, 'ALQ': 5, 'BLQ': 4, 'Rec': 3, 'LwQ': 2, 'Unf': 1, 'No': 0}
    )
    df['BsmtFin Type 2'] = df['BsmtFin Type 2'].map(
        {'GLQ': 6, 'ALQ': 5, 'BLQ': 4, 'Rec': 3, 'LwQ': 2, 'Unf': 1, 'No': 0}
    )

    # Drop identifiers
    df = df.drop(columns=['Order', 'PID', 'Mo Sold', 'Yr Sold'], errors='ignore')

    # One-hot encode against full dataset
    nominal_cols = df.select_dtypes(include='str').columns.tolist()
    df = pd.get_dummies(df, columns=nominal_cols, drop_first=True)

    # Align columns
    df = df.reindex(columns=feature_cols, fill_value=0)

    # Scale
    numeric_cols = X_train.select_dtypes(include='number').columns.tolist()
    df[numeric_cols] = scaler.transform(df[numeric_cols])

    # Predict only for row 0
    log_price = ridge.predict(df.iloc[[0]])[0]
    return float(np.expm1(log_price))

def retrieve_comps(inputs: PropertyInput) -> list:
    query = (
        f"{inputs.bedroom_abvgr} bedroom house "
        f"{inputs.gr_liv_area} sq ft "
        f"Overall Quality {inputs.overall_qual} "
        f"built {inputs.year_built} "
        f"{inputs.garage_cars} car garage "
        f"neighborhood {inputs.neighborhood}"
    )
    query_embedding = embedder.encode([query]).astype('float32')
    distances, indices = index.search(query_embedding, k=5)

    return [
        {'rank': i + 1, 'description': documents[idx]}
        for i, idx in enumerate(indices[0])
    ]

def generate_strategy(
    inputs: PropertyInput,
    predicted_price: float,
    comps: list
) -> str:
    comps_text = "\n\n".join([
        f"Comp {c['rank']}: {c['description']}"
        for c in comps
    ])

    prompt = f"""You are an expert real estate negotiation advisor.

Property: {inputs.bedroom_abvgr} bed, {inputs.full_bath} bath, 
{inputs.gr_liv_area} sq ft, built {inputs.year_built}, 
Overall Quality {inputs.overall_qual}/10, 
{inputs.garage_cars}-car garage, {inputs.total_bsmt_sf} sq ft basement.

Asking price: ${inputs.asking_price:,}
ML predicted fair value: ${predicted_price:,.0f}
Difference: ${inputs.asking_price - predicted_price:,.0f} \
({'above' if inputs.asking_price > predicted_price else 'below'} predicted)

Comparable sales:
{comps_text}

Provide:
1. Recommended offer price with justification
2. Key negotiation leverage points from these comps
3. Negotiation strategy (initial offer, concessions, walk-away price)
4. Red flags or strengths in this pricing

Ground every recommendation in the comparable sales data."""

    response = gemini_client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt
    )
    return response.text

@app.post("/analyze")
async def analyze_property(inputs: PropertyInput):
    predicted_price = predict_price(inputs)
    comps = retrieve_comps(inputs)
    strategy = generate_strategy(inputs, predicted_price, comps)

    return {
        "predicted_price": round(predicted_price),
        "asking_price": inputs.asking_price,
        "difference": round(inputs.asking_price - predicted_price),
        "comps": comps,
        "strategy": strategy
    }

@app.get("/health")
async def health():
    return {"status": "ok"}