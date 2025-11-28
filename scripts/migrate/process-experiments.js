#!/usr/bin/env node

/**
 * Process WordPress experiments and experiment logs
 */

const path = require('path');
const { htmlToMarkdown, decodeHtmlEntities, cleanProjectTitle, generateSlug, formatDate, formatDateForFilename, extractExcerpt, writeFile, readJSON, ensureDir, createTaxonomyLookup, getTaxonomyTerms, createMediaLookup, getMediaFullUrl, getMediaThumbUrl, getProcessImageUrl, getLinksFromMeta, extractMetaDescriptionFromYoast, convertWordPressUrlToLocalPath, getMediaSmallUrl } = require('../utils/helpers');

const dataDir = path.join(__dirname, 'data');
const experimentsOutputDir = path.join(__dirname, '../../content/experiments');

function processExperiments() {
  console.log('Processing experiments...');
  
  const experiments = readJSON(path.join(dataDir, 'experiments.json'));
  if (!experiments || !Array.isArray(experiments)) {
    console.log('No experiments found or invalid data');
    return;
  }
  
  const experimentLogs = readJSON(path.join(dataDir, 'experiment-logs.json')) || [];
  const taxonomies = readJSON(path.join(dataDir, 'taxonomies.json')) || {};
  const taxonomyLookup = createTaxonomyLookup(taxonomies);
  
  // Load media and create lookup
  const media = readJSON(path.join(dataDir, 'media.json')) || [];
  const mediaLookup = createMediaLookup(media);
  
  // Create a map of experiment logs by parent experiment ID
  const logsByExperiment = {};
  if (Array.isArray(experimentLogs)) {
    experimentLogs.forEach(log => {
      // Extract parent experiment ID from meta field
      const meta = log.meta || {};
      const parentExperimentId = meta.experiment_log_parent_project;
      if (parentExperimentId) {
        // Convert to number for consistent lookup
        const experimentId = Number(parentExperimentId) || String(parentExperimentId);
        if (!logsByExperiment[experimentId]) {
          logsByExperiment[experimentId] = [];
        }
        logsByExperiment[experimentId].push(log);
      }
    });
  }
  
  let processed = 0;
  
  experiments.forEach(experiment => {
    // Skip non-published content
    if (experiment.status !== 'publish') {
      return;
    }
    
    // Decode HTML entities and clean title (experiments might also have project type suffixes)
    const rawTitle = experiment.title.rendered || '';
    const decodedTitle = decodeHtmlEntities(rawTitle);
    const cleanedTitle = cleanProjectTitle(decodedTitle);
    
    // Use WordPress slug directly, fallback to generated slug if missing
    const slug = experiment.slug || generateSlug(cleanedTitle);
    const date = formatDate(experiment.date);
    const updated = formatDate(experiment.modified);
    
    // Get taxonomy terms - WordPress uses 'experiment-type', 'tool', 'project-status', etc.
    const experimentTypes = getTaxonomyTerms(experiment, 'experiment-type', taxonomyLookup);
    const projectStatus = getTaxonomyTerms(experiment, 'project-status', taxonomyLookup);
    const projectStyles = getTaxonomyTerms(experiment, 'project-style', taxonomyLookup);
    const tools = getTaxonomyTerms(experiment, 'tool', taxonomyLookup);
    const tags = getTaxonomyTerms(experiment, 'tags', taxonomyLookup);
    
    // Look up featured media full URL and thumbnail URL from WordPress
    const mediaFullUrl = getMediaFullUrl(experiment, mediaLookup);
    const mediaThumbUrl = getMediaThumbUrl(experiment, mediaLookup);
    const mediaSmallUrl = getMediaSmallUrl(experiment, mediaLookup);
    const featuredImage = experiment.featured_media && mediaFullUrl ? convertWordPressUrlToLocalPath(mediaFullUrl) : undefined;
    const featuredImageThumb = experiment.featured_media && mediaThumbUrl ? convertWordPressUrlToLocalPath(mediaThumbUrl) : undefined;
    const featuredImageSmall = experiment.featured_media && mediaSmallUrl ? convertWordPressUrlToLocalPath(mediaSmallUrl) : undefined;
    
    // Get process image and links from meta
    const processImageRaw = getProcessImageUrl(experiment, mediaLookup, 'project_process_images');
    const processImage = processImageRaw ? convertWordPressUrlToLocalPath(processImageRaw) : undefined;
    const links = getLinksFromMeta(experiment, 'project_links') || [];
    
    // Extract meta description from Yoast SEO if available
    const yoastMetaDescription = experiment.yoast_head ? extractMetaDescriptionFromYoast(experiment.yoast_head) : null;
    
    const content = htmlToMarkdown(experiment.content.rendered);
    
    const frontmatter = {
      layout: 'layouts/experiment.njk',
      title: cleanedTitle,
      date: date,
      updated: updated !== date ? updated : undefined,
      type: 'experiment',
      tags: tags.length > 0 ? tags : undefined,
      experimentTypes: experimentTypes.length > 0 ? experimentTypes : undefined,
      projectStatus: projectStatus.length > 0 ? projectStatus : undefined,
      tools: tools.length > 0 ? tools : undefined,
      featuredImage: featuredImage,
      featuredImageThumb: featuredImageThumb,
      featuredImageSmall: featuredImageSmall,
      processImage: processImage,
      projectStyles: projectStyles.length > 0 ? projectStyles : undefined,
      links: links.length > 0 ? links : undefined,
      metaDescription: yoastMetaDescription || undefined
    };
    
    Object.keys(frontmatter).forEach(key => {
      if (frontmatter[key] === undefined) {
        delete frontmatter[key];
      }
    });
    
    const experimentDir = path.join(experimentsOutputDir, slug);
    ensureDir(experimentDir);
    ensureDir(path.join(experimentDir, 'logs'));
    
    const experimentFile = path.join(experimentDir, 'index.md');
    const markdown = `---\n${formatFrontmatter(frontmatter)}\n---\n\n${content}`;
    writeFile(experimentFile, markdown);
    
    const logs = logsByExperiment[experiment.id] || [];
    logs.forEach(log => {
      processExperimentLog(log, experimentDir, slug, taxonomyLookup, mediaLookup);
    });
    
    processed++;
    console.log(`  Processed: ${cleanedTitle} (${logs.length} logs)`);
  });
  
  console.log(`\nProcessed ${processed} experiments`);
}

