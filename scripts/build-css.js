#!/usr/bin/env node

/**
 * Build script for copying CSS with cache busting in production
 */

const path = require('path');
const fs = require('fs');

const isProduction = process.env.NODE_ENV === 'production' || process.argv.includes('--production');
// Cache busting is optional and disabled by default
const enableCacheBusting = process.env.ENABLE_CACHE_BUSTING === 'true' || process.env.ENABLE_CACHE_BUSTING === '1';

function buildCSS() {
  const cssSource = path.join(__dirname, '..', 'public', 'css', 'main.css');
  const cssOutdir = path.join(__dirname, '..', '_site', 'css');
  
  let timestamp = null;
  let jsFilename = null;
  
  // Try to read build info from JS build (only if cache busting is enabled)
  if (isProduction && enableCacheBusting) {
    const buildInfoPath = path.join(__dirname, '..', '_site', 'build-info.json');
    if (fs.existsSync(buildInfoPath)) {
      try {
        const buildInfo = JSON.parse(fs.readFileSync(buildInfoPath, 'utf8'));
        timestamp = buildInfo.timestamp;
        jsFilename = buildInfo.js;
      } catch (error) {
        console.warn('Warning: Could not read build-info.json, generating new timestamp');
        timestamp = Date.now().toString();
      }
    } else {
      // Generate new timestamp if build info doesn't exist
      timestamp = Date.now().toString();
    }
  }
  
  const cssFilename = timestamp ? `main.${timestamp}.css` : 'main.css';
  const cssOutfile = path.join(cssOutdir, cssFilename);
  
  // Ensure output directory exists
  if (!fs.existsSync(cssOutdir)) {
    fs.mkdirSync(cssOutdir, { recursive: true });
  }

  try {
    // Copy CSS file
    fs.copyFileSync(cssSource, cssOutfile);
    
    const cacheBustingStatus = (isProduction && enableCacheBusting) ? ' with cache busting' : '';
    console.log(`✓ CSS copied${cacheBustingStatus} → _site/css/${cssFilename}`);
    
    // Create/update asset manifest for Eleventy to use (only if cache busting is enabled)
    if (isProduction && enableCacheBusting && timestamp) {
      const manifestPath = path.join(__dirname, '..', '_site', 'asset-manifest.json');
      const manifest = {
        js: jsFilename || `/js/main.${timestamp}.js`,
        css: `/css/${cssFilename}`
      };
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    }
    
    return { cssFilename, timestamp };
  } catch (error) {
    console.error('✗ CSS build failed:', error.message);
    process.exit(1);
  }
}

buildCSS();

