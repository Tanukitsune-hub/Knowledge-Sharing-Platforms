function kspCreateKnowledgeExportEnvironment() {
  var environment = kspCreateMaintenanceEnvironment();

  environment.loadKnowledgeExportContext = function () {
    var context = kspLoadMaintenanceContext(environment);
    var state = environment.getInstallationState();
    var folderId = state && state.resources ? state.resources[KSP_RESOURCE_KEYS.KNOWLEDGE_EXPORTS] : '';
    kspAssert(folderId, 'KNOWLEDGE_EXPORTS_FOLDER_MISSING', 'Knowledge Exports folderが設定されていません。');
    kspValidateKnowledgeExportFolder(folderId, state && state.config ? state.config.knowledgeParentFolderId : '');
    context.knowledgeExportsFolderId = folderId;
    return context;
  };

  environment.createKnowledgeExportArtifact = function (options) {
    var input = options || {};
    kspAssert(input.folderId, 'KNOWLEDGE_EXPORTS_FOLDER_MISSING', 'Knowledge Exports folderが設定されていません。');
    var state = environment.getInstallationState();
    kspValidateKnowledgeExportFolder(
      input.folderId,
      state && state.config ? state.config.knowledgeParentFolderId : ''
    );
    var temporaryDocumentId = '';
    var pdfFileId = '';
    try {
      var temporaryName = input.outputType === KSP_KNOWLEDGE_EXPORT_OUTPUT_TYPES.PDF
        ? String(input.filename) + ' (temporary)' : String(input.filename);
      var documentFile = Drive.Files.create({
        name: temporaryName,
        mimeType: 'application/vnd.google-apps.document',
        parents: [input.folderId]
      }, null, {
        supportsAllDrives: true,
        fields: 'id,name,mimeType,webViewLink,parents,trashed'
      });
      temporaryDocumentId = documentFile.id;
      kspAssertKnowledgeExportCreatedFile(
        documentFile, input.folderId, 'application/vnd.google-apps.document',
        'KNOWLEDGE_EXPORT_DOCUMENT_CREATE_FAILED'
      );
      kspWriteKnowledgeExportDocument(temporaryDocumentId, input.model);

      if (input.outputType === KSP_KNOWLEDGE_EXPORT_OUTPUT_TYPES.GOOGLE_DOCS) {
        kspAssert(documentFile.id,
          'KNOWLEDGE_EXPORT_DOCUMENT_URL_MISSING', '生成されたGoogle Docのリンクを確認できません。');
        return {
          id: documentFile.id,
          name: documentFile.name || input.filename,
          url: kspIsKnowledgeExportDriveUrl(documentFile.webViewLink)
            ? documentFile.webViewLink : ('https://docs.google.com/document/d/' + documentFile.id + '/edit'),
          warnings: []
        };
      }

      var pdfBlob = Drive.Files.export(temporaryDocumentId, 'application/pdf');
      kspAssert(pdfBlob && pdfBlob.getBytes && pdfBlob.getBytes().length > 0,
        'KNOWLEDGE_EXPORT_PDF_EMPTY', 'PDFの内容が空です。');
      var pdfFile = Drive.Files.create({
        name: String(input.filename),
        mimeType: 'application/pdf',
        parents: [input.folderId]
      }, pdfBlob, {
        supportsAllDrives: true,
        fields: 'id,name,mimeType,webViewLink,parents,trashed,size'
      });
      pdfFileId = pdfFile.id;
      kspAssertKnowledgeExportCreatedFile(
        pdfFile, input.folderId, 'application/pdf', 'KNOWLEDGE_EXPORT_PDF_CREATE_FAILED'
      );
      kspAssert(pdfFile.id, 'KNOWLEDGE_EXPORT_PDF_URL_MISSING', '生成されたPDFのリンクを確認できません。');

      var warnings = [];
      try {
        kspTrashKnowledgeExportFile(temporaryDocumentId);
      } catch (cleanupError) {
        warnings.push({
          code: 'KNOWLEDGE_EXPORT_TEMP_DOCUMENT_CLEANUP_FAILED',
          message: 'PDFは作成されましたが、一時Google Docを自動削除できませんでした。'
        });
      }
      temporaryDocumentId = '';
      return {
        id: pdfFile.id,
        name: pdfFile.name || input.filename,
        url: kspIsKnowledgeExportDriveUrl(pdfFile.webViewLink)
          ? pdfFile.webViewLink : ('https://drive.google.com/open?id=' + pdfFile.id),
        warnings: warnings
      };
    } catch (error) {
      if (pdfFileId) {
        try { kspTrashKnowledgeExportFile(pdfFileId); } catch (ignoredPdfCleanup) { /* Preserve original error. */ }
      }
      if (temporaryDocumentId) {
        try { kspTrashKnowledgeExportFile(temporaryDocumentId); } catch (ignoredDocumentCleanup) { /* Preserve original error. */ }
      }
      error.code = error.code || 'KNOWLEDGE_EXPORT_ARTIFACT_CREATE_FAILED';
      throw error;
    }
  };

  return environment;
}

