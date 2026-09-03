var KSP_INSTALLATION_SHEET_NAME = 'KnowledgeShare_Installation';
var KSP_INSTALLER_OWNER_LATCH_VERSION = 1;
var KSP_DEPLOYMENT_SECURITY_ATTESTATION_VERSION = 1;

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

function kspInstallerError_(code, message) {
  var error = new Error(message);
  error.code = code;
  return error;
}

function kspWithInstallerLock_(environment, callback) {
  var lock = null;
  try {
    lock = environment.acquireScriptLock(KSP_DEFAULTS.LOCK_TIMEOUT_MS);
    return callback();
  } finally {
    if (lock) environment.releaseScriptLock(lock);
  }
}

function kspReadInstallerOwner_(environment) {
  var raw = environment.getProperty(KSP_PROPERTY_KEYS.INSTALLER_OWNER_JSON);
  if (!raw) return null;
  var value;
  try {
    value = JSON.parse(raw);
  } catch (ignored) {
    throw kspInstallerError_('INSTALLER_OWNER_LATCH_INVALID', 'Installer owner latch is malformed.');
  }
  var ownerEmail = kspNormalizeInstallerIdentity_(value && value.ownerEmail);
  kspAssert_(kspIsPlainObject_(value) && value.version === KSP_INSTALLER_OWNER_LATCH_VERSION &&
    ownerEmail && value.ownerEmail === ownerEmail,
  'INSTALLER_OWNER_LATCH_INVALID', 'Installer owner latch is invalid.');
  return ownerEmail;
}

function kspWriteInstallerOwner_(environment, ownerEmail) {
  environment.setProperty(KSP_PROPERTY_KEYS.INSTALLER_OWNER_JSON, JSON.stringify({
    version: KSP_INSTALLER_OWNER_LATCH_VERSION,
    ownerEmail: ownerEmail
  }));
}

function kspBuildInstallerBootstrapConfig_(authorization) {
  return {
    environment: 'PROD',
    knowledgeParentFolderId: authorization.parentId,
    controlFolderId: authorization.parentId,
    adminEmails: [authorization.activeEmail],
    timezone: KSP_DEFAULTS.TIMEZONE,
    aiSyncEnabled: false,
    aiSyncIntervalMinutes: KSP_DEFAULTS.AI_SYNC_INTERVAL_MINUTES
  };
}

function kspAssertInstallerBootstrapMatches_(environment, expected) {
  var raw = environment.getProperty(KSP_PROPERTY_KEYS.BOOTSTRAP_CONFIG_JSON);
  if (!raw) return false;
  var actual;
  try {
    actual = kspNormalizeAndValidateConfig_(JSON.parse(raw));
  } catch (ignored) {
    throw kspInstallerError_('INSTALLER_BOOTSTRAP_CONFLICT', 'Installer bootstrap config is malformed.');
  }
  var actualAdmins = kspNormalizeEmailList_(actual.adminEmails);
  var expectedAdmins = kspNormalizeEmailList_(expected.adminEmails);
  kspAssert_(actual.environment === expected.environment &&
    actual.knowledgeParentFolderId === expected.knowledgeParentFolderId &&
    actual.controlFolderId === expected.controlFolderId &&
    actual.timezone === expected.timezone &&
    actual.aiSyncEnabled === expected.aiSyncEnabled &&
    actual.aiSyncIntervalMinutes === expected.aiSyncIntervalMinutes &&
    actualAdmins.length === 1 && expectedAdmins.length === 1 && actualAdmins[0] === expectedAdmins[0],
  'INSTALLER_BOOTSTRAP_CONFLICT', 'Installer bootstrap config conflicts with the latched owner or host.');
  return true;
}

