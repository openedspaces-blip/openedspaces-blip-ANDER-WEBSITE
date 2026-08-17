// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
    rules: {
      // Async content and session hydration intentionally synchronize local state.
      "react-hooks/set-state-in-effect": "off",
    },
  }
]);
