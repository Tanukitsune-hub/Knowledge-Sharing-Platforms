const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'src','ClientThemeSettings.html'),'utf8');
const script=source.slice(source.indexOf('<script>')+8,source.lastIndexOf('themeSettingsState=themeSettingsBootstrap();'));
const context=vm.createContext({});
vm.runInContext(script,context,{filename:'ClientThemeSettings.html'});
const plain=value=>JSON.parse(JSON.stringify(value));

test('HEX and HSV conversions round-trip all 16 theme defaults and representative colors',()=>{
  const registry=JSON.parse(fs.readFileSync(path.join(root,'docs','design','theme-palette-tokens.json'),'utf8'));
  for(const hex of [...registry.user_adjustable_tokens.map(item=>item.hex),'#000000','#FFFFFF','#FF0000','#00FF00','#0000FF','#808080','#123456']){
    const hsv=plain(context.themeColorHexToHsv(hex));
    assert.equal(context.themeColorHsvToHex(hsv.hue,hsv.saturation,hsv.value),hex,hex);
  }
});

test('HEX parsing accepts lowercase only in complete #RRGGBB format',()=>{
  assert.equal(context.themeSettingsHex('#a1b2c3'),'#A1B2C3');
  for(const invalid of ['#12345','#1234567','123456','#GG0000','red',''])assert.equal(context.themeSettingsHex(invalid),'');
  assert.deepEqual(plain(context.themeSettingsChannels('#A1B2C3')),[161,178,195]);
});

test('HSV picker corners and hue positions yield deterministic HEX',()=>{
  assert.equal(context.themeColorHsvToHex(0,1,1),'#FF0000');
  assert.equal(context.themeColorHsvToHex(120,1,1),'#00FF00');
  assert.equal(context.themeColorHsvToHex(240,1,1),'#0000FF');
  assert.equal(context.themeColorHsvToHex(0,0,1),'#FFFFFF');
  assert.equal(context.themeColorHsvToHex(180,1,0),'#000000');
});
