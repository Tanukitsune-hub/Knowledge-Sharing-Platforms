const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function formatDateInTimeZone(value, timezone, pattern) {
  const parts = new Intl.DateTimeFormat('en-CA', pattern === 'HH:mm' ? {
    timeZone: timezone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  } : {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(value);
  const byType = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return pattern === 'HH:mm' ? `${byType.hour}:${byType.minute}` : `${byType.year}-${byType.month}-${byType.day}`;
}

function loadMaintenance() {
  const context = vm.createContext({
    console, JSON, Object, Array, String, Number, Boolean, Date, Math, RegExp,
    Error, TypeError, Set, Map, Intl,
    Utilities: { formatDate: formatDateInTimeZone }
  });
  const bootstrap = `
var KSP_STATUS=Object.freeze({ACTIVE:'Active',INACTIVE:'Inactive'});
var KSP_PITCHBOOK_STATUS=Object.freeze({PENDING:'Pending',ACTIVE:'Active',FAILED:'Failed',INACTIVE:'Inactive'});
var KSP_AI_INDEX_STATUS=Object.freeze({NOT_INDEXED:'NotIndexed',PENDING:'Pending',INDEXED:'Indexed',FAILED:'Failed'});
var KSP_AUDIT_RESULTS=Object.freeze({SUCCESS:'Success',FAILURE:'Failure'});
var KSP_SHEET_NAMES=Object.freeze({GP_MASTER:'GP_Master',OPTION_MASTER:'Option_Master',MEETING_INDEX:'Meeting_Index',PITCHBOOK_INDEX:'Pitchbook_Index',AUDIT_LOG:'Audit_Log'});
var KSP_RESOURCE_KEYS=Object.freeze({BACKEND_SPREADSHEET:'backendSpreadsheetId',AUDIT_SPREADSHEET:'auditSpreadsheetId'});
var KSP_OPTION_TYPES=Object.freeze({LOCATION:'LOCATION',ASSET_CLASS:'ASSET_CLASS',CAPITAL_TYPE:'CAPITAL_TYPE',TEAM:'TEAM'});
var KSP_DEFAULTS=Object.freeze({LOCK_TIMEOUT_MS:30000,TIMEZONE:'Asia/Tokyo'});
function kspDeepClone_(value){return value===undefined?undefined:JSON.parse(JSON.stringify(value));}
function kspAssert_(condition,code,message){if(!condition){var error=new Error(message);error.code=code;throw error;}}
function kspGetErrorCode_(error,fallback){return error&&error.code?String(error.code):(fallback||'UNEXPECTED_ERROR');}
function kspUniqueStrings_(values){var seen={};return values.filter(function(value){var key=String(value);if(seen[key])return false;seen[key]=true;return true;});}
function kspSafeParseJson_(text,label){if(text===null||text===undefined||text==='')return null;try{return JSON.parse(text);}catch(error){throw new Error((label||'JSON')+' is not valid JSON: '+error.message);}}
function kspNormalizeGeneratedNameSegment_(value){if(value===null||value===undefined)return '';return String(value).replace(/[\\u0000-\\u001f\\u007f]/g,'').replace(/[\\\\/&]/g,'').trim().replace(/\\s+/g,'_').replace(/_+/g,'_').replace(/^_+|_+$/g,'');}
function kspGetAuditSchema_(){return{Audit_Log:['Event_Timestamp','Actor','Action','Target_Type','Target_ID','Result','Changed_Fields','Before_Metadata_JSON','After_Metadata_JSON','Batch_ID','Error_Code','Error_Message','Search_Mode','Question_Or_Instruction','Date_From','Date_To','GP_Filter','Asset_Class_Filter','Capital_Type_Filter','Source_Type_Filter','Model_ID','Cited_Source_IDs']};}
`;
  new vm.Script(bootstrap, { filename: 'base-stubs.js' }).runInContext(context);
  for (const file of ['00_Core.gs', '05_TemporalContracts.gs', '61_PitchbookValidation.gs', '62_PitchbookIdentity.gs', '30_MeetingCore.gs', '100_MaintenanceCore.gs', '110_MaintenanceMeetingService.gs', '111_MaintenancePitchbookMasterService.gs', '112_MaintenanceServiceHelpers.gs', '125_GpWorkspaceService.gs']) {
    new vm.Script(fs.readFileSync(path.join(__dirname, '..', 'src', file), 'utf8'), { filename: file }).runInContext(context);
  }
  return context;
}

const ksp = loadMaintenance();
module.exports = { ksp };
