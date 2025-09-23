import { useEffect } from 'react';

/**
 * Custom hook untuk keyboard shortcuts di desktop
 */
export const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Ctrl/Cmd + K untuk focus search (jika ada)
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]');
        if (searchInput) {
          searchInput.focus();
        }
      }

      // Escape untuk close modal
      if (event.key === 'Escape') {
        const modal = document.querySelector('.modal-open, [data-modal="open"]');
        if (modal) {
          const closeButton = modal.querySelector('[data-modal="close"]');
          if (closeButton) {
            closeButton.click();
          }
        }
      }

      // Arrow keys untuk navigate menu items
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        const menuItems = document.querySelectorAll('[data-menu-item]');
        const currentIndex = Array.from(menuItems).findIndex(item => 
          item === document.activeElement || item.contains(document.activeElement)
        );
        
        if (menuItems.length > 0) {
          let nextIndex;
          if (event.key === 'ArrowDown') {
            nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % menuItems.length;
          } else {
            nextIndex = currentIndex === -1 ? menuItems.length - 1 : (currentIndex - 1 + menuItems.length) % menuItems.length;
          }
          
          menuItems[nextIndex]?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);
};

/**
 * Hook untuk desktop-specific features
 */
export const useDesktopFeatures = () => {
  useEffect(() => {
    // Add desktop-specific classes
    const isDesktop = window.innerWidth >= 1024;
    
    if (isDesktop) {
      document.body.classList.add('desktop-mode');
      
      // Add hover effects for desktop
      const style = document.createElement('style');
      style.textContent = `
        .desktop-mode .menu-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(255, 215, 0, 0.1);
        }
        
        .desktop-mode .category-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(255, 215, 0, 0.2);
        }
        
        .desktop-mode .cart-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(255, 215, 0, 0.3);
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.body.classList.remove('desktop-mode');
        document.head.removeChild(style);
      };
    }
  }, []);
};

