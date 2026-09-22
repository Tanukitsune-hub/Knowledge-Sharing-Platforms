var KSP_BACKUP_KIND = 'backend-daily-v1';
var KSP_BACKUP_PREFIX = 'Knowledge Platform Backend Backup ';
var KSP_BACKUP_RETENTION_DAYS = 30;

function kspBackendBackupName_(dateKey) {
  kspAssert_(kspTemporalIsValidDateKey_(dateKey), 'BACKUP_DATE_INVALID', 'Backup date is invalid.');
  return KSP_BACKUP_PREFIX + dateKey;
}

function kspBackendBackupOwned_(file, folderId, backendId) {
  if (!file || !file.id || file.id === backendId || file.trashed === true ||
    file.mimeType !== KSP_MIME_TYPES.SPREADSHEET ||
    !Array.isArray(file.parents) || file.parents.length !== 1 || file.parents[0] !== folderId) return false;
  var marker = file.appProperties || {};
  return marker.kspBackupKind === KSP_BACKUP_KIND && marker.kspBackendSourceId === backendId &&
    kspTemporalIsValidDateKey_(marker.kspBackupDate) && file.name === kspBackendBackupName_(marker.kspBackupDate);
}

function kspBackendBackupAgeDays_(todayKey, snapshotKey) {
  kspAssert_(kspTemporalIsValidDateKey_(todayKey) && kspTemporalIsValidDateKey_(snapshotKey),
    'BACKUP_DATE_INVALID', 'Backup date is invalid.');
  return (Date.parse(todayKey + 'T00:00:00Z') - Date.parse(snapshotKey + 'T00:00:00Z')) / 86400000;
}

function kspRunBackendDailyBackup_(environment) {
  var result = { ok: false, dateKey: '', snapshot: 'NOT_RUN', retentionTrashed: 0, errorCode: '' };
  var lock = null;
  try {
    lock = environment.acquireScriptLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS);
    var state = kspLoadInstallationState_(environment);
    kspAssert_(state && state.config && state.resources, 'BACKUP_INSTALLATION_MISSING',
      'Backup requires a completed installation.');
    var config = kspNormalizeAndValidateConfig_(state.config);
    var folderId = state.resources[KSP_RESOURCE_KEYS.BACKUP_FOLDER];
    var backendId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
    kspAssert_(folderId && backendId && folderId !== backendId, 'BACKUP_RESOURCE_ID_MISSING',
      'Backup resource IDs are missing or invalid.');
    var folder = environment.getResource(folderId);
    var backend = environment.getResource(backendId);
    kspAssert_(folder && folder.mimeType === KSP_MIME_TYPES.FOLDER &&
      Array.isArray(folder.parents) && folder.parents.length === 1 && folder.parents[0] === config.controlFolderId,
    'BACKUP_FOLDER_BOUNDARY_INVALID', 'Backup folder is outside the restricted control boundary.');
    kspAssert_(backend && backend.mimeType === KSP_MIME_TYPES.SPREADSHEET &&
      Array.isArray(backend.parents) && backend.parents.length === 1 && backend.parents[0] === config.controlFolderId,
    'BACKUP_SOURCE_BOUNDARY_INVALID', 'Backend source is outside the restricted control boundary.');

    var todayKey = environment.todayKey(config.timezone);
    kspAssert_(kspTemporalIsValidDateKey_(todayKey), 'BACKUP_DATE_INVALID', 'Backup date is invalid.');
    result.dateKey = todayKey;
    var listed = environment.listBackupFiles(folderId);
    kspAssert_(Array.isArray(listed), 'BACKUP_LIST_INVALID', 'Backup listing is incomplete.');
    var owned = listed.filter(function (file) { return kspBackendBackupOwned_(file, folderId, backendId); });
    var sameDay = owned.filter(function (file) { return file.appProperties.kspBackupDate === todayKey; });
    kspAssert_(sameDay.length <= 1, 'BACKUP_DUPLICATE_SAME_DAY', 'Multiple accepted snapshots exist for one day.');

    if (sameDay.length) {
      var existing = environment.getBackupFile(sameDay[0].id);
      kspAssert_(kspBackendBackupOwned_(existing, folderId, backendId) &&
        existing.appProperties.kspBackupDate === todayKey,
      'BACKUP_EXISTING_MISMATCH', 'Existing daily snapshot identity changed.');
      result.snapshot = 'REUSED';
    } else {
      var name = kspBackendBackupName_(todayKey);
      var marker = { kspBackupKind: KSP_BACKUP_KIND, kspBackendSourceId: backendId, kspBackupDate: todayKey };
      var copied = environment.copyBackendSpreadsheet(backendId, folderId, name, marker);
      kspAssert_(copied && copied.id && copied.id !== backendId, 'BACKUP_COPY_INVALID',
        'Backup copy did not return a distinct file.');
      var verified = environment.getBackupFile(copied.id);
      kspAssert_(kspBackendBackupOwned_(verified, folderId, backendId) &&
        verified.appProperties.kspBackupDate === todayKey,
      'BACKUP_COPY_VERIFICATION_FAILED', 'Backup copy could not be verified in the dedicated folder.');
      result.snapshot = 'CREATED';
    }

    var expired = owned.filter(function (file) {
      return kspBackendBackupAgeDays_(todayKey, file.appProperties.kspBackupDate) > KSP_BACKUP_RETENTION_DAYS;
    });
    var verifiedExpired = expired.map(function (file) {
      var fresh = environment.getBackupFile(file.id);
      kspAssert_(kspBackendBackupOwned_(fresh, folderId, backendId) &&
        kspBackendBackupAgeDays_(todayKey, fresh.appProperties.kspBackupDate) > KSP_BACKUP_RETENTION_DAYS,
      'BACKUP_RETENTION_BOUNDARY_CHANGED', 'Backup retention candidate changed before cleanup.');
      return fresh;
    });
    verifiedExpired.forEach(function (file) {
      var trashed = environment.trashBackupFile(file.id);
      kspAssert_(trashed && trashed.id === file.id && trashed.trashed === true,
        'BACKUP_TRASH_VERIFICATION_FAILED', 'Backup Trash operation could not be verified.');
      result.retentionTrashed += 1;
    });
    result.ok = true;
    return result;
  } catch (error) {
    result.errorCode = kspGetErrorCode_(error, 'BACKUP_OPERATION_FAILED');
    return result;
  } finally {
    if (lock) environment.releaseScriptLock(lock);
  }
}
