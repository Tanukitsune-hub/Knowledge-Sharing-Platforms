const { validatePublicSurface } = require('./public-surface.cjs');

const result = validatePublicSurface();
console.log(`Validated Apps Script public facade: ${result.publicDeclarations.length} public, ${result.privateDeclarations.length} private top-level functions.`);
