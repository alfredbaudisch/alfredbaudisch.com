/**
 * Asset manifest loader
 * Reads the asset manifest generated during build to get cache-busted filenames
 */

const fs = require('fs');
const path = require('path');

module.exports = function() {
  const manifestPath = path.join(__dirname, '../../_site/asset-manifest.json');
  
  // Default filenames (for development)
  const defaultAssets = {
    js: '/js/main.js',
    css: '/css/main.css'
  };
  
  // Try to read manifest file
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      return {
        js: manifest.js || defaultAssets.js,
        css: manifest.css || defaultAssets.css
      };
    } catch (error) {
      console.warn('Warning: Could not parse asset manifest:', error.message);
      return defaultAssets;
    }
  }
  
  // Return defaults if manifest doesn't exist
  return defaultAssets;
};

