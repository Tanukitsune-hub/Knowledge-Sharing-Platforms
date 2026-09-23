function kspCreateBackendBackupEnvironment_() {
  var environment = kspCreateAppsScriptEnvironment_();

  environment.todayKey = function (timezone) {
    kspAssert_(timezone === KSP_DEFAULTS.TIMEZONE, 'BACKUP_TIMEZONE_MISMATCH',
      'Backup timezone must match the Apps Script Business Date boundary.');
    return kspCanonicalBusinessDate_(new Date());
  };

  environment.listBackupFiles = function (folderId) {
    var files = [];
    var pageToken = null;
    var pages = 0;
    do {
      pages += 1;
      kspAssert_(pages <= 100, 'BACKUP_LIST_PAGE_LIMIT', 'Backup folder listing exceeded the safe page limit.');
      var response = Drive.Files.list({
        q: "'" + kspEscapeDriveQueryLiteral_(folderId) + "' in parents and trashed = false",
        spaces: 'drive',
        corpora: 'allDrives',
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
        pageSize: 100,
        pageToken: pageToken || undefined,
        fields: 'nextPageToken,incompleteSearch,files(id,name,mimeType,parents,trashed,appProperties)'
      });
      kspAssert_(response && !response.incompleteSearch, 'BACKUP_LIST_INCOMPLETE',
        'Backup folder listing is incomplete.');
      files = files.concat(response.files || []);
      pageToken = response.nextPageToken || null;
    } while (pageToken);
    return files;
  };

  environment.getBackupFile = function (fileId) {
    return Drive.Files.get(fileId, {
      supportsAllDrives: true,
      fields: 'id,name,mimeType,parents,trashed,appProperties'
    });
  };

  environment.copyBackendSpreadsheet = function (sourceId, folderId, name, marker) {
    return Drive.Files.copy({
      name: name,
      parents: [folderId],
      appProperties: marker
    }, sourceId, {
      supportsAllDrives: true,
      fields: 'id,name,mimeType,parents,trashed,appProperties'
    });
  };

  environment.trashBackupFile = function (fileId) {
    return Drive.Files.update({ trashed: true }, fileId, null, {
      supportsAllDrives: true,
      fields: 'id,trashed'
    });
  };

  return environment;
}