function kspAuthorizeAndLatchInstaller_(environment) {
  return kspWithInstallerLock_(environment, function () {
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

    var state = kspLoadInstallationState_(environment);
    var owner = kspReadInstallerOwner_(environment);
    var installed = Boolean(state && state.config);
    var administrators = installed ? kspNormalizeEmailList_(state.config.adminEmails || []) : [];

    if (!installed) {
      kspAssert_(effective && active === effective, 'INSTALLER_IDENTITY_AMBIGUOUS',
        '初回導入では実行ユーザーと有効ユーザーが一致する必要があります。');
      if (owner) {
        kspAssert_(active === owner, 'INSTALLER_OWNER_MISMATCH',
          '中断した導入は最初に確認された会社管理者だけが再開できます。');
      }
      var authorization = {
        activeEmail: active,
        ownerEmail: owner || active,
        parentId: String(bound.parentIds[0]),
        spreadsheetId: String(bound.id),
        spreadsheetName: String(bound.name || '')
      };
      var bootstrap = kspBuildInstallerBootstrapConfig_(authorization);
      var hasBootstrap = kspAssertInstallerBootstrapMatches_(environment, bootstrap);
      if (!owner) {
        owner = active;
        kspWriteInstallerOwner_(environment, owner);
      }
      authorization.ownerEmail = owner;
      if (!hasBootstrap) {
        environment.setProperty(KSP_PROPERTY_KEYS.BOOTSTRAP_CONFIG_JSON, JSON.stringify(bootstrap));
      }
      authorization.state = state;
      return authorization;
    }

    kspAssert_(administrators.indexOf(active) !== -1, 'INSTALLER_ADMIN_REQUIRED',
      '登録済みの会社管理者アカウントで再実行してください。');
    if (!owner) {
      kspAssert_(administrators.length === 1 && administrators[0] === active,
        'INSTALLER_OWNER_MIGRATION_AMBIGUOUS',
        'Pre-latch owner migration requires the sole authoritative administrator.');
      owner = active;
      kspWriteInstallerOwner_(environment, owner);
    }
    kspAssert_(administrators.indexOf(owner) !== -1, 'INSTALLER_OWNER_CONFIG_CONFLICT',
      'Installer owner is not present in the authoritative administrator configuration.');

    return {
      activeEmail: active,
      ownerEmail: owner,
      parentId: String(bound.parentIds[0]),
      spreadsheetId: String(bound.id),
      spreadsheetName: String(bound.name || ''),
      state: state
    };
  });
}

