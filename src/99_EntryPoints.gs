function setupKnowledgePlatform() {
  return kspRunSetup(kspCreateAppsScriptEnvironment());
}

function validateInstallation() {
  return kspRunValidation(kspCreateAppsScriptEnvironment());
}

function getInstallationStatus() {
  return kspGetStatus(kspCreateAppsScriptEnvironment());
}

function getBootstrapConfigTemplate() {
  return kspGetBootstrapConfigTemplate();
}
