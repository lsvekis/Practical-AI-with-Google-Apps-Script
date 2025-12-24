/**
 * Validation.gs
 * Lightweight validation utilities for structured AI outputs.
 */

function vSafeJsonParse_(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

function vValidateCategory_(obj) {
  if (!obj) return false;
  const allowed = ['Billing', 'Technical', 'General', 'Other'];
  if (!allowed.includes(obj.category)) return false;
  if (typeof obj.confidence !== 'number') return false;
  if (obj.confidence < 0 || obj.confidence > 1) return false;
  return true;
}

function vValidateCleanup_(obj) {
  if (!obj) return false;
  if (!Array.isArray(obj.repetition)) return false;
  if (!Array.isArray(obj.filler)) return false;
  if (typeof obj.longSentences !== 'number') return false;
  return true;
}

/**
 * Parse -> validate -> repair (1 attempt) pattern.
 * @param {string} rawText
 * @param {(obj:any)=>boolean} validateFn
 * @param {string} schemaText
 * @returns {any}
 */
function vParseValidateRepair_(rawText, validateFn, schemaText) {
  const parsed = vSafeJsonParse_(rawText);
  if (validateFn(parsed)) return parsed;

  // Repair attempt via AI: ask for corrected JSON only.
  const repairPrompt = [
    'The following JSON is invalid or does not match the required schema.',
    'Fix it and return ONLY valid JSON (no markdown, no comments).',
    '',
    'Schema:',
    schemaText,
    '',
    'JSON:',
    rawText
  ].join('\n');

  const repairedRaw = aiGenerateText(repairPrompt, { cacheKey: aiCacheKey_(repairPrompt), cacheTtlSeconds: 600 });
  const repaired = vSafeJsonParse_(repairedRaw);
  if (validateFn(repaired)) return repaired;

  throw new Error('AI output could not be validated.');
}
