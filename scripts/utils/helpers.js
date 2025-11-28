/**
 * Helper utilities for WordPress migration
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const TurndownService = require('turndown');
const slugify = require('slugify');
const { URL } = require('url');

/**
 * Convert HTML to Markdown
 */
function htmlToMarkdown(html) {
  if (!html) return '';
  
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-'
  });
  
  // Configure code blocks
  turndownService.addRule('codeBlock', {
    filter: 'pre',
    replacement: function(content, node) {
      const code = node.querySelector('code');
      if (code) {
        const lang = code.className.match(/language-(\w+)/);
        const langAttr = lang ? lang[1] : '';
        return `\n\`\`\`${langAttr}\n${code.textContent}\n\`\`\`\n`;
      }
      return `\n\`\`\`\n${content}\n\`\`\`\n`;
    }
  });
  
  // Handle YouTube iframes - preserve as HTML
  turndownService.addRule('youtubeEmbed', {
    filter: function(node) {
      return node.tagName === 'IFRAME' && 
             node.src && 
             (node.src.includes('youtube.com/embed') || node.src.includes('youtu.be'));
    },
    replacement: function(content, node) {
      // Extract video ID from YouTube URL
      const src = node.getAttribute('src') || '';
      let videoId = null;
      
      // Match youtube.com/embed/VIDEO_ID or youtu.be/VIDEO_ID
      const embedMatch = src.match(/(?:youtube\.com\/embed\/|youtu\.be\/)([^?&]+)/);
      if (embedMatch) {
        videoId = embedMatch[1];
      }
      
      if (videoId) {
        // Create a YouTube embed iframe
        const title = node.getAttribute('title') || 'YouTube video player';
        const width = node.getAttribute('width') || '560';
        const height = node.getAttribute('height') || '315';
        return `\n<iframe width="${width}" height="${height}" src="https://www.youtube.com/embed/${videoId}" title="${title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>\n`;
      }
      
      // Fallback: preserve original iframe
      return `\n${node.outerHTML}\n`;
    }
  });
  
  // Handle video tags - preserve as HTML
  turndownService.addRule('videoTag', {
    filter: 'video',
    replacement: function(content, node) {
      // Preserve video tag with all attributes
      return `\n${node.outerHTML}\n`;
    }
  });
  
  // Handle WordPress gallery blocks - convert to imageGallery shortcode
  turndownService.addRule('wpGallery', {
    filter: function(node) {
      return node.tagName === 'FIGURE' && 
             node.classList.contains('wp-block-gallery');
    },
    replacement: function(content, node) {
      const galleryItems = node.querySelectorAll('.blocks-gallery-item figure, .wp-block-image');
      const images = [];
      
      galleryItems.forEach(item => {
        const img = item.querySelector('img');
        const figcaption = item.querySelector('figcaption');
        const link = item.querySelector('a');
        
        if (!img) return;
        
        const imgSrc = img.getAttribute('src') || '';
        const linkHref = link ? link.getAttribute('href') : null;
        const alt = img.getAttribute('alt') || '';
        const caption = figcaption ? figcaption.textContent.trim() : '';
        
        // Convert WordPress URL to local media path if needed
        let localSrc = imgSrc;
        if (imgSrc.includes('wp-content/uploads')) {
          // Extract the path after wp-content/uploads
          const match = imgSrc.match(/wp-content\/uploads\/(.+)$/);
          if (match) {
            localSrc = `/media/wp-content/${match[1]}`;
          }
        }
        
        // Use data-full-url if available (full-size image)
        const fullUrl = img.getAttribute('data-full-url');
        if (fullUrl) {
          if (fullUrl.includes('wp-content/uploads')) {
            const match = fullUrl.match(/wp-content\/uploads\/(.+)$/);
            if (match) {
              localSrc = `/media/wp-content/${match[1]}`;
            }
          } else {
            localSrc = fullUrl;
          }
        }
        
        const imageObj = {
          src: localSrc,
          alt: alt || caption || '',
          caption: caption || ''
        };
        
        // Add link if present and it's an image URL
        if (linkHref) {
          const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
          const isImageUrl = imageExtensions.some(ext => linkHref.toLowerCase().includes(ext));
          if (isImageUrl) {
            // Convert WordPress URL to local media path
            if (linkHref.includes('wp-content/uploads')) {
              const match = linkHref.match(/wp-content\/uploads\/(.+)$/);
              if (match) {
                imageObj.link = `/media/wp-content/${match[1]}`;
              } else {
                imageObj.link = linkHref;
              }
            } else {
              imageObj.link = linkHref;
            }
          }
        }
        
        images.push(imageObj);
      });
      
      if (images.length === 0) {
        return content;
      }
      
      // Generate imageGallery shortcode in Nunjucks format
      // Format: {% imageGallery [ { src: "...", caption: "...", link: "..." }, ... ] %}
      const imageStrings = images.map(img => {
        // Escape quotes in strings
        const escapeQuotes = (str) => (str || '').replace(/"/g, '\\"').replace(/\n/g, ' ');
        const src = escapeQuotes(img.src);
        const alt = escapeQuotes(img.alt || img.caption || '');
        const caption = escapeQuotes(img.caption || '');
        
        let imgStr = `{ src: "${src}", alt: "${alt}", caption: "${caption}"`;
        if (img.link) {
          const link = escapeQuotes(img.link);
          imgStr += `, link: "${link}"`;
        }
        imgStr += ' }';
        return imgStr;
      });
      
      return `\n{% imageGallery [ ${imageStrings.join(', ')} ] %}\n`;
    }
  });
  
  // Handle figure elements containing images with captions
  turndownService.addRule('figureImage', {
    filter: function(node) {
      return node.tagName === 'FIGURE' && 
             node.querySelector('img') &&
             !node.querySelector('iframe') &&
             !node.querySelector('video') &&
             !node.classList.contains('wp-block-gallery');
    },
    replacement: function(content, node) {
      const img = node.querySelector('img');
      const figcaption = node.querySelector('figcaption');
      const link = node.querySelector('a');
      
      if (!img) {
        return content;
      }
      
      // Get image source and link
      const imgSrc = img.getAttribute('src') || '';
      const linkHref = link ? link.getAttribute('href') : null;
      
      // Get alt text
      const alt = img.getAttribute('alt') || '';
      
      // Get caption text
      const caption = figcaption ? figcaption.textContent.trim() : '';
      
      // Only preserve as HTML figure if there's a caption
      // Otherwise, convert to regular markdown image syntax
      if (caption) {
        // Build the figure HTML with caption
        let figureHtml = '\n<figure class="wp-block-image">\n';
        
        // If there's a link, wrap image in link (use link href for the link, img src for display)
        if (link && linkHref) {
          figureHtml += `  <a href="${linkHref}"><img src="${imgSrc}" alt="${alt}" loading="lazy"></a>\n`;
        } else {
          figureHtml += `  <img src="${imgSrc}" alt="${alt}" loading="lazy">\n`;
        }
        
        figureHtml += `  <figcaption>${caption}</figcaption>\n`;
        figureHtml += '</figure>\n';
        
        return figureHtml;
      } else {
        // No caption - convert to regular markdown image syntax
        // Use the link href if present, otherwise just the image
        if (link && linkHref) {
          return `\n[![${alt}](${imgSrc})](${linkHref})\n`;
        } else {
          return `\n![${alt}](${imgSrc})\n`;
        }
      }
    }
  });
  
  // Handle figure elements containing iframes or videos
  turndownService.addRule('figureEmbed', {
    filter: function(node) {
      return node.tagName === 'FIGURE' && 
             (node.querySelector('iframe') || node.querySelector('video'));
    },
    replacement: function(content, node) {
      // Extract the iframe or video from inside the figure
      const iframe = node.querySelector('iframe');
      const video = node.querySelector('video');
      const figcaption = node.querySelector('figcaption');
      const caption = figcaption ? figcaption.textContent.trim() : '';
      
      if (iframe) {
        // Process the iframe (YouTube or other)
        const src = iframe.getAttribute('src') || '';
        let videoId = null;
        
        const embedMatch = src.match(/(?:youtube\.com\/embed\/|youtu\.be\/)([^?&]+)/);
        if (embedMatch) {
          videoId = embedMatch[1];
        }
        
        if (videoId) {
          const title = iframe.getAttribute('title') || 'YouTube video player';
          const width = iframe.getAttribute('width') || '560';
          const height = iframe.getAttribute('height') || '315';
          let result = `\n<iframe width="${width}" height="${height}" src="https://www.youtube.com/embed/${videoId}" title="${title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>\n`;
          if (caption) {
            result = `\n<figure>\n${result}<figcaption>${caption}</figcaption>\n</figure>\n`;
          }
          return result;
        }
        
        // Preserve original iframe with caption if present
        if (caption) {
          return `\n<figure>\n${iframe.outerHTML}\n<figcaption>${caption}</figcaption>\n</figure>\n`;
        }
        return `\n${iframe.outerHTML}\n`;
      }
      
      if (video) {
        // Preserve video tag with caption if present
        if (caption) {
          return `\n<figure>\n${video.outerHTML}\n<figcaption>${caption}</figcaption>\n</figure>\n`;
        }
        return `\n${video.outerHTML}\n`;
      }
      
      return content;
    }
  });
  
  let markdown = turndownService.turndown(html || '');
  
  // Fix escaped underscores in code blocks (fenced code blocks with ```)
  // Match code blocks: ```lang\ncontent\n```
  markdown = markdown.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, codeContent) => {
    // Unescape underscores in code content
    let fixedCode = codeContent.replace(/\\_/g, '_');
    fixedCode = fixedCode.replace(/\\\]/g, ']');
    fixedCode = fixedCode.replace(/\\\[/g, '[');
    fixedCode = fixedCode.replace(/\\\*/g, '*');
    return `\`\`\`${lang || ''}\n${fixedCode}\`\`\``;
  });
  
  // Fix escaped underscores in inline code (backticks)
  markdown = markdown.replace(/`([^`]+)`/g, (match, codeContent) => {
    // Unescape underscores in inline code
    let fixedCode = codeContent.replace(/\\_/g, '_');
    fixedCode = fixedCode.replace(/\\\]/g, ']');
    fixedCode = fixedCode.replace(/\\\[/g, '[');
    fixedCode = fixedCode.replace(/\\\*/g, '*');
    return `\`${fixedCode}\``;
  });
  
  // Fix escaped underscores in URLs
  // Match markdown links [text](url) and plain URLs
  markdown = markdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    // Unescape underscores in URL
    const fixedUrl = url.replace(/\\_/g, '_');
    return `[${text}](${fixedUrl})`;
  });
  
  // Also fix plain URLs (not in markdown links) - match URLs starting with http:// or https://
  markdown = markdown.replace(/(https?:\/\/[^\s\)]+)/g, (match, url) => {
    // Unescape underscores in plain URLs
    return url.replace(/\\_/g, '_');
  });
  
  // Replace WordPress media URLs with local media paths
  // Replace https://alfredbaudisch.com/wp-content/uploads/ with /media/wp-content/
  markdown = markdown.replace(/https?:\/\/alfredbaudisch\.com\/wp-content\/uploads\//g, '/media/wp-content/');
  // Also handle www.alfredbaudisch.com
  markdown = markdown.replace(/https?:\/\/www\.alfredbaudisch\.com\/wp-content\/uploads\//g, '/media/wp-content/');
  
  return markdown;
}

/**
 * Convert WordPress media URL to local media path
 * Converts https://alfredbaudisch.com/wp-content/uploads/... to /media/wp-content/...
 */
function convertWordPressUrlToLocalPath(url) {
  if (!url || typeof url !== 'string') return url;
  
  // Replace WordPress URLs with local media paths
  let localPath = url.replace(/https?:\/\/alfredbaudisch\.com\/wp-content\/uploads\//g, '/media/wp-content/');
  localPath = localPath.replace(/https?:\/\/www\.alfredbaudisch\.com\/wp-content\/uploads\//g, '/media/wp-content/');
  
  return localPath;
}

/**
 * Decode HTML entities in text
 */
function decodeHtmlEntities(text) {
  if (!text || typeof text !== 'string') return text;
  
  // Common HTML entities mapping
  const entities = {
    '&#8220;': '"',
    '&#8221;': '"',
    '&#8216;': "'",
    '&#8217;': "'",
    '&#8211;': '–',
    '&#8212;': '—',
    '&#8230;': '…',
    '&quot;': '"',
    '&apos;': "'",
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&nbsp;': ' ',
    '&#39;': "'"
  };
  
  let decoded = text;
  
  // Replace numeric entities (&#8220;)
  decoded = decoded.replace(/&#(\d+);/g, (match, num) => {
    return String.fromCharCode(parseInt(num, 10));
  });
  
  // Replace hex entities (&#x201C;)
  decoded = decoded.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });
  
  // Replace named entities
  Object.keys(entities).forEach(entity => {
    decoded = decoded.replace(new RegExp(entity, 'g'), entities[entity]);
  });
  
  return decoded;
}

