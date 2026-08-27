function kspCreateActivityAnalyticsEnvironment_() {
  var environment = kspCreateMaintenanceEnvironment_();

  environment.updateMeetingAdminCheckAtomic = function (
    meetingId, expectedCompleted, expectedUpdatedAt, desiredCompleted, actor, nowIso
  ) {
    var lock = kspMaintenanceAcquireLock_('Meeting monthly admin check');
    try {
      var state = environment.getInstallationState();
      kspAssert_(state && state.resources, 'INSTALLATION_STATE_MISSING', 'Installation stateがありません。');
      var backendSpreadsheetId = state.resources[KSP_RESOURCE_KEYS.BACKEND_SPREADSHEET];
      kspAssert_(backendSpreadsheetId, 'BACKEND_SPREADSHEET_MISSING', 'Backend Spreadsheetがありません。');
      var found = kspMaintenanceFindSheetRow_(
        backendSpreadsheetId, KSP_SHEET_NAMES.MEETING_INDEX, 'Meeting_ID', meetingId
      );
      kspAssert_(found, 'ADMIN_CHECK_NOT_FOUND', '対象Meetingが見つかりません。');

      var currentCompleted = kspToBoolean_(found.row.Admin_Check_Completed, false);
      var currentUpdatedAt = kspCanonicalInstantIso_(found.row.Admin_Check_Updated_At);
      kspAssert_(currentCompleted === expectedCompleted && currentUpdatedAt === expectedUpdatedAt,
        'ADMIN_CHECK_STALE', '月次管理状態が先に更新されています。');

      var before = Object.assign({}, found.row);
      if (currentCompleted === desiredCompleted) {
        return { changed: false, before: before, after: Object.assign({}, before) };
      }

      var canonicalNowIso = kspCanonicalInstantIso_(nowIso);
      kspAssert_(canonicalNowIso, 'ADMIN_CHECK_STATE_INVALID', '更新日時が不正です。');
      var fields = {
        Admin_Check_Completed: desiredCompleted,
        Admin_Check_Updated_At: canonicalNowIso,
        Admin_Check_Updated_By: actor || 'UNIDENTIFIED'
      };
      kspMaintenanceWriteSheetFieldsWithRollback_(
        found.sheet, found.headers, found.rowNumber, fields, found.row
      );
      return { changed: true, before: before, after: Object.assign({}, before, fields) };
    } finally {
      lock.releaseLock();
    }
  };

  return environment;
}
