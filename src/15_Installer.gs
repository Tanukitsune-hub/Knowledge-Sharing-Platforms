var KSP_INSTALLATION_SHEET_NAME = 'KnowledgeShare_Installation';

var KSP_INSTALLER_STATES = Object.freeze({
  INSTALLING: 'INSTALLING',
  READY_FOR_DEPLOYMENT: 'READY_FOR_DEPLOYMENT',
  READY: 'READY',
  ACTION_REQUIRED: 'ACTION_REQUIRED',
  FAILED: 'FAILED'
});

function kspNormalizeInstallerIdentity_(value) {
  return String(value || '').trim().toLowerCase();
}

function kspGetInstallerAuthorization_(environment, state) {
  var bound = environment.getBoundSpreadsheetContext();
  kspAssert_(bound && bound.id, 'INSTALLER_BOUND_SPREADSHEET_REQUIRED',
    'このインストーラーは導入先スプレッドシートに紐づくApps Scriptから実行してください。');
  kspAssert_(Array.isArray(bound.parentIds) && bound.parentIds.length === 1,
    'INSTALLER_PARENT_AMBIGUOUS', '導入先スプレッドシートの親フォルダを1つにしてください。');

  var identities = environment.getSessionIdentities();
  var active = kspNormalizeInstallerIdentity_(identities && identities.active);
  var effective = kspNormalizeInstallerIdentity_(identities && identities.effective);
  kspAssert_(active, 'INSTALLER_ACTIVE_USER_REQUIRED',
    '会社管理者アカウントを識別できません。識別可能なアカウントで再実行してください。');

  var installed = Boolean(state && state.config);
  if (!installed) {
    kspAssert_(effective && active === effective, 'INSTALLER_IDENTITY_AMBIGUOUS',
      '初回導入では実行ユーザーと有効ユーザーが一致する必要があります。');
  } else {
    var administrators = kspNormalizeEmailList_(state.config.adminEmails || []);
    kspAssert_(administrators.indexOf(active) !== -1, 'INSTALLER_ADMIN_REQUIRED',
      '登録済みの会社管理者アカウントで再実行してください。');
  }

  return {
    activeEmail: active,
    parentId: String(bound.parentIds[0]),
    spreadsheetId: String(bound.id),
    spreadsheetName: String(bound.name || '')
  };
}

function kspInstallerSafeError_(error) {
  var code = kspGetErrorCode_(error, 'INSTALLER_FAILED');
  var messages = {
    INSTALLER_BOUND_SPREADSHEET_REQUIRED: '導入先スプレッドシートからApps Scriptを開いて再実行してください。',
    INSTALLER_PARENT_AMBIGUOUS: '導入先スプレッドシートの保存場所を確認してください。',
    INSTALLER_ACTIVE_USER_REQUIRED: '会社管理者アカウントで再実行してください。',
    INSTALLER_IDENTITY_AMBIGUOUS: '初回導入は実行ユーザーと有効ユーザーが一致する会社管理者アカウントで行ってください。',
    INSTALLER_ADMIN_REQUIRED: '登録済みの会社管理者アカウントで再実行してください。',
    DUPLICATE_RESOURCE_CANDIDATES: '同名ファイルが複数あります。管理者に確認してください。',
    INSTALLATION_STATE_MISSING: 'installKnowledgeShare を先に実行してください。'
  };
  return { code: code, message: messages[code] || '導入状態を確認して、会社管理者として再実行してください。' };
}

function kspBuildInstallerStatus_(state, nextAction, details) {
  var metadata = kspGetDistributionMetadata_();
  var data = details || {};
  return {
    ok: state === KSP_INSTALLER_STATES.READY || state === KSP_INSTALLER_STATES.READY_FOR_DEPLOYMENT,
    state: state,
    nextAction: nextAction,
    releaseVersion: metadata.releaseVersion,
    schemaVersion: metadata.schemaVersion,
    sourceCommit: metadata.sourceCommit,
    bundleProfile: metadata.bundleProfile,
    bundlePayloadSha256: metadata.bundlePayloadSha256,
    resourceSummary: data.resourceSummary || '',
    error: data.error || null
  };
}

function kspPersistInstallerStatus_(environment, status) {
  if (environment && typeof environment.writeInstallationStatus === 'function') {
    environment.writeInstallationStatus(status);
  }
  return status;
}

