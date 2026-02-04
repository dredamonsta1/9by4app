import js from "@eslint/js";
import globals from "globals";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

// globals package has keys with trailing whitespace — strip them
const trimGlobals = (obj) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [k.trim(), v]));

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.{js,jsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...trimGlobals(globals.browser),
        ...trimGlobals(globals.es2017),
        process: "readonly",
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "no-unused-vars": "warn",
      "no-case-declarations": "warn",
    },
  },
  {
    files: ["src/test/**/*.{js,jsx}", "src/**/*.test.{js,jsx}"],
    languageOptions: {
      globals: {
        ...trimGlobals(globals.node),
        global: "writable",
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        vi: "readonly",
      },
    },
  },
  {
    files: ["src/setupProxy.js"],
    languageOptions: {
      globals: {
        ...trimGlobals(globals.node),
        require: "readonly",
        module: "writable",
      },
      sourceType: "commonjs",
    },
  },
  {
    ignores: ["dist/", "node_modules/"],
  },
];
