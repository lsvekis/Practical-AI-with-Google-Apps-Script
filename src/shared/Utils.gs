/**
 * Utils.gs
 * Shared helpers for Docs/Sheets/Drive workflows.
 */

function uClampText_(text, limit) {
  text = String(text || '');
  if (!limit) return text;
  return text.length > limit ? text.slice(0, limit) : text;
}

function uBase64Key_(text, maxLen) {
  const b64 = Utilities.base64EncodeWebSafe(text);
  return b64.length > (maxLen || 180) ? b64.slice(0, (maxLen || 180)) : b64;
}

function uTry_(fn, fallback) {
  try { return fn(); } catch (e) { return fallback; }
}
