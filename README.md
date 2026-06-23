# ValueIQ

### ML-powered home valuation with AI-driven negotiation strategy

> Estimates home value from property and location data, then generates 
> negotiation strategy grounded in real comps and market conditions.

---

## Why this exists

Buyers and sellers rarely have access to the data-driven pricing and 
negotiation insight that real estate agents use internally. ValueIQ estimates 
home value using machine learning, grounds that estimate in real neighborhood 
and market context via retrieval, and generates negotiation strategy from an 
LLM reasoning over that context — not just generic advice.

## Features

- Estimates home value from property attributes (square footage, bedrooms, 
  lot size, year built) and location (neighborhood, school district)
- Surfaces the context behind each estimate — comparable sales, school 
  ratings, neighborhood trends
- Generates negotiation strategy grounded in comps and market signals rather 
  than generic tips

## Architecture

*Diagram coming soon*

The system has four stages:
1. **Data layer** — housing, school, and neighborhood data
2. **Price prediction model** — regression / gradient boosting on property + location features
3. **RAG context retrieval** — pulls comps and market signals relevant to a given property
4. **LLM negotiation engine** — generates strategy grounded in retrieved context and model output

## Tech stack

- **Modeling:** Python, scikit-learn, XGBoost, pandas
- **Data:** Ames Housing dataset (via Kaggle)
- **RAG:** *(coming — Phase 2)*
- **LLM:** *(coming — Phase 3)*
- **Backend/Frontend:** *(coming — Phase 4)*

## Data sources & disclaimers

This project uses publicly available, aggregated datasets — it does **not** 
scrape or use live Zillow listings or Zestimate data.

- Housing data: [Ames Iowa Housing Data](https://www.kaggle.com/datasets/marcopalermo/housing) via Kaggle

## Setup

```bash
git clone https://github.com/Joaco273/ValueIQ.git
cd ValueIQ
pip install -r requirements.txt
```

## Model performance

*(Will be updated after Phase 1 — baseline model results)*

| Model | RMSE | MAE | R² |
|---|---|---|---|
| Linear regression (baseline) | — | — | — |
| Random Forest | — | — | — |
| XGBoost | — | — | — |

## Roadmap

- [ ] Phase 1 — Clean dataset, train and evaluate price model
- [ ] Phase 2 — Build RAG layer for neighborhood/school context
- [ ] Phase 3 — Add LLM negotiation reasoning grounded in comps
- [ ] Phase 4 — Polish frontend, deploy live

## License

MIT — see [LICENSE](LICENSE) for details.