/**
 * DriveRagLite.gs
 * RAG-Lite utilities for Drive-backed grounded Q&A.
 */

function ragSearchFiles_(query, maxResults) {
  maxResults = maxResults || 5;
  const it = DriveApp.searchFiles("fullText contains '" + query.replace(/'/g, "\\'") + "' and trashed = false");
  const res = [];
  while (it.hasNext() && res.length < maxResults) res.push(it.next());
  return res;
}

function ragGetDocTextById_(fileId, limit) {
  limit = limit || 5000;
  const doc = DocumentApp.openById(fileId);
  return uClampText_(doc.getBody().getText(), limit);
}

function ragChunkText_(text, chunkSize) {
  chunkSize = chunkSize || 900;
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) chunks.push(text.substring(i, i + chunkSize));
  return chunks;
}

function ragSelectRelevantChunks_(chunks, query, maxChunks) {
  maxChunks = maxChunks || 5;
  const q = query.toLowerCase();
  const filtered = chunks.filter(function(c){ return c.toLowerCase().indexOf(q) !== -1; });
  return (filtered.length ? filtered : chunks).slice(0, maxChunks);
}

/**
 * Ask a grounded question over Drive documents (Docs only for this reference implementation).
 * @param {string} question
 * @returns {string}
 */
function ragAskDrive(question) {
  question = String(question || '').trim();
  if (!question) throw new Error('Question is empty.');

  const files = ragSearchFiles_(question, 5);
  if (!files.length) return 'No relevant documents found.';

  let sources = [];
  files.forEach(function(file){
    const text = ragGetDocTextById_(file.getId(), 6000);
    const chunks = ragChunkText_(text, 900);
    const picked = ragSelectRelevantChunks_(chunks, question, 3);
    sources = sources.concat(picked);
  });

  sources = sources.slice(0, 6);
  const prompt = PROMPTS.RAG_ANSWER_V1(question, sources);
  return aiGenerateText(prompt, { cacheKey: aiCacheKey_(prompt), cacheTtlSeconds: 900 });
}
