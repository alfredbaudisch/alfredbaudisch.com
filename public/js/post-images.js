/**
 * Handle markdown images in post content
 * Makes images clickable to open in lightbox, unless they have a link
 */

(function() {
  'use strict';
  
  function initPostImages() {
    const postContent = document.querySelector('.post-content');
    const pageContent = document.querySelector('.page-content');
    const aboutPageIntro = document.querySelector('.about-page-intro');
    const processSection = document.querySelector('.process-section');
    
    // Collect all images for lightbox gallery (shared across all images)
    const lightboxImages = [];
    
    // Find all images that are not already in galleries
    // Exclude images inside .image-gallery
    const contentElement = postContent || pageContent;
    const allImages = (contentElement ? contentElement.querySelectorAll('img') : []);
    const images = Array.from(allImages).filter(img => {
      // Skip images that are inside galleries
      // Skip images inside figures (they'll be handled separately)
      return !img.closest('.image-gallery') && !img.closest('figure');
    });
    
    // Also handle process images
    const processImages = processSection ? processSection.querySelectorAll('img') : [];
    
    images.forEach((img, index) => {
      // Skip if image is already wrapped in a link (we'll handle those separately)
      if (img.closest('a')) {
        return;
      }
      
      // Add to lightbox images array
      lightboxImages.push({
        src: img.src,
        alt: img.alt || '',
        caption: img.alt || '',
        index: index
      });
      
      // Wrap image in a clickable container
      const wrapper = document.createElement('a');
      wrapper.href = '#';
      wrapper.className = 'post-image-link';
      wrapper.setAttribute('data-lightbox-index', index);
      wrapper.setAttribute('data-lightbox', 'content');
      
      // Insert wrapper before image
      img.parentNode.insertBefore(wrapper, img);
      // Move image into wrapper
      wrapper.appendChild(img);
      
      // Add click handler
      wrapper.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Wait for lightbox to be ready if needed
        const openLightbox = () => {
          if (window.lightboxInstance && lightboxImages.length > 0) {
            // Find the index of this image in the lightboxImages array
            const clickedIndex = parseInt(wrapper.getAttribute('data-lightbox-index'), 10);
            window.lightboxInstance.open(lightboxImages, clickedIndex);
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
      wrapper.style.cursor = 'pointer';
    });
    
    // Store process images for later processing (after all other images)
    const processImageData = [];
    
    // Handle images inside figures (with captions)
    const figureImages = contentElement ? contentElement.querySelectorAll('figure img') : [];
    figureImages.forEach((img) => {
      const figure = img.closest('figure');
      const link = img.closest('a');
      const figcaption = figure ? figure.querySelector('figcaption') : null;
      const caption = figcaption ? figcaption.textContent.trim() : '';
      
      if (!link) return;
      
      const linkHref = link.href;
      const imgSrc = img.src;
      
      // Check if link href is an image URL (must actually be an image file)
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
      const isImageUrl = imageExtensions.some(ext => 
        linkHref.toLowerCase().includes(ext)
      );
      
      // Only treat as image link if:
      // 1. Link href points to the same image (same URL as img src)
      // 2. Link href is actually an image URL (has image extension in the link itself)
      // 3. Link is just an anchor (#) or empty
      // Do NOT treat external URLs or non-image URLs as image links
      const isImageLink = linkHref === imgSrc || 
                          isImageUrl ||
                          linkHref.endsWith('#') || 
                          linkHref === window.location.href + '#' ||
                          linkHref === window.location.href ||
                          link.getAttribute('href') === '';
      
      if (isImageLink) {
        // Use the link href (full-size image) for lightbox, or img src as fallback
        const lightboxSrc = linkHref && isImageUrl ? linkHref : imgSrc;
        
        // Add this image to lightboxImages if not already there
        const existingIndex = lightboxImages.findIndex(li => li.src === lightboxSrc || li.src === imgSrc);
        const imgIndex = existingIndex !== -1 ? existingIndex : lightboxImages.length;
        
        if (existingIndex === -1) {
          lightboxImages.push({
            src: lightboxSrc,
            alt: img.alt || caption || '',
            caption: caption || img.alt || '',
            index: imgIndex
          });
        }
        
        link.addEventListener('click', (e) => {
          e.preventDefault();
          
          const openLightbox = () => {
            if (window.lightboxInstance && lightboxImages.length > 0) {
              // Find the correct index (might have been added with different src)
              const correctIndex = lightboxImages.findIndex(li => li.src === lightboxSrc || li.src === imgSrc);
              if (correctIndex !== -1) {
                window.lightboxInstance.open(lightboxImages, correctIndex);
              } else {
                window.lightboxInstance.open(lightboxImages, imgIndex);
              }
            }
          };
          
          if (window.lightboxInstance) {
            openLightbox();
          } else {
            setTimeout(() => {
              openLightbox();
            }, 200);
          }
        });
        link.style.cursor = 'pointer';
      }
      // Otherwise, let the link work normally (open the linked URL)
    });
    
    // Also handle images that are already wrapped in links (for markdown [![alt](img)](link) syntax)
    // Exclude images inside figures (already handled above)
    const linkedImages = contentElement ? contentElement.querySelectorAll('a img') : [];
    
    // Handle images in about-page-intro section
    if (aboutPageIntro) {
      const aboutImages = aboutPageIntro.querySelectorAll('a img');
      aboutImages.forEach((img) => {
        const link = img.closest('a');
        if (!link) return;
        
        const linkHref = link.href;
        const imgSrc = img.src;
        const figure = img.closest('figure');
        const figcaption = figure ? figure.querySelector('figcaption') : null;
        const caption = figcaption ? figcaption.textContent.trim() : '';
        
        // Check if link href is an image URL
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        const isImageUrl = imageExtensions.some(ext => 
          linkHref.toLowerCase().includes(ext)
        );
        
        // Check if link has data-lightbox attribute or is an image URL
        const hasLightboxAttr = link.hasAttribute('data-lightbox');
        const isImageLink = hasLightboxAttr || isImageUrl || linkHref === imgSrc;
        
        if (isImageLink) {
          // Use the link href (full-size image) for lightbox if it's an image URL, otherwise use img src
          const lightboxSrc = isImageUrl ? linkHref : imgSrc;
          
          // Add this image to lightboxImages if not already there
          const existingIndex = lightboxImages.findIndex(li => li.src === lightboxSrc || li.src === imgSrc);
          const imgIndex = existingIndex !== -1 ? existingIndex : lightboxImages.length;
          
          if (existingIndex === -1) {
            lightboxImages.push({
              src: lightboxSrc,
              alt: img.alt || caption || '',
              caption: caption || img.alt || '',
              index: imgIndex
            });
          }
          
          link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const openLightbox = () => {
              if (window.lightboxInstance && lightboxImages.length > 0) {
                // Find the correct index (might have been added with different src)
                const correctIndex = lightboxImages.findIndex(li => li.src === lightboxSrc || li.src === imgSrc);
                if (correctIndex !== -1) {
                  window.lightboxInstance.open(lightboxImages, correctIndex);
                } else {
                  window.lightboxInstance.open(lightboxImages, imgIndex);
                }
              }
            };
            
            if (window.lightboxInstance) {
              openLightbox();
            } else {
              setTimeout(() => {
                openLightbox();
              }, 200);
            }
          });
          link.style.cursor = 'pointer';
        }
      });
    }
    linkedImages.forEach((img) => {
      // Skip images inside figures (already handled)
      if (img.closest('figure')) {
        return;
      }
      
      const link = img.closest('a');
      const linkHref = link.href;
      const imgSrc = img.src;
      
      // Check if link href is an image URL
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
      const isImageUrl = imageExtensions.some(ext => 
        linkHref.toLowerCase().includes(ext)
      );
      
      // Check if link points to the image itself, is an image URL, is just '#', or is empty/anchor
      // In these cases, convert to lightbox behavior
      const isImageLink = linkHref === imgSrc || 
                          isImageUrl ||
                          linkHref.endsWith('#') || 
                          linkHref === window.location.href + '#' ||
                          linkHref === window.location.href ||
                          link.getAttribute('href') === '';
      
      if (isImageLink) {
        // Use the link href (full-size image) for lightbox if it's an image URL, otherwise use img src
        const lightboxSrc = isImageUrl ? linkHref : imgSrc;
        
        // Add this image to lightboxImages if not already there
        const existingIndex = lightboxImages.findIndex(li => li.src === lightboxSrc || li.src === imgSrc);
        const imgIndex = existingIndex !== -1 ? existingIndex : lightboxImages.length;
        
        if (existingIndex === -1) {
          lightboxImages.push({
            src: lightboxSrc,
            alt: img.alt || '',
            caption: img.alt || '',
            index: imgIndex
          });
        }
        
        link.addEventListener('click', (e) => {
          e.preventDefault();
          
          const openLightbox = () => {
            if (window.lightboxInstance && lightboxImages.length > 0) {
              // Find the correct index (might have been added with different src)
              const correctIndex = lightboxImages.findIndex(li => li.src === lightboxSrc || li.src === imgSrc);
              if (correctIndex !== -1) {
                window.lightboxInstance.open(lightboxImages, correctIndex);
              } else {
                window.lightboxInstance.open(lightboxImages, imgIndex);
              }
            }
          };
          
          if (window.lightboxInstance) {
            openLightbox();
          } else {
            setTimeout(() => {
              openLightbox();
            }, 200);
          }
        });
        link.style.cursor = 'pointer';
      }
      // Otherwise, let the link work normally (open the linked URL)
    });
    
    // Handle process images LAST - add them to lightbox array after all other images
    // This ensures they get the correct index
    processImages.forEach((img, index) => {
      const link = img.closest('a');
      if (!link) return;
      
      // Use the link href (full-size image) for lightbox if it's an image URL, otherwise use img src
      const linkHref = link.href;
      const imgSrc = img.src;
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
      const isImageUrl = imageExtensions.some(ext => 
        linkHref.toLowerCase().includes(ext)
      );
      const lightboxSrc = isImageUrl ? linkHref : imgSrc;
      
      // Check if this image is already in the lightboxImages array
      const existingIndex = lightboxImages.findIndex(li => li.src === lightboxSrc || li.src === imgSrc);
      const imgIndex = existingIndex !== -1 ? existingIndex : lightboxImages.length;
      
      // Add to lightbox images array if not already there
      if (existingIndex === -1) {
        lightboxImages.push({
          src: lightboxSrc,
          alt: img.alt || '',
          caption: img.alt || '',
          index: imgIndex
        });
      }
      
      processImageData.push({ link, imgIndex });
    });
    
    // Now bind click handlers for process images
    processImageData.forEach(({ link, imgIndex }) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        const openLightbox = () => {
          if (window.lightboxInstance && lightboxImages.length > 0) {
            // Find the correct index (might have been added with different src)
            const linkHref = link.href;
            const img = link.querySelector('img');
            const imgSrc = img ? img.src : '';
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
            const isImageUrl = imageExtensions.some(ext => 
              linkHref.toLowerCase().includes(ext)
            );
            const lightboxSrc = isImageUrl ? linkHref : imgSrc;
            
            const correctIndex = lightboxImages.findIndex(li => li.src === lightboxSrc || li.src === imgSrc);
            if (correctIndex !== -1) {
              window.lightboxInstance.open(lightboxImages, correctIndex);
            } else {
              window.lightboxInstance.open(lightboxImages, imgIndex);
            }
          }
        };
        
        if (window.lightboxInstance) {
          openLightbox();
        } else {
          setTimeout(() => {
            openLightbox();
          }, 200);
        }
      });
      link.style.cursor = 'pointer';
    });
  }
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPostImages);
  } else {
    initPostImages();
  }
  
  // Re-initialize when new content is loaded (for dynamic content)
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(() => {
      initPostImages();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
})();

