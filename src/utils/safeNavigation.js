// Safe navigation utilities untuk menghindari error URL construction
import { buildUrlWithParams } from './urlParams';

export const safeBuildUrl = (path, params = {}) => {
  try {
    return buildUrlWithParams(path, params);
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
