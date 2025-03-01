module.exports = {
  extends: ['expo', 'prettier', 'plugin:drizzle/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: ['prettier', 'drizzle'],
  rules: {
    'prettier/prettier': 'error',
    'drizzle/enforce-delete-with-where': 'error',
    'drizzle/enforce-update-with-where': 'error',
  },
}