/**
 * Remove project type suffix from title (e.g., "(Open-source Projects)")
 * Only removes if it matches the pattern "(Type Projects)" at the end
 */
function cleanProjectTitle(title) {
  if (!title || typeof title !== 'string') return title;
  
  // Match pattern: (anything) Projects) at the end of the string
  // Examples: "(Open-source Projects)", "(Education Projects)", "(Games Projects)"
  const pattern = /\s*\([^)]+\s+Projects\)\s*$/;
  
  return title.replace(pattern, '').trim();
}

/**
 * Generate slug from title
 */
function generateSlug(title) {
  return slugify(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
}

/**
 * Format date
 */
function formatDate(dateString) {
  if (!dateString) return null;
  // WordPress dates come in ISO 8601 format (e.g., "2021-03-11T12:34:56" or "2021-03-11T12:34:56+00:00")
  // Parse and return full ISO string with time component
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    console.warn(`Invalid date string: ${dateString}`);
    return null;
  }
  // Return full ISO 8601 string with time (YYYY-MM-DDTHH:mm:ss.sssZ)
  return date.toISOString();
}

/**
 * Format date for filename (date only, no time)
 * Returns YYYY-MM-DD format
 */
function formatDateForFilename(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    console.warn(`Invalid date string: ${dateString}`);
    return null;
  }
  return date.toISOString().split('T')[0];
}

