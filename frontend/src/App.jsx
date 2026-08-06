import { useState } from "react";

const NEIGHBORHOODS = [
  "NAmes", "CollgCr", "OldTown", "Edwards", "Somerst",
  "NridgHt", "Gilbert", "Sawyer", "NWAmes", "SawyerW",
  "BrkSide", "Crawfor", "Mitchel", "NoRidge", "Timber",
  "IDOTRR", "ClearCr", "StoneBr", "SWISU", "Blmngtn",
  "MeadowV", "BrDale", "Veenker", "NPkVill", "Blueste"
];

const KITCHEN_QUALS = [
  { value: "Ex", label: "Excellent" },
  { value: "Gd", label: "Good" },
  { value: "TA", label: "Average" },
  { value: "Fa", label: "Fair" },
];

export default function App() {
  const [form, setForm] = useState({
    gr_liv_area: "",
    overall_qual: 5,
    year_built: "",
    full_bath: "",
    bedroom_abvgr: "",
    garage_cars: "",
    total_bsmt_sf: "",
    asking_price: "",
    neighborhood: "NAmes",
    kitchen_qual: "TA",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gr_liv_area: parseInt(form.gr_liv_area),
          overall_qual: parseInt(form.overall_qual),
          year_built: parseInt(form.year_built),
          full_bath: parseInt(form.full_bath),
          bedroom_abvgr: parseInt(form.bedroom_abvgr),
          garage_cars: parseInt(form.garage_cars),
          total_bsmt_sf: parseInt(form.total_bsmt_sf),
          asking_price: parseInt(form.asking_price),
          neighborhood: form.neighborhood,
          kitchen_qual: form.kitchen_qual,
        }),
      });

      if (!response.ok) throw new Error("API request failed");
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError("Something went wrong. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>ValueIQ</h1>
          <p style={styles.subtitle}>
            ML-powered home valuation with AI negotiation strategy
          </p>
        </div>

        {/* Form */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Property Details</h2>
          <div style={styles.grid}>
            <div style={styles.field}>
              <label style={styles.label}>Living Area (sq ft)</label>
              <input
                style={styles.input}
                type="number"
                name="gr_liv_area"
                value={form.gr_liv_area}
                onChange={handleChange}
                placeholder="e.g. 1800"
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Overall Quality (1-10)</label>
              <input
                style={styles.input}
                type="number"
                name="overall_qual"
                min="1"
                max="10"
                value={form.overall_qual}
                onChange={handleChange}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Year Built</label>
              <input
                style={styles.input}
                type="number"
                name="year_built"
                value={form.year_built}
                onChange={handleChange}
                placeholder="e.g. 1995"
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Full Bathrooms</label>
              <input
                style={styles.input}
                type="number"
                name="full_bath"
                value={form.full_bath}
                onChange={handleChange}
                placeholder="e.g. 2"
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Bedrooms</label>
              <input
                style={styles.input}
                type="number"
                name="bedroom_abvgr"
                value={form.bedroom_abvgr}
                onChange={handleChange}
                placeholder="e.g. 3"
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Garage Cars</label>
              <input
                style={styles.input}
                type="number"
                name="garage_cars"
                value={form.garage_cars}
                onChange={handleChange}
                placeholder="e.g. 2"
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Basement Size (sq ft)</label>
              <input
                style={styles.input}
                type="number"
                name="total_bsmt_sf"
                value={form.total_bsmt_sf}
                onChange={handleChange}
                placeholder="e.g. 900"
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Asking Price ($)</label>
              <input
                style={styles.input}
                type="number"
                name="asking_price"
                value={form.asking_price}
                onChange={handleChange}
                placeholder="e.g. 220000"
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Neighborhood</label>
              <select
                style={styles.input}
                name="neighborhood"
                value={form.neighborhood}
                onChange={handleChange}
              >
                {NEIGHBORHOODS.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Kitchen Quality</label>
              <select
                style={styles.input}
                name="kitchen_qual"
                value={form.kitchen_qual}
                onChange={handleChange}
              >
                {KITCHEN_QUALS.map((q) => (
                  <option key={q.value} value={q.value}>{q.label}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            style={loading ? styles.buttonDisabled : styles.button}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Analyzing... (this may take 30-60s)" : "Analyze Property"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={styles.error}>{error}</div>
        )}

        {/* Results */}
        {result && (
          <div>
            {/* Price Summary */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Valuation Summary</h2>
              <div style={styles.priceGrid}>
                <div style={styles.priceBox}>
                  <p style={styles.priceLabel}>ML Predicted Value</p>
                  <p style={styles.priceValue}>
                    ${result.predicted_price.toLocaleString()}
                  </p>
                </div>
                <div style={styles.priceBox}>
                  <p style={styles.priceLabel}>Asking Price</p>
                  <p style={styles.priceValue}>
                    ${result.asking_price.toLocaleString()}
                  </p>
                </div>
                <div style={{
                  ...styles.priceBox,
                  background: result.difference > 0 ? "#fee2e2" : "#dcfce7"
                }}>
                  <p style={styles.priceLabel}>Difference</p>
                  <p style={{
                    ...styles.priceValue,
                    color: result.difference > 0 ? "#dc2626" : "#16a34a"
                  }}>
                    {result.difference > 0 ? "+" : ""}
                    ${result.difference.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Comps */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Comparable Sales</h2>
              {result.comps.map((comp) => (
                <div key={comp.rank} style={styles.comp}>
                  <span style={styles.compRank}>#{comp.rank}</span>
                  <p style={styles.compText}>
                    {comp.description.replace(/\\n/g, " ").replace(/\n/g, " ")}
                  </p>
                </div>
              ))}
            </div>

            {/* Strategy */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Negotiation Strategy</h2>
              <div style={styles.strategy}>
                {result.strategy.split("\n").map((line, i) => (
                  <p key={i} style={styles.strategyLine}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    fontFamily: "'Inter', sans-serif",
    padding: "2rem 1rem",
  },
  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    marginBottom: "2rem",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "800",
    color: "#1e293b",
    margin: 0,
  },
  subtitle: {
    color: "#64748b",
    marginTop: "0.5rem",
    fontSize: "1rem",
  },
  card: {
    background: "white",
    borderRadius: "12px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  cardTitle: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 0,
    marginBottom: "1rem",
    paddingBottom: "0.5rem",
    borderBottom: "2px solid #f1f5f9",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  label: {
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#475569",
  },
  input: {
    padding: "0.6rem 0.75rem",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "0.95rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "0.85rem",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  buttonDisabled: {
    width: "100%",
    padding: "0.85rem",
    background: "#93c5fd",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "not-allowed",
  },
  error: {
    background: "#fee2e2",
    color: "#dc2626",
    padding: "1rem",
    borderRadius: "8px",
    marginBottom: "1rem",
  },
  priceGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "1rem",
  },
  priceBox: {
    background: "#f8fafc",
    borderRadius: "8px",
    padding: "1rem",
    textAlign: "center",
  },
  priceLabel: {
    fontSize: "0.8rem",
    color: "#64748b",
    fontWeight: "600",
    margin: "0 0 0.5rem 0",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  priceValue: {
    fontSize: "1.5rem",
    fontWeight: "800",
    color: "#1e293b",
    margin: 0,
  },
  comp: {
    display: "flex",
    gap: "0.75rem",
    padding: "0.75rem 0",
    borderBottom: "1px solid #f1f5f9",
    alignItems: "flex-start",
  },
  compRank: {
    background: "#2563eb",
    color: "white",
    borderRadius: "6px",
    padding: "0.2rem 0.5rem",
    fontSize: "0.8rem",
    fontWeight: "700",
    flexShrink: 0,
  },
  compText: {
    margin: 0,
    fontSize: "0.9rem",
    color: "#475569",
    lineHeight: "1.5",
  },
  strategy: {
    lineHeight: "1.8",
  },
  strategyLine: {
    margin: "0.25rem 0",
    color: "#334155",
    fontSize: "0.95rem",
  },
};