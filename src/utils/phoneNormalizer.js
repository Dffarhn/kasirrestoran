/**
 * Normalize phone number to +62 format
 * Converts: 0822535033 -> +62822535033
 * Converts: +62822535033 -> +62822535033 (no change)
 * Converts: 62822535033 -> +62822535033
 * 
 * @param {string} phone - Phone number in any format
 * @returns {string} Normalized phone number in +62 format
 */
export const normalizePhoneNumber = (phone) => {
  if (!phone) return phone;
  
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // If starts with 0, replace with +62
  if (cleaned.startsWith('0')) {
    cleaned = '+62' + cleaned.substring(1);
  }
  // If starts with 62 (without +), add +
  else if (cleaned.startsWith('62') && !cleaned.startsWith('+62')) {
    cleaned = '+' + cleaned;
  }
  // If doesn't start with +, assume it's already in correct format or add +62
  else if (!cleaned.startsWith('+')) {
    // If it's 10-11 digits, assume it's Indonesian number starting with 0
    if (cleaned.length >= 10 && cleaned.length <= 11) {
      cleaned = '+62' + cleaned;
    } else {
      cleaned = '+' + cleaned;
    }
  }
  
  return cleaned;
};

/**
 * Search for customer with multiple phone formats
 * Normalizes phone to +62 format for consistent searching
 * 
 * @param {string} phone - Phone number in any format
 * @returns {string} Normalized phone number in +62 format
 */
export const normalizePhoneForSearch = (phone) => {
  if (!phone) return phone;
  
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Normalize to +62 format
  if (cleaned.startsWith('0')) {
    return '+62' + cleaned.substring(1);
  } else if (cleaned.startsWith('62') && !cleaned.startsWith('+62')) {
    return '+' + cleaned;
  } else if (!cleaned.startsWith('+')) {
    if (cleaned.length >= 10 && cleaned.length <= 11) {
      return '+62' + cleaned;
    }
    return '+' + cleaned;
  }
  
  return cleaned;
};

