#!/usr/bin/env node

/**
 * WordPress Export Script
 * Exports all content from WordPress REST API to JSON files
 * 
 * Usage: node scripts/migrate/export-wp.js --url=https://yourwordpress.com --output=scripts/migrate/data
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const args = process.argv.slice(2);
const config = {
  url: 'http://localhost',
  output: path.join(__dirname, 'data'),
  username: '',
  password: ''
};

// Parse command line arguments
args.forEach(arg => {
  const [key, value] = arg.split('=');
  if (key.startsWith('--')) {
    const configKey = key.slice(2);
    if (config.hasOwnProperty(configKey)) {
      config[configKey] = value;
    }
  }
});

// Ensure output directory exists
if (!fs.existsSync(config.output)) {
  fs.mkdirSync(config.output, { recursive: true });
}

/**
 * Make HTTP/HTTPS request
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'WordPress-to-11ty-Migration',
        ...options.headers
      }
    };
    
    // Add basic auth if provided
    if (config.username && config.password) {
      const auth = Buffer.from(`${config.username}:${config.password}`).toString('base64');
      requestOptions.headers['Authorization'] = `Basic ${auth}`;
    }
    
    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

/**
 * Fetch all posts of a specific type
 */
async function fetchAllPosts(postType, baseUrl) {
  const posts = [];
  let page = 1;
  let hasMore = true;
  
  console.log(`Fetching ${postType}...`);
  
  while (hasMore) {
    try {
      const url = `${baseUrl}/wp-json/wp/v2/${postType}?per_page=100&page=${page}`;
      const data = await makeRequest(url);
      
      if (Array.isArray(data) && data.length > 0) {
        posts.push(...data);
        page++;
        console.log(`  Fetched page ${page - 1}, total: ${posts.length}`);
      } else {
        hasMore = false;
      }
    } catch (error) {
      console.error(`Error fetching ${postType} page ${page}:`, error.message);
      hasMore = false;
    }
  }
  
  return posts;
}

/**
 * Fetch all taxonomies
 */
async function fetchTaxonomies(baseUrl) {
  const taxonomies = {};
  
  const taxonomyNames = [
    'project-style',
    'project-status',
    'tool',
    'project-type',
    'log-category',
    'experiment-type',
    'tags',
    'categories'
  ];
  
  console.log('Fetching taxonomies...');
  
  for (const taxName of taxonomyNames) {
    try {
      const terms = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        try {
          const url = `${baseUrl}/wp-json/wp/v2/${taxName}?per_page=100&page=${page}`;
          const data = await makeRequest(url);
          
          if (Array.isArray(data) && data.length > 0) {
            terms.push(...data);
            page++;
          } else {
            hasMore = false;
          }
        } catch (error) {
          console.error(`  Error fetching ${taxName} page ${page}:`, error.message);
          hasMore = false;
        }
      }
      
      taxonomies[taxName] = terms;
      console.log(`  Fetched ${taxName}: ${taxonomies[taxName].length} terms`);
    } catch (error) {
      console.log(`  ${taxName} not found or empty`);
      taxonomies[taxName] = [];
    }
  }
  
  return taxonomies;
}

/**
 * Fetch all media
 */
async function fetchAllMedia(baseUrl) {
  const media = [];
  let page = 1;
  let hasMore = true;
  
  console.log('Fetching media...');
  
  while (hasMore) {
    try {
      const url = `${baseUrl}/wp-json/wp/v2/media?per_page=100&page=${page}`;
      const data = await makeRequest(url);
      
      if (Array.isArray(data) && data.length > 0) {
        media.push(...data);
        page++;
        console.log(`  Fetched page ${page - 1}, total: ${media.length}`);
      } else {
        hasMore = false;
      }
    } catch (error) {
      console.error(`Error fetching media page ${page}:`, error.message);
      hasMore = false;
    }
  }
  
  return media;
}

/**
 * Main export function
 */
async function exportWordPress() {
  const baseUrl = config.url.replace(/\/$/, '');
  
  console.log(`Exporting from: ${baseUrl}`);
  console.log(`Output directory: ${config.output}`);
  console.log('');
  
  try {
    // Fetch all post types
    const postTypes = ['posts', 'projects', 'project-logs', 'experiments', 'experiment-logs'];
    const allPosts = {};
    
    for (const postType of postTypes) {
      allPosts[postType] = await fetchAllPosts(postType, baseUrl);
    }
    
    // Fetch pages
    allPosts['pages'] = await fetchAllPosts('pages', baseUrl);
    
    // Fetch taxonomies
    const taxonomies = await fetchTaxonomies(baseUrl);
    
    // Fetch media
    const media = await fetchAllMedia(baseUrl);
    
    // Save to JSON files
    console.log('\nSaving data...');
    
    for (const [postType, posts] of Object.entries(allPosts)) {
      const filename = path.join(config.output, `${postType}.json`);
      fs.writeFileSync(filename, JSON.stringify(posts, null, 2));
      console.log(`  Saved ${postType}.json (${posts.length} items)`);
    }
    
    const taxFilename = path.join(config.output, 'taxonomies.json');
    fs.writeFileSync(taxFilename, JSON.stringify(taxonomies, null, 2));
    console.log(`  Saved taxonomies.json`);
    
    const mediaFilename = path.join(config.output, 'media.json');
    fs.writeFileSync(mediaFilename, JSON.stringify(media, null, 2));
    console.log(`  Saved media.json (${media.length} items)`);
    
    console.log('\nExport complete!');
    console.log(`\nNext steps:`);
    console.log(`1. Run: node scripts/migrate/process-posts.js`);
    console.log(`2. Run: node scripts/migrate/process-projects.js`);
    console.log(`3. Run: node scripts/migrate/process-experiments.js`);
    console.log(`4. Run: node scripts/migrate/process-pages.js`);
    console.log(`5. Run: node scripts/migrate/process-media.js`);
    
  } catch (error) {
    console.error('Export failed:', error);
    process.exit(1);
  }
}

// Run export
exportWordPress();

