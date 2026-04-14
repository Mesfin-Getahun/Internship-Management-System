const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/dist/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  // Use a relative path for input so nativewind's cache keys don't include absolute Windows paths
  input: './global.css',
});
