/**
 * ESLint flat config.
 *
 * - `@eslint/js` recommended rules for plain JavaScript (the Node scripts).
 * - `typescript-eslint` type-aware rules for the application source.
 * - `react-hooks` rules, which catch stale closures and conditional hooks —
 *   the most common source of real bugs in React code.
 */
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'public'] },

  // Node scripts (build tooling) — plain JavaScript modules.
  {
    files: ['scripts/**/*.mjs', 'eslint.config.js'],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
  },

  // Application source and Vite config — TypeScript with type information.
  {
    files: ['src/**/*.{ts,tsx}', 'vite.config.ts'],
    extends: [js.configs.recommended, ...tseslint.configs.strictTypeChecked],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Template literals with numbers are idiomatic for CSS values and labels.
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
    },
  },

  // Tests index into fixtures they just built; `!` is clearer there than guards.
  {
    files: ['src/**/*.test.ts'],
    rules: { '@typescript-eslint/no-non-null-assertion': 'off' },
  },
);