/**
 * Extract excerpt from content
 */
function extractExcerpt(content, maxLength = 200) {
  if (!content) return '';
  const text = content.replace(/<[^>]*>/g, '').trim();
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

/**
 * Process image URLs in content
 */
function processImageUrls(html, baseUrl, mediaMap = {}) {
  if (!html) return html;
  
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const images = document.querySelectorAll('img');
  
  images.forEach(img => {
    const src = img.getAttribute('src');
    if (src) {
      // Convert relative URLs to absolute
      let absoluteUrl = src;
      if (src.startsWith('/')) {
        absoluteUrl = baseUrl.replace(/\/$/, '') + src;
      } else if (!src.startsWith('http')) {
        absoluteUrl = baseUrl.replace(/\/$/, '') + '/' + src;
      }
      
      // Map to new location if available
      if (mediaMap[absoluteUrl]) {
        img.setAttribute('src', mediaMap[absoluteUrl]);
      } else {
        img.setAttribute('src', absoluteUrl);
      }
    }
  });
  
  return document.body.innerHTML;
}

/**
 * Ensure directory exists
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Write file safely
 */
function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
}

/**
 * Read JSON file
 */
function readJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Create taxonomy lookup object from taxonomies.json
 * Returns: { [taxonomyType]: { [id]: name } }
 */
