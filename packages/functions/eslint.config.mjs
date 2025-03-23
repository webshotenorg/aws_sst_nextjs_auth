import { FlatCompat } from "@eslint/eslintrc";
import globals from "globals";
import eslintConfigPrettier from "eslint-config-prettier";
import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import typeScriptESLintParser from "@typescript-eslint/parser";

const compat = new FlatCompat();

export default [
  {
    files: ["**/*.ts"],
  },
  {
    ignores: ["eslint.config.mjs", "node_modules", "**/*.d.ts", "**/*.js"],
  },
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module", // commonjsからmoduleに変更
      parserOptions: {
        project: ["./tsconfig.json"],
      },
      parser: typeScriptESLintParser,
      globals: {
        ...globals.node,
      },
    },
  },
  {
    plugins: {
      "@typescript-eslint": typescriptEslint,
    },
  },
  {
    rules: {
      // プラグインから推奨ルールを使用したい場合はここに書く
      ...typescriptEslint.configs.recommended.rules,
    },
  },
  js.configs.recommended,
  eslintConfigPrettier,
];
