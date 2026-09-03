function kspGetDistributionMetadata_() {
  if (typeof KSP_BUNDLE_RELEASE_METADATA !== 'undefined' && KSP_BUNDLE_RELEASE_METADATA) {
    return kspDeepClone_(KSP_BUNDLE_RELEASE_METADATA);
  }
  return {
    product: 'Knowledge Share',
    releaseVersion: KSP_RELEASE_VERSION,
    schemaVersion: KSP_SCHEMA_VERSION,
    sourceCommit: '',
    bundleProfile: 'modular-source',
    hashCanonicalizationVersion: 'ksp-bundle-payload-v1',
    bundlePayloadSha256: ''
  };
}

function kspHasBundledHtmlResources_() {
  return typeof KSP_BUNDLED_HTML_RESOURCES !== 'undefined' &&
    KSP_BUNDLED_HTML_RESOURCES && typeof KSP_BUNDLED_HTML_RESOURCES === 'object';
}

function kspReadHtmlResource_(name) {
  var normalized = String(name || '').trim();
  kspAssert_(/^[A-Za-z][A-Za-z0-9_]*$/.test(normalized),
    'HTML_RESOURCE_NAME_INVALID', 'HTML resource name is invalid.');

  if (kspHasBundledHtmlResources_()) {
    kspAssert_(Object.prototype.hasOwnProperty.call(KSP_BUNDLED_HTML_RESOURCES, normalized),
      'HTML_RESOURCE_NOT_FOUND', 'HTML resource is not available: ' + normalized + '.');
    return String(KSP_BUNDLED_HTML_RESOURCES[normalized]);
  }

  return HtmlService.createHtmlOutputFromFile(normalized).getContent();
}

function kspCreateHtmlTemplate_(name) {
  return HtmlService.createTemplate(kspReadHtmlResource_(name));
}
