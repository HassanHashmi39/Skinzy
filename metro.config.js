const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const path = require("path");

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [
  new RegExp(`^${path.resolve(__dirname, "ml")}\\/.*$`),
  new RegExp(`^${path.resolve(__dirname, "backend")}\\/.*$`),
  new RegExp(`^${path.resolve(__dirname, "venv")}\\/.*$`)
];

module.exports = withNativeWind(config, { input: "./global.css" });
