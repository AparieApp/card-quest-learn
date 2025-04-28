
/**
 * Secure input validation utilities
 */

// Validate and sanitize text input
export const sanitizeText = (input: string | null | undefined): string => {
  if (input === null || input === undefined) {
    return '';
  }
  
  // Trim and limit length
  let sanitized = input.trim().slice(0, 1000);
  
  // Basic XSS protection
  sanitized = sanitized
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
    
  return sanitized;
};

// Validate share code (alphanumeric only)
export const validateShareCode = (code: string | null | undefined): string => {
  if (!code) return '';
  
  // Clean up code (remove spaces, etc)
  const cleanCode = code.trim().toUpperCase();
  
  // Check if code follows expected pattern (alphanumeric, 6-8 chars)
  if (!/^[A-Z0-9]{6,8}$/.test(cleanCode)) {
    throw new Error('Invalid share code format');
  }
  
  return cleanCode;
};

// Validate UUID format
export const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// Rate limit check for sensitive operations
let lastCheckTime: Record<string, number> = {};
let attemptCount: Record<string, number> = {};

export const checkRateLimit = (operation: string, maxAttempts = 5, windowMs = 60000): boolean => {
  const now = Date.now();
  const key = operation;
  
  // Reset counter if window has passed
  if (!lastCheckTime[key] || (now - lastCheckTime[key] > windowMs)) {
    attemptCount[key] = 1;
    lastCheckTime[key] = now;
    return true;
  }
  
  // Increment counter
  attemptCount[key] = (attemptCount[key] || 0) + 1;
  lastCheckTime[key] = now;
  
  // Check if limit exceeded
  return attemptCount[key] <= maxAttempts;
};

// Constant time comparison (to prevent timing attacks)
export const secureCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    // Still process both strings to prevent timing attacks
    let result = 0;
    const maxLength = Math.max(a.length, b.length);
    
    for (let i = 0; i < maxLength; i++) {
      result |= (a.charCodeAt(i % a.length) ^ b.charCodeAt(i % b.length));
    }
    
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= (a.charCodeAt(i) ^ b.charCodeAt(i));
  }
  
  return result === 0;
};
