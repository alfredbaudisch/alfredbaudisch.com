/**
 * Render the project links section HTML.
 * Kept in sync with content/_includes/components/links-section.njk
 */
function renderLinksSection(links) {
  if (!links || !Array.isArray(links) || links.length === 0) {
    return "";
  }

  const items = links.map((link) =>
    `<li><a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.name}</a></li>`
  ).join("\n        ");

  return `<section class="links-section">
      <h2>Links</h2>
      <ul class="links-list">
        ${items}
      </ul>
    </section>`;
}

module.exports = { renderLinksSection };