function kspInstallerSafeError_(error) {
  var code = kspGetErrorCode_(error, 'INSTALLER_FAILED');
  var messages = {
    INSTALLER_BOUND_SPREADSHEET_REQUIRED: '導入先スプレッドシートからApps Scriptを開いて再実行してください。',
    INSTALLER_PARENT_AMBIGUOUS: '導入先スプレッドシートの保存場所を確認してください。',
    INSTALLER_ACTIVE_USER_REQUIRED: '会社管理者アカウントで再実行してください。',
    INSTALLER_IDENTITY_AMBIGUOUS: '初回導入は実行ユーザーと有効ユーザーが一致する会社管理者アカウントで行ってください。',
    INSTALLER_ADMIN_REQUIRED: '登録済みの会社管理者アカウントで再実行してください。',
    INSTALLER_OWNER_MISMATCH: '最初に導入を開始した会社管理者アカウントで再実行してください。',
    INSTALLER_OWNER_LATCH_INVALID: '導入所有者の記録が不正です。サポート担当者に確認してください。',
    INSTALLER_OWNER_CONFIG_CONFLICT: '導入所有者と管理者設定が一致しません。サポート担当者に確認してください。',
    INSTALLER_OWNER_MIGRATION_AMBIGUOUS: '既存導入の所有者を一意に確認できません。サポート担当者に確認してください。',
    INSTALLER_BOOTSTRAP_CONFLICT: '中断した導入設定が現在の管理者または保存場所と一致しません。',
    SETUP_LOCK_TIMEOUT: '別の導入処理が実行中です。完了後に再実行してください。',
    DUPLICATE_RESOURCE_CANDIDATES: '同名ファイルが複数あります。管理者に確認してください。',
    INSTALLATION_STATE_MISSING: 'installKnowledgeShare を先に実行してください。',
    WEB_APP_DEPLOYMENT_REQUIRED: '会社限定のWeb Appをデプロイしてから再実行してください。',
    WEB_APP_DEPLOYMENT_IDENTITY_INVALID: 'Web AppのデプロイURLを確認してください。',
    DEPLOYMENT_SECURITY_ATTESTATION_REQUIRED: 'デプロイ設定を管理者が確認し、confirmKnowledgeShareDeploymentSecurity を実行してください。',
    DEPLOYMENT_SECURITY_ATTESTATION_INVALID: 'デプロイ確認記録が不正です。管理者が設定を再確認してください。',
    DEPLOYMENT_SECURITY_ATTESTATION_STALE: 'Web Appが変更されています。管理者がデプロイ設定を再確認してください。'
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

function kspGetWebAppDeploymentIdentity_(environment) {
  var identity = String(environment.getWebAppDeploymentIdentity() || '').trim();
  if (!identity) return '';
  kspAssert_(/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/(?:exec|dev)$/.test(identity),
    'WEB_APP_DEPLOYMENT_IDENTITY_INVALID', 'A versioned Web App execution URL is required.');
  return identity.replace(/\/dev$/, '/exec');
}

function kspReadDeploymentSecurityAttestation_(environment) {
  var raw = environment.getProperty(KSP_PROPERTY_KEYS.DEPLOYMENT_SECURITY_ATTESTATION_JSON);
  if (!raw) return null;
  var value;
  try {
    value = JSON.parse(raw);
  } catch (ignored) {
    throw kspInstallerError_('DEPLOYMENT_SECURITY_ATTESTATION_INVALID', 'Deployment attestation is malformed.');
  }
  kspAssert_(kspIsPlainObject_(value) &&
    value.version === KSP_DEPLOYMENT_SECURITY_ATTESTATION_VERSION &&
    /^[0-9a-f]{64}$/.test(String(value.deploymentIdentitySha256 || '')) &&
    /^\d{4}-\d{2}-\d{2}T/.test(String(value.confirmedAt || '')),
  'DEPLOYMENT_SECURITY_ATTESTATION_INVALID', 'Deployment attestation is invalid.');
  return value;
}

function kspBuildDeploymentReadinessStatus_(environment, resourceSummary) {
  var identity = kspGetWebAppDeploymentIdentity_(environment);
  if (!identity) {
    return kspBuildInstallerStatus_(KSP_INSTALLER_STATES.READY_FOR_DEPLOYMENT,
      'Apps Scriptで会社限定のWeb Appを1回デプロイし、デプロイ設定を確認してください。',
      { resourceSummary: resourceSummary });
  }

  var attestation;
  try {
    attestation = kspReadDeploymentSecurityAttestation_(environment);
  } catch (error) {
    var invalid = kspInstallerSafeError_(error);
    return kspBuildInstallerStatus_(KSP_INSTALLER_STATES.ACTION_REQUIRED, invalid.message,
      { resourceSummary: resourceSummary, error: invalid });
  }
  if (!attestation) {
    var required = kspInstallerSafeError_({ code: 'DEPLOYMENT_SECURITY_ATTESTATION_REQUIRED' });
    return kspBuildInstallerStatus_(KSP_INSTALLER_STATES.ACTION_REQUIRED, required.message,
      { resourceSummary: resourceSummary, error: required });
  }

  var currentHash = String(environment.hashDeploymentIdentity(identity) || '');
  if (!/^[0-9a-f]{64}$/.test(currentHash)) {
    var hashInvalid = kspInstallerSafeError_({ code: 'DEPLOYMENT_SECURITY_ATTESTATION_INVALID' });
    return kspBuildInstallerStatus_(KSP_INSTALLER_STATES.ACTION_REQUIRED, hashInvalid.message,
      { resourceSummary: resourceSummary, error: hashInvalid });
  }
  if (attestation.deploymentIdentitySha256 !== currentHash) {
    var stale = kspInstallerSafeError_({ code: 'DEPLOYMENT_SECURITY_ATTESTATION_STALE' });
    return kspBuildInstallerStatus_(KSP_INSTALLER_STATES.ACTION_REQUIRED, stale.message,
      { resourceSummary: resourceSummary, error: stale });
  }

  return kspBuildInstallerStatus_(KSP_INSTALLER_STATES.READY,
    '管理者が会社限定のデプロイ設定を確認済みです。Web Appを承認済みの社内利用者へ共有できます。',
    { resourceSummary: resourceSummary });
}

function kspRunInstaller_(environment) {
  try {
    kspAuthorizeAndLatchInstaller_(environment);
  } catch (error) {
    var denied = kspInstallerSafeError_(error);
    return kspBuildInstallerStatus_(KSP_INSTALLER_STATES.ACTION_REQUIRED, denied.message, { error: denied });
  }

  try {
    kspPersistInstallerStatus_(environment, kspBuildInstallerStatus_(
      KSP_INSTALLER_STATES.INSTALLING, '導入処理を実行しています。'));

    var setup = kspRunSetup_(environment);
    if (!setup.ok) {
      var setupError = setup.errors && setup.errors[0] ? setup.errors[0] : { code: 'INSTALLER_FAILED' };
      var safeSetupError = kspInstallerSafeError_({ code: setupError.code });
      return kspPersistInstallerStatus_(environment, kspBuildInstallerStatus_(
        KSP_INSTALLER_STATES.FAILED, safeSetupError.message, { error: safeSetupError }));
    }

    kspAuthorizeAndLatchInstaller_(environment);
    var validation = kspRunValidation_(environment);
    if (!validation.ok) {
      var validationError = validation.errors && validation.errors[0] ? validation.errors[0] : { code: 'INSTALLER_FAILED' };
      var safeValidationError = kspInstallerSafeError_({ code: validationError.code });
      return kspPersistInstallerStatus_(environment, kspBuildInstallerStatus_(
        KSP_INSTALLER_STATES.FAILED, safeValidationError.message, { error: safeValidationError }));
    }

    return kspPersistInstallerStatus_(environment, kspBuildDeploymentReadinessStatus_(environment,
      '必要なフォルダ、Backend、Audit、スキーマ、設定を確認しました。'));
  } catch (error) {
    var safeError = kspInstallerSafeError_(error);
    return kspPersistInstallerStatus_(environment, kspBuildInstallerStatus_(
      KSP_INSTALLER_STATES.FAILED, safeError.message, { error: safeError }));
  }
}

function kspCheckInstallerReadiness_(environment) {
  try {
    var authorization = kspAuthorizeAndLatchInstaller_(environment);
    kspAssert_(authorization.state && authorization.state.config, 'INSTALLATION_STATE_MISSING',
      'installKnowledgeShare を先に実行してください。');
    var validation = kspRunValidation_(environment);
    if (!validation.ok) {
      var validationError = validation.errors && validation.errors[0] ? validation.errors[0] : { code: 'INSTALLER_FAILED' };
      var safeValidationError = kspInstallerSafeError_({ code: validationError.code });
      return kspPersistInstallerStatus_(environment, kspBuildInstallerStatus_(
        KSP_INSTALLER_STATES.FAILED, safeValidationError.message, { error: safeValidationError }));
    }
    return kspPersistInstallerStatus_(environment, kspBuildDeploymentReadinessStatus_(environment,
      '必要なリソースとスキーマを確認しました。'));
  } catch (error) {
    var safeError = kspInstallerSafeError_(error);
    return kspBuildInstallerStatus_(KSP_INSTALLER_STATES.ACTION_REQUIRED, safeError.message, { error: safeError });
  }
}

function kspConfirmInstallerDeploymentSecurity_(environment) {
  try {
    var result = kspWithInstallerLock_(environment, function () {
      var bound = environment.getBoundSpreadsheetContext();
      kspAssert_(bound && bound.id, 'INSTALLER_BOUND_SPREADSHEET_REQUIRED',
        'この確認は導入先スプレッドシートに紐づくApps Scriptから実行してください。');
      kspAssert_(Array.isArray(bound.parentIds) && bound.parentIds.length === 1,
        'INSTALLER_PARENT_AMBIGUOUS', '導入先スプレッドシートの親フォルダを1つにしてください。');
      var identities = environment.getSessionIdentities();
      var active = kspNormalizeInstallerIdentity_(identities && identities.active);
      kspAssert_(active, 'INSTALLER_ACTIVE_USER_REQUIRED', '会社管理者アカウントを識別できません。');
      var state = kspLoadInstallationState_(environment);
      kspAssert_(state && state.config, 'INSTALLATION_STATE_MISSING',
        'installKnowledgeShare を先に実行してください。');
      var owner = kspReadInstallerOwner_(environment);
      var administrators = kspNormalizeEmailList_(state.config.adminEmails || []);
      kspAssert_(administrators.indexOf(active) !== -1, 'INSTALLER_ADMIN_REQUIRED',
        '登録済みの会社管理者アカウントで再実行してください。');
      kspAssert_(owner && administrators.indexOf(owner) !== -1, 'INSTALLER_OWNER_CONFIG_CONFLICT',
        'Installer owner is not present in the authoritative administrator configuration.');
      var identity = kspGetWebAppDeploymentIdentity_(environment);
      kspAssert_(identity, 'WEB_APP_DEPLOYMENT_REQUIRED', 'A Web App deployment is required.');
      var deploymentIdentitySha256 = String(environment.hashDeploymentIdentity(identity) || '');
      kspAssert_(/^[0-9a-f]{64}$/.test(deploymentIdentitySha256),
        'DEPLOYMENT_SECURITY_ATTESTATION_INVALID', 'Deployment identity hash is invalid.');
      var attestation = {
        version: KSP_DEPLOYMENT_SECURITY_ATTESTATION_VERSION,
        deploymentIdentitySha256: deploymentIdentitySha256,
        confirmedAt: environment.nowIso()
      };
      environment.setProperty(KSP_PROPERTY_KEYS.DEPLOYMENT_SECURITY_ATTESTATION_JSON,
        JSON.stringify(attestation));
      return attestation;
    });
    kspAssert_(result, 'DEPLOYMENT_SECURITY_ATTESTATION_INVALID', 'Deployment attestation was not saved.');
    return kspPersistInstallerStatus_(environment, kspBuildDeploymentReadinessStatus_(environment,
      '必要なリソースとスキーマ、および管理者による会社限定デプロイ設定の確認を完了しました。'));
  } catch (error) {
    var safeError = kspInstallerSafeError_(error);
    return kspBuildInstallerStatus_(KSP_INSTALLER_STATES.ACTION_REQUIRED, safeError.message, { error: safeError });
  }
}
