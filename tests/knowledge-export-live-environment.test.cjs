const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(
  path.join(__dirname, '..', 'src', '157_KnowledgeExportLiveEnvironment.gs'),
  'utf8'
);

function loadPdfExportHarness(options = {}) {
  const captured = [];
  const blob = {
    getBytes() {
      return options.bytes === undefined ? [1, 2, 3] : options.bytes;
    }
  };
  const response = {
    getResponseCode() {
      return options.responseCode === undefined ? 200 : options.responseCode;
    },
    getBlob() {
      return blob;
    }
  };
  const context = vm.createContext({
    encodeURIComponent,
    UrlFetchApp: {
      fetch(url, requestOptions) {
        captured.push({ url, requestOptions });
        return response;
      }
    },
    ScriptApp: {
      getOAuthToken() {
        return 'synthetic-oauth-token';
      }
    },
    kspAssert_(condition, code, message) {
      if (condition) return;
      const error = new Error(message);
      error.code = code;
      throw error;
    }
  });
  new vm.Script(source, { filename: '157_KnowledgeExportLiveEnvironment.gs' }).runInContext(context);
  return { context, captured, blob };
}

test('PDF export uses authenticated Drive v3 media endpoint and returns the Blob', () => {
  const harness = loadPdfExportHarness();
  const result = harness.context.kspExportKnowledgeDocumentPdf_('doc id/123');

  assert.equal(result, harness.blob);
  assert.equal(harness.captured.length, 1);
  assert.equal(
    harness.captured[0].url,
    'https://www.googleapis.com/drive/v3/files/doc%20id%2F123/export?mimeType=application%2Fpdf'
  );
  assert.equal(harness.captured[0].requestOptions.method, 'get');
  assert.equal(
    harness.captured[0].requestOptions.headers.Authorization,
    'Bearer synthetic-oauth-token'
  );
  assert.equal(harness.captured[0].requestOptions.muteHttpExceptions, true);
});

test('PDF export rejects a non-success Drive response with a bounded safe error', () => {
  const harness = loadPdfExportHarness({ responseCode: 503 });

  assert.throws(
    () => harness.context.kspExportKnowledgeDocumentPdf_('doc-1'),
    (error) => {
      assert.equal(error.code, 'KNOWLEDGE_EXPORT_PDF_EXPORT_FAILED');
      assert.equal(error.message, 'Google DocをPDFへ変換できませんでした。');
      return true;
    }
  );
});

test('PDF export rejects an empty response Blob', () => {
  const harness = loadPdfExportHarness({ bytes: [] });

  assert.throws(
    () => harness.context.kspExportKnowledgeDocumentPdf_('doc-1'),
    (error) => {
      assert.equal(error.code, 'KNOWLEDGE_EXPORT_PDF_EMPTY');
      return true;
    }
  );
});

test('live adapter no longer uses Advanced Drive Files.export for byte content', () => {
  assert.doesNotMatch(source, /Drive\.Files\.export\s*\(/);
});