function processExperimentLog(log, experimentDir, experimentSlug, taxonomyLookup, mediaLookup) {
  // Skip non-published content
  if (log.status !== 'publish') {
    return;
  }
  
  // Decode HTML entities in title
  const rawTitle = log.title.rendered || '';
  const decodedTitle = decodeHtmlEntities(rawTitle);
  
  const slug = log.slug || generateSlug(decodedTitle);
  const date = formatDate(log.date);
  const updated = formatDate(log.modified);
  
  const logCategories = getTaxonomyTerms(log, 'log-category', taxonomyLookup);
  const tags = getTaxonomyTerms(log, 'tags', taxonomyLookup);

  const projectStyles = getTaxonomyTerms(log, 'project-style', taxonomyLookup);
  const tools = getTaxonomyTerms(log, 'tool', taxonomyLookup);
  
  // Look up featured media full URL and thumbnail URL from WordPress
  const mediaFullUrl = getMediaFullUrl(log, mediaLookup);
  const mediaThumbUrl = getMediaThumbUrl(log, mediaLookup);
  const mediaSmallUrl = getMediaSmallUrl(log, mediaLookup);
  const featuredImage = log.featured_media && mediaFullUrl ? convertWordPressUrlToLocalPath(mediaFullUrl) : undefined;
  const featuredImageThumb = log.featured_media && mediaThumbUrl ? convertWordPressUrlToLocalPath(mediaThumbUrl) : undefined;
  const featuredImageSmall = log.featured_media && mediaSmallUrl ? convertWordPressUrlToLocalPath(mediaSmallUrl) : undefined;

  // Get process image and links from meta
  const processImageRaw = getProcessImageUrl(log, mediaLookup, 'project_process_images');
  const processImage = processImageRaw ? convertWordPressUrlToLocalPath(processImageRaw) : undefined;
  const links = getLinksFromMeta(log, 'project_links') || [];
  
  // Extract meta description from Yoast SEO if available
  const yoastMetaDescription = log.yoast_head ? extractMetaDescriptionFromYoast(log.yoast_head) : null;
  
  const content = htmlToMarkdown(log.content.rendered);
  
  const frontmatter = {
    layout: 'layouts/experiment-log.njk',
    title: decodedTitle,
    date: date,
    updated: updated !== date ? updated : undefined,
    type: 'experiment-log',
    tags: tags.length > 0 ? tags : undefined,
    parentExperiment: experimentSlug,
    logCategories: logCategories.length > 0 ? logCategories : undefined,
    projectStyles: projectStyles.length > 0 ? projectStyles : undefined,
    tools: tools.length > 0 ? tools : undefined,
    featuredImage: featuredImage,
    featuredImageThumb: featuredImageThumb,
    featuredImageSmall: featuredImageSmall,
    processImage: processImage,
    links: links.length > 0 ? links : undefined,
    metaDescription: yoastMetaDescription || undefined
  };
  
  Object.keys(frontmatter).forEach(key => {
    if (frontmatter[key] === undefined) {
      delete frontmatter[key];
    }
  });
  
  // Use date-only for filename
  const dateForFilename = formatDateForFilename(log.date);
  const logFile = path.join(experimentDir, 'logs', `${dateForFilename}-${slug}.md`);
  const markdown = `---\n${formatFrontmatter(frontmatter)}\n---\n\n${content}`;
  writeFile(logFile, markdown);
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

processExperiments();

