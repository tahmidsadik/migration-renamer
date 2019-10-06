module.exports = {
  extends: ['airbnb-base', 'prettier'],
  plugins: ['prettier', 'jest'],
  rules: {
    'func-names': 0,
    'global-require': 0,
    'import/no-dynamic-require': 0,
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_'
      }
    ],
    'no-restricted-syntax': [
      'error',
      {
        selector: 'LabeledStatement',
        message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.'
      },
      {
        selector: 'WithStatement',
        message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.'
      }
    ],
    'no-plusplus': 0,
    'no-underscore-dangle': 0,
    'no-param-reassign': 0,
    'no-loop-func': 0,
    'no-use-before-define': 1,
    'consistent-return': 1,
    curly: ['error', 'all'],
    'prefer-destructuring': 0
  },
  env: {
    'jest/globals': true
  }
};
