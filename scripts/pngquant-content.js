#!/usr/bin/env node

/**
 * Run pngquant on all PNG images in the content directory
 * Reduces PNG file sizes while maintaining visual quality
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONTENT_DIR = path.join(__dirname, '..', 'content');

/**
 * Check if pngquant is available
 */
function checkPngquantAvailable() {
  try {
    execSync('which pngquant', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get file size in bytes
 */
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

/**
 * Format file size for display
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get all PNG files recursively
 */
function getAllPngFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    return fileList;
  }
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    // Skip node_modules and other build artifacts
    if (file.startsWith('.') && file !== '.DS_Store') {
      return;
    }
    
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllPngFiles(filePath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (ext === '.png') {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

/**
 * Run pngquant on a single file
 * pngquant overwrites the original file by default when using --ext .png --force
 */
function optimizePng(filePath) {
  try {
    const beforeSize = getFileSize(filePath);
    
    // Run pngquant with quality settings
    // --quality 65-80: balance between size and quality
    // --ext .png: keep original extension
    // --force: overwrite existing file
    // --skip-if-larger: skip if output would be larger
    execSync(
      `pngquant --quality=65-80 --ext .png --force --skip-if-larger "${filePath}"`,
      { stdio: 'ignore' }
    );
    
    const afterSize = getFileSize(filePath);
    const saved = beforeSize - afterSize;
    const percentSaved = beforeSize > 0 ? ((saved / beforeSize) * 100).toFixed(1) : 0;
    
    return {
      success: true,
      beforeSize,
      afterSize,
      saved,
      percentSaved
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

function main() {
  console.log('🔍 Scanning for PNG files in content directory...\n');
  
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error(`❌ Content directory not found: ${CONTENT_DIR}`);
    process.exit(1);
  }
  
  if (!checkPngquantAvailable()) {
    console.error('❌ pngquant is not installed or not in PATH');
    console.error('\n📦 To install pngquant:');
    console.error('   macOS: brew install pngquant');
    console.error('   Linux: apt-get install pngquant or yum install pngquant');
    console.error('   Windows: Download from https://pngquant.org/\n');
    process.exit(1);
  }
  
  const pngFiles = getAllPngFiles(CONTENT_DIR);
  
  if (pngFiles.length === 0) {
    console.log('✅ No PNG files found in content directory');
    return;
  }
  
  console.log(`📁 Found ${pngFiles.length} PNG file(s)\n`);
  console.log('🔄 Optimizing images...\n');
  
  let processed = 0;
  let successful = 0;
  let skipped = 0;
  let failed = 0;
  let totalBeforeSize = 0;
  let totalAfterSize = 0;
  
  pngFiles.forEach((filePath, index) => {
    const relativePath = path.relative(CONTENT_DIR, filePath);
    process.stdout.write(`\r   [${index + 1}/${pngFiles.length}] Processing: ${relativePath}...`);
    
    const result = optimizePng(filePath);
    processed++;
    
    if (result.success) {
      if (result.saved > 0) {
        successful++;
        totalBeforeSize += result.beforeSize;
        totalAfterSize += result.afterSize;
        console.log(`\r   ✓ ${relativePath} - Saved ${formatFileSize(result.saved)} (${result.percentSaved}%)`);
      } else {
        skipped++;
        console.log(`\r   ⊘ ${relativePath} - Already optimized (skipped)`);
      }
    } else {
      failed++;
      console.log(`\r   ✗ ${relativePath} - Error: ${result.error}`);
    }
  });
  
  console.log('\n');
  console.log('📊 Summary:');
  console.log(`   Total files: ${pngFiles.length}`);
  console.log(`   Optimized: ${successful}`);
  console.log(`   Skipped (already optimal): ${skipped}`);
  console.log(`   Failed: ${failed}`);
  
  if (successful > 0) {
    const totalSaved = totalBeforeSize - totalAfterSize;
    const totalPercentSaved = totalBeforeSize > 0 ? ((totalSaved / totalBeforeSize) * 100).toFixed(1) : 0;
    console.log(`\n💾 Total size reduction:`);
    console.log(`   Before: ${formatFileSize(totalBeforeSize)}`);
    console.log(`   After:  ${formatFileSize(totalAfterSize)}`);
    console.log(`   Saved:  ${formatFileSize(totalSaved)} (${totalPercentSaved}%)`);
  }
  
  console.log('\n✅ Done!\n');
}

main();

