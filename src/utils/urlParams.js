// Utility functions untuk menangani parameter URL
export const getUrlParams = () => {
  try {
    // Pastikan window.location tersedia
    if (typeof window === 'undefined' || !window.location) {
      console.warn('window.location not available, returning default params');
      return { toko_id: null, table: '1' };
    }
    
    // Debug logging
    console.log('Current URL:', window.location.href);
    console.log('Search params:', window.location.search);
    
    const urlParams = new URLSearchParams(window.location.search);
    const params = {
      toko_id: urlParams.get('toko_id') || urlParams.get('restaurant_id'),
      table: urlParams.get('table') || urlParams.get('nomor_meja') || '1'
    };
    
    console.log('Parsed params:', params);
    return params;
  } catch (error) {
    console.error('Error getting URL params:', error);
    return { toko_id: null, table: '1' };
  }
};

export const buildUrlWithParams = (path, params = {}) => {
  try {
    // Validasi path
    if (!path || typeof path !== 'string') {
      console.error('Invalid path provided to buildUrlWithParams:', path);
      return '/';
    }
    
    // Pastikan path dimulai dengan /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    
    const currentParams = getUrlParams();
    const urlParams = new URLSearchParams();
    
    // Gunakan parameter dari current URL sebagai default
    if (currentParams.toko_id) {
      urlParams.set('toko_id', currentParams.toko_id);
    }
    if (currentParams.table) {
      urlParams.set('table', currentParams.table);
    }
    
    // Override dengan parameter yang diberikan
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        urlParams.set(key, String(value));
      }
    });
    
    const queryString = urlParams.toString();
    return queryString ? `${normalizedPath}?${queryString}` : normalizedPath;
  } catch (error) {
    console.error('Error in buildUrlWithParams:', error);
    return path || '/';
  }
};

export const navigateWithParams = (navigate, path, params = {}, options = {}) => {
  try {
    const url = buildUrlWithParams(path, params);
    navigate(url, options);
  } catch (error) {
    console.error('Error in navigateWithParams:', error);
    // Fallback ke path asli tanpa parameter
    navigate(path || '/', options);
  }
};

export const getParamFromStorage = () => {
  try {
    const stored = localStorage.getItem('restaurant_params');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error parsing stored params:', error);
  }
  return null;
};

export const saveParamsToStorage = (params) => {
  try {
    localStorage.setItem('restaurant_params', JSON.stringify(params));
  } catch (error) {
    console.error('Error saving params to storage:', error);
  }
};
