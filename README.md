# Practical AI with Google Workspace (Apps Script) — Reference Repo

A reference implementation for building **safe, reliable AI tools in Google Workspace** using **Google Apps Script**:
- Docs/Sheets sidebars (preview-first UX)
- RAG-lite over Drive (grounded answers)
- Structured JSON outputs + validation + repair
- Form/Sheet workflow pipelines (rules decide, AI informs)
- Caching + retries + backoff
- Minimal-secrets practices (Script Properties)

> **Important:** This repo is intentionally model/provider-agnostic.  
> Plug in your AI provider by editing `src/shared/AIService.gs` (`callAI_()`).

---

## Repo Layout

```
practical-ai-workspace-gas/
  src/
    shared/
      AIService.gs
      PromptService.gs
      Validation.gs
      Utils.gs
    docs-addon/
      Code.gs
      Sidebar.html
      appsscript.json
    sheets-addon/
      Code.gs
      Sidebar.html
      appsscript.json
    workflows/
      FormToSheetPipeline.gs
    rag-lite/
      DriveRagLite.gs
  tools/
    set_api_key.gs
  LICENSE
```

---

## Quick Start (Local → Apps Script)

1. Create a new Apps Script project (Docs or Sheets) and copy the corresponding folder:
   - Docs: `src/docs-addon/*`
   - Sheets: `src/sheets-addon/*`

2. Also copy the shared library files:
   - `src/shared/*`

3. Configure your AI key in **Script Properties**:
   - Run `tools/set_api_key.gs` (copy it into the project temporarily) or set manually:
     - Key: `AI_API_KEY`
     - Value: your provider key

4. Implement your provider call in:
   - `src/shared/AIService.gs` → `callAI_()`

5. Reload the Doc/Sheet, open the menu:
   - **AI Assistant → Open Sidebar**

---

## Security Notes

- **Never hardcode** keys in source.
- Use **Script Properties** and restrict OAuth scopes.
- Don’t log sensitive content (docs/emails).
- Default to **preview-first** (no silent edits).

---

## What’s Included

### Docs Sidebar
- Summarize selection / document
- Explain selection
- Cleanup analysis (repetition/filler/artifacts)
- Optional apply button (inserts at cursor)

### Sheets Sidebar
- Explain a formula
- Classify a cell
- Batch insights into helper columns
- Safe narrative summaries

### RAG-Lite (Drive)
- Keyword retrieval via Drive search
- Chunking + lightweight relevance
- Grounded prompt: “answer only from sources or say not found”

### Workflows
- Forms → Sheets → AI analysis → rule-based routing + flags
- Confidence thresholds + manual review queue

---

## License
MIT
