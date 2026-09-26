const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {loadAi}=require('./ai-test-loader.cjs');

function liveCommitFixture(failAt){
  const ksp=loadAi();
  const settings={AI_MODEL_POLICY_JSON:'',OPENAI_DEFAULT_MODEL:'gpt-old',OPENAI_ENABLED:'false'};
  const properties=new Map();
  let writes=0;
  ksp.PropertiesService={getScriptProperties:()=>({
    getProperty:key=>properties.get(key)||'',
    setProperty(key,value){properties.set(key,value)},
    deleteProperty:key=>properties.delete(key)
  })};
  ksp.kspCreateMaintenanceEnvironment_=()=>({
    getInstallationState:()=>({resources:{backendSpreadsheetId:'synthetic-backend'}}),
    acquireScriptLock:()=>({}),releaseScriptLock:()=>{},
    nowIso:()=> '2026-09-26T00:00:00.000Z'
  });
  ksp.kspReadSettingsMapLive_=()=>settings;
  ksp.kspWriteSettingLive_=(_backend,key,value)=>{
    writes+=1;
    if(writes===failAt)throw Error('synthetic write interruption');
    settings[key]=value;
  };
  new vm.Script(fs.readFileSync(path.join(__dirname,'../src/160_AiEnvironment.gs'),'utf8'),
    {filename:'160_AiEnvironment.gs'}).runInContext(ksp);
  const env=ksp.kspCreateAiEnvironment_();
  const generation='a'.repeat(32);
  const policy={schemaVersion:1,updatedAt:'2026-09-26T00:00:00.000Z',
    lastOperationId:'synthetic-operation-000073',
    lastOperationProfileId:'openai-model-synthetic',profiles:[{
      profileId:'openai-model-synthetic',provider:'OPENAI',modelId:'gpt-new',displayName:'gpt-new',family:'gpt-new',
      enabled:true,userVisible:true,isProviderDefault:true,apiAccess:'AVAILABLE',qualification:'QUALIFIED',
      fileSearch:true,thinkingProfiles:[{thinkingProfileId:'provider-default',label:'Default',
        providerDefault:true,enabled:true,qualification:'QUALIFIED'}],
      defaultThinkingProfileId:'provider-default',qualifiedCredentialGeneration:generation,
      qualifiedTupleFingerprint:'f'.repeat(64)
    }]};
  const request={provider:'OPENAI',operationId:'synthetic-operation-000073',expectedPolicyJson:'',
    expectedCredentialGeneration:'legacy',nextCredentialGeneration:generation,
    candidateKey:'synthetic-secret',modelId:'gpt-new',policy};
  return {env,settings,properties,request,getWrites:()=>writes};
}

test('candidate key is adopted only after model policy and scalar model write succeed',()=>{
  const fixture=liveCommitFixture();
  fixture.env.commitAiModelSetup(fixture.request);
  assert.equal(fixture.settings.OPENAI_DEFAULT_MODEL,'gpt-new');
  assert.equal(fixture.env.getAiCredentialGeneration('OPENAI'),'a'.repeat(32));
  assert.equal(fixture.properties.size,1);
  assert.equal(fixture.getWrites(),2);
  assert.equal(fixture.env.getAiSetupOperation('synthetic-operation-000073',true,'OPENAI').status,'SAVED');
});

test('credential removal requires stopped provider and clears active and legacy slots',()=>{
  const fixture=liveCommitFixture();
  fixture.env.commitAiModelSetup(fixture.request);
  fixture.properties.set('KSP_OPENAI_API_KEY','legacy-synthetic-secret');
  fixture.settings.OPENAI_ENABLED='true';
  assert.throws(()=>fixture.env.removeAiCredential('OPENAI'),error=>error.code==='AI_SETUP_STOP_REQUIRED');
  assert.equal(fixture.properties.size,2);
  fixture.settings.OPENAI_ENABLED='false';
  assert.equal(fixture.env.removeAiCredential('OPENAI'),true);
  assert.equal(fixture.properties.size,0);
  assert.equal(fixture.env.getAiCredentialGeneration('OPENAI'),'legacy');
});

test('interrupted scalar write restores old model/policy and never adopts candidate key',()=>{
  const fixture=liveCommitFixture(2);
  assert.throws(()=>fixture.env.commitAiModelSetup(fixture.request),error=>error.code==='AI_SETUP_WRITE_FAILED');
  assert.equal(fixture.settings.OPENAI_DEFAULT_MODEL,'gpt-old');
  assert.equal(fixture.settings.AI_MODEL_POLICY_JSON,'');
  assert.equal(fixture.properties.size,0);
  assert.equal(fixture.env.getAiCredentialGeneration('OPENAI'),'legacy');
});

test('stale credential generation rejects the old operation before any write',()=>{
  const fixture=liveCommitFixture();
  fixture.request.expectedCredentialGeneration='old-generation';
  assert.throws(()=>fixture.env.commitAiModelSetup(fixture.request),error=>error.code==='AI_SETUP_STALE');
  assert.equal(fixture.getWrites(),0);
  assert.equal(fixture.properties.size,0);
});

test('nondefault expert save persists policy without changing scalar default',()=>{
  const fixture=liveCommitFixture();
  fixture.request.makeDefault=false;
  fixture.request.candidateKey='';
  fixture.request.nextCredentialGeneration='legacy';
  fixture.env.commitAiModelSetup(fixture.request);
  assert.equal(fixture.settings.OPENAI_DEFAULT_MODEL,'gpt-old');
  assert.equal(fixture.getWrites(),1);
  assert.equal(fixture.properties.size,0);
});
