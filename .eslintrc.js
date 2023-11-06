
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  env: {
    node: true
  },
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'quotes': ['error', 'single'],
    'indent': ['error', 2]
  },
  overrides: [
    {
      files: ['src/**/*.ts'],
      parserOptions: {
        project: './tsconfig.json'
      }
    }
  ]
};
