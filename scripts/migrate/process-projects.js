#!/usr/bin/env node

/**
 * Process WordPress projects and project logs
 */

const path = require('path');
const fs = require('fs');
const { htmlToMarkdown, decodeHtmlEntities, cleanProjectTitle, generateSlug, formatDate, formatDateForFilename, extractExcerpt, writeFile, readJSON, ensureDir, createTaxonomyLookup, getTaxonomyTerms, createMediaLookup, getMediaFullUrl, getMediaThumbUrl, getProcessImageUrl, getLinksFromMeta, extractMetaDescriptionFromYoast, convertWordPressUrlToLocalPath, getMediaSmallUrl } = require('../utils/helpers');

const dataDir = path.join(__dirname, 'data');
const projectsOutputDir = path.join(__dirname, '../../content/projects');

function processProjects() {
  console.log('Processing projects...');
  
  const projects = readJSON(path.join(dataDir, 'projects.json'));
  if (!projects || !Array.isArray(projects)) {
    console.log('No projects found or invalid data');
    return;
  }
  
  const projectLogs = readJSON(path.join(dataDir, 'project-logs.json')) || [];
  const taxonomies = readJSON(path.join(dataDir, 'taxonomies.json')) || {};
  const taxonomyLookup = createTaxonomyLookup(taxonomies);
  
  // Load media and create lookup
  const media = readJSON(path.join(dataDir, 'media.json')) || [];
  const mediaLookup = createMediaLookup(media);
  
  // Create a map of project logs by parent project ID
  const logsByProject = {};
  if (Array.isArray(projectLogs)) {
    projectLogs.forEach(log => {
      // Extract parent project ID from meta field
      const meta = log.meta || {};
      const parentProjectId = meta.project_log_parent_project;
      if (parentProjectId) {
        // Convert to number for consistent lookup
        const projectId = Number(parentProjectId) || String(parentProjectId);
        if (!logsByProject[projectId]) {
          logsByProject[projectId] = [];
        }
        logsByProject[projectId].push(log);
      }
    });
  }
  
  let processed = 0;
  
  projects.forEach(project => {
    // Skip non-published content
    if (project.status !== 'publish') {
      return;
    }
    
    // Decode HTML entities and clean project title
    const rawTitle = project.title.rendered || '';
    const decodedTitle = decodeHtmlEntities(rawTitle);
    const cleanedTitle = cleanProjectTitle(decodedTitle);
    
    // Use WordPress slug directly, fallback to generated slug if missing
    const slug = project.slug || generateSlug(cleanedTitle);
    const date = formatDate(project.date);
    const updated = formatDate(project.modified);
    
    // Get taxonomy terms - WordPress uses 'project-style', 'project-status', etc.
    const projectStyles = getTaxonomyTerms(project, 'project-style', taxonomyLookup);
    const projectStatus = getTaxonomyTerms(project, 'project-status', taxonomyLookup);
    const projectTypes = getTaxonomyTerms(project, 'project-type', taxonomyLookup);
    const tools = getTaxonomyTerms(project, 'tool', taxonomyLookup);
    const tags = getTaxonomyTerms(project, 'tags', taxonomyLookup);
    
    // Look up featured media full URL and thumbnail URL from WordPress
    const mediaFullUrl = getMediaFullUrl(project, mediaLookup);
    const mediaThumbUrl = getMediaThumbUrl(project, mediaLookup);
    const mediaSmallUrl = getMediaSmallUrl(project, mediaLookup);
    const featuredImage = project.featured_media && mediaFullUrl ? convertWordPressUrlToLocalPath(mediaFullUrl) : undefined;
    const featuredImageThumb = project.featured_media && mediaThumbUrl ? convertWordPressUrlToLocalPath(mediaThumbUrl) : undefined;
    const featuredImageSmall = project.featured_media && mediaSmallUrl ? convertWordPressUrlToLocalPath(mediaSmallUrl) : undefined;

    // Get process image and links from meta
    const processImageRaw = getProcessImageUrl(project, mediaLookup, 'project_process_images');
    const processImage = processImageRaw ? convertWordPressUrlToLocalPath(processImageRaw) : undefined;
    const links = getLinksFromMeta(project, 'project_links') || [];
    
    // Extract meta description from Yoast SEO if available
    const yoastMetaDescription = project.yoast_head ? extractMetaDescriptionFromYoast(project.yoast_head) : null;
    
    // Convert content to markdown
    const content = htmlToMarkdown(project.content.rendered);
    
    // Build frontmatter
    const frontmatter = {
      layout: 'layouts/project.njk',
      title: cleanedTitle,
      date: date,
      updated: updated !== date ? updated : undefined,
      type: 'project',
      tags: tags.length > 0 ? tags : undefined,
      projectStyles: projectStyles.length > 0 ? projectStyles : undefined,
      projectStatus: projectStatus.length > 0 ? projectStatus : undefined,
      projectTypes: projectTypes.length > 0 ? projectTypes : undefined,
      tools: tools.length > 0 ? tools : undefined,
      featuredImage: featuredImage,
      featuredImageThumb: featuredImageThumb,
      featuredImageSmall: featuredImageSmall,
      processImage: processImage,
      links: links.length > 0 ? links : undefined,
      metaDescription: yoastMetaDescription || undefined
    };
    
    // Remove undefined values
    Object.keys(frontmatter).forEach(key => {
      if (frontmatter[key] === undefined) {
        delete frontmatter[key];
      }
    });
    
    // Create project directory
    const projectDir = path.join(projectsOutputDir, slug);
    ensureDir(projectDir);
    ensureDir(path.join(projectDir, 'logs'));
    
    // Create project index.md
    const projectFile = path.join(projectDir, 'index.md');
    const markdown = `---\n${formatFrontmatter(frontmatter)}\n---\n\n${content}`;
    writeFile(projectFile, markdown);
    
    // Process project logs
    const logs = logsByProject[project.id] || [];
    logs.forEach(log => {
      processProjectLog(log, projectDir, slug, taxonomyLookup, mediaLookup);
    });
    
    processed++;
    console.log(`  Processed: ${cleanedTitle} (${logs.length} logs)`);
  });
  
  console.log(`\nProcessed ${processed} projects`);
}

function processProjectLog(log, projectDir, projectSlug, taxonomyLookup, mediaLookup) {
  // Skip non-published content
  if (log.status !== 'publish') {
    return;
  }
  
  // Decode HTML entities in title
  const rawTitle = log.title.rendered || '';
  const decodedTitle = decodeHtmlEntities(rawTitle);
  
  // Use WordPress slug directly, fallback to generated slug if missing
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
    layout: 'layouts/project-log.njk',
    title: decodedTitle,
    date: date,
    updated: updated !== date ? updated : undefined,
    type: 'project-log',
    tags: tags.length > 0 ? tags : undefined,
    parentProject: projectSlug,
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
  const logFile = path.join(projectDir, 'logs', `${dateForFilename}-${slug}.md`);
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

processProjects();

