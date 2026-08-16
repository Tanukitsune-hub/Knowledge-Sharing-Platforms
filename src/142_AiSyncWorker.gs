function kspRunAiSync(environment) {
  var startedAt = environment.nowIso();
  var context = environment.loadAiContext();
  environment.ensureAiSettings(kspGetAiSettingSeedRows(startedAt));
  context = environment.loadAiContext();
  var settings = kspNormalizeAiSettings(context.settings);
  var report = kspBuildAiSyncReport(startedAt, settings);
  if (!settings.syncEnabled) {
    report.finishedAt = environment.nowIso();
    return report;
  }

  var store = environment.ensureFileSearchStore(settings, KSP_AI_DEFAULTS.STORE_DISPLAY_NAME);
  var storeName = store.name;
  var items = kspSelectAiWorkItems(context.meetingRows, context.pitchbookRows, startedAt, settings);
  report.selected = items.length;
  var maps = kspBuildAiMasterMaps(context.gpRows, context.optionRows);

  items.forEach(function (item) {
    var claim = environment.claimAiSource(item.sourceType, item.sourceId, startedAt, KSP_AI_DEFAULTS.CLAIM_TTL_MILLIS);
    if (!claim) {
      report.skippedClaims += 1;
      report.items.push({ sourceType: item.sourceType, sourceId: item.sourceId, action: 'claimed-elsewhere' });
      return;
    }
    try {
      if (String(item.row.Status) === KSP_STATUS.INACTIVE) {
        kspProcessInactiveAiItem(environment, storeName, item, report);
      } else {
        kspProcessActiveAiItem(environment, storeName, item, maps, report, environment.nowIso());
      }
    } catch (error) {
      try {
        kspRecordAiFailure(environment, item, error, settings, environment.nowIso(), report);
      } catch (recordError) {
        report.ok = false;
        report.errors.push({
          sourceType: item.sourceType,
          sourceId: item.sourceId,
          code: kspGetErrorCode(recordError),
          message: recordError.message || String(recordError)
        });
      }
    } finally {
      environment.releaseAiSourceClaim(item.sourceType, item.sourceId, claim.token);
    }
  });

  report.finishedAt = environment.nowIso();
  report.ok = report.errors.length === 0;
  return report;
}
