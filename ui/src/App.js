import React, { useState } from "react";

function App() {
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!company || !location) return;
    setLoading(true);
    setResults([]);

    try {
      const res = await fetch("http://localhost:5000/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, location }),
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      alert("Scraping failed: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>LinkedIn Vision Scraper</h1>
      <input
        placeholder="Company Name"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        style={{ padding: 10, marginRight: 10 }}
      />
      <input
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        style={{ padding: 10, marginRight: 10 }}
      />
      <button onClick={handleSubmit} style={{ padding: 10 }}>Scrape</button>

      {loading && <p>🔄 Scraping in progress...</p>}

      {results?.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h2>Results</h2>
          <ul>
            {results.map((r, idx) => (
              <li key={idx}>
                <strong>{r.name}</strong> - {r.role || r.title} @ {r.company}<br />
                📍 {r.location} <br />
                🔗 <a href={r.linkedinSearchLink} target="_blank" rel="noopener noreferrer">View on LinkedIn</a>
                <hr />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
