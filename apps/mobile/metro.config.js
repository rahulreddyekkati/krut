const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');


const config = getDefaultConfig(projectRoot);

// Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(projectRoot, 'node_modules/expo-router/node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Required for monorepo: prevents Metro from picking up conflicting
// package versions from parent directories (especially expo-router app root)
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
