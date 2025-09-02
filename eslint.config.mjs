import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const config = [
  // Next.js 推奨（FlatCompat経由）
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  // ESLint/TS 推奨
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // 無視
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'dist/**',
      'coverage/**',
      'public/**',
      'src/components/ui/**',
    ],
  },

  // next-env.d.ts は Next が自動生成するため triple-slash を許容
  {
    files: ['next-env.d.ts'],
    rules: {
      '@typescript-eslint/triple-slash-reference': 'off',
    },
  },

  // 共通ルール
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    settings: {
      // importプラグインは next の設定で読み込まれる想定
      // TypeScript のパス解決（必要なら project を指定）
      'import/resolver': {
        typescript: {
          // project: "./tsconfig.json",
          alwaysTryTypes: true,
        },
        node: true,
      },
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
        // 型情報を使う厳格なルールを増やす場合に有効化
        // project: "./tsconfig.json",
      },
    },
    rules: {
      // ---- 並び替え ----
      'simple-import-sort/imports': [
        'warn',
        {
          groups: [
            [
              '^node:',
              `^(${[
                'assert',
                'buffer',
                'child_process',
                'cluster',
                'console',
                'constants',
                'crypto',
                'dgram',
                'dns',
                'domain',
                'events',
                'fs',
                'http',
                'http2',
                'https',
                'inspector',
                'module',
                'net',
                'os',
                'path',
                'perf_hooks',
                'process',
                'punycode',
                'querystring',
                'readline',
                'repl',
                'stream',
                'string_decoder',
                'sys',
                'timers',
                'tls',
                'tty',
                'url',
                'util',
                'v8',
                'vm',
                'zlib',
              ].join('|')})(/|$)`,
            ],
            ['^react$', '^@?\\w'],
            ['^(@|~|src)(/.*|$)'],
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            ['^\\.(?!/?$)', '^\\./?$'],
            ['^type\\s'],
            ['^.+\\.s?css$', '^.+\\.(png|jpe?g|gif|svg|webp|avif)$'],
          ],
        },
      ],
      'simple-import-sort/exports': 'warn',

      // ---- import まわり（next経由の import プラグインが有効）----
      'import/first': 'warn',
      'import/no-duplicates': 'warn',
      'import/newline-after-import': ['warn', { count: 1 }],
      'import/no-useless-path-segments': ['warn', { noUselessIndex: true }],

      // ---- 未使用検出 ----
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      // ---- 型 import 方針 ----
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', disallowTypeAnnotations: false },
      ],

      // ---- 補助 ----
      'sort-imports': [
        'warn',
        { ignoreDeclarationSort: true, ignoreCase: true },
      ],
      'prefer-const': ['warn', { destructuring: 'all' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
];

export default config;
