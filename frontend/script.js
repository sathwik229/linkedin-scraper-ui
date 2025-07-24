// Determine backend URL based on environment
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const backendBase = isLocal 
  ? 'http://localhost:5000' 
  : 'https://linkedin-scraper-ui-84750544973.europe-west1.run.app';

document.getElementById("startButton").addEventListener("click", async () => {
  const company = document.getElementById("company").value.trim();

  const loading = document.getElementById("loading");
  const results = document.getElementById("results");

  if (!company) {
    alert("Please enter a company name.");
    return;
  }

  loading.style.display = "block";
  results.innerHTML = "";

  try {
    const response = await fetch(`${backendBase}/scrape`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ company }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    const data = await response.json();
    loading.style.display = "none";

    if (!data || !data.results || data.results.length === 0) {
      results.innerHTML = "<p>No results found.</p>";
      return;
    }

    const cards = data.results.map(emp => `
      <div class="card">
        <h3>${emp.name || "N/A"}</h3>
        <p><strong>Role:</strong> ${emp.role || "N/A"}</p>
        ${emp.profile_url ? `<p><a href="${emp.profile_url}" target="_blank" rel="noopener noreferrer">🔗 View LinkedIn Search</a></p>` : ""}
      </div>
    `).join("");

    results.innerHTML = cards;
  } catch (err) {
    loading.style.display = "none";
    results.innerHTML = "<p>Error occurred. Please try again later.</p>";
    console.error(err);
  }
}); 