#!/usr/bin/env node

/**
 * Process WordPress pages and convert to Markdown
 * Only imports pages with slugs: "about" and "everydays-by-beeple-nft-auction-christie-sotheby"
 */

const path = require('path');
const { htmlToMarkdown, decodeHtmlEntities, formatDate, writeFile, readJSON, extractMetaDescriptionFromYoast } = require('../utils/helpers');

const dataDir = path.join(__dirname, 'data');
const outputDir = path.join(__dirname, '../../content/pages');

// Pages to import (by slug)
const allowedSlugs = ['about', 'everydays-by-beeple-nft-auction-christie-sotheby'];

function processPages() {
  console.log('Processing WordPress pages...');
  
  const pages = readJSON(path.join(dataDir, 'pages.json'));
  if (!pages || !Array.isArray(pages)) {
    console.log('No pages found or invalid data');
    return;
  }
  
  let processed = 0;
  
  pages.forEach(page => {
    // Skip non-published content
    if (page.status !== 'publish') {
      return;
    }
    
    // Only import allowed pages
    if (!allowedSlugs.includes(page.slug)) {
      return;
    }
    
    // Decode HTML entities in title
    const rawTitle = page.title.rendered || '';
    const decodedTitle = decodeHtmlEntities(rawTitle);
    
    // Use WordPress slug directly
    const slug = page.slug;
    const date = formatDate(page.date);
    const updated = formatDate(page.modified);
    
    // Convert content to markdown
    const content = htmlToMarkdown(page.content.rendered);
    
    // Extract meta description from Yoast SEO if available
    const yoastMetaDescription = page.yoast_head ? extractMetaDescriptionFromYoast(page.yoast_head) : null;
    
    // Build frontmatter
    const frontmatter = {
      layout: 'layouts/page.njk',
      title: decodedTitle,
      date: date,
      updated: updated !== date ? updated : undefined,
      metaDescription: yoastMetaDescription || undefined,
      type: 'page'
    };
    
    // Remove undefined values
    Object.keys(frontmatter).forEach(key => {
      if (frontmatter[key] === undefined) {
        delete frontmatter[key];
      }
    });
    
    // Create markdown file
    const filename = `${slug}.md`;
    const filepath = path.join(outputDir, filename);
    
    const markdown = `---\n${formatFrontmatter(frontmatter)}\n---\n\n${content}`;
    
    writeFile(filepath, markdown);
    processed++;
    
    console.log(`  Processed: ${decodedTitle} (${slug})`);
  });
  
  console.log(`\nProcessed ${processed} pages`);
}

function formatFrontmatter(frontmatter) {
  return Object.entries(frontmatter).map(([key, value]) => {
    if (Array.isArray(value)) {
      if (value.length === 0) return `${key}: []`;
      return `${key}: [${value.map(v => `"${String(v).replace(/"/g, '\\"')}"`).join(', ')}]`;
    }
    if (typeof value === 'string') {
      return `${key}: "${value.replace(/"/g, '\\"')}"`;
    }
    return `${key}: ${value}`;
  }).join('\n');
}

processPages();