function kspRunInstaller_(environment) {
  var state = kspLoadInstallationState_(environment);
  var authorization;
  try {
    authorization = kspGetInstallerAuthorization_(environment, state);
  } catch (error) {
    var denied = kspInstallerSafeError_(error);
    return kspBuildInstallerStatus_(KSP_INSTALLER_STATES.ACTION_REQUIRED, denied.message, { error: denied });
  }

  try {
    kspPersistInstallerStatus_(environment, kspBuildInstallerStatus_(
      KSP_INSTALLER_STATES.INSTALLING, '導入処理を実行しています。'));

    if (!state.config) {
      environment.setProperty(KSP_PROPERTY_KEYS.BOOTSTRAP_CONFIG_JSON, JSON.stringify({
        environment: 'PROD',
        knowledgeParentFolderId: authorization.parentId,
        controlFolderId: authorization.parentId,
        adminEmails: [authorization.activeEmail],
        timezone: KSP_DEFAULTS.TIMEZONE,
        aiSyncEnabled: false,
        aiSyncIntervalMinutes: KSP_DEFAULTS.AI_SYNC_INTERVAL_MINUTES
      }));
    }

    var setup = kspRunSetup_(environment);
    if (!setup.ok) {
      var setupError = setup.errors && setup.errors[0] ? setup.errors[0] : { code: 'INSTALLER_FAILED' };
      var safeSetupError = kspInstallerSafeError_({ code: setupError.code });
      return kspPersistInstallerStatus_(environment, kspBuildInstallerStatus_(
        KSP_INSTALLER_STATES.FAILED, safeSetupError.message, { error: safeSetupError }));
    }

    var validation = kspRunValidation_(environment);
    if (!validation.ok) {
      var validationError = validation.errors && validation.errors[0] ? validation.errors[0] : { code: 'INSTALLER_FAILED' };
      var safeValidationError = kspInstallerSafeError_({ code: validationError.code });
      return kspPersistInstallerStatus_(environment, kspBuildInstallerStatus_(
        KSP_INSTALLER_STATES.FAILED, safeValidationError.message, { error: safeValidationError }));
    }

    var deploymentReady = Boolean(environment.hasWebAppDeployment());
    return kspPersistInstallerStatus_(environment, kspBuildInstallerStatus_(
      deploymentReady ? KSP_INSTALLER_STATES.READY : KSP_INSTALLER_STATES.READY_FOR_DEPLOYMENT,
      deploymentReady
        ? '導入は完了しています。Web Appを社内利用者へ共有できます。'
        : 'Apps Scriptで会社限定のWeb Appを1回デプロイし、checkKnowledgeShareReadiness を実行してください。',
      { resourceSummary: '必要なフォルダ、Backend、Audit、スキーマ、設定を確認しました。' }
    ));
  } catch (error) {
    var safeError = kspInstallerSafeError_(error);
    return kspPersistInstallerStatus_(environment, kspBuildInstallerStatus_(
      KSP_INSTALLER_STATES.FAILED, safeError.message, { error: safeError }));
  }
}

function kspCheckInstallerReadiness_(environment) {
  var state = kspLoadInstallationState_(environment);
  try {
    kspGetInstallerAuthorization_(environment, state);
    kspAssert_(state && state.config, 'INSTALLATION_STATE_MISSING',
      'installKnowledgeShare を先に実行してください。');
    var validation = kspRunValidation_(environment);
    if (!validation.ok) {
      var validationError = validation.errors && validation.errors[0] ? validation.errors[0] : { code: 'INSTALLER_FAILED' };
      var safeValidationError = kspInstallerSafeError_({ code: validationError.code });
      return kspPersistInstallerStatus_(environment, kspBuildInstallerStatus_(
        KSP_INSTALLER_STATES.FAILED, safeValidationError.message, { error: safeValidationError }));
    }
    var deploymentReady = Boolean(environment.hasWebAppDeployment());
    return kspPersistInstallerStatus_(environment, kspBuildInstallerStatus_(
      deploymentReady ? KSP_INSTALLER_STATES.READY : KSP_INSTALLER_STATES.READY_FOR_DEPLOYMENT,
      deploymentReady
        ? '導入は完了しています。Web Appを社内利用者へ共有できます。'
        : 'Apps Scriptで会社限定のWeb Appを1回デプロイしてください。',
      { resourceSummary: '必要なリソースとスキーマを確認しました。' }
    ));
  } catch (error) {
    var safeError = kspInstallerSafeError_(error);
    return kspBuildInstallerStatus_(KSP_INSTALLER_STATES.ACTION_REQUIRED, safeError.message, { error: safeError });
  }
}
