/**
 * AIService.gs
 * Provider-agnostic AI calling layer for Apps Script.
 *
 * You MUST implement callAI_() for your chosen provider.
 * This repo supplies reliability: retries, caching, and safe response handling.
 */

const AI_CONFIG = {
  // Adjust to fit your provider constraints.
  MAX_INPUT_CHARS: 12000,
  CACHE_TTL_SECONDS: 3600,
  RETRIES: 3,
  BASE_BACKOFF_MS: 500,
};

function aiGetApiKey_() {
  const key = PropertiesService.getScriptProperties().getProperty('AI_API_KEY');
  if (!key) throw new Error('Missing AI_API_KEY in Script Properties.');
  return key;
}

/**
 * Public: call AI with caching + retries.
 * @param {string} prompt
 * @param {{cacheKey?:string, cacheTtlSeconds?:number, retries?:number}} [opts]
 * @returns {string}
 */
function aiGenerateText(prompt, opts) {
  opts = opts || {};
  prompt = String(prompt || '');
  if (!prompt.trim()) throw new Error('Prompt is empty.');

  if (prompt.length > AI_CONFIG.MAX_INPUT_CHARS) {
    prompt = prompt.slice(0, AI_CONFIG.MAX_INPUT_CHARS);
  }

  const cacheKey = opts.cacheKey || aiCacheKey_(prompt);
  const ttl = typeof opts.cacheTtlSeconds === 'number' ? opts.cacheTtlSeconds : AI_CONFIG.CACHE_TTL_SECONDS;

  const cached = aiCacheGet_(cacheKey);
  if (cached) return cached;

  const retries = typeof opts.retries === 'number' ? opts.retries : AI_CONFIG.RETRIES;
  const result = aiCallWithBackoff_(prompt, retries);

  aiCachePut_(cacheKey, result, ttl);
  return result;
}

function aiCallWithBackoff_(prompt, retries) {
  let lastErr;
  for (let i = 0; i < retries; i++) {
    try {
      return callAI_(prompt);
    } catch (err) {
      lastErr = err;
      const sleepMs = AI_CONFIG.BASE_BACKOFF_MS * Math.pow(2, i);
      Utilities.sleep(sleepMs);
    }
  }
  throw lastErr || new Error('AI call failed.');
}

/**
 * Implement this function for your AI provider.
 * Must return plain text.
 *
 * Example patterns:
 * - UrlFetchApp.fetch(endpoint, options)
 * - headers: Authorization bearer token
 * - JSON payload with prompt/messages
 * - muteHttpExceptions + parse status codes
 *
 * @param {string} prompt
 * @returns {string}
 */
function callAI_(prompt) {
  // TODO: Implement your provider integration here.
  // This placeholder throws to make it obvious it must be implemented.
  throw new Error('callAI_() not implemented. Configure your AI provider in src/shared/AIService.gs');
}
////OPtional
function callAI_(prompt) {
  const provider = (PropertiesService.getScriptProperties().getProperty('AI_PROVIDER') || 'gemini').toLowerCase();
  if (provider !== 'gemini') {
    throw new Error("AI_PROVIDER is not 'gemini'. Set AI_PROVIDER=gemini or use the OpenAI option below.");
  }

  const apiKey = aiGetApiKey_();
  const model = PropertiesService.getScriptProperties().getProperty('AI_MODEL') || 'gemini-2.5-flash';

  const url =
    'https://generativelanguage.googleapis.com/v1beta/models/' +
    encodeURIComponent(model) +
    ':generateContent?key=' +
    encodeURIComponent(apiKey);

  const payload = {
    contents: [
      { role: 'user', parts: [{ text: String(prompt || '') }] }
    ],
    generationConfig: {
      temperature: 0.2
    }
  };

  const res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  const code = res.getResponseCode();
  const body = res.getContentText();

  if (code < 200 || code >= 300) {
    throw new Error('Gemini API error ' + code + ': ' + body);
  }

  const json = JSON.parse(body);

  // Typical response: candidates[0].content.parts[0].text
  const text =
    json &&
    json.candidates &&
    json.candidates[0] &&
    json.candidates[0].content &&
    json.candidates[0].content.parts &&
    json.candidates[0].content.parts[0] &&
    json.candidates[0].content.parts[0].text;

  if (!text) {
    throw new Error('Gemini response missing text: ' + body);
  }

  return String(text).trim();
}


/** Cache helpers */
function aiCacheKey_(text) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8);
  return bytes.map(function(b){ return (b + 256).toString(16).slice(-2); }).join('');
}
function aiCacheGet_(key) {
  const cache = CacheService.getScriptCache();
  return cache.get(key);
}
function aiCachePut_(key, value, ttlSeconds) {
  const cache = CacheService.getScriptCache();
  cache.put(key, value, ttlSeconds);
}
