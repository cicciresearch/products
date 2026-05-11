document.addEventListener("DOMContentLoaded", async () => {
  const list = document.getElementById("publications-list");
  const searchInput = document.getElementById("pub-search");
  const yearFilter = document.getElementById("pub-year-filter");

  if (!list || !searchInput || !yearFilter) return;

  let publications = [];

  try {
    const response = await fetch("../../assets/data/publications.json");
    publications = await response.json();
  } catch (error) {
    list.innerHTML = "<p>Could not load publications database.</p>";
    return;
  }

  publications.sort((a, b) => b.year - a.year);

  const years = [...new Set(publications.map(pub => pub.year))].sort((a, b) => b - a);
  years.forEach(year => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearFilter.appendChild(option);
  });

  function render() {
    const query = searchInput.value.toLowerCase();
    const selectedYear = yearFilter.value;

    const filtered = publications.filter(pub => {
      const searchableText = [
        pub.title,
        pub.authors,
        pub.journal,
        pub.year,
        pub.doi,
        pub.note,
        ...(pub.tags || [])
      ].join(" ").toLowerCase();

      const matchesSearch = searchableText.includes(query);
      const matchesYear = !selectedYear || String(pub.year) === selectedYear;

      return matchesSearch && matchesYear;
    });

    if (filtered.length === 0) {
      list.innerHTML = "<p>No publications found.</p>";
      return;
    }

    list.innerHTML = filtered.map(pub => `
      <article class="publication-card">
        <div class="publication-year">${pub.year}</div>

        <div class="publication-content">
          <h2>${pub.title}</h2>
          <p class="publication-authors">${pub.authors}</p>
          <p class="publication-journal">${pub.journal}</p>

          ${pub.note ? `<p class="publication-note">${pub.note}</p>` : ""}

          <div class="publication-tags">
            ${(pub.tags || []).map(tag => `<span>${tag}</span>`).join("")}
          </div>
        </div>

        <div class="publication-actions">
          ${pub.url ? `<a href="${pub.url}" target="_blank" rel="noopener">View publication</a>` : ""}
          ${pub.doi ? `<small>DOI: ${pub.doi}</small>` : ""}
        </div>
      </article>
    `).join("");
  }

  searchInput.addEventListener("input", render);
  yearFilter.addEventListener("change", render);

  render();
});