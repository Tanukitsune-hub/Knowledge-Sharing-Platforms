function kspAttachPitchbookDriveAdapters_(meetingEnvironment) {
  meetingEnvironment.decodeBase64 = function (base64Data) {
    return Utilities.base64Decode(base64Data);
  };

  meetingEnvironment.createOrReusePitchbookFile = function (parentFolderId, row, bytes, mimeType) {
    var query = "'" + kspEscapeDriveQueryLiteral_(parentFolderId) + "' in parents and trashed = false" +
      " and appProperties has { key='kspDocumentId' and value='" +
      kspEscapeDriveQueryLiteral_(String(row.Document_ID)) + "' }";
    var response = Drive.Files.list({ q: query, spaces: 'drive', includeItemsFromAllDrives: true,
      supportsAllDrives: true, pageSize: 10, fields: 'files(id,name,webViewLink,parents,appProperties)' });
    var matches = response.files || [];
    kspAssert_(matches.length <= 1, 'DUPLICATE_PITCHBOOK_FILES',
      'Multiple Drive files found for ' + row.Document_ID + '.');
    if (matches.length === 1) {
      return { id: matches[0].id, name: matches[0].name,
        url: matches[0].webViewLink || '', reused: true };
    }
    var blob = Utilities.newBlob(bytes, mimeType || 'application/octet-stream', String(row.Original_Filename));
    var created = Drive.Files.create({
      name: String(row.Saved_Filename),
      parents: [parentFolderId],
      appProperties: { kspDocumentId: String(row.Document_ID), kspBatchId: String(row.Batch_ID) }
    }, blob, { supportsAllDrives: true, fields: 'id,name,webViewLink,parents,appProperties' });
    return { id: created.id, name: created.name, url: created.webViewLink || '', reused: false };
  };
}
