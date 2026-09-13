const fs = require("fs");
const slugify = require("slugify");

const DEFAULT_MIN_LEVEL = 2;
const DEFAULT_MAX_LEVEL = 3;
const EXCLUDED_HEADINGS = new Set(["table of contents"]);

function parseLevelRange(levels) {
  if (!levels) {
    return { minLevel: DEFAULT_MIN_LEVEL, maxLevel: DEFAULT_MAX_LEVEL };
  }

  const parts = String(levels)
    .split(",")
    .map((part) => parseInt(part.trim(), 10))
    .filter((part) => !Number.isNaN(part));

  if (parts.length === 0) {
    return { minLevel: DEFAULT_MIN_LEVEL, maxLevel: DEFAULT_MAX_LEVEL };
  }

  if (parts.length === 1) {
    return { minLevel: parts[0], maxLevel: parts[0] };
  }

  return { minLevel: parts[0], maxLevel: parts[1] };
}

function stripFrontmatter(content) {
  return content.replace(/^---[\s\S]*?---\s*/m, "");
}

function plainHeadingText(text) {
  return text
    .replace(/\s*\{#.+?\}\s*$/g, "")
    .replace(/\s*\{[^}]+\}\s*$/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .trim();
}

function createSlug(text, slugCounts) {
  const base = slugify(text, { lower: true, strict: true });

  if (!(base in slugCounts)) {
    slugCounts[base] = 0;
    return base;
  }

  slugCounts[base] += 1;
  return `${base}-${slugCounts[base]}`;
}

function extractHeadings(markdown, minLevel, maxLevel) {
  const content = stripFrontmatter(markdown);
  const headings = [];
  const slugCounts = {};
  const regex = /^(#{2,6})\s+(.+)$/gm;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const level = match[1].length;

    if (level < minLevel || level > maxLevel) {
      continue;
    }

    const text = plainHeadingText(match[2]);

    if (!text || EXCLUDED_HEADINGS.has(text.toLowerCase())) {
      continue;
    }

    headings.push({
      level,
      text,
      id: createSlug(text, slugCounts)
    });
  }

  return headings;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderTableOfContents(headings) {
  if (headings.length === 0) {
    return "";
  }

  let html = `<nav class="table-of-contents" aria-label="Table of contents">
  <h2 class="toc-title">Table of Contents</h2>
  <ul class="toc-list">`;

  let currentLevel = headings[0].level;

  for (const heading of headings) {
    while (currentLevel < heading.level) {
      html += "<ul class=\"toc-list\">";
      currentLevel += 1;
    }

    while (currentLevel > heading.level) {
      html += "</ul>";
      currentLevel -= 1;
    }

    html += `<li class="toc-item toc-level-${heading.level}"><a href="#${heading.id}">${escapeHtml(heading.text)}</a></li>`;
  }

  while (currentLevel > headings[0].level) {
    html += "</ul>";
    currentLevel -= 1;
  }

  html += `</ul>
</nav>`;

  return html;
}

function renderTocFromFile(inputPath, levels) {
  if (!inputPath || !fs.existsSync(inputPath)) {
    return "";
  }

  const { minLevel, maxLevel } = parseLevelRange(levels);
  const markdown = fs.readFileSync(inputPath, "utf8");
  const headings = extractHeadings(markdown, minLevel, maxLevel);

  return renderTableOfContents(headings);
}

module.exports = {
  createSlug,
  extractHeadings,
  parseLevelRange,
  renderTableOfContents,
  renderTocFromFile,
  slugifyHeading: (text) => slugify(text, { lower: true, strict: true })
};
