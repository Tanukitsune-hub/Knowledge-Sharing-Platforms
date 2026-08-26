const { ksp } = require('./maintenance-test-loader.cjs');
function catalogRows() {
  return {
    gps: [
      { GP_ID: 'GP-000001', GP_Name: 'Apollo', Status: 'Active', Updated_At: '2026-01-01T00:00:00.000Z' },
      { GP_ID: 'GP-000002', GP_Name: 'KKR', Status: 'Active', Updated_At: '2026-01-01T00:00:00.000Z' },
      { GP_ID: 'GP-000003', GP_Name: 'Inactive GP', Status: 'Inactive', Updated_At: '2026-01-01T00:00:00.000Z' }
    ],
    options: [
      { Option_ID: 'OPT-AC-001', Type: 'ASSET_CLASS', Name: 'PE', Sort_Order: 1, Status: 'Active', Updated_At: '2026-01-01T00:00:00.000Z' },
      { Option_ID: 'OPT-AC-002', Type: 'ASSET_CLASS', Name: 'Infrastructure', Sort_Order: 2, Status: 'Active', Updated_At: '2026-01-01T00:00:00.000Z' },
      { Option_ID: 'OPT-CT-001', Type: 'CAPITAL_TYPE', Name: 'Equity', Sort_Order: 1, Status: 'Active', Updated_At: '2026-01-01T00:00:00.000Z' },
      { Option_ID: 'OPT-LOC-001', Type: 'LOCATION', Name: 'オンライン', Sort_Order: 1, Status: 'Active', Updated_At: '2026-01-01T00:00:00.000Z' },
      { Option_ID: 'OPT-TEAM-001', Type: 'TEAM', Name: 'PD', Sort_Order: 1, Status: 'Active', Updated_At: '2026-01-01T00:00:00.000Z' }
    ]
  };
}

