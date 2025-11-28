#!/usr/bin/env node

/**
 * Download and organize WordPress media files
 */

const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const { URL } = require('url');
const { readJSON, ensureDir } = require('../utils/helpers');

const dataDir = path.join(__dirname, 'data');
const mediaOutputDir = path.join(__dirname, '../../content/media');
const config = {
  wpUrl: process.env.WP_URL || 'http://localhost',
  wpUsername: process.env.WP_USERNAME || '',
  wpPassword: process.env.WP_PASSWORD || ''
};

/**
 * Download a file from URL
 */
function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      headers: {
        'User-Agent': 'WordPress-to-11ty-Migration'
      }
    };
    
    if (config.wpUsername && config.wpPassword) {
      const auth = Buffer.from(`${config.wpUsername}:${config.wpPassword}`).toString('base64');
      requestOptions.headers['Authorization'] = `Basic ${auth}`;
    }
    
    const file = fs.createWriteStream(outputPath);
    
    client.get(requestOptions, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {});
      reject(err);
    });
  });
}

/**
 * Process media files
 */
async function processMedia() {
  console.log('Processing media files...');
  console.log(`WordPress URL: ${config.wpUrl}`);
  
  const posts = readJSON(path.join(dataDir, 'posts.json')) || [];
  const projects = readJSON(path.join(dataDir, 'projects.json')) || [];
  const experiments = readJSON(path.join(dataDir, 'experiments.json')) || [];
  
  let downloaded = 0;
  let skipped = 0;
  
  // Process featured images from posts
  for (const post of posts) {
    if (post.featured_media && post.featured_media_url) {
      const slug = post.slug || 'post-' + post.id;
      const mediaDir = path.join(mediaOutputDir, 'posts', slug);
      ensureDir(mediaDir);
      
      const filename = 'featured.jpg';
      const outputPath = path.join(mediaDir, filename);
      
      if (!fs.existsSync(outputPath)) {
        try {
          await downloadFile(post.featured_media_url, outputPath);
          downloaded++;
          console.log(`  Downloaded: ${post.featured_media_url}`);
        } catch (error) {
          console.error(`  Failed to download ${post.featured_media_url}:`, error.message);
          skipped++;
        }
      } else {
        skipped++;
      }
    }
  }
  
  // Process featured images from projects
  for (const project of projects) {
    if (project.featured_media && project.featured_media_url) {
      const slug = project.slug || 'project-' + project.id;
      const mediaDir = path.join(mediaOutputDir, 'projects', slug);
      ensureDir(mediaDir);
      
      const filename = 'featured.jpg';
      const outputPath = path.join(mediaDir, filename);
      
      if (!fs.existsSync(outputPath)) {
        try {
          await downloadFile(project.featured_media_url, outputPath);
          downloaded++;
          console.log(`  Downloaded: ${project.featured_media_url}`);
        } catch (error) {
          console.error(`  Failed to download ${project.featured_media_url}:`, error.message);
          skipped++;
        }
      } else {
        skipped++;
      }
    }
  }
  
  // Process featured images from experiments
  for (const experiment of experiments) {
    if (experiment.featured_media && experiment.featured_media_url) {
      const slug = experiment.slug || 'experiment-' + experiment.id;
      const mediaDir = path.join(mediaOutputDir, 'experiments', slug);
      ensureDir(mediaDir);
      
      const filename = 'featured.jpg';
      const outputPath = path.join(mediaDir, filename);
      
      if (!fs.existsSync(outputPath)) {
        try {
          await downloadFile(experiment.featured_media_url, outputPath);
          downloaded++;
          console.log(`  Downloaded: ${experiment.featured_media_url}`);
        } catch (error) {
          console.error(`  Failed to download ${experiment.featured_media_url}:`, error.message);
          skipped++;
        }
      } else {
        skipped++;
      }
    }
  }
  
  console.log(`\nMedia processing complete!`);
  console.log(`  Downloaded: ${downloaded} files`);
  console.log(`  Skipped: ${skipped} files (already exist)`);
  console.log(`\nNote: This script only downloads featured images.`);
  console.log(`For full media migration, you may need to download wp-content/uploads manually.`);
}

processMedia().catch(error => {
  console.error('Media processing failed:', error);
  process.exit(1);
});

