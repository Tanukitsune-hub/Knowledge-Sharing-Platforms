const fs = require('node:fs');
const path = require('node:path');

const PUBLIC_FACADE_ALLOWLIST = Object.freeze([
  'doGet',
  'getMeetingBootstrapData',
  'registerMeeting',
  'getPitchbookBootstrapData',
  'preparePitchbookBatch',
  'uploadPitchbookFile',
  'getPhase1MaintenanceBootstrapData',
  'searchMeetingRecords',
  'getMeetingMaintenanceRecord',
  'updateMeetingMaintenance',
  'changeMeetingStatus',
  'searchPitchbookRecords',
  'getPitchbookMaintenanceRecord',
  'updatePitchbookMaintenance',
  'changePitchbookStatus',
  'mutateMaster',
  'quickAddGp',
  'getGpWorkspaceData',
  'getEntityWorkspaceData',
  'getKnowledgeSearchBootstrapData',
  'searchKnowledge',
  'getAiProviderAdminData',
  'manageAiProviderAdminSession',
  'mutateAiProviderSettings',
  'previewKnowledgeExport',
  'createKnowledgeExport',
  'getKnowledgeExportPrompt',
  'recordKnowledgeExportPromptCopy',
  'getMeetingActivityAnalytics',
  'getRelationshipExplorerData',
  'updateMeetingAdminCheck'
]);

const OPERATOR_ENTRYPOINT_ALLOWLIST = Object.freeze([
  'installKnowledgeShare',
  'checkKnowledgeShareReadiness',
  'confirmKnowledgeShareDeploymentSecurity'
]);

const PRIVILEGED_FUNCTION_NAMES = Object.freeze([
  'setupKnowledgePlatform',
  'validateInstallation',
  'getInstallationStatus',
  'getBootstrapConfigTemplate',
  'include',
  'getPhase1Diagnostics',
  'runAuditRetentionCleanup',
  'runAiSyncWorker',
  'askKnowledgeQuestion',
  'getFeatureFreezeDiagnostics',
  'kspWriteKnowledgeExportDocument',
  'kspTrashKnowledgeExportFile',
  'kspCreateAppsScriptEnvironment',
  'kspCreateKnowledgeExportEnvironment'
]);

function isIdentifierStart(value) {
  return /[A-Za-z_$]/.test(value || '');
}

function isIdentifierPart(value) {
  return /[A-Za-z0-9_$]/.test(value || '');
}

function isWordBoundary(source, index) {
  return !isIdentifierPart(source[index - 1]) && !isIdentifierPart(source[index + 8]);
}

function collectTopLevelFunctionDeclarations(source, file = '<inline>') {
  const declarations = [];
  let state = 'code';
  let escaped = false;
  let regexClass = false;
  let braceDepth = 0;
  let line = 1;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];

    if (character === '\n') line += 1;

    if (state === 'line-comment') {
      if (character === '\n') state = 'code';
      continue;
    }
    if (state === 'block-comment') {
      if (character === '*' && next === '/') {
        state = 'code';
        index += 1;
      }
      continue;
    }
    if (state === 'single-quote' || state === 'double-quote' || state === 'template') {
      if (escaped) {
        escaped = false;
      } else if (character === '\\') {
        escaped = true;
      } else if (
        (state === 'single-quote' && character === "'") ||
        (state === 'double-quote' && character === '"') ||
        (state === 'template' && character === '`')
      ) {
        state = 'code';
      }
      continue;
    }
    if (state === 'regex') {
      if (character === '\n') {
        state = 'code';
      } else if (escaped) {
        escaped = false;
      } else if (character === '\\') {
        escaped = true;
      } else if (character === '[') {
        regexClass = true;
      } else if (character === ']') {
        regexClass = false;
      } else if (character === '/' && !regexClass) {
        state = 'code';
      }
      continue;
    }

    if (character === '/' && next === '/') {
      state = 'line-comment';
      index += 1;
      continue;
    }
    if (character === '/' && next === '*') {
      state = 'block-comment';
      index += 1;
      continue;
    }
    if (character === "'") {
      state = 'single-quote';
      escaped = false;
      continue;
    }
    if (character === '"') {
      state = 'double-quote';
      escaped = false;
      continue;
    }
    if (character === '`') {
      state = 'template';
      escaped = false;
      continue;
    }
    if (character === '/' && isLikelyRegexStart(source, index)) {
      state = 'regex';
      escaped = false;
      regexClass = false;
      continue;
    }
    if (character === '{') {
      braceDepth += 1;
      continue;
    }
    if (character === '}') {
      braceDepth = Math.max(0, braceDepth - 1);
      continue;
    }

    if (braceDepth !== 0 || !source.startsWith('function', index) || !isWordBoundary(source, index)) {
      continue;
    }

    let nameIndex = index + 8;
    while (/\s/.test(source[nameIndex] || '')) nameIndex += 1;
    if (source[nameIndex] === '*') {
      nameIndex += 1;
      while (/\s/.test(source[nameIndex] || '')) nameIndex += 1;
    }
    if (!isIdentifierStart(source[nameIndex])) continue;
    let endIndex = nameIndex + 1;
    while (isIdentifierPart(source[endIndex])) endIndex += 1;
    declarations.push({ name: source.slice(nameIndex, endIndex), file, line });
  }

  return declarations;
}

