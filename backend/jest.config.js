/** @type {import('jest').Config} */
export default {
  testEnvironment: "node",
  // No uses extensionsToTreatAsEsm con "type": "module"
  transform: {},   // sin transpilar, puro ESM
  verbose: true
};