function createTaxonomyLookup(taxonomies) {
  const lookup = {};
  
  if (!taxonomies || typeof taxonomies !== 'object') {
    return lookup;
  }
  
  // Iterate through each taxonomy type
  Object.keys(taxonomies).forEach(taxonomyType => {
    lookup[taxonomyType] = {};
    
    // Each taxonomy type contains an array of terms
    if (Array.isArray(taxonomies[taxonomyType])) {
      taxonomies[taxonomyType].forEach(term => {
        if (term && term.id && term.name) {
          lookup[taxonomyType][term.id] = term.name;
        }
      });
    }
  });
  
  return lookup;
}

/**
 * Map WordPress taxonomy name to site metadata name
 */
function mapTaxonomyName(wpTaxonomyName) {
  const mapping = {
    'project-style': 'projectStyles',
    'project-status': 'projectStatus',
    'project-type': 'projectTypes',
    'project_types': 'projectTypes',
    'project_styles': 'projectStyles',
    'project_status': 'projectStatus',
    'experiment-type': 'experimentTypes',
    'experiment_types': 'experimentTypes',
    'log-category': 'logCategories',
    'log_categories': 'logCategories',
    'tool': 'tools',
    'tools': 'tools',
    'tags': 'tags',
    'category': 'categories',
    'categories': 'categories'
  };
  
  return mapping[wpTaxonomyName] || wpTaxonomyName;
}

