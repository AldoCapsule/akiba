const { getDefaultConfig } = require('expo/metro-config');
const { mergeConfig } = require('metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch monorepo root for shared packages
config.watchFolders = [monorepoRoot];

// Block React 19 from being bundled — admin app uses React 19 (Next.js),
// mobile app uses React 18. Without this, Metro picks up both copies.
config.resolver.blockList = [
  /node_modules[\/\\]\.pnpm[\/\\]react@19\./,
  /node_modules[\/\\]\.pnpm[\/\\]react-dom@19\./,
];

module.exports = config;
