// Safe navigation utilities untuk menghindari error URL construction
import { buildUrlWithParams } from './urlParams';

// Resolve path pemesanan (menu, cart, checkout, dll.) supaya mengikuti
// base path saat ini: /default/... atau /:slug/...
const resolveOrderingPath = (path) => {
  if (!path) return '/';

  // Normalisasi path agar selalu diawali /
  let normalizedPath = typeof path === 'string' ? path : String(path);
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = `/${normalizedPath}`;
  }

  // Hanya adjust untuk path yang termasuk flow pemesanan
  const orderingPaths = new Set([
    '/',
    '/pesan',
    '/cart',
    '/checkout',
    '/confirmation',
    '/order-status',
    '/order-history',
    '/session-history',
    '/close-bill-summary'
  ]);

  if (!orderingPaths.has(normalizedPath)) {
    return normalizedPath;
  }

  // Tentukan base dari URL saat ini: /default atau /:slug
  let base = '/default';
  try {
    if (typeof window !== 'undefined' && window.location && window.location.pathname) {
      const segments = window.location.pathname.split('/').filter(Boolean);
      if (segments.length > 0) {
        const first = segments[0];
        if (first === 'default') {
          base = '/default';
        } else {
          // Anggap segmen pertama adalah slug toko
          base = `/${first}`;
        }
      }
    }
  } catch (error) {
    console.warn('resolveOrderingPath: gagal membaca window.location, fallback ke /default', error);
  }

  switch (normalizedPath) {
    case '/':
    case '/pesan':
      return `${base}/pesan`;
    case '/cart':
      return `${base}/cart`;
    case '/checkout':
      return `${base}/checkout`;
    case '/confirmation':
      return `${base}/confirmation`;
    case '/order-status':
      return `${base}/order-status`;
    case '/order-history':
      return `${base}/order-history`;
    case '/session-history':
      return `${base}/session-history`;
    case '/close-bill-summary':
      return `${base}/close-bill-summary`;
    default:
      return normalizedPath;
  }
};

export const safeBuildUrl = (path, params = {}) => {
  try {
    const resolvedPath = resolveOrderingPath(path);
    return buildUrlWithParams(resolvedPath, params);
  } catch (error) {
    console.error('Error in safeBuildUrl:', error);
    // Fallback ke path asli tanpa parameter
    return path || '/';
  }
};

export const safeNavigate = (navigate, path, params = {}, options = {}) => {
  try {
    const url = safeBuildUrl(path, params);
    navigate(url, options);
  } catch (error) {
    console.error('Error in safeNavigate:', error);
    // Fallback ke path asli tanpa parameter
    navigate(path || '/', options);
  }
};
