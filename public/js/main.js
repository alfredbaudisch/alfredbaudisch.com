/**
 * Main JavaScript bundle entry point
 * Bundles all site JavaScript including Prism.js
 */

// Import Prism.js (CommonJS, will be bundled by esbuild)
const Prism = require('prismjs');

// Import Prism language definitions that are commonly used
require('prismjs/components/prism-javascript');
require('prismjs/components/prism-json');
require('prismjs/components/prism-yaml');
require('prismjs/components/prism-bash');
require('prismjs/components/prism-markup');
require('prismjs/components/prism-css');
require('prismjs/components/prism-markdown');
require('prismjs/components/prism-gdscript');

// Import autoloader plugin
require('prismjs/plugins/autoloader/prism-autoloader.min.js');

// Configure autoloader to use CDN for languages not bundled
// This must run after Prism and autoloader are loaded
(function() {
  if (typeof Prism !== 'undefined' && Prism.plugins && Prism.plugins.autoloader) {
    Prism.plugins.autoloader.languages_path = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/';
  }
})();

// Import site JavaScript files
require('./lightbox.js');
require('./gallery.js');
require('./post-images.js');
require('./code-blocks.js');
require('./mobile-menu.js');

