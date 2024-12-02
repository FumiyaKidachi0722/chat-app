module.exports = {
  root: true,
  extends: [
    'next',
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
  ],
  plugins: ['@typescript-eslint', 'prettier', 'import'],
  rules: {
    'prettier/prettier': ['error'],
    'import/order': [
      'error',
      {
        groups: [
          ['builtin', 'external'],
          ['internal'],
          ['parent', 'sibling', 'index'],
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    semi: ['error', 'always'],
    'react/react-in-jsx-scope': 'off',
    '@next/next/no-duplicate-head': 'off',
    'react/prop-types': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: ['.next/', '.yarn/', 'node_modules/'],
};