/**
 * Get WordPress taxonomy name from site metadata name (reverse mapping)
 */
function getWPTaxonomyName(siteTaxonomyName) {
  const mapping = {
    'projectStyles': 'project-style',
    'projectStatus': 'project-status',
    'projectTypes': 'project-type',
    'experimentTypes': 'experiment-type',
    'logCategories': 'log-category',
    'tools': 'tool',
    'tags': 'tags',
    'categories': 'category'
  };
  
  return mapping[siteTaxonomyName] || siteTaxonomyName;
}

/**
 * Get taxonomy terms from WordPress item by looking up IDs
 * @param {Object} item - WordPress post/project/experiment object
 * @param {string} wpTaxonomyName - WordPress taxonomy name (e.g., 'project-style', 'tags')
 * @param {Object} taxonomyLookup - Lookup object created by createTaxonomyLookup
 * @returns {Array<string>} Array of term names
 */
function getTaxonomyTerms(item, wpTaxonomyName, taxonomyLookup) {
  if (!item || !taxonomyLookup) {
    return [];
  }
  
  // Get the array of IDs from the WordPress item
  const ids = item[wpTaxonomyName] || [];
  
  if (!Array.isArray(ids) || ids.length === 0) {
    return [];
  }
  
  // Look up each ID and get the name
  const lookup = taxonomyLookup[wpTaxonomyName] || {};
  const terms = ids
    .map(id => {
      // Handle both string and number IDs
      const termName = lookup[Number(id)] || lookup[String(id)];
      return termName;
    })
    .filter(name => name !== undefined && name !== null);
  
  return terms;
}

/**
 * Create media lookup object from media.json
 * Returns: { [id]: { filename, extension, fullUrl } }
 */
