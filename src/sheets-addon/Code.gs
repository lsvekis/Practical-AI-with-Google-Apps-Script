/**
 * Sheets Add-on / Container-bound script entry points.
 * Copy this folder into a Sheets-bound Apps Script project.
 */

function onOpen(e) {
  SpreadsheetApp.getUi()
    .createMenu('AI Assistant')
    .addItem('Open Sidebar', 'sheetsShowSidebar')
    .addSeparator()
    .addItem('Explain Active Formula', 'sheetsExplainActiveFormula')
    .addItem('Classify Active Cell', 'sheetsClassifyActiveCell')
    .addToUi();
}

function sheetsShowSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('Sidebar')
    .setTitle('AI Assistant');
  SpreadsheetApp.getUi().showSidebar(html);
}

function sheetsGetActiveCellText_() {
  const cell = SpreadsheetApp.getActiveRange();
  if (!cell) return null;
  const v = cell.getDisplayValue();
  return String(v || '').trim();
}

function sheetsGetActiveCellFormula_() {
  const cell = SpreadsheetApp.getActiveRange();
  if (!cell) return null;
  const f = cell.getFormula();
  return String(f || '').trim();
}

function sheetsExplainActiveFormula() {
  const formula = sheetsGetActiveCellFormula_();
  if (!formula) return 'No formula in the active cell.';
  const prompt = [
    'Explain the following spreadsheet formula in plain language.',
    '',
    'Constraints:',
    '- Do not calculate results',
    '- Do not change the formula',
    '- Explain step by step',
    '',
    'Formula:',
    formula
  ].join('\n');
  return aiGenerateText(prompt);
}

function sheetsClassifyActiveCell() {
  const text = sheetsGetActiveCellText_();
  if (!text) return 'Active cell is empty.';
  const prompt = PROMPTS.CLASSIFY_TEXT_V1(uClampText_(text, 1500));
  const raw = aiGenerateText(prompt);
  const schema = '{"category":"Billing | Technical | General | Other","confidence":number}';
  const obj = vParseValidateRepair_(raw, vValidateCategory_, schema);
  return JSON.stringify(obj, null, 2);
}

/**
 * Batch classify a column of text into helper columns.
 * Assumes:
 * - Input in column A starting at row 2
 * - Output category in column B, confidence in column C
 */
function sheetsBatchClassifyColumnA() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 'No data.';

  const values = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  const out = [];
  const conf = [];

  for (let i = 0; i < values.length; i++) {
    const text = String(values[i][0] || '').trim();
    if (!text) { out.push(['']); conf.push(['']); continue; }
    const prompt = PROMPTS.CLASSIFY_TEXT_V1(uClampText_(text, 1500));
    const raw = aiGenerateText(prompt, { cacheKey: aiCacheKey_(prompt) });
    const schema = '{"category":"Billing | Technical | General | Other","confidence":number}';
    const obj = vParseValidateRepair_(raw, vValidateCategory_, schema);
    out.push([obj.category]);
    conf.push([obj.confidence]);
  }

  sheet.getRange(2, 2, out.length, 1).setValues(out);
  sheet.getRange(2, 3, conf.length, 1).setValues(conf);
  return 'Batch classification complete.';
}
