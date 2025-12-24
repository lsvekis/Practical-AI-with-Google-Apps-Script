/**
 * FormToSheetPipeline.gs
 * Example workflow: Forms -> Sheets -> AI analysis -> rules + flags.
 *
 * Assumes columns:
 * A Timestamp, B Name, C Email, D Message
 * Writes:
 * E Category, F Confidence, G Status
 */

function wfOnFormSubmit(e) {
  const row = e && e.range ? e.range.getRow() : null;
  if (!row) return;
  wfProcessRow_(row);
}

function wfProcessRow_(row) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const vals = sheet.getRange(row, 1, 1, 4).getValues()[0];
  const message = String(vals[3] || '').trim();

  if (!message) {
    sheet.getRange(row, 7).setValue('Empty message — review');
    return;
  }

  const prompt = PROMPTS.CLASSIFY_TEXT_V1(uClampText_(message, 2500));
  const raw = aiGenerateText(prompt, { cacheKey: aiCacheKey_(prompt), cacheTtlSeconds: 3600 });

  const schema = '{"category":"Billing | Technical | General | Other","confidence":number}';
  const obj = vParseValidateRepair_(raw, vValidateCategory_, schema);

  sheet.getRange(row, 5).setValue(obj.category);
  sheet.getRange(row, 6).setValue(obj.confidence);

  if (obj.confidence < 0.6) {
    sheet.getRange(row, 7).setValue('Needs manual review');
    return;
  }

  sheet.getRange(row, 7).setValue('OK');
}
