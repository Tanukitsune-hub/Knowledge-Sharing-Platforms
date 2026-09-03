const { validatePublicSurface } = require('./public-surface.cjs');

const result = validatePublicSurface();
console.log(`Validated Apps Script public facade: ${result.publicDeclarations.length} normal, ${result.operatorDeclarations.length} guarded operator, ${result.privateDeclarations.length} private top-level functions.`);
