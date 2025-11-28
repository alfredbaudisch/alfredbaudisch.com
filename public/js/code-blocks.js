/**
 * Code block enhancements - copy to clipboard functionality
 */

(function() {
  'use strict';
  
  function initCodeBlocks() {
    // Find all pre elements that contain code and haven't been processed yet
    // Exclude those already inside a code-block-wrapper
    const preElements = document.querySelectorAll('pre code[class*="language-"]:not(.code-block-wrapper code)');
    
    preElements.forEach(codeBlock => {
      const pre = codeBlock.parentElement;
      
      // Skip if already processed or not a pre element
      if (pre.tagName !== 'PRE' || 
          pre.parentElement.classList.contains('code-block-wrapper') ||
          pre.closest('.code-block-wrapper')) {
        return;
      }
      
      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';
      
      const header = document.createElement('div');
      header.className = 'code-block-header';
      
      const language = document.createElement('span');
      language.className = 'code-block-language';
      const langClass = Array.from(codeBlock.classList).find(cls => cls.startsWith('language-'));
      if (langClass) {
        language.textContent = langClass.replace('language-', '');
      }
      
      const copyBtn = document.createElement('button');
      copyBtn.className = 'code-block-copy';
      copyBtn.textContent = 'Copy';
      copyBtn.setAttribute('aria-label', 'Copy code to clipboard');
      
      copyBtn.addEventListener('click', async () => {
        const text = codeBlock.textContent;
        
        try {
          await navigator.clipboard.writeText(text);
          copyBtn.textContent = 'Copied!';
          setTimeout(() => {
            copyBtn.textContent = 'Copy';
          }, 2000);
        } catch (err) {
          // Fallback for older browsers
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          
          try {
            document.execCommand('copy');
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
              copyBtn.textContent = 'Copy';
            }, 2000);
          } catch (err) {
            copyBtn.textContent = 'Failed';
            setTimeout(() => {
              copyBtn.textContent = 'Copy';
            }, 2000);
          }
          
          document.body.removeChild(textarea);
        }
      });
      
      header.appendChild(language);
      header.appendChild(copyBtn);
      
      // Create content wrapper with line numbers
      const contentWrapper = document.createElement('div');
      contentWrapper.className = 'code-block-content';
      
      // Create line numbers container
      const linesContainer = document.createElement('div');
      linesContainer.className = 'code-block-lines';
      
      // Count lines in the code - handle trailing newline
      const codeText = codeBlock.textContent || '';
      let lines = codeText.split('\n');
      // Remove empty last line if code ends with newline
      if (lines.length > 1 && lines[lines.length - 1] === '') {
        lines.pop();
      }
      const lineCount = Math.max(1, lines.length);
      
      // Create line number elements
      for (let i = 0; i < lineCount; i++) {
        const lineSpan = document.createElement('span');
        linesContainer.appendChild(lineSpan);
      }
      
      // Create code container and move pre into it
      const codeContainer = document.createElement('div');
      codeContainer.className = 'code-block-code';
      
      // Insert wrapper before pre, then move pre into codeContainer
      pre.parentElement.insertBefore(wrapper, pre);
      codeContainer.appendChild(pre);
      
      contentWrapper.appendChild(linesContainer);
      contentWrapper.appendChild(codeContainer);
      
      wrapper.appendChild(header);
      wrapper.appendChild(contentWrapper);
    });
  }
  
  // Initialize after a delay to ensure Prism.js has processed code blocks
  function delayedInit() {
    // Wait a bit for Prism.js to finish processing
    setTimeout(() => {
      initCodeBlocks();
    }, 100);
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', delayedInit);
  } else {
    delayedInit();
  }
  
  // Re-initialize when new content is loaded
  // But ignore changes we make ourselves
  if (typeof MutationObserver !== 'undefined') {
    let isProcessing = false;
    
    const observer = new MutationObserver((mutations) => {
      // Skip if we're currently processing to avoid infinite loops
      if (isProcessing) return;
      
      // Check if any mutation added a pre element (new code blocks)
      const hasNewPre = mutations.some(mutation => {
        return Array.from(mutation.addedNodes).some(node => {
          if (node.nodeType === 1) { // Element node
            return node.tagName === 'PRE' || node.querySelector('pre');
          }
          return false;
        });
      });
      
      if (hasNewPre) {
        // Debounce to avoid multiple calls
        clearTimeout(observer.timeout);
        observer.timeout = setTimeout(() => {
          isProcessing = true;
          initCodeBlocks();
          isProcessing = false;
        }, 300);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
})();


