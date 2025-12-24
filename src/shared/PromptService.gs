/**
 * PromptService.gs
 * Central place for prompt templates + versions.
 */

const PROMPTS = {
  SUMMARY_V1: function(text) {
    return [
      'You are a document summarization assistant.',
      '',
      'Task:',
      'Summarize the content below in 5 bullet points.',
      '',
      'Constraints:',
      '- Only use the provided content',
      '- Do not add outside information',
      '- If content is insufficient, say: "Insufficient information in provided content."',
      '',
      'Content:',
      text
    ].join('\n');
  },

  EXPLAIN_SELECTION_V1: function(text) {
    return [
      'You are a helpful explainer for non-technical readers.',
      '',
      'Task:',
      'Explain the text below in simple terms.',
      '',
      'Constraints:',
      '- Use short sentences',
      '- Do not add external facts',
      '- If something is unclear, say: "Not explained in the text."',
      '',
      'Text:',
      text
    ].join('\n');
  },

  CLEANUP_ANALYSIS_V1: function(text) {
    return [
      'You are a document quality reviewer.',
      '',
      'Task:',
      'Analyze the text below and identify: repetition, filler language, and long sentences.',
      '',
      'Output:',
      'Return ONLY valid JSON using this schema:',
      '{',
      '  "repetition": string[],',
      '  "filler": string[],',
      '  "longSentences": number',
      '}',
      '',
      'Rules:',
      '- Do NOT rewrite the document',
      '- Detect only based on provided text',
      '',
      'Text:',
      text
    ].join('\n');
  },

  CLASSIFY_TEXT_V1: function(text) {
    return [
      'Classify the text below into one category.',
      '',
      'Return ONLY valid JSON with this schema:',
      '{ "category": "Billing | Technical | General | Other", "confidence": number }',
      '',
      'Rules:',
      '- Confidence between 0 and 1',
      '- If unclear, use "Other"',
      '',
      'Text:',
      text
    ].join('\n');
  },

  RAG_ANSWER_V1: function(question, sources) {
    const src = sources.map(function(s, i){
      return 'Source ' + (i+1) + ':\n' + s;
    }).join('\n\n');
    return [
      'You are a knowledge assistant.',
      '',
      'You may ONLY answer using the source content below.',
      'If the answer is not present, respond exactly with:',
      '"I could not find this information in the provided documents."',
      '',
      'Sources:',
      src,
      '',
      'Question:',
      question
    ].join('\n');
  }
};
