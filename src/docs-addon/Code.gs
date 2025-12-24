/**
 * Docs Add-on / Container-bound script entry points.
 * Copy this folder into a Docs-bound Apps Script project.
 */

function onOpen(e) {
  DocumentApp.getUi()
    .createMenu('AI Assistant')
    .addItem('Open Sidebar', 'docsShowSidebar')
    .addSeparator()
    .addItem('Summarize Document', 'docsSummarizeDoc')
    .addItem('Explain Selection', 'docsExplainSelection')
    .addToUi();
}

function docsShowSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('Sidebar')
    .setTitle('AI Assistant');
  DocumentApp.getUi().showSidebar(html);
}

function docsGetSelectedText_() {
  const sel = DocumentApp.getActiveDocument().getSelection();
  if (!sel) return null;
  const parts = sel.getRangeElements().map(function(re){
    const el = re.getElement();
    return el && el.getText ? el.getText() : '';
  });
  return parts.join(' ').trim();
}

function docsGetDocText_(limit) {
  const body = DocumentApp.getActiveDocument().getBody();
  return uClampText_(body.getText(), limit || 4000);
}

/** Sidebar actions */
function docsSummarizeDoc() {
  const text = docsGetDocText_(4000);
  const prompt = PROMPTS.SUMMARY_V1(text);
  return aiGenerateText(prompt);
}

function docsExplainSelection() {
  const text = docsGetSelectedText_();
  if (!text) return 'No text selected.';
  const prompt = PROMPTS.EXPLAIN_SELECTION_V1(uClampText_(text, 2500));
  return aiGenerateText(prompt);
}

function docsCleanupAnalysis() {
  const text = docsGetDocText_(6000);
  const prompt = PROMPTS.CLEANUP_ANALYSIS_V1(text);
  const raw = aiGenerateText(prompt);
  const schema = '{"repetition": string[], "filler": string[], "longSentences": number}';
  const obj = vParseValidateRepair_(raw, vValidateCleanup_, schema);
  return JSON.stringify(obj, null, 2);
}

function docsInsertAtCursor(text) {
  const cursor = DocumentApp.getActiveDocument().getCursor();
  if (!cursor) throw new Error('No cursor found. Click in the document where you want to insert text.');
  cursor.insertText(String(text || ''));
  return 'Inserted at cursor.';
}