function kspValidateKnowledgeExportFolder(folderId, expectedParentId) {
  kspAssert(folderId && expectedParentId, 'KNOWLEDGE_EXPORTS_FOLDER_INVALID',
    'Knowledge Exportsフォルダの親境界を確認できません。');
  var folder = Drive.Files.get(folderId, {
    supportsAllDrives: true,
    fields: 'id,mimeType,parents,trashed'
  });
  kspAssert(folder && !folder.trashed && folder.mimeType === KSP_MIME_TYPES.FOLDER &&
    (folder.parents || []).indexOf(expectedParentId) !== -1,
    'KNOWLEDGE_EXPORTS_FOLDER_INVALID',
    'Knowledge Exportsフォルダが設定された親フォルダ直下にありません。');
  return folder;
}

function kspAssertKnowledgeExportCreatedFile(file, folderId, expectedMimeType, errorCode) {
  kspAssert(file && file.id && file.mimeType === expectedMimeType && !file.trashed &&
    (file.parents || []).indexOf(folderId) !== -1,
    errorCode || 'KNOWLEDGE_EXPORT_ARTIFACT_CREATE_FAILED',
    '生成された書き出しファイルの境界を確認できません。');
}

function kspWriteKnowledgeExportDocument(documentId, model) {
  var document = DocumentApp.openById(documentId);
  var body = document.getBody();
  body.clear();
  body.appendParagraph(String(model.title || 'Knowledge Export'))
    .setHeading(DocumentApp.ParagraphHeading.TITLE);

  var sections = model.meetingSections || [];
  sections.forEach(function (section, index) {
    if (index > 0) body.appendPageBreak();
    body.appendParagraph(String(section.heading || 'Meeting'))
      .setHeading(DocumentApp.ParagraphHeading.HEADING1);
    (section.metadataLines || []).forEach(function (line) {
      body.appendParagraph(String(line));
    });
    body.appendParagraph(String(section.body || ''));
  });

  if ((model.pitchbookLines || []).length) {
    if (sections.length) body.appendPageBreak();
    body.appendParagraph('Pitchbooks / metadata and authoritative links only')
      .setHeading(DocumentApp.ParagraphHeading.HEADING1);
    model.pitchbookLines.forEach(function (line) {
      body.appendParagraph(String(line));
    });
  }
  document.saveAndClose();
}

function kspTrashKnowledgeExportFile(fileId) {
  kspAssert(fileId, 'KNOWLEDGE_EXPORT_FILE_ID_MISSING', '書き出しファイルIDがありません。');
  Drive.Files.update({ trashed: true }, fileId, null, {
    supportsAllDrives: true,
    fields: 'id,trashed'
  });
}
