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

function loadAi() {
  const context = vm.createContext({
    console, JSON, Object, Array, String, Number, Boolean, Date, Math, RegExp, Error, TypeError,
    Set, Map, Intl, encodeURIComponent, Utilities: { formatDate: formatDateInTimeZone }
  });
  const stub = `
    var KSP_AI_INDEX_STATUS={NOT_INDEXED:'NotIndexed',PENDING:'Pending',INDEXED:'Indexed',FAILED:'Failed'};
    var KSP_STATUS={ACTIVE:'Active',INACTIVE:'Inactive'};
    var KSP_AUDIT_RESULTS={SUCCESS:'Success',FAILURE:'Failure'};
    var KSP_SHEET_NAMES={MEETING_INDEX:'Meeting_Index',PITCHBOOK_INDEX:'Pitchbook_Index',GP_MASTER:'GP_Master',OPTION_MASTER:'Option_Master',SETTINGS:'Settings',AUDIT_LOG:'Audit_Log'};
    var KSP_RESOURCE_KEYS={BACKEND_SPREADSHEET:'backendSpreadsheetId',AUDIT_SPREADSHEET:'auditSpreadsheetId'};
    var KSP_DEFAULTS={LOCK_TIMEOUT_MS:30000};
    function kspDeepClone_(v){return v===undefined?undefined:JSON.parse(JSON.stringify(v));}
    function kspAssert_(c,code,m){if(!c){var e=new Error(m);e.code=code;throw e;}}
    function kspGetErrorCode_(e,f){return e&&e.code?String(e.code):(f||'UNEXPECTED_ERROR');}
    function kspUniqueStrings_(values){var seen={};return (values||[]).filter(function(v){v=String(v);if(seen[v])return false;seen[v]=true;return true;});}
    function kspToBoolean_(v,d){if(v===true||v===false)return v;if(v==='true'||v===1||v==='1')return true;if(v==='false'||v===0||v==='0')return false;return d;}
    function kspBuildMeetingCatalog_(gps,options){
      function mapOptions(type){return (options||[]).filter(function(r){return r.Status==='Active'&&r.Type===type;}).sort(function(a,b){return (+a.Sort_Order||0)-(+b.Sort_Order||0);}).map(function(r){return{id:String(r.Option_ID),name:String(r.Name),sortOrder:+r.Sort_Order||0};});}
      return {gps:(gps||[]).filter(function(r){return r.Status==='Active';}).map(function(r){return{id:String(r.GP_ID),name:String(r.GP_Name)};}),assetClasses:mapOptions('ASSET_CLASS'),capitalTypes:mapOptions('CAPITAL_TYPE'),locations:mapOptions('LOCATION')};
    }
    function kspRequireCatalogItem_(items,id,code,message){var found=(items||[]).find(function(x){return String(x.id)===String(id);});kspAssert_(found,code,message);return found;}
  `;
  new vm.Script(stub, { filename: 'base-stub.gs' }).runInContext(context);
  const root = path.resolve(__dirname, '..');
  for (const file of [
    '00_Core.gs','05_TemporalContracts.gs','30_MeetingCore.gs','130_AiConstants.gs','131_AiFileSearchContracts.gs','132_AiKnowledgeContracts.gs','133_AiRetryContracts.gs','161_GeminiRestClient.gs','163_OpenAiRestClient.gs','164_AiProviderCore.gs',
    '140_AiSourceModels.gs','141_AiSyncHelpers.gs','142_AiSyncWorker.gs',
    '150_KnowledgeSearchModels.gs','151_KnowledgeSearchService.gs',
    '180_FeatureFreezeFormats.gs','181_FeatureFreezeSync.gs','182_FeatureFreezeKnowledge.gs','190_FeatureFreezeDiagnostics.gs','170_AiEntryPoints.gs'
  ]) {
    new vm.Script(fs.readFileSync(path.join(root,'src',file),'utf8'), { filename:file }).runInContext(context);
  }
  return context;
}
module.exports = { loadAi };
