const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadMaintenance() {
  const context = vm.createContext({
    console, JSON, Object, Array, String, Number, Boolean, Date, Math, RegExp,
    Error, TypeError, Set, Map, Intl
  });
  const bootstrap = `
var KSP_STATUS=Object.freeze({ACTIVE:'Active',INACTIVE:'Inactive'});
var KSP_PITCHBOOK_STATUS=Object.freeze({PENDING:'Pending',ACTIVE:'Active',FAILED:'Failed',INACTIVE:'Inactive'});
var KSP_AI_INDEX_STATUS=Object.freeze({NOT_INDEXED:'NotIndexed',PENDING:'Pending',INDEXED:'Indexed',FAILED:'Failed'});
var KSP_AUDIT_RESULTS=Object.freeze({SUCCESS:'Success',FAILURE:'Failure'});
var KSP_SHEET_NAMES=Object.freeze({GP_MASTER:'GP_Master',OPTION_MASTER:'Option_Master',MEETING_INDEX:'Meeting_Index',PITCHBOOK_INDEX:'Pitchbook_Index',AUDIT_LOG:'Audit_Log'});
var KSP_RESOURCE_KEYS=Object.freeze({BACKEND_SPREADSHEET:'backendSpreadsheetId',AUDIT_SPREADSHEET:'auditSpreadsheetId'});
var KSP_OPTION_TYPES=Object.freeze({LOCATION:'LOCATION',ASSET_CLASS:'ASSET_CLASS',CAPITAL_TYPE:'CAPITAL_TYPE',TEAM:'TEAM'});
var KSP_DEFAULTS=Object.freeze({LOCK_TIMEOUT_MS:30000});
function kspDeepClone_(value){return value===undefined?undefined:JSON.parse(JSON.stringify(value));}
function kspAssert_(condition,code,message){if(!condition){var error=new Error(message);error.code=code;throw error;}}
function kspGetErrorCode_(error,fallback){return error&&error.code?String(error.code):(fallback||'UNEXPECTED_ERROR');}
function kspUniqueStrings_(values){var seen={};return values.filter(function(value){var key=String(value);if(seen[key])return false;seen[key]=true;return true;});}
function kspSafeParseJson_(text,label){if(text===null||text===undefined||text==='')return null;try{return JSON.parse(text);}catch(error){throw new Error((label||'JSON')+' is not valid JSON: '+error.message);}}
function kspIsValidDateKey_(value){var match=/^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(String(value||''));if(!match)return false;var year=Number(match[1]),month=Number(match[2]),day=Number(match[3]);var date=new Date(Date.UTC(year,month-1,day));return date.getUTCFullYear()===year&&date.getUTCMonth()===month-1&&date.getUTCDate()===day;}
function kspIsValidTimeValue_(value){return /^(?:[01]\\d|2[0-3]):[0-5]\\d$/.test(String(value||''));}
function kspNormalizeGeneratedNameSegment_(value){if(value===null||value===undefined)return '';return String(value).replace(/[\\u0000-\\u001f\\u007f]/g,'').replace(/[\\\\/&]/g,'').trim().replace(/\\s+/g,'_').replace(/_+/g,'_').replace(/^_+|_+$/g,'');}
function kspNormalizeMeetingInput_(input){var s=input&&typeof input==='object'?input:{};function t(v){return v==null?'':String(v).trim();}return{date:t(s.date),time:t(s.time),locationId:t(s.locationId),gpId:t(s.gpId),assetClassId:t(s.assetClassId),capitalTypeId:t(s.capitalTypeId),counterparty:t(s.counterparty),internalParticipants:t(s.internalParticipants),notes:s.notes==null?'':String(s.notes).replace(/\\r\\n?/g,'\\n').replace(/\\u0000/g,''),retryMeetingId:t(s.retryMeetingId),retryFingerprint:t(s.retryFingerprint)};}
function kspParseMeetingId_(value){var m=/^MTG-(\\d{6})$/.exec(String(value||''));kspAssert_(m&&Number(m[1])>0,'MEETING_ID_INVALID','Meeting ID is invalid.');return Number(m[1]);}
function kspRequireCatalogItem_(items,id,code,message){var found=(items||[]).filter(function(item){return String(item.id)===String(id);})[0];kspAssert_(found,code,message);return found;}
function kspBuildMeetingCatalog_(gpRows,optionRows){var gps=(gpRows||[]).filter(r=>String(r.Status)==='Active').map(r=>({id:String(r.GP_ID),name:String(r.GP_Name)})).filter(r=>r.id&&r.name).sort((a,b)=>a.name.toLowerCase().localeCompare(b.name.toLowerCase(),'en'));var opts=(optionRows||[]).filter(r=>String(r.Status)==='Active').map(r=>({id:String(r.Option_ID),type:String(r.Type),name:String(r.Name),sortOrder:Number(r.Sort_Order)||0}));function byType(type){return opts.filter(r=>r.type===type).sort((a,b)=>a.sortOrder-b.sortOrder||a.name.localeCompare(b.name,'ja')).map(r=>({id:r.id,name:r.name,sortOrder:r.sortOrder}));}return{gps,assetClasses:byType('ASSET_CLASS'),capitalTypes:byType('CAPITAL_TYPE'),locations:byType('LOCATION'),teams:byType('TEAM')};}
function kspBuildMeetingBootstrapResponse_(catalog){return{options:kspDeepClone_(catalog)};}
function kspGetBackendSchemas_(){return{
  GP_Master:['GP_ID','GP_Name','Status','Created_At','Updated_At','Created_By','Updated_By'],
  Option_Master:['Option_ID','Type','Name','Sort_Order','Status','Created_At','Updated_At','Created_By','Updated_By'],
  Meeting_Index:['Meeting_ID','Date','Time','Location_ID','GP_ID','Asset_Class_ID','Capital_Type_ID','Counterparty','Internal_Participants','Doc_File_ID','Doc_URL','Saved_Filename','Status','Version','Created_At','Updated_At','Created_By','Updated_By','AI_Document_Name','AI_Index_Status','AI_Indexed_At','AI_Content_Hash','AI_Last_Error','Team_ID','Fund_Strategy','Meeting_Type_Codes','Related_Pitchbook_IDs','Follow_Up_Required','Follow_Up_Note'],
  Pitchbook_Index:['Document_ID','Batch_ID','Date','GP_ID','Asset_Class_ID','Capital_Type_ID','Sequence_No','File_ID','File_URL','Original_Filename','Saved_Filename','Status','Created_At','Updated_At','Created_By','Updated_By','AI_Document_Name','AI_Index_Status','AI_Indexed_At','AI_Content_Hash','AI_Last_Error','Fund_Strategy'],
  Settings:['Key','Value','Description','Updated_At']};}
function kspGetAuditSchema_(){return{Audit_Log:['Event_Timestamp','Actor','Action','Target_Type','Target_ID','Result','Changed_Fields','Before_Metadata_JSON','After_Metadata_JSON','Batch_ID','Error_Code','Error_Message','Search_Mode','Question_Or_Instruction','Date_From','Date_To','GP_Filter','Asset_Class_Filter','Capital_Type_Filter','Source_Type_Filter','Model_ID','Cited_Source_IDs']};}
function kspValidateMeetingInput_(input,catalog){kspAssert_(input.date,'MEETING_DATE_REQUIRED','date');kspAssert_(input.gpId,'MEETING_GP_REQUIRED','gp');kspAssert_(input.assetClassId,'MEETING_ASSET_CLASS_REQUIRED','ac');kspAssert_(kspIsValidDateKey_(input.date),'MEETING_DATE_INVALID','date');kspAssert_(!input.time||kspIsValidTimeValue_(input.time),'MEETING_TIME_INVALID','time');return{gp:kspRequireCatalogItem_(catalog.gps,input.gpId,'GP','gp'),assetClass:kspRequireCatalogItem_(catalog.assetClasses,input.assetClassId,'AC','ac'),capitalType:input.capitalTypeId?kspRequireCatalogItem_(catalog.capitalTypes,input.capitalTypeId,'CT','ct'):null,location:input.locationId?kspRequireCatalogItem_(catalog.locations,input.locationId,'LOC','loc'):null};}
function kspBuildMeetingFilename_(input,selected,id){var parts=[input.date,selected.gp.name,selected.assetClass.name];if(selected.capitalType)parts.push(selected.capitalType.name);parts.push(id);return parts.map(kspNormalizeGeneratedNameSegment_).join('_');}
function kspBuildMeetingDocumentText_(input,selected){var lines=['日付: '+input.date];if(input.time)lines.push('時間: '+input.time);if(selected.location)lines.push('面談場所: '+selected.location.name);lines.push('GP: '+selected.gp.name);lines.push('Asset Class: '+selected.assetClass.name);if(selected.capitalType)lines.push('Equity / Debt: '+selected.capitalType.name);if(input.counterparty)lines.push('面談相手: '+input.counterparty);if(input.internalParticipants)lines.push('当社側: '+input.internalParticipants);if(input.notes.trim()){lines.push('');lines.push('面談内容:');lines.push(input.notes);}return lines.join('\\n');}
`;
  new vm.Script(bootstrap, { filename: 'base-stubs.js' }).runInContext(context);
  for (const file of ['61_PitchbookValidation.gs', '62_PitchbookIdentity.gs', '00_Core.gs', '100_MaintenanceCore.gs', '110_MaintenanceMeetingService.gs', '111_MaintenancePitchbookMasterService.gs', '112_MaintenanceServiceHelpers.gs']) {
    new vm.Script(fs.readFileSync(path.join(__dirname, '..', 'src', file), 'utf8'), { filename: file }).runInContext(context);
  }
  return context;
}

const ksp = loadMaintenance();
module.exports = { ksp };
