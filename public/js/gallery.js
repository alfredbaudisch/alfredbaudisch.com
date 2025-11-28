/**
 * Gallery handler - initializes image galleries and connects them to lightbox
 */

(function() {
  'use strict';
  
  function initGalleries() {
    const galleries = document.querySelectorAll('.image-gallery');
    
    galleries.forEach(gallery => {
      // Get all gallery items (both divs with data-lightbox and links)
      const galleryItems = gallery.querySelectorAll('.gallery-item');
      
      if (galleryItems.length === 0) return;
      
      // Collect all images from the gallery
      const images = [];
      const itemsToProcess = [];
      
      galleryItems.forEach((item, index) => {
        const img = item.querySelector('img');
        if (!img) return;
        
        const captionEl = item.querySelector('.gallery-caption');
        const isLink = item.tagName === 'A';
        const linkHref = isLink ? item.href : null;
        const imgSrc = img.src;
        
        images.push({
          src: imgSrc,
          alt: img.alt || '',
          caption: captionEl ? captionEl.textContent : '',
          index: index
        });
        
        itemsToProcess.push({
          item: item,
          index: index,
          isLink: isLink,
          linkHref: linkHref,
          imgSrc: imgSrc
        });
      });
      
      // Add click handlers to gallery items
      itemsToProcess.forEach(({ item, index, isLink, linkHref, imgSrc }) => {
        item.addEventListener('click', (e) => {
          // If it's a link and points to an external URL (not the image itself), let it work normally
          if (isLink && linkHref && linkHref !== imgSrc && !linkHref.endsWith('#') && linkHref !== window.location.href + '#') {
            // Check if it's an external link
            try {
              const linkUrl = new URL(linkHref);
              const currentUrl = new URL(window.location.href);
              // If different domain or different path, let the link work
              if (linkUrl.origin !== currentUrl.origin || linkUrl.pathname !== currentUrl.pathname) {
                return; // Let the browser handle the link
              }
            } catch (e) {
              // Invalid URL, treat as lightbox
            }
          }
          
          // Otherwise, open in lightbox
          e.preventDefault();
          
          // Wait for lightbox to be ready if needed
          const openLightbox = () => {
            if (window.lightboxInstance && images.length > 0) {
              window.lightboxInstance.open(images, index);
            }
          };
          
          if (window.lightboxInstance) {
            openLightbox();
          } else {
            // Lightbox might not be ready yet, wait a bit
            setTimeout(() => {
              openLightbox();
            }, 200);
          }
        });
        
        // Add cursor pointer style
        item.style.cursor = 'pointer';
      });
    });
  }
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGalleries);
  } else {
    initGalleries();
  }
  
  // Re-initialize when new content is loaded (for dynamic content)
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(() => {
      initGalleries();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
})();

