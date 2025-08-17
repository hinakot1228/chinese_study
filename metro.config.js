// metro.config.js  （← package.json と同じ階層に置く）
const { getDefaultConfig } = require("expo/metro-config");
const config = getDefaultConfig(__dirname);

// CSV をアセットとして扱う
config.resolver.assetExts = [...config.resolver.assetExts, "csv"];

// 念のため、sourceExts に入っていたら除外
config.resolver.sourceExts = (config.resolver.sourceExts || []).filter(
  (ext) => ext !== "csv"
);

module.exports = config;