function createMediaLookup(media) {
  const lookup = {};
  
  if (!media || !Array.isArray(media)) {
    return lookup;
  }
  
  media.forEach(item => {
    if (!item || !item.id) return;
    
    // Extract filename from guid.rendered or sizes.full.source_url
    let filename = null;
    let extension = null;
    let fullUrl = null;
    let thumbUrl = null;
    let smallUrl = null;
    
    // Try media_details.sizes.full.source_url first (most reliable)
    if (item.media_details && item.media_details.sizes && item.media_details.sizes.full && item.media_details.sizes.full.source_url) {
      fullUrl = item.media_details.sizes.full.source_url;
      const urlPath = new URL(fullUrl).pathname;
      filename = path.basename(urlPath);
    }
    // Fallback to guid.rendered
    else if (item.guid && item.guid.rendered) {
      fullUrl = item.guid.rendered;
      const urlPath = new URL(fullUrl).pathname;
      filename = path.basename(urlPath);
    }
    
    // ---------- THUMBNAIL ----------
    // Get medium_large size URL for thumbnail
    if (item.media_details && item.media_details.sizes && item.media_details.sizes.medium_large && item.media_details.sizes.medium_large.source_url) {
      thumbUrl = item.media_details.sizes.medium_large.source_url;
    }
    // Fallback to medium if medium_large doesn't exist
    else if (item.media_details && item.media_details.sizes && item.media_details.sizes.medium && item.media_details.sizes.medium.source_url) {
      thumbUrl = item.media_details.sizes.medium.source_url;
    }
    // Fallback to large if medium doesn't exist
    else if (item.media_details && item.media_details.sizes && item.media_details.sizes.large && item.media_details.sizes.large.source_url) {
      thumbUrl = item.media_details.sizes.large.source_url;
    }
    // Final fallback to full URL if no size variants exist
    else if (fullUrl) {
      thumbUrl = fullUrl;
    }

    // ---------- SMALL ----------
    if (item.media_details && item.media_details.sizes && item.media_details.sizes.medium && item.media_details.sizes.medium.source_url) {
      smallUrl = item.media_details.sizes.medium.source_url;
    }
    // Fallback to small if medium doesn't exist
    else if (item.media_details && item.media_details.sizes && item.media_details.sizes.small && item.media_details.sizes.small.source_url) {
      smallUrl = item.media_details.sizes.small.source_url;
    }
    // Final fallback to full URL if no size variants exist
    else if (fullUrl) {
      smallUrl = fullUrl;
    }
    
    if (filename) {
      // Extract extension
      const extMatch = filename.match(/\.([^.]+)$/);
      extension = extMatch ? extMatch[1] : '';
      
      // Remove extension to get base name
      const baseName = extension ? filename.slice(0, -(extension.length + 1)) : filename;
      
      lookup[item.id] = {
        filename: filename,
        baseName: baseName,
        extension: extension,
        fullUrl: fullUrl,
        thumbUrl: thumbUrl,
        smallUrl: smallUrl
      };
    }
  });
  
  return lookup;
}

/**
 * Get media filename from WordPress item by looking up featured_media ID
 * @param {Object} item - WordPress post/project/experiment object
 * @param {Object} mediaLookup - Lookup object created by createMediaLookup
 * @returns {string|null} Filename or null if not found
 */
function getMediaFilename(item, mediaLookup) {
  if (!item || !mediaLookup || !item.featured_media) {
    return null;
  }
  
  const mediaId = Number(item.featured_media) || String(item.featured_media);
  const mediaInfo = mediaLookup[mediaId];
  
  return mediaInfo ? mediaInfo.filename : null;
}

/**
 * Get media full URL from WordPress item by looking up featured_media ID
 * @param {Object} item - WordPress post/project/experiment object
 * @param {Object} mediaLookup - Lookup object created by createMediaLookup
 * @returns {string|null} Full URL or null if not found
 */
function getMediaFullUrl(item, mediaLookup) {
  if (!item || !mediaLookup || !item.featured_media) {
    return null;
  }
  
  const mediaId = Number(item.featured_media) || String(item.featured_media);
  const mediaInfo = mediaLookup[mediaId];
  
  return mediaInfo ? mediaInfo.fullUrl : null;
}

/**
 * Get media thumbnail URL (medium size) from WordPress item by looking up featured_media ID
 * @param {Object} item - WordPress post/project/experiment object
 * @param {Object} mediaLookup - Lookup object created by createMediaLookup
 * @returns {string|null} Thumbnail URL or null if not found
 */
function getMediaThumbUrl(item, mediaLookup) {
  if (!item || !mediaLookup || !item.featured_media) {
    return null;
  }
  
  const mediaId = Number(item.featured_media) || String(item.featured_media);
  const mediaInfo = mediaLookup[mediaId];
  
  return mediaInfo ? mediaInfo.thumbUrl : null;
}

/**
 * Get media medium URL (medium_large size) from WordPress item by looking up featured_media ID
 * @param {Object} item - WordPress post/project/experiment object
 * @param {Object} mediaLookup - Lookup object created by createMediaLookup
 * @returns {string|null} Medium URL or null if not found
 */
function getMediaSmallUrl(item, mediaLookup) {
  if (!item || !mediaLookup || !item.featured_media) {
    return null;
  }
  
  const mediaId = Number(item.featured_media) || String(item.featured_media);
  const mediaInfo = mediaLookup[mediaId];
  
  return mediaInfo ? mediaInfo.smallUrl : null;
}

/**
 * Get media base name (without extension) from WordPress item
 * @param {Object} item - WordPress post/project/experiment object
 * @param {Object} mediaLookup - Lookup object created by createMediaLookup
 * @returns {string|null} Base name or null if not found
 */
