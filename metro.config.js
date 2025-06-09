const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});

// Habilitar conditional exports para resolver problemas com @google/genai
config.resolver.unstable_enablePackageExports = true;

module.exports = config; 