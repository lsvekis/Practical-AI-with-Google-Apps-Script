/**
 * Run once, then DELETE this file from the project.
 * Stores AI_API_KEY in Script Properties.
 */
function TOOL_setApiKey() {
  const ui = SpreadsheetApp.getUi ? SpreadsheetApp.getUi() : DocumentApp.getUi();
  const resp = ui.prompt('Set AI_API_KEY', 'Paste your AI API key (will be stored in Script Properties):', ui.ButtonSet.OK_CANCEL);
  if (resp.getSelectedButton() !== ui.Button.OK) return;
  const key = resp.getResponseText().trim();
  if (!key) throw new Error('No key provided.');
  PropertiesService.getScriptProperties().setProperty('AI_API_KEY', key);
  ui.alert('Saved AI_API_KEY to Script Properties.');
}