function isLikelyRegexStart(source, index) {
  let cursor = index - 1;
  while (cursor >= 0 && /\s/.test(source[cursor])) cursor -= 1;
  if (cursor < 0) return true;
  if (/[=(:,!&|?{};\[\]+*%~^<>-]/.test(source[cursor])) return true;
  let end = cursor + 1;
  while (cursor >= 0 && isIdentifierPart(source[cursor])) cursor -= 1;
  const previousWord = source.slice(cursor + 1, end);
  return ['return', 'case', 'throw', 'else', 'do', 'typeof', 'void', 'delete', 'yield', 'await', 'new'].includes(previousWord);
}

function readTopLevelVariableStatement(source, startIndex, startLine, file) {
  const declarations = [];
  let state = 'code';
  let escaped = false;
  let regexClass = false;
  let parenDepth = 0;
  let bracketDepth = 0;
  let braceDepth = 0;
  let expectingName = true;
  let line = startLine;

  for (let index = startIndex; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];
    if (character === '\n') line += 1;

    if (state === 'line-comment') {
      if (character === '\n') state = 'code';
      continue;
    }
    if (state === 'block-comment') {
      if (character === '*' && next === '/') {
        state = 'code';
        index += 1;
      }
      continue;
    }
    if (state === 'single-quote' || state === 'double-quote' || state === 'template') {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if ((state === 'single-quote' && character === "'") ||
        (state === 'double-quote' && character === '"') ||
        (state === 'template' && character === '`')) state = 'code';
      continue;
    }
    if (state === 'regex') {
      if (character === '\n') state = 'code';
      else if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '[') regexClass = true;
      else if (character === ']') regexClass = false;
      else if (character === '/' && !regexClass) state = 'code';
      continue;
    }

    if (character === '/' && next === '/') {
      state = 'line-comment';
      index += 1;
      continue;
    }
    if (character === '/' && next === '*') {
      state = 'block-comment';
      index += 1;
      continue;
    }
    if (character === "'") { state = 'single-quote'; escaped = false; continue; }
    if (character === '"') { state = 'double-quote'; escaped = false; continue; }
    if (character === '`') { state = 'template'; escaped = false; continue; }
    if (character === '/' && isLikelyRegexStart(source, index)) {
      state = 'regex';
      escaped = false;
      regexClass = false;
      continue;
    }

    if (expectingName) {
      if (/\s/.test(character)) continue;
      if (!isIdentifierStart(character)) {
        throw new Error(`Unsupported top-level variable declaration in ${file}:${line}; use a simple identifier.`);
      }
      let endIndex = index + 1;
      while (isIdentifierPart(source[endIndex])) endIndex += 1;
      declarations.push({ name: source.slice(index, endIndex), file, line });
      index = endIndex - 1;
      expectingName = false;
      continue;
    }

    if (character === '(') parenDepth += 1;
    else if (character === ')') parenDepth = Math.max(0, parenDepth - 1);
    else if (character === '[') bracketDepth += 1;
    else if (character === ']') bracketDepth = Math.max(0, bracketDepth - 1);
    else if (character === '{') braceDepth += 1;
    else if (character === '}') braceDepth = Math.max(0, braceDepth - 1);
    else if (character === ',' && parenDepth === 0 && bracketDepth === 0 && braceDepth === 0) expectingName = true;
    else if (character === ';' && parenDepth === 0 && bracketDepth === 0 && braceDepth === 0) {
      return { declarations, index, line };
    }
  }

  return { declarations, index: source.length - 1, line };
}