function createFakeEnvironment(options = {}) {
  const cat = catalogRows();
  let tick = 0;
  const documents = new Map(Object.entries(options.documents || { 'doc-1': { name: 'old', text: '日付: 2026-08-01\nGP: KKR\nAsset Class: Infrastructure\n\n面談内容:\nline1\nline2' } }));
  const files = new Map(Object.entries(options.files || { 'file-1': { name: '2026-08-01_KKR_Infrastructure_01.pdf' } }));
  const meetingRows = (options.meetingRows || [{
    Meeting_ID: 'MTG-000001', Date: '2026-08-01', Time: '', Location_ID: '', GP_ID: 'GP-000002',
    Asset_Class_ID: 'OPT-AC-002', Capital_Type_ID: '', Counterparty: '', Internal_Participants: '',
    Doc_File_ID: 'doc-1', Doc_URL: 'https://example/doc-1', Saved_Filename: '2026-08-01_KKR_Infrastructure_MTG-000001',
    Status: 'Active', Version: 1, Updated_At: '2026-08-01T00:00:00.000Z', Updated_By: 'old', AI_Index_Status: 'Indexed', AI_Last_Error: ''
  }]).map(x => ({ ...x }));
  const pitchbookRows = (options.pitchbookRows || [{
    Document_ID: 'DOC-000001', Batch_ID: 'BAT-000001', Date: '2026-08-01', GP_ID: 'GP-000002',
    Asset_Class_ID: 'OPT-AC-002', Capital_Type_ID: '', Sequence_No: 1, File_ID: 'file-1', File_URL: 'https://example/file-1',
    Original_Filename: 'source.pdf', Saved_Filename: '2026-08-01_KKR_Infrastructure_01.pdf', Status: 'Active',
    Updated_At: '2026-08-01T00:00:00.000Z', Updated_By: 'old', AI_Index_Status: 'Indexed', AI_Last_Error: ''
  }, {
    Document_ID: 'DOC-000002', Batch_ID: 'BAT-000002', Date: '2026-08-02', GP_ID: 'GP-000001',
    Asset_Class_ID: 'OPT-AC-001', Capital_Type_ID: '', Sequence_No: 1, File_ID: 'file-2', File_URL: 'https://example/file-2',
    Original_Filename: 'other.pdf', Saved_Filename: '2026-08-02_Apollo_PE_01.pdf', Status: 'Active',
    Updated_At: '2026-08-02T00:00:00.000Z', Updated_By: 'old', AI_Index_Status: 'Indexed', AI_Last_Error: ''
  }]).map(x => ({ ...x }));
  const gpRows = cat.gps.map(x => ({ ...x }));
  const optionRows = cat.options.map(x => ({ ...x }));
  const audits = [];
  const claims = new Map();
  const pitchbookWrites = [];

  function nowIso() {
    tick += 1;
    return `2026-08-16T00:00:${String(tick).padStart(2, '0')}.000Z`;
  }
  function rowsFor(sheet) {
    if (sheet === 'Meeting_Index') return meetingRows;
    if (sheet === 'Pitchbook_Index') return pitchbookRows;
    if (sheet === 'GP_Master') return gpRows;
    if (sheet === 'Option_Master') return optionRows;
    if (sheet === 'Audit_Log') return audits;
    return [];
  }
  function find(rows, key, value) { return rows.find(row => String(row[key]) === String(value)); }

  const env = {
    nowIso,
    getInstallationState() { return { resources: { backendSpreadsheetId: 'backend', auditSpreadsheetId: 'audit' } }; },
    getActor() { if (options.actorError) throw new Error('actor unavailable'); return options.actor || 'user@example.com'; },
    readRows(_id, sheet) { return rowsFor(sheet).map(row => ({ ...row })); },
    getSheetHeaders(id, sheet) {
      if (id === 'backend') {
        if (sheet === 'GP_Master') return ['GP_ID','GP_Name','Status','Created_At','Updated_At','Created_By','Updated_By'];
        if (sheet === 'Option_Master') return ['Option_ID','Type','Name','Sort_Order','Status','Created_At','Updated_At','Created_By','Updated_By'];
        if (sheet === 'Meeting_Index') return ['Meeting_ID','Date','Time','Location_ID','GP_ID','Asset_Class_ID','Capital_Type_ID','Counterparty','Internal_Participants','Doc_File_ID','Doc_URL','Saved_Filename','Status','Version','Created_At','Updated_At','Created_By','Updated_By','AI_Document_Name','AI_Index_Status','AI_Indexed_At','AI_Content_Hash','AI_Last_Error','Team_ID','Fund_Strategy','Meeting_Type_Codes','Related_Pitchbook_IDs','Follow_Up_Required','Follow_Up_Note'];
        if (sheet === 'Pitchbook_Index') return ['Document_ID','Batch_ID','Date','GP_ID','Asset_Class_ID','Capital_Type_ID','Sequence_No','File_ID','File_URL','Original_Filename','Saved_Filename','Status','Created_At','Updated_At','Created_By','Updated_By','AI_Document_Name','AI_Index_Status','AI_Indexed_At','AI_Content_Hash','AI_Last_Error','Fund_Strategy'];
        if (sheet === 'Settings') return ['Key','Value','Description','Updated_At'];
      }
      if (id === 'audit' && sheet === 'Audit_Log') return ['Event_Timestamp','Actor','Action','Target_Type','Target_ID','Result','Changed_Fields','Before_Metadata_JSON','After_Metadata_JSON','Batch_ID','Error_Code','Error_Message','Search_Mode','Question_Or_Instruction','Date_From','Date_To','GP_Filter','Asset_Class_Filter','Capital_Type_Filter','Source_Type_Filter','Model_ID','Cited_Source_IDs'];
      return [];
    },
    getDocumentText(id) { return documents.get(id)?.text || ''; },
    getDocumentSnapshot(id) { return { ...documents.get(id) }; },
    updateMeetingDocument(id, name, text) { if (options.documentWriteError) throw new Error('doc write failed'); documents.set(id, { name, text }); },
    restoreDocumentSnapshot(id, snapshot) { documents.set(id, { ...snapshot }); },
    getDriveFileSnapshot(id) { return { ...files.get(id) }; },
    renameDriveFile(id, name) { if (options.renameError) throw new Error('rename failed'); files.set(id, { name }); },
    restoreDriveFileSnapshot(id, snapshot) { files.set(id, { ...snapshot }); },
    claimRecordEdit(entity, id, sheet, key, token, expected) {
      const row = find(rowsFor(sheet), key, id);
      if (!row) { const e = new Error('missing'); e.code = 'RECORD_NOT_FOUND'; throw e; }
      if (String(row[token]) !== String(expected)) { const e = new Error('stale'); e.code = 'STALE_RECORD_VERSION'; throw e; }
      const claim = { claimKey: `${entity}:${id}`, claimToken: `${entity}-token`, row: { ...row } };
      claims.set(claim.claimKey, claim.claimToken);
      return claim;
    },
    isRecordEditClaimOwned(claim) { return claims.get(claim.claimKey) === claim.claimToken; },
    releaseRecordEditClaim(claim) { claims.delete(claim.claimKey); },
    commitClaimedRowEdit(claim, sheet, key, id, token, expected, updated) {
      if (!this.isRecordEditClaimOwned(claim)) { const e = new Error('lost'); e.code = 'RECORD_EDIT_CLAIM_LOST'; throw e; }
      if (options.commitError) { const e = new Error('commit failed'); e.code = 'COMMIT_FAILED'; throw e; }
      const row = find(rowsFor(sheet), key, id);
      if (String(row[token]) !== String(expected)) { const e = new Error('stale'); e.code = 'STALE_RECORD_VERSION'; throw e; }
      Object.assign(row, updated);
      claims.delete(claim.claimKey);
      return { ...row };
    },
    commitClaimedPitchbookEdit(claim, id, expected, updated) {
      if (!this.isRecordEditClaimOwned(claim)) { const e = new Error('lost'); e.code = 'RECORD_EDIT_CLAIM_LOST'; throw e; }
      if (options.commitError) { const e = new Error('commit failed'); e.code = 'COMMIT_FAILED'; throw e; }
      const row = find(pitchbookRows, 'Document_ID', id);
      if (String(row.Updated_At) !== String(expected)) { const e = new Error('stale'); e.code = 'STALE_RECORD_VERSION'; throw e; }
      const fields = {};
      if (ksp.kspCanonicalPitchbookDateKey_(row.Date) !== ksp.kspCanonicalPitchbookDateKey_(updated.Date)) fields.Date = updated.Date;
      ['GP_ID','Asset_Class_ID','Capital_Type_ID','Fund_Strategy','Sequence_No','Saved_Filename','Updated_At','Updated_By','AI_Index_Status','AI_Last_Error']
        .forEach(key => { if (String(row[key] ?? '') !== String(updated[key] ?? '') || ['Updated_At','Updated_By','AI_Index_Status','AI_Last_Error'].includes(key)) fields[key] = updated[key] ?? ''; });
      Object.assign(row, fields);
      pitchbookWrites.push(Object.keys(fields));
      claims.delete(claim.claimKey);
      return { ...row };
    },
    reservePitchbookEditSequence(_claim, input) {
      const max = pitchbookRows.filter(r => r.Document_ID !== input.documentId && ksp.kspPitchbookContextMatchesRow_(r, input))
        .reduce((m, r) => Math.max(m, Number(r.Sequence_No || 0)), 0);
      return max + 1;
    },
    updateStatusAtomic(sheet, key, id, token, expected, status, actor, now) {
      const row = find(rowsFor(sheet), key, id); if (!row) throw Object.assign(new Error('missing'), { code: 'RECORD_NOT_FOUND' });
      if (String(row[token]) !== String(expected)) throw Object.assign(new Error('stale'), { code: 'STALE_RECORD_VERSION' });
      const before = { ...row }; row.Status = status; row.Version = Number(row.Version || 0) + 1; row.Updated_At = now; row.Updated_By = actor; row.AI_Index_Status = 'Pending'; return { before, after: { ...row } };
    },
    updatePitchbookStatusAtomic(id, expected, status, actor, now) {
      const row = find(pitchbookRows, 'Document_ID', id); if (!row) throw Object.assign(new Error('missing'), { code: 'PITCHBOOK_NOT_FOUND' });
      if (String(row.Updated_At) !== String(expected)) throw Object.assign(new Error('stale'), { code: 'STALE_RECORD_VERSION' });
      if (status === 'Active' && !row.File_ID) throw Object.assign(new Error('no file'), { code: 'PITCHBOOK_AUTHORITATIVE_FILE_MISSING' });
      const before = { ...row }; row.Status = status; row.Updated_At = now; row.Updated_By = actor; row.AI_Index_Status = 'Pending'; return { before, after: { ...row } };
    },
    appendRow(_id, sheet, row) { if (options.auditError) throw new Error('audit failed'); rowsFor(sheet).push({ ...row }); },
    mutateMasterAtomic(input, actor, now) {
      const rows = input.entity === 'GP' ? gpRows : optionRows;
      const key = input.entity === 'GP' ? 'GP_ID' : 'Option_ID';
      if (input.action === 'ADD') {
        const dup = ksp.kspFindNormalizedMasterDuplicate_(rows, input.entity, input.type, input.name, '');
        if (dup) {
          if (input.returnExistingOnDuplicate) return { before: { ...dup }, after: { ...dup }, existing: true };
          throw Object.assign(new Error('duplicate'), { code: 'MASTER_DUPLICATE_NAME' });
        }
        const row = input.entity === 'GP'
          ? { GP_ID: ksp.kspNextGpId_(rows), GP_Name: input.name, Status: 'Active', Updated_At: now, Updated_By: actor }
          : { Option_ID: ksp.kspNextOptionId_(rows, input.type), Type: input.type, Name: input.name, Sort_Order: rows.filter(r => r.Type === input.type).length + 1, Status: 'Active', Updated_At: now, Updated_By: actor };
        rows.push(row); return { before: null, after: { ...row } };
      }
      const row = find(rows, key, input.id); if (!row) throw Object.assign(new Error('missing'), { code: 'MASTER_NOT_FOUND' });
      const before = { ...row };
      if (input.action === 'RENAME') input.entity === 'GP' ? row.GP_Name = input.name : row.Name = input.name;
      if (input.action === 'DEACTIVATE') row.Status = 'Inactive';
      if (input.action === 'REACTIVATE') row.Status = 'Active';
      if (input.action === 'REORDER') {
        const same = rows.filter(r => r.Type === row.Type).sort((a,b)=>a.Sort_Order-b.Sort_Order);
        const without = same.filter(r => r.Option_ID !== row.Option_ID); without.splice(Math.min(input.sortOrder-1, without.length), 0, row); without.forEach((r,i)=>r.Sort_Order=i+1);
      }
      row.Updated_At = now; row.Updated_By = actor; return { before, after: { ...row } };
    },
    deleteAuditRowsBefore(_id, cutoff) { const before = audits.length; for (let i=audits.length-1;i>=0;i--) if (audits[i].Event_Timestamp < cutoff) audits.splice(i,1); return { deletedRows: before-audits.length }; },
    _debug: { meetingRows, pitchbookRows, gpRows, optionRows, documents, files, audits, claims, pitchbookWrites }
  };
  return env;
}

module.exports = { ksp, catalogRows, createFakeEnvironment };
