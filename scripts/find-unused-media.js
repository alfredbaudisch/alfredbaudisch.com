#!/usr/bin/env node

/**
 * Find unused media files in content/media/wp-content
 * Checks usage in markdown files, frontmatter, and nunjucks templates
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const MEDIA_DIR = path.join(__dirname, '../content/media/wp-content');
const CONTENT_DIR = path.join(__dirname, '../content');

// Fields to check in frontmatter
const FRONTMATTER_FIELDS = [
  'featuredImage',
  'featuredImageThumb',
  'featuredImageSmall',
  'processImage',
  'aboutImage',
  'aboutIntroImage',
  'aboutIntroImageFull'
];

// File extensions to search for
const MEDIA_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.mp4', '.webm', '.ogg', '.wav', '.mp3', '.pdf'];

/**
 * Get all media files recursively
 */
function getAllMediaFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    return fileList;
  }
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllMediaFiles(filePath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (MEDIA_EXTENSIONS.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

/**
 * Get all content files to search
 */
function getAllContentFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    return fileList;
  }
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    // Skip node_modules, _site, and other build artifacts
    if (file.startsWith('.') || file === 'node_modules' || file === '_site' || file === 'media') {
      return;
    }
    
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllContentFiles(filePath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      // Include markdown, nunjucks, html, json, and js files
      if (['.md', '.njk', '.html', '.json', '.js'].includes(ext)) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

/**
 * Extract frontmatter from markdown file
 * Returns an object with all frontmatter fields
 */
function extractFrontmatter(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  const match = content.match(frontmatterRegex);
  
  if (!match) return null;
  
  const frontmatterText = match[1];
  const frontmatter = {};
  
  // Parse YAML-like frontmatter
  const lines = frontmatterText.split('\n');
  let currentKey = null;
  let currentValue = [];
  let inArray = false;
  
  lines.forEach(line => {
    const trimmed = line.trim();
    
    // Skip empty lines
    if (!trimmed) {
      if (currentKey && currentValue.length > 0) {
        frontmatter[currentKey] = currentValue.join('\n').trim();
        currentKey = null;
        currentValue = [];
      }
      return;
    }
    
    // Check if this is a key-value pair
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex > 0 && !trimmed.startsWith('-') && !trimmed.startsWith(' ')) {
      // Save previous key-value if exists
      if (currentKey && currentValue.length > 0) {
        frontmatter[currentKey] = currentValue.join('\n').trim();
      }
      
      // Start new key-value
      currentKey = trimmed.substring(0, colonIndex).trim();
      let value = trimmed.substring(colonIndex + 1).trim();
      currentValue = [];
      inArray = false;
      
      // Check if value starts an array
      if (value === '' || value === '[]') {
        // Empty array or array starts on next line
        return;
      } else if (value.startsWith('[')) {
        // Inline array
        const arrayMatch = value.match(/\[(.*)\]/);
        if (arrayMatch) {
          const arrayContent = arrayMatch[1];
          if (arrayContent.trim()) {
            value = arrayContent.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
            frontmatter[currentKey] = value;
            currentKey = null;
            currentValue = [];
            return;
          } else {
            frontmatter[currentKey] = [];
            currentKey = null;
            currentValue = [];
            return;
          }
        }
      } else {
        // Regular value
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        currentValue.push(value);
      }
    } else if (currentKey && trimmed.startsWith('-')) {
      // Array item
      const arrayItem = trimmed.substring(1).trim();
      const cleanItem = arrayItem.replace(/^["']|["']$/g, '');
      if (!frontmatter[currentKey] || !Array.isArray(frontmatter[currentKey])) {
        frontmatter[currentKey] = [];
      }
      frontmatter[currentKey].push(cleanItem);
    } else if (currentKey) {
      // Continuation of value
      currentValue.push(trimmed);
    }
  });
  
  // Save last key-value if exists
  if (currentKey && currentValue.length > 0) {
    frontmatter[currentKey] = currentValue.join('\n').trim();
  }
  
  return frontmatter;
}

/**
 * Extract image references from imageGallery shortcode
 */
function extractImageGalleryReferences(content) {
  const references = [];
  // Match {% imageGallery [ ... ] %}
  const galleryRegex = /{%\s*imageGallery\s*\[([\s\S]*?)\]\s*%}/g;
  let match;
  
  while ((match = galleryRegex.exec(content)) !== null) {
    const galleryContent = match[1];
    // Extract src, link values from objects like { src: "...", caption: "...", link: "..." }
    const srcRegex = /src:\s*["']([^"']+)["']/g;
    const linkRegex = /link:\s*["']([^"']+)["']/g;
    
    let srcMatch;
    while ((srcMatch = srcRegex.exec(galleryContent)) !== null) {
      references.push(srcMatch[1]);
    }
    
    let linkMatch;
    while ((linkMatch = linkRegex.exec(galleryContent)) !== null) {
      references.push(linkMatch[1]);
    }
  }
  
  return references;
}

/**
 * Check if a media file path is referenced in content
 */
function checkFileUsage(mediaFilePath, contentFiles) {
  let count = 0;
  const mediaFileName = path.basename(mediaFilePath);
  const mediaRelativePath = path.relative(path.join(CONTENT_DIR, 'media'), mediaFilePath);
  const mediaUrlPath = `/media/${mediaRelativePath.replace(/\\/g, '/')}`;
  
  // Also check for WordPress-style URLs
  const wpPath = mediaRelativePath.replace(/^wp-content\//, '');
  const wpUrlPatterns = [
    `/wp-content/${wpPath}`,
    `wp-content/${wpPath}`,
    `https://alfredbaudisch.com/wp-content/${wpPath}`,
    `alfredbaudisch.com/wp-content/${wpPath}`
  ];
  
  // Create a function to check if a string matches our media file
  const matchesMediaFile = (str) => {
    if (!str) return false;
    return str.includes(mediaFileName) || 
           str.includes(mediaRelativePath) ||
           str.includes(mediaUrlPath) ||
           wpUrlPatterns.some(pattern => str.includes(pattern));
  };
  
  contentFiles.forEach(contentFile => {
    try {
      const content = fs.readFileSync(contentFile, 'utf8');
      const ext = path.extname(contentFile).toLowerCase();
      
      // Check in file content (general search)
      if (content.includes(mediaFileName) || 
          content.includes(mediaRelativePath) ||
          content.includes(mediaUrlPath) ||
          wpUrlPatterns.some(pattern => content.includes(pattern))) {
        count++;
      }
      
      // Specifically check imageGallery shortcodes
      const galleryRefs = extractImageGalleryReferences(content);
      if (galleryRefs.some(ref => matchesMediaFile(ref))) {
        count++;
      }
      
      // Check frontmatter for markdown files
      if (ext === '.md') {
        const frontmatter = extractFrontmatter(content);
        if (frontmatter) {
          FRONTMATTER_FIELDS.forEach(field => {
            const value = frontmatter[field];
            if (value && (
              value.includes(mediaFileName) ||
              value.includes(mediaRelativePath) ||
              value.includes(mediaUrlPath) ||
              wpUrlPatterns.some(pattern => value.includes(pattern))
            )) {
              count++;
            }
          });
          
          // Check links array
          if (frontmatter.links && Array.isArray(frontmatter.links)) {
            frontmatter.links.forEach(link => {
              if (typeof link === 'object' && link.url) {
                if (link.url.includes(mediaFileName) || 
                    link.url.includes(mediaRelativePath) ||
                    link.url.includes(mediaUrlPath) ||
                    wpUrlPatterns.some(pattern => link.url.includes(pattern))) {
                  count++;
                }
              }
            });
          }
        }
      }
    } catch (error) {
      // Skip files that can't be read
      console.error(`Error reading ${contentFile}:`, error.message);
    }
  });
  
  return count;
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 Scanning for media files...');
  
  if (!fs.existsSync(MEDIA_DIR)) {
    console.error(`❌ Media directory not found: ${MEDIA_DIR}`);
    process.exit(1);
  }
  
  const mediaFiles = getAllMediaFiles(MEDIA_DIR);
  console.log(`📁 Found ${mediaFiles.length} media files`);
  
  console.log('📄 Scanning content files...');
  const contentFiles = getAllContentFiles(CONTENT_DIR);
  console.log(`📝 Found ${contentFiles.length} content files to search`);
  
  console.log('🔎 Checking usage...');
  const usageMap = new Map();
  let processed = 0;
  
  mediaFiles.forEach(mediaFile => {
    const relativePath = path.relative(path.join(__dirname, '..'), mediaFile);
    const count = checkFileUsage(mediaFile, contentFiles);
    usageMap.set(relativePath, count);
    
    processed++;
    if (processed % 50 === 0) {
      process.stdout.write(`\r   Processed ${processed}/${mediaFiles.length} files...`);
    }
  });
  
  console.log(`\n✅ Analysis complete!\n`);
  
  // Sort by usage count
  const sortedUsage = Array.from(usageMap.entries())
    .sort((a, b) => a[1] - b[1]);
  
  // Show files with 0 usage
  const unusedFiles = sortedUsage.filter(([file, count]) => count === 0);
  
  console.log('📊 Usage Summary:');
  console.log(`   Total files: ${mediaFiles.length}`);
  console.log(`   Files in use: ${mediaFiles.length - unusedFiles.length}`);
  console.log(`   Unused files: ${unusedFiles.length}\n`);
  
  if (unusedFiles.length > 0) {
    console.log('📋 Unused files:');
    unusedFiles.forEach(([file, count]) => {
      console.log(`   ${file}: ${count}`);
    });
    console.log('');
    
    // Prompt for deletion
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question(`🗑️  ${unusedFiles.length} files are never used. Delete them? (yes/no): `, async (answer) => {
      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        console.log('\n🗑️  Deleting unused files...');
        const deletedFiles = [];
        const errors = [];
        
        unusedFiles.forEach(([file, count]) => {
          const fullPath = path.join(__dirname, '..', file);
          try {
            fs.unlinkSync(fullPath);
            deletedFiles.push(file);
            console.log(`   ✓ Deleted: ${file}`);
          } catch (error) {
            errors.push({ file, error: error.message });
            console.error(`   ✗ Error deleting ${file}: ${error.message}`);
          }
        });
        
        // Create report
        const reportPath = path.join(__dirname, '../unused-media-report.json');
        const report = {
          date: new Date().toISOString(),
          totalFiles: mediaFiles.length,
          unusedFiles: unusedFiles.length,
          deletedFiles: deletedFiles.length,
          deleted: deletedFiles,
          errors: errors
        };
        
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n📄 Report saved to: ${reportPath}`);
        console.log(`\n✅ Deleted ${deletedFiles.length} files`);
        
        if (errors.length > 0) {
          console.log(`⚠️  ${errors.length} files could not be deleted`);
        }
      } else {
        console.log('\n❌ Deletion cancelled');
      }
      
      rl.close();
    });
  } else {
    console.log('✅ All files are in use!');
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
