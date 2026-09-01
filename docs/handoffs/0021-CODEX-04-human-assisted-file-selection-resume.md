# Work 0021 — CODEX-04 human-assisted file-selection resume

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-04`
BALL: `CODEX`
STATUS: `READY`

## Purpose

Do not spend further Work 0021 time repairing the ChatGPT/Codex Chrome file-chooser automation bridge.

The bridge failure is now classified as an external automation-tooling issue, not a Knowledge Share product blocker, because:

- the normal Web App file input exists and is enabled;
- all six fixture files are valid and locally readable;
- deterministic registration/format logic passes;
- the failure occurs before any file path reaches the Web App;
- no evidence shows that a human user cannot complete the normal file selection dialog.

Work 0021 should continue through one bounded **human-assisted file selection** while preserving the normal product registration path.

## Resume procedure

1. Recreate or copy the six already-validated CODEX-04 fixtures to one obvious user-accessible folder outside Git, for example a temporary folder under the current Codex workspace or Downloads.
2. Keep the six filenames clear and format-specific: PDF, PPTX, XLSX, DOCX, TXT, EML.
3. Open the existing private Web App version 63 to the normal Pitchbook registration UI using the currently working Chrome connection.
4. Navigate to the normal upload/drop-zone state and then STOP before choosing files.
5. Tell the user the exact folder path and ask them to click/select the six files manually in the native file chooser. This is the only human step.
6. The human must use the ordinary product UI. Do not insert Backend rows directly, call a hidden registration API, create a qualification-only endpoint, bypass source validation, or upload directly to OpenAI.
7. After the normal UI has accepted the files and registration completes, Codex resumes all remaining CODEX-04 qualification:
   - identify the six resulting authoritative `DOC-*` rows;
   - exact OpenAI-only sync per source;
   - one current provider document per supported source;
   - one bounded grounded query + authoritative normalized citation per format;
   - EML attachment boundary;
   - one API-independent FULL_OUTPUT preview;
   - final provider/source integrity;
   - required report and GitHub updates.
8. If the human-operated native chooser itself does not open, then this becomes evidence of a product/browser-environment primary-flow blocker. Stop and report that exact fact.
9. If human file selection succeeds, the Chrome automation chooser issue is `FIX SOON / external tooling` and must not block Work 0021 merge.

## Boundaries

Preserve the existing fixture and safety limits:

- maximum six tiny non-confidential synthetic sources;
- no `DOC-000018`;
- no old Matrix-C 5–25 MiB fixtures;
- no broad sync/reindex;
- no Gemini API call;
- no Work 0023 implementation;
- no new Web App, Vector Store, public endpoint or qualification bypass;
- no CODEX-05 unless a genuine Work 0021 product blocker appears.

## External tooling follow-up

The ChatGPT Chrome plugin / extension file-chooser automation bridge may be reported separately through `/feedback` with the affected chat/task ID. Its repair is not required for Work 0021 if the normal human upload path succeeds.
