const { DateTime } = require("luxon");
const markdownIt = require("markdown-it");
const markdownItAttrs = require("markdown-it-attrs");
const slugify = require("slugify");
const { buildRedirects, writeNginxRedirects } = require("./scripts/lib/redirects");
const { renderLinksSection } = require("./scripts/lib/render-links-section");

// Helper function to get sort date (updated || date)
function getSortDate(item) {
  if (!item || !item.data) return new Date(0);
  const updated = item.data.updated;
  const date = item.data.date;
  
  // Prefer updated if present, otherwise use date
  const sortDate = updated || date;
  
  if (!sortDate) return new Date(0);
  
  if (sortDate instanceof Date) {
    return sortDate;
  }
  
  if (typeof sortDate === "string") {
    const parsed = DateTime.fromISO(sortDate);
    if (parsed.isValid) {
      return parsed.toJSDate();
    }
    const jsDate = new Date(sortDate);
    if (!isNaN(jsDate.getTime())) {
      return jsDate;
    }
  }
  
  return new Date(0);
}

module.exports = function(eleventyConfig) {
  let siteRedirects = [];
  // Add environment data
  eleventyConfig.addGlobalData("env", {
    NODE_ENV: process.env.NODE_ENV || 'development'
  });

  // Copy static assets - copy public files to root
  eleventyConfig.addPassthroughCopy({
    "public/css": "css",
    "public/images": "images"
  });
  // Copy JS files for development (production uses bundled main.js)
  // In production, exclude main.js since it's bundled by build-js.js
  if (process.env.NODE_ENV === 'production') {
    // Copy individual JS files except main.js (which is bundled)
    eleventyConfig.addPassthroughCopy("public/js/lightbox.js");
    eleventyConfig.addPassthroughCopy("public/js/gallery.js");
    eleventyConfig.addPassthroughCopy("public/js/post-images.js");
    eleventyConfig.addPassthroughCopy("public/js/code-blocks.js");
    eleventyConfig.addPassthroughCopy("public/js/mobile-menu.js");
  } else {
    // In development, copy all JS files
    eleventyConfig.addPassthroughCopy({
      "public/js": "js"
    });
  }
  eleventyConfig.addPassthroughCopy("content/media");
  eleventyConfig.addPassthroughCopy("assets/fonts");

  // Markdown configuration
  const md = new markdownIt({
    html: true,
    breaks: true,
    linkify: true
  }).use(markdownItAttrs);

  eleventyConfig.setLibrary("md", md);
  
  // Add markdown filter for use in Nunjucks templates
  eleventyConfig.addFilter("markdown", function(content) {
    if (!content) return "";
    return md.render(content);
  });

  // Collections
  eleventyConfig.addCollection("allContent", function(collectionApi) {
    return collectionApi.getAll()
      .filter(item => !item.data.draft)
      .sort((a, b) => {
        const dateA = getSortDate(a);
        const dateB = getSortDate(b);
        return dateB - dateA;
      });
  });

  eleventyConfig.addCollection("redirects", function(collectionApi) {
    siteRedirects = buildRedirects(collectionApi);
    return siteRedirects;
  });

  // Homepage content - excludes pages and archive pages
  eleventyConfig.addCollection("homepageContent", function(collectionApi) {
    return collectionApi.getAll()
      .filter(item => {
        // Exclude drafts
        if (item.data.draft) return false;
        
        // Exclude pages (check both type and filePathStem)
        if (item.data.type === 'page') return false;
        const filePathStem = item.page?.filePathStem || '';
        if (filePathStem.includes('/pages/')) return false;
        
        // Exclude archive pages and sitemap
        if (filePathStem.includes('/archives/')) return false;
        if (filePathStem === '/sitemap') return false;
        if (filePathStem.startsWith('/tag/')) return false;
        if (filePathStem.startsWith('/project-style/')) return false;
        if (filePathStem.startsWith('/project-status/')) return false;
        if (filePathStem.startsWith('/project-type/')) return false;
        if (filePathStem.startsWith('/tools/')) return false;
        if (filePathStem.startsWith('/log-category/')) return false;
        if (filePathStem.startsWith('/experiment-type/')) return false;
        // Exclude category archives (like /blog/, /dailies/)
        // These are single-level paths that aren't posts
        if (filePathStem.match(/^\/[^\/]+\/$/) && !filePathStem.includes('/posts/')) return false;
        
        return true;
      })
      .sort((a, b) => {
        const dateA = getSortDate(a);
        const dateB = getSortDate(b);
        return dateB - dateA;
      });
  });

  eleventyConfig.addCollection("projects", function(collectionApi) {
    return collectionApi.getFilteredByGlob("content/projects/**/index.md")
      .filter(item => !item.data.draft)
      .sort((a, b) => {
        const dateA = getSortDate(a);
        const dateB = getSortDate(b);
        return dateB - dateA;
      });
  });

  eleventyConfig.addCollection("projectLogs", function(collectionApi) {
    return collectionApi.getFilteredByGlob("content/projects/**/logs/*.md")
      .filter(item => !item.data.draft)
      .sort((a, b) => {
        const dateA = getSortDate(a);
        const dateB = getSortDate(b);
        return dateB - dateA;
      });
  });

  eleventyConfig.addCollection("experiments", function(collectionApi) {
    return collectionApi.getFilteredByGlob("content/experiments/**/index.md")
      .filter(item => !item.data.draft)
      .sort((a, b) => {
        const dateA = getSortDate(a);
        const dateB = getSortDate(b);
        return dateB - dateA;
      });
  });

  eleventyConfig.addCollection("experimentLogs", function(collectionApi) {
    return collectionApi.getFilteredByGlob("content/experiments/**/logs/*.md")
      .filter(item => !item.data.draft)
      .sort((a, b) => {
        const dateA = getSortDate(a);
        const dateB = getSortDate(b);
        return dateB - dateA;
      });
  });

  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("content/posts/*.md")
      .filter(item => !item.data.draft)
      .sort((a, b) => {
        const dateA = getSortDate(a);
        const dateB = getSortDate(b);
        return dateB - dateA;
      });
  });

  eleventyConfig.addCollection("pages", function(collectionApi) {
    return collectionApi.getFilteredByGlob("content/pages/*.md");
  });

  // Generate taxonomy archive pages dynamically
  eleventyConfig.addCollection("taxonomyArchives", function(collectionApi) {
    const allContent = collectionApi.getAll().filter(item => !item.data.draft);
    const taxonomies = {
      projectStyles: new Set(),
      projectStatus: new Set(),
      tools: new Set(),
      projectTypes: new Set(),
      logCategories: new Set(),
      experimentTypes: new Set()
    };
    
    // Taxonomy URL mapping
    const taxonomyUrlMap = {
      'projectStyles': 'project-style',
      'projectStatus': 'project-status',
      'tools': 'tools',
      'projectTypes': 'project-type',
      'logCategories': 'log-category',
      'experimentTypes': 'experiment-type'
    };
    
    // Extract all taxonomy values
    allContent.forEach(item => {
      if (item.data) {
        // Handle projectStyles
        if (item.data.projectStyles) {
          const values = Array.isArray(item.data.projectStyles) ? item.data.projectStyles : [item.data.projectStyles];
          values.forEach(v => taxonomies.projectStyles.add(v));
        }
        // Handle projectStatus (can be single value or array)
        if (item.data.projectStatus) {
          const values = Array.isArray(item.data.projectStatus) ? item.data.projectStatus : [item.data.projectStatus];
          values.forEach(v => taxonomies.projectStatus.add(v));
        }
        // Handle tools
        if (item.data.tools) {
          const values = Array.isArray(item.data.tools) ? item.data.tools : [item.data.tools];
          values.forEach(v => taxonomies.tools.add(v));
        }
        // Handle projectTypes
        if (item.data.projectTypes) {
          const values = Array.isArray(item.data.projectTypes) ? item.data.projectTypes : [item.data.projectTypes];
          values.forEach(v => taxonomies.projectTypes.add(v));
        }
        // Handle logCategories
        if (item.data.logCategories) {
          const values = Array.isArray(item.data.logCategories) ? item.data.logCategories : [item.data.logCategories];
          values.forEach(v => taxonomies.logCategories.add(v));
        }
        // Handle experimentTypes
        if (item.data.experimentTypes) {
          const values = Array.isArray(item.data.experimentTypes) ? item.data.experimentTypes : [item.data.experimentTypes];
          values.forEach(v => taxonomies.experimentTypes.add(v));
        }
      }
    });
    
    // Create archive page objects, deduplicated by URL
    // Use Map keyed by URL to avoid duplicates when same value appears in multiple content types
    const archivesByUrl = new Map();
    
    Object.keys(taxonomies).forEach(taxonomyType => {
      taxonomies[taxonomyType].forEach(value => {
        let url;
        const valueSlug = slugify(value, { lower: true, strict: true });
        
        // Special handling for project types and experiment types
        if (taxonomyType === 'projectTypes') {
          url = `/projects/${valueSlug}/`;
        } else if (taxonomyType === 'experimentTypes') {
          url = `/experiments/${valueSlug}/`;
        } else {
          // Use taxonomy URL map for other taxonomies
          const urlPrefix = taxonomyUrlMap[taxonomyType] || taxonomyType.toLowerCase();
          url = `/${urlPrefix}/${valueSlug}/`;
        }
        
        // If URL doesn't exist yet, or if current taxonomy type is more specific, store it
        if (!archivesByUrl.has(url)) {
          archivesByUrl.set(url, {
            taxonomyType: taxonomyType,
            taxonomyValue: value,
            url: url
          });
        } else {
          // If duplicate URL exists, prefer keeping the first one found
          // (This handles cases where same value appears in multiple taxonomy types)
          // We keep the existing entry to avoid duplicates
        }
      });
    });
    
    return Array.from(archivesByUrl.values());
  });

  // Generate tag archive pages dynamically
  eleventyConfig.addCollection("tagArchives", function(collectionApi) {
    const allContent = collectionApi.getAll().filter(item => !item.data.draft);
    // Use Map to track tags by slugified value to avoid duplicates
    // Key: slugified tag, Value: original tag name
    const tagsBySlug = new Map();
    
    allContent.forEach(item => {
      if (item.data && item.data.tags && Array.isArray(item.data.tags)) {
        item.data.tags.forEach(tag => {
          const tagSlug = slugify(tag, { lower: true, strict: true });
          // If this slug doesn't exist yet, store it
          if (!tagsBySlug.has(tagSlug)) {
            tagsBySlug.set(tagSlug, tag);
          } else {
            // If duplicate slug exists, prefer the version without accents/diacritics
            const existingTag = tagsBySlug.get(tagSlug);
            const normalizedTag = tag.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const normalizedExisting = existingTag.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            // Prefer tag without accents if both exist
            if (tag === normalizedTag && existingTag !== normalizedExisting) {
              tagsBySlug.set(tagSlug, tag);
            }
          }
        });
      }
    });
    
    return Array.from(tagsBySlug.entries()).map(([slug, tag]) => ({
      tag: tag,
      url: `/tag/${slug}/`
    }));
  });

  // Generate category archive pages dynamically
  eleventyConfig.addCollection("categoryArchives", function(collectionApi) {
    const allContent = collectionApi.getAll().filter(item => !item.data.draft);
    const categories = new Set();
    
    allContent.forEach(item => {
      if (item.data && item.data.categories && Array.isArray(item.data.categories)) {
        item.data.categories.forEach(category => categories.add(category));
      }
    });
    
    return Array.from(categories).map(category => ({
      category: category,
      url: `/${slugify(category, { lower: true, strict: true })}/`
    }));
  });

  // Filters
  eleventyConfig.addFilter("getLogsByProject", function(logs, projectSlug) {
    if (!logs || !Array.isArray(logs)) return [];
    return logs.filter(log => log.data.parentProject === projectSlug);
  });

  eleventyConfig.addFilter("getLogsByExperiment", function(logs, experimentSlug) {
    if (!logs || !Array.isArray(logs)) return [];
    return logs.filter(log => log.data.parentExperiment === experimentSlug);
  });

  eleventyConfig.addFilter("dateDisplay", function(date, format = "yyyy-MM-dd") {
    if (!date) return "";
    
    // Handle "now" string
    if (date === "now") {
      return DateTime.now().toFormat(format);
    }
    
    // Handle Date objects
    if (date instanceof Date) {
      return DateTime.fromJSDate(date).toFormat(format);
    }
    
    // Handle string dates
    if (typeof date === "string") {
      const parsed = DateTime.fromISO(date);
      if (parsed.isValid) {
        return parsed.toFormat(format);
      }
      // Try parsing as JS date string
      const jsDate = new Date(date);
      if (!isNaN(jsDate.getTime())) {
        return DateTime.fromJSDate(jsDate).toFormat(format);
      }
    }
    
    return "";
  });

  eleventyConfig.addFilter("dateISO", function(date) {
    if (!date) return "";
    
    // Handle Date objects
    if (date instanceof Date) {
      return DateTime.fromJSDate(date).toISO();
    }
    
    // Handle string dates
    if (typeof date === "string") {
      const parsed = DateTime.fromISO(date);
      if (parsed.isValid) {
        return parsed.toISO();
      }
      const jsDate = new Date(date);
      if (!isNaN(jsDate.getTime())) {
        return DateTime.fromJSDate(jsDate).toISO();
      }
    }
    
    return "";
  });

  eleventyConfig.addFilter("dateRSS", function(date) {
    if (!date) return "";
    
    // Handle Date objects
    if (date instanceof Date) {
      return DateTime.fromJSDate(date).toRFC2822();
    }
    
    // Handle string dates
    if (typeof date === "string") {
      const parsed = DateTime.fromISO(date);
      if (parsed.isValid) {
        return parsed.toRFC2822();
      }
      // Try parsing as JS date string
      const jsDate = new Date(date);
      if (!isNaN(jsDate.getTime())) {
        return DateTime.fromJSDate(jsDate).toRFC2822();
      }
    }
    
    return "";
  });

  eleventyConfig.addFilter("xml", function(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  });

  eleventyConfig.addFilter("slug", function(str) {
    return slugify(str, { lower: true, strict: true });
  });

  // Format taxonomy type name for display
  eleventyConfig.addFilter("formatTaxonomyType", function(taxonomyType) {
    const taxonomyMap = {
      'projectStyles': 'Project Styles',
      'projectStatus': 'Project Status',
      'projectTypes': 'Project Types',
      'tools': 'Tools',
      'logCategories': 'Log Categories',
      'experimentTypes': 'Experiment Types'
    };
    return taxonomyMap[taxonomyType] || taxonomyType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
  });

  // Format taxonomy title for archive pages
  // Can accept either (taxonomyType, taxonomyValue) or archive object
  eleventyConfig.addFilter("formatTaxonomyTitle", function(taxonomyType, taxonomyValue) {
    // Handle case where archive object is passed as first argument
    if (taxonomyType && typeof taxonomyType === 'object' && taxonomyType.taxonomyType) {
      const archive = taxonomyType;
      taxonomyType = archive.taxonomyType;
      taxonomyValue = archive.taxonomyValue;
    }
    
    if (taxonomyType === 'projectTypes') {
      return `${taxonomyValue} Projects`;
    }
    if (taxonomyType === 'experimentTypes') {
      return `${taxonomyValue} Experiments`;
    }
    const taxonomyMap = {
      'projectStyles': 'Project Style',
      'projectStatus': 'Project Status',
      'projectTypes': 'Project Type',
      'tools': 'Tool',
      'logCategories': 'Log Category'
    };
    const typeLabel = taxonomyMap[taxonomyType] || taxonomyType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
    return `${typeLabel}: ${taxonomyValue}`;
  });

  // Get all unique project types for navigation dropdown
  eleventyConfig.addCollection("projectTypesList", function(collectionApi) {
    const projects = collectionApi.getFilteredByGlob("content/projects/**/index.md");
    const projectTypes = new Set();
    
    projects.forEach(project => {
      if (project.data && project.data.projectTypes) {
        const types = Array.isArray(project.data.projectTypes) ? project.data.projectTypes : [project.data.projectTypes];
        types.forEach(type => projectTypes.add(type));
      }
    });
    
    return Array.from(projectTypes).sort();
  });

  // Filter content by taxonomy value
  eleventyConfig.addFilter("filterByTaxonomy", function(collection, taxonomyName, value) {
    if (!collection || !Array.isArray(collection)) return [];
    return collection
      .filter(item => {
        if (!item.data) return false;
        const taxonomy = item.data[taxonomyName];
        if (Array.isArray(taxonomy)) {
          return taxonomy.some(v => String(v).toLowerCase() === String(value).toLowerCase());
        }
        return String(taxonomy).toLowerCase() === String(value).toLowerCase();
      })
      .sort((a, b) => {
        const dateA = getSortDate(a);
        const dateB = getSortDate(b);
        return dateB - dateA;
      });
  });

  // Filter content by tag
  eleventyConfig.addFilter("filterByTag", function(collection, tag) {
    if (!collection || !Array.isArray(collection)) return [];
    return collection
      .filter(item => {
        if (!item.data) return false;
        const tags = item.data.tags || [];
        if (!Array.isArray(tags)) return false;
        return tags.some(t => String(t).toLowerCase() === String(tag).toLowerCase());
      })
      .sort((a, b) => {
        const dateA = getSortDate(a);
        const dateB = getSortDate(b);
        return dateB - dateA;
      });
  });

  // Filter content by category
  eleventyConfig.addFilter("filterByCategory", function(collection, category) {
    if (!collection || !Array.isArray(collection)) return [];
    return collection
      .filter(item => {
        if (!item.data) return false;
        const categories = item.data.categories || [];
        if (!Array.isArray(categories)) return false;
        return categories.some(c => String(c).toLowerCase() === String(category).toLowerCase());
      })
      .sort((a, b) => {
        const dateA = getSortDate(a);
        const dateB = getSortDate(b);
        return dateB - dateA;
      });
  });

  // Group content by year - returns array of [year, items] pairs sorted descending
  // Uses updated date if present, otherwise date
  eleventyConfig.addFilter("groupByYear", function(collection) {
    if (!collection || !Array.isArray(collection)) return [];
    const grouped = {};
    collection.forEach(item => {
      if (!item.data) return;
      
      // Use updated date if present, otherwise date
      const sortDate = getSortDate(item);
      if (!sortDate || sortDate.getTime() === 0) return;
      
      const year = sortDate.getFullYear();
      
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(item);
    });
    
    // Sort items within each year by sort date (newest first)
    Object.keys(grouped).forEach(year => {
      grouped[year].sort((a, b) => {
        const dateA = getSortDate(a);
        const dateB = getSortDate(b);
        return dateB - dateA;
      });
    });
    
    // Convert to array of [year, items] pairs and sort by year descending
    const sorted = Object.keys(grouped)
      .map(year => [parseInt(year), grouped[year]])
      .sort((a, b) => b[0] - a[0])
      .map(([year, items]) => [year.toString(), items]);
    
    return sorted;
  });

  // Group items by a property
  eleventyConfig.addFilter("groupBy", function(collection, property) {
    if (!collection || !Array.isArray(collection)) return {};
    const grouped = {};
    collection.forEach(item => {
      if (!item.data) return;
      const value = item.data[property];
      if (value) {
        const values = Array.isArray(value) ? value : [value];
        values.forEach(v => {
          if (!grouped[v]) {
            grouped[v] = [];
          }
          grouped[v].push(item);
        });
      }
    });
    return grouped;
  });

  // Get keys from an object
  eleventyConfig.addFilter("keys", function(obj) {
    if (!obj || typeof obj !== 'object') return [];
    return Object.keys(obj);
  });

  // Helper function to generate meta description from content
  function generateMetaDescription(content, customDescription, maxLength = 155) {
    // If custom description is provided, use it
    if (customDescription && typeof customDescription === 'string' && customDescription.trim()) {
      return customDescription.trim();
    }
    
    // Otherwise, generate from content
    if (!content || typeof content !== 'string') return '';
    
    // Strip markdown syntax and HTML
    let text = content
      .replace(/^---[\s\S]*?---\s*/m, '') // Remove frontmatter
      .replace(/\[([^\]]*)\]\([^\)]*\)/g, '$1') // Remove markdown links, keep text
      .replace(/!\[([^\]]*)\]\([^\)]*\)/g, '') // Remove images
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`[^`]*`/g, '') // Remove inline code
      .replace(/#{1,6}\s+/g, '') // Remove markdown headers
      .replace(/\*\*([^\*]*)\*\*/g, '$1') // Remove bold
      .replace(/\*([^\*]*)\*/g, '$1') // Remove italic
      .replace(/<[^>]*>/g, '') // Remove any HTML tags (in case of mixed content)
      .replace(/&nbsp;/g, ' ') // Replace HTML entities
      .replace(/&[a-z]+;/gi, ' ') // Replace other HTML entities
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
    
    // Truncate to max length, ensuring we don't cut words
    if (text.length > maxLength) {
      text = text.substring(0, maxLength);
      const lastSpace = text.lastIndexOf(' ');
      if (lastSpace > 0) {
        text = text.substring(0, lastSpace);
      }
      text += '...';
    }
    
    return text;
  }

  // Generate meta description from content if not provided (filter version)
  eleventyConfig.addFilter("getMetaDescription", function(content, customDescription, maxLength = 155) {
    return generateMetaDescription(content, customDescription, maxLength);
  });

  // Get meta description from page templateContent
  eleventyConfig.addFilter("getMetaDescriptionFromPage", function(page, customDescription, maxLength = 155) {
    if (customDescription && typeof customDescription === 'string' && customDescription.trim()) {
      return customDescription.trim();
    }
    
    // Try multiple ways to access templateContent
    const templateContent = page?.templateContent 
      || page?.data?.page?.templateContent 
      || page?.template?.templateContent
      || (page?.inputPath && require('fs').existsSync(page.inputPath) ? require('fs').readFileSync(page.inputPath, 'utf8') : null);
    
    if (!templateContent || typeof templateContent !== 'string') {
      return '';
    }
    
    return generateMetaDescription(templateContent, null, maxLength);
  });

  // Add a global data transform to compute autoDescription
  eleventyConfig.addGlobalData("computeAutoDescription", function() {
    // This will be called per-page via eleventyComputed in individual data files
    return null;
  });


  // Get robots meta tag
  eleventyConfig.addFilter("getRobotsMeta", function(noindex, nofollow) {
    const directives = [];
    if (noindex) directives.push('noindex');
    if (nofollow) directives.push('nofollow');
    return directives.length > 0 ? directives.join(', ') : 'index, follow';
  });

  // Get post type label
  eleventyConfig.addFilter("getPostTypeLabel", function(item) {
    if (!item || !item.data) return "";
    const type = item.data.type;
    if (type === "project") {
      // For projects, try to get projectTypes
      const projectTypes = item.data.projectTypes || [];
      if (projectTypes.length > 0) {
        return projectTypes[0] + " Projects";
      }
      return "Project";
    }
    if (type === "project-log") return "Project Log";
    if (type === "experiment") {
      // For experiments, try to get experimentTypes
      const experimentTypes = item.data.experimentTypes || [];
      if (experimentTypes.length > 0) {
        return experimentTypes[0] + " Experiments";
      }
      return "Experiment";
    }
    if (type === "experiment-log") return "Experiment Log";
    if (type === "post" || !type) {
      // For regular posts, try to get category
      const categories = item.data.categories || [];
      if (categories.length > 0) {
        return categories[0];
      }
      return "Blog";
    }
    return "";
  });

  eleventyConfig.addFilter("findProjectBySlug", function(projects, slug) {
    if (!projects || !Array.isArray(projects)) return null;
    return projects.find(p => {
      const projectSlug = p.filePathStem.split('/').slice(-2, -1)[0];
      return projectSlug === slug;
    }) || null;
  });

  eleventyConfig.addFilter("findExperimentBySlug", function(experiments, slug) {
    if (!experiments || !Array.isArray(experiments)) return null;
    return experiments.find(e => {
      const experimentSlug = e.filePathStem.split('/').slice(-2, -1)[0];
      return experimentSlug === slug;
    }) || null;
  });

  // Generate sitemap
  eleventyConfig.on('eleventy.after', async ({ results }) => {
    const { writeFileSync } = require('fs');
    const { join } = require('path');
    
    const siteUrl = 'https://alfredbaudisch.com';
    
    // Get all pages from results
    const allPages = results.filter(page => {
      // Must have outputPath
      if (!page.outputPath) return false;
      
      // Only HTML files
      if (!page.outputPath.endsWith('.html')) return false;
      
      // Exclude feed.xml and sitemap.xml (they're not HTML but check anyway)
      if (page.outputPath.includes('/feed.xml') || page.outputPath.includes('/sitemap.xml')) {
        return false;
      }
      
      // Exclude drafts - check if page.data exists first
      if (page.data && page.data.draft) return false;

      // Exclude redirect pages
      if (page.data && page.data.sitemap === false) return false;
      
      return true;
    });
    
    // Normalize URLs and create sitemap entries
    const sitemapEntries = allPages.map(page => {
      let url = page.url;
      
      // If no url, derive from outputPath
      if (!url) {
        url = page.outputPath.replace(/^_site/, '').replace(/\/index\.html$/, '/').replace(/\.html$/, '');
        // Ensure leading slash
        if (!url.startsWith('/')) url = '/' + url;
      }
      
      // Normalize index.html to /
      if (url === '/index.html' || url.endsWith('/index.html')) {
        url = url.replace(/\/index\.html$/, '/');
      }
      
      // Get last modified date
      const lastmod = page.data?.updated || page.data?.date || new Date();
      const lastmodDate = lastmod instanceof Date ? lastmod : new Date(lastmod);
      
      // Determine changefreq and priority
      const type = page.data?.type;
      let changefreq = 'weekly';
      let priority = '0.8';
      
      if (url === '/') {
        priority = '1.0';
        changefreq = 'daily';
      } else if (type === 'page') {
        changefreq = 'monthly';
        priority = '0.7';
      } else if (type === 'post' || type === 'project' || type === 'experiment') {
        changefreq = 'weekly';
        priority = '0.8';
      } else if (type === 'projectLog' || type === 'experimentLog') {
        changefreq = 'monthly';
        priority = '0.6';
      }
      
      return {
        url,
        lastmod: lastmodDate.toISOString().split('T')[0],
        changefreq,
        priority
      };
    });
    
    // Sort by URL for consistency
    sitemapEntries.sort((a, b) => a.url.localeCompare(b.url));
    
    // Generate XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.map(entry => `  <url>
    <loc>${siteUrl}${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
    
    writeFileSync(join('_site', 'sitemap.xml'), sitemap);
    console.log(`✓ Generated sitemap.xml with ${sitemapEntries.length} URLs`);

    writeNginxRedirects(siteRedirects);
  });

  // Copy robots.txt
  eleventyConfig.addPassthroughCopy('content/robots.txt');

  // Shortcodes
  eleventyConfig.addShortcode("projectLinks", function() {
    const links = this.ctx.links;

    if (!links || !Array.isArray(links) || links.length === 0) {
      return "";
    }

    return renderLinksSection(links);
  });

  eleventyConfig.addShortcode("imageGallery", function(images) {
    if (!images || !Array.isArray(images)) return "";
    const imagesHtml = images.map((img, index) => {
      const src = img.src || img;
      const caption = img.caption || "";
      const link = img.link || "";
      const alt = img.alt || caption || "";
      
      let imgTag = `<img src="${src}" alt="${alt}" loading="lazy" data-gallery-index="${index}">`;
      
      if (link) {
        return `<a href="${link}" class="gallery-item">${imgTag}${caption ? `<span class="gallery-caption">${caption}</span>` : ""}</a>`;
      } else {
        return `<div class="gallery-item" data-lightbox>${imgTag}${caption ? `<span class="gallery-caption">${caption}</span>` : ""}</div>`;
      }
    }).join("");
    
    return `<div class="image-gallery">${imagesHtml}</div>`;
  });


  return {
    dir: {
      input: "content",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};