function collectTopLevelVariableDeclarations(source, file = '<inline>') {
  const declarations = [];
  let state = 'code';
  let escaped = false;
  let regexClass = false;
  let braceDepth = 0;
  let line = 1;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];
    if (character === '\n') line += 1;

    if (state === 'line-comment') {
      if (character === '\n') state = 'code';
      continue;
    }
    if (state === 'block-comment') {
      if (character === '*' && next === '/') { state = 'code'; index += 1; }
      continue;
    }
    if (state === 'single-quote' || state === 'double-quote' || state === 'template') {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if ((state === 'single-quote' && character === "'") ||
        (state === 'double-quote' && character === '"') ||
        (state === 'template' && character === '`')) state = 'code';
      continue;
    }
    if (state === 'regex') {
      if (character === '\n') state = 'code';
      else if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '[') regexClass = true;
      else if (character === ']') regexClass = false;
      else if (character === '/' && !regexClass) state = 'code';
      continue;
    }

    if (character === '/' && next === '/') { state = 'line-comment'; index += 1; continue; }
    if (character === '/' && next === '*') { state = 'block-comment'; index += 1; continue; }
    if (character === "'") { state = 'single-quote'; escaped = false; continue; }
    if (character === '"') { state = 'double-quote'; escaped = false; continue; }
    if (character === '`') { state = 'template'; escaped = false; continue; }
    if (character === '/' && isLikelyRegexStart(source, index)) {
      state = 'regex'; escaped = false; regexClass = false; continue;
    }
    if (character === '{') { braceDepth += 1; continue; }
    if (character === '}') { braceDepth = Math.max(0, braceDepth - 1); continue; }
    if (braceDepth !== 0 || !isIdentifierStart(character) || isIdentifierPart(source[index - 1])) continue;

    let endIndex = index + 1;
    while (isIdentifierPart(source[endIndex])) endIndex += 1;
    const word = source.slice(index, endIndex);
    if (!['var', 'let', 'const'].includes(word)) {
      index = endIndex - 1;
      continue;
    }
    const statement = readTopLevelVariableStatement(source, endIndex, line, file);
    declarations.push(...statement.declarations);
    index = statement.index;
    line = statement.line;
  }

  return declarations;
}

function listAppsScriptFiles(sourceDir) {
  return fs.readdirSync(sourceDir)
    .filter((file) => file.endsWith('.gs'))
    .sort()
    .map((file) => ({
      file,
      source: fs.readFileSync(path.join(sourceDir, file), 'utf8')
    }));
}

function collectRepositoryPublicSurface(rootDir = path.resolve(__dirname, '..')) {
  const sourceDir = path.join(rootDir, 'src');
  return listAppsScriptFiles(sourceDir).flatMap(({ file, source }) =>
    collectTopLevelFunctionDeclarations(source, file)
  );
}

function validatePublicSurface(rootDir = path.resolve(__dirname, '..')) {
  const declarations = collectRepositoryPublicSurface(rootDir);
  const names = new Set(declarations.map((declaration) => declaration.name));
  const allowlist = new Set(PUBLIC_FACADE_ALLOWLIST);
  const operatorAllowlist = new Set(OPERATOR_ENTRYPOINT_ALLOWLIST);
  const publicDeclarations = declarations.filter((declaration) => !declaration.name.endsWith('_'));
  const unexpectedPublic = publicDeclarations.filter((declaration) =>
    !allowlist.has(declaration.name) && !operatorAllowlist.has(declaration.name));
  const missingFacade = PUBLIC_FACADE_ALLOWLIST.filter((name) => !names.has(name));
  const missingOperatorEntrypoints = OPERATOR_ENTRYPOINT_ALLOWLIST.filter((name) => !names.has(name));
  const privilegedPublic = PRIVILEGED_FUNCTION_NAMES.filter((name) => names.has(name));
  const publicCounts = publicDeclarations.reduce((counts, declaration) => {
    counts[declaration.name] = (counts[declaration.name] || 0) + 1;
    return counts;
  }, {});
  const duplicatePublic = Object.keys(publicCounts).filter((name) => publicCounts[name] > 1);
  const errors = [];

  if (missingFacade.length) errors.push(`Missing required public facade: ${missingFacade.join(', ')}`);
  if (missingOperatorEntrypoints.length) errors.push(`Missing guarded operator entrypoint: ${missingOperatorEntrypoints.join(', ')}`);
  if (unexpectedPublic.length) {
    errors.push(`Unexpected browser-callable top-level functions: ${unexpectedPublic.map((item) => `${item.name} (${item.file}:${item.line})`).join(', ')}`);
  }
  if (duplicatePublic.length) errors.push(`Duplicate browser-callable top-level functions: ${duplicatePublic.join(', ')}`);
  if (privilegedPublic.length) errors.push(`Privileged functions are public: ${privilegedPublic.join(', ')}`);

  for (const name of PRIVILEGED_FUNCTION_NAMES) {
    if (names.has(`${name}_`)) continue;
    if (!names.has(name)) errors.push(`Required private function declaration is missing: ${name}_`);
  }

  if (errors.length) {
    const error = new Error(errors.join('\n'));
    error.details = { declarations, unexpectedPublic, missingFacade, privilegedPublic, duplicatePublic };
    throw error;
  }

  return {
    declarations,
    publicDeclarations: publicDeclarations.filter((declaration) => allowlist.has(declaration.name)),
    operatorDeclarations: publicDeclarations.filter((declaration) => operatorAllowlist.has(declaration.name)),
    privateDeclarations: declarations.filter((declaration) => declaration.name.endsWith('_'))
  };
}

module.exports = {
  PUBLIC_FACADE_ALLOWLIST,
  OPERATOR_ENTRYPOINT_ALLOWLIST,
  PRIVILEGED_FUNCTION_NAMES,
  collectTopLevelFunctionDeclarations,
  collectTopLevelVariableDeclarations,
  collectRepositoryPublicSurface,
  validatePublicSurface
};
