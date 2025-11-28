#!/usr/bin/env node

/**
 * Build script for bundling and minifying JavaScript
 * Uses esbuild to bundle all JS files including Prism.js
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const isProduction = process.env.NODE_ENV === 'production' || process.argv.includes('--production');
// Cache busting is optional and disabled by default
const enableCacheBusting = process.env.ENABLE_CACHE_BUSTING === 'true' || process.env.ENABLE_CACHE_BUSTING === '1';

function buildJS() {
  const entryPoint = path.join(__dirname, '..', 'public', 'js', 'main.js');
  const outdir = path.join(__dirname, '..', '_site', 'js');
  
  // Generate timestamp for cache busting only if explicitly enabled
  const timestamp = (isProduction && enableCacheBusting) ? Date.now() : null;
  const jsFilename = timestamp ? `main.${timestamp}.js` : 'main.js';
  const outfile = path.join(outdir, jsFilename);
  
  // Ensure output directory exists
  if (!fs.existsSync(outdir)) {
    fs.mkdirSync(outdir, { recursive: true });
  }

  try {
    // Use npx to run esbuild (works even if not in node_modules due to version issues)
    const esbuildArgs = [
      entryPoint,
      '--bundle',
      '--format=iife',
      '--platform=browser',
      '--target=es2015',
      `--outfile=${outfile}`
    ];

    if (isProduction) {
      esbuildArgs.push('--minify');
    } else {
      esbuildArgs.push('--sourcemap');
    }

    execSync(`npx esbuild ${esbuildArgs.join(' ')}`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });

    console.log(`✓ JavaScript bundled${isProduction ? ' and minified' : ''} → _site/js/${jsFilename}`);
    
    // Save timestamp and JS filename for CSS build to use (only if cache busting is enabled)
    if (isProduction && enableCacheBusting && timestamp) {
      const buildInfoPath = path.join(__dirname, '..', '_site', 'build-info.json');
      const buildInfo = {
        timestamp: timestamp.toString(),
        js: `/js/${jsFilename}`
      };
      fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));
    }
    
    return { jsFilename, timestamp };
  } catch (error) {
    console.error('✗ JavaScript build failed:', error.message);
    process.exit(1);
  }
}

const result = buildJS();
if (result && result.timestamp) {
  // Export timestamp for use in other build scripts
  process.env.BUILD_TIMESTAMP = result.timestamp.toString();
}

