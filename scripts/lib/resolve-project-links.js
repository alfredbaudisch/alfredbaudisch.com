const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

function getLinksFromProjectIndex(projectDir) {
  const indexPath = path.join(projectDir, "index.md");

  if (!fs.existsSync(indexPath)) {
    return null;
  }

  const { data } = matter(fs.readFileSync(indexPath, "utf8"));
  const links = data.links;

  if (!links || !Array.isArray(links) || links.length === 0) {
    return null;
  }

  return links;
}

function resolveProjectLinks(data) {
  if (data.links && Array.isArray(data.links) && data.links.length > 0) {
    return data.links;
  }

  if (data.type !== "project-log" || !data.page?.inputPath) {
    return data.links || null;
  }

  const projectDir = path.dirname(path.dirname(data.page.inputPath));
  return getLinksFromProjectIndex(projectDir);
}

module.exports = {
  getLinksFromProjectIndex,
  resolveProjectLinks
};
