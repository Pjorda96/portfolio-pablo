import next from 'eslint-config-next';
import prettier from 'eslint-config-prettier/flat';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
const config = [
  // Next.js rules, react-hooks (including the React Compiler rules) and a
  // handful of jsx-a11y rules.
  ...next,

  // The full accessibility set, not only the few rules Next enables. Only the
  // rules: `eslint-config-next` already registers the plugin and ESLint refuses
  // to define it twice.
  {
    files: ['**/*.tsx', '**/*.jsx'],
    rules: jsxA11y.flatConfigs.recommended.rules,
  },

  ...tseslint.configs.recommended,

  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
    },
  },

  // Zod must come configured for the CSP (no `new Function` probe), see src/lib/zod.ts.
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    ignores: ['src/lib/zod.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [{ name: 'zod', message: "Import { z } from '@/lib/zod' (CSP-safe config)." }],
        },
      ],
    },
  },

  // Last, so formatting is Prettier's job and never a lint error.
  prettier,

  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      '.lighthouseci/**',
      'next-env.d.ts',
    ],
  },
];

export default config;
