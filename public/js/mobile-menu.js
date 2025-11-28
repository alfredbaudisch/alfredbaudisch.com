/**
 * Mobile menu toggle functionality
 */

(function() {
  'use strict';
  
  function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const navList = document.querySelector('.nav-list');
    
    if (!toggle || !navList) {
      console.warn('Mobile menu elements not found');
      return;
    }
    
    function toggleMenu(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      const newState = !isExpanded;
      toggle.setAttribute('aria-expanded', newState);
      navList.classList.toggle('active');
      console.log('Menu toggled:', newState);
    }
    
    // Use both touchstart and touchend for better mobile compatibility
    toggle.addEventListener('touchstart', function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu(e);
    }, { passive: false, capture: true });
    
    toggle.addEventListener('touchend', function(e) {
      e.preventDefault();
      e.stopPropagation();
    }, { passive: false });
    
    // Also handle click for desktop/fallback
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu(e);
    }, { capture: true });
    
    // Close menu when clicking/touching outside
    function closeMenu(e) {
      const target = e.target;
      if (!navList.contains(target) && !toggle.contains(target)) {
        navList.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
      }
    }
    
    document.addEventListener('click', closeMenu);
    document.addEventListener('touchend', function(e) {
      setTimeout(function() {
        closeMenu(e);
      }, 50);
    });
  }
  
  // Initialize immediately and also on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileMenu);
  } else {
    // DOM already loaded, initialize immediately
    setTimeout(initMobileMenu, 0);
  }
})();