function getMediaBaseName(item, mediaLookup) {
  if (!item || !mediaLookup || !item.featured_media) {
    return null;
  }
  
  const mediaId = Number(item.featured_media) || String(item.featured_media);
  const mediaInfo = mediaLookup[mediaId];
  
  return mediaInfo ? mediaInfo.baseName : null;
}

/**
 * Get media extension from WordPress item
 * @param {Object} item - WordPress post/project/experiment object
 * @param {Object} mediaLookup - Lookup object created by createMediaLookup
 * @returns {string|null} Extension or null if not found
 */
function getMediaExtension(item, mediaLookup) {
  if (!item || !mediaLookup || !item.featured_media) {
    return null;
  }
  
  const mediaId = Number(item.featured_media) || String(item.featured_media);
  const mediaInfo = mediaLookup[mediaId];
  
  return mediaInfo ? mediaInfo.extension : null;
}

/**
 * Get process image URL from WordPress item by looking up meta field
 * @param {Object} item - WordPress post/project/experiment object
 * @param {Object} mediaLookup - Lookup object created by createMediaLookup
 * @param {string} metaFieldName - Meta field name (e.g., 'project_process_images')
 * @returns {string|null} Process image URL or null if not found
 */
function getProcessImageUrl(item, mediaLookup, metaFieldName) {
  if (!item || !mediaLookup || !metaFieldName) {
    return null;
  }
  
  // Access meta field - could be item.meta[metaFieldName] or item[metaFieldName]
  const meta = item.meta || {};
  const processImageId = meta[metaFieldName];
  
  if (!processImageId) {
    return null;
  }
  
  // Handle both string and number IDs
  const mediaId = Number(processImageId) || String(processImageId);
  const mediaInfo = mediaLookup[mediaId];
  
  return mediaInfo ? mediaInfo.fullUrl : null;
}

/**
 * Extract links from WordPress meta field
 * @param {Object} item - WordPress post/project/experiment object
 * @param {string} metaFieldName - Meta field name (e.g., 'project_links')
 * @returns {Array<{name: string, url: string}>} Array of link objects or empty array
 */
function getLinksFromMeta(item, metaFieldName) {
  if (!item || !metaFieldName) {
    return [];
  }
  
  // Access meta field - could be item.meta[metaFieldName] or item[metaFieldName]
  const meta = item.meta || {};
  const linksData = meta[metaFieldName];
  
  if (!linksData || !Array.isArray(linksData)) {
    return [];
  }
  
  // WordPress links come as array of arrays: [["Name", "URL"], ...]
  return linksData
    .filter(link => Array.isArray(link) && link.length >= 2)
    .map(link => ({
      name: String(link[0] || '').trim(),
      url: String(link[1] || '').trim()
    }))
    .filter(link => link.name && link.url);
}

/**
 * Extract meta description from Yoast SEO head HTML
 * @param {string} yoastHead - Yoast SEO head HTML string
 * @returns {string|null} Meta description content or null if not found
 */
function extractMetaDescriptionFromYoast(yoastHead) {
  if (!yoastHead || typeof yoastHead !== 'string') {
    return null;
  }
  
  // Match <meta name="description" content="...">
  const match = yoastHead.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']\s*\/?>/i);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  return null;
}

module.exports = {
  htmlToMarkdown,
  decodeHtmlEntities,
  cleanProjectTitle,
  generateSlug,
  formatDate,
  formatDateForFilename,
  extractExcerpt,
  processImageUrls,
  ensureDir,
  writeFile,
  readJSON,
  createTaxonomyLookup,
  mapTaxonomyName,
  getWPTaxonomyName,
  getTaxonomyTerms,
  createMediaLookup,
  getMediaFilename,
  getMediaFullUrl,
  getMediaThumbUrl,
  getMediaSmallUrl,
  getMediaBaseName,
  getMediaExtension,
  getProcessImageUrl,
  getLinksFromMeta,
  extractMetaDescriptionFromYoast,
  convertWordPressUrlToLocalPath
};

