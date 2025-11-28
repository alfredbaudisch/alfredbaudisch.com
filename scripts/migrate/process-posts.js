#!/usr/bin/env node

/**
 * Process WordPress blog posts and convert to Markdown
 */

const path = require('path');
const { htmlToMarkdown, decodeHtmlEntities, generateSlug, formatDate, formatDateForFilename, extractExcerpt, writeFile, readJSON, createTaxonomyLookup, getTaxonomyTerms, createMediaLookup, getMediaFullUrl, getMediaThumbUrl, getProcessImageUrl, getLinksFromMeta, extractMetaDescriptionFromYoast, convertWordPressUrlToLocalPath, getMediaSmallUrl } = require('../utils/helpers');

const dataDir = path.join(__dirname, 'data');
const outputDir = path.join(__dirname, '../../content/posts');

function processPosts() {
  console.log('Processing blog posts...');
  
  const posts = readJSON(path.join(dataDir, 'posts.json'));
  if (!posts || !Array.isArray(posts)) {
    console.log('No posts found or invalid data');
    return;
  }
  
  // Load taxonomies and create lookup
  const taxonomies = readJSON(path.join(dataDir, 'taxonomies.json')) || {};
  const taxonomyLookup = createTaxonomyLookup(taxonomies);
  
  // Load media and create lookup
  const media = readJSON(path.join(dataDir, 'media.json')) || [];
  const mediaLookup = createMediaLookup(media);
  
  let processed = 0;
  
  posts.forEach(post => {
    // Skip non-published content
    if (post.status !== 'publish') {
      return;
    }
    
    // Decode HTML entities in title
    const rawTitle = post.title.rendered || '';
    const decodedTitle = decodeHtmlEntities(rawTitle);
    
    // Use WordPress slug directly, fallback to generated slug if missing
    const slug = post.slug || generateSlug(decodedTitle);
    const date = formatDate(post.date);
    const updated = formatDate(post.modified);
    
    // Convert content to markdown
    const content = htmlToMarkdown(post.content.rendered);
    
    // Extract excerpt
    const excerpt = post.excerpt ? htmlToMarkdown(post.excerpt.rendered) : extractExcerpt(post.content.rendered);
    
    // Look up taxonomy terms
    // WordPress posts use 'categories' key but taxonomy is stored as 'categories' in taxonomies.json
    const tags = getTaxonomyTerms(post, 'tags', taxonomyLookup);
    const categories = getTaxonomyTerms(post, 'categories', taxonomyLookup);
    
    // Look up featured media full URL and thumbnail URL from WordPress
    const mediaFullUrl = getMediaFullUrl(post, mediaLookup);
    const mediaThumbUrl = getMediaThumbUrl(post, mediaLookup);
    const mediaSmallUrl = getMediaSmallUrl(post, mediaLookup);
    const featuredImage = post.featured_media && mediaFullUrl ? convertWordPressUrlToLocalPath(mediaFullUrl) : undefined;
    const featuredImageThumb = post.featured_media && mediaThumbUrl ? convertWordPressUrlToLocalPath(mediaThumbUrl) : undefined;
    const featuredImageSmall = post.featured_media && mediaSmallUrl ? convertWordPressUrlToLocalPath(mediaSmallUrl) : undefined;
    
    // Get process image and links from meta
    const processImageRaw = getProcessImageUrl(post, mediaLookup, 'project_process_images');
    const processImage = processImageRaw ? convertWordPressUrlToLocalPath(processImageRaw) : undefined;
    const links = getLinksFromMeta(post, 'project_links') || 
                  [];
    
    // Extract meta description from Yoast SEO if available
    const yoastMetaDescription = post.yoast_head ? extractMetaDescriptionFromYoast(post.yoast_head) : null;
    
    // Build frontmatter
    const frontmatter = {
      layout: 'layouts/post.njk',
      title: decodedTitle,
      date: date,
      updated: updated !== date ? updated : undefined,
      tags: tags.length > 0 ? tags : undefined,
      categories: categories.length > 0 ? categories : undefined,
      featuredImage: featuredImage,
      featuredImageThumb: featuredImageThumb,
      featuredImageSmall: featuredImageSmall,
      processImage: processImage,
      links: links.length > 0 ? links : undefined,
      metaDescription: yoastMetaDescription || undefined,
      type: 'post'
    };
    
    // Remove undefined values
    Object.keys(frontmatter).forEach(key => {
      if (frontmatter[key] === undefined) {
        delete frontmatter[key];
      }
    });
    
    // Create markdown file (use date-only for filename)
    const dateForFilename = formatDateForFilename(post.date);
    const filename = `${dateForFilename}-${slug}.md`;
    const filepath = path.join(outputDir, filename);
    
    const markdown = `---\n${formatFrontmatter(frontmatter)}\n---\n\n${content}`;
    
    writeFile(filepath, markdown);
    processed++;
    
    console.log(`  Processed: ${decodedTitle}`);
  });
  
  console.log(`\nProcessed ${processed} blog posts`);
}

function formatFrontmatter(frontmatter) {
  return Object.entries(frontmatter).map(([key, value]) => {
    if (Array.isArray(value)) {
      if (value.length === 0) return `${key}: []`;
      // Handle array of objects (links)
      if (value.length > 0 && typeof value[0] === 'object') {
        return `${key}:\n${value.map(v => `  - name: "${String(v.name || '').replace(/"/g, '\\"')}"\n    url: "${String(v.url || '').replace(/"/g, '\\"')}"`).join('\n')}`;
      }
      return `${key}: [${value.map(v => `"${String(v).replace(/"/g, '\\"')}"`).join(', ')}]`;
    }
    if (typeof value === 'string') {
      return `${key}: "${value.replace(/"/g, '\\"')}"`;
    }
    return `${key}: ${value}`;
  }).join('\n');
}

processPosts();

