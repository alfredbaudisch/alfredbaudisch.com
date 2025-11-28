/**
 * Lightbox implementation for image galleries
 * Supports keyboard navigation, touch/swipe, and click-to-close
 */

class Lightbox {
  constructor() {
    this.currentIndex = 0;
    this.images = [];
    this.isOpen = false;
    this.touchStartX = 0;
    this.touchEndX = 0;
    
    this.init();
  }
  
  init() {
    this.createLightboxHTML();
    this.bindEvents();
  }
  
  createLightboxHTML() {
    const lightboxHTML = `
      <div class="lightbox" id="lightbox" role="dialog" aria-label="Image gallery" aria-modal="true">
        <button class="lightbox-close" aria-label="Close lightbox">&times;</button>
        <button class="lightbox-nav prev" aria-label="Previous image">&#8249;</button>
        <button class="lightbox-nav next" aria-label="Next image">&#8250;</button>
        <div class="lightbox-content">
          <img class="lightbox-image" src="" alt="">
          <div class="lightbox-caption"></div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', lightboxHTML);
    
    this.lightbox = document.getElementById('lightbox');
    this.lightboxImage = this.lightbox.querySelector('.lightbox-image');
    this.lightboxCaption = this.lightbox.querySelector('.lightbox-caption');
    this.closeBtn = this.lightbox.querySelector('.lightbox-close');
    this.prevBtn = this.lightbox.querySelector('.lightbox-nav.prev');
    this.nextBtn = this.lightbox.querySelector('.lightbox-nav.next');
  }
  
  bindEvents() {
    // Close button
    this.closeBtn.addEventListener('click', () => this.close());
    
    // Navigation buttons
    this.prevBtn.addEventListener('click', () => this.prev());
    this.nextBtn.addEventListener('click', () => this.next());
    
    // Click outside to close
    this.lightbox.addEventListener('click', (e) => {
      if (e.target === this.lightbox) {
        this.close();
      }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.isOpen) return;
      
      switch(e.key) {
        case 'Escape':
          this.close();
          break;
        case 'ArrowLeft':
          this.prev();
          break;
        case 'ArrowRight':
          this.next();
          break;
      }
    });
    
    // Touch events for swipe
    this.lightbox.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    this.lightbox.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    }, { passive: true });
  }
  
  open(images, startIndex = 0) {
    if (!images || images.length === 0) return;
    
    this.images = images;
    this.currentIndex = startIndex;
    this.isOpen = true;
    
    this.updateImage();
    this.lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus management
    this.lightbox.focus();
  }
  
  close() {
    this.isOpen = false;
    this.lightbox.classList.remove('active');
    document.body.style.overflow = '';
    this.images = [];
  }
  
  updateImage() {
    if (this.images.length === 0) return;
    
    const image = this.images[this.currentIndex];
    this.lightboxImage.src = image.src;
    this.lightboxImage.alt = image.alt || image.caption || '';
    const caption = image.caption || '';
    this.lightboxCaption.textContent = caption;
    
    // Show/hide caption bar based on whether caption exists
    if (caption.trim()) {
      this.lightboxCaption.style.display = 'block';
      this.lightboxImage.style.maxHeight = 'calc(90vh - 60px)';
    } else {
      this.lightboxCaption.style.display = 'none';
      this.lightboxImage.style.maxHeight = '90vh';
    }
    
    // Show/hide navigation buttons
    this.prevBtn.style.display = this.images.length > 1 ? 'flex' : 'none';
    this.nextBtn.style.display = this.images.length > 1 ? 'flex' : 'none';
  }
  
  prev() {
    if (this.images.length <= 1) return;
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.updateImage();
  }
  
  next() {
    if (this.images.length <= 1) return;
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.updateImage();
  }
  
  handleSwipe() {
    const swipeThreshold = 50;
    const diff = this.touchStartX - this.touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - next image
        this.next();
      } else {
        // Swipe right - previous image
        this.prev();
      }
    }
  }
}

// Initialize lightbox when DOM is ready
let lightboxInstance = null;

function initLightbox() {
  lightboxInstance = new Lightbox();
  // Export for use in gallery.js and post-images.js
  window.lightboxInstance = lightboxInstance;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLightbox);
} else {
  initLightbox();
}

