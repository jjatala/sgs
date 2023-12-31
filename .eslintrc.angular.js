/**
 * Rules reference: https://github.com/angular-eslint/angular-eslint
 */
module.exports = {
  rules: {
    '@angular-eslint/directive-selector': [
      'error',
      { type: 'attribute', prefix: 'app', style: 'camelCase' },
    ],
    '@angular-eslint/component-selector': [
      'error',
      { type: 'element', prefix: 'app', style: 'kebab-case' },
    ],
    '@angular-eslint/no-pipe-impure': 'off',
    '@angular-eslint/contextual-lifecycle': 'error',
    '@angular-eslint/use-lifecycle-interface': 'error',
    '@angular-eslint/use-injectable-provided-in': 'error',
    '@angular-eslint/prefer-on-push-component-change-detection': 'warn', // TODO: refactor sources and switch to error
    '@angular-eslint/no-output-native': 'error',
    '@angular-eslint/no-lifecycle-call': 'error',
    '@angular-eslint/no-conflicting-lifecycle': 'error',
    '@angular-eslint/no-forward-ref': 'off',
    '@angular-eslint/no-input-prefix': 'error',
    '@angular-eslint/no-output-on-prefix': 'error',
    '@angular-eslint/no-output-rename': 'error',
    '@angular-eslint/prefer-output-readonly': 'error',
    '@angular-eslint/relative-url-prefix': 'off',
    '@angular-eslint/use-component-selector': 'error',
    '@angular-eslint/use-component-view-encapsulation': 'error',
    //'@angular-eslint/use-pipe-decorator': 'error',
    '@angular-eslint/use-pipe-transform-interface': 'error',
    '@angular-eslint/component-class-suffix': [
      'error',
      { suffixes: ['Component', 'Page', 'Modal'] },
    ],
    '@angular-eslint/directive-class-suffix': [
      'error',
      { suffixes: ['Directive', 'ViewAdapter'] },
    ],
    '@angular-eslint/no-host-metadata-property': 'error',
    '@angular-eslint/no-inputs-metadata-property': 'error',
    '@angular-eslint/no-outputs-metadata-property': 'error',
    '@angular-eslint/no-queries-metadata-property': 'error',
  },

  overrides: [
    {
      files: '**/*.spec.ts',
      rules: {
        '@angular-eslint/no-lifecycle-call': 'off',
        '@angular-eslint/prefer-on-push-component-change-detection': 'off',
      },
    },
    {
      files: '**/*.mock.ts',
      rules: {
        '@angular-eslint/use-injectable-provided-in': 'off',
        '@angular-eslint/prefer-on-push-component-change-detection': 'off',
      },
    },
    {
      files: ['**/hammerjs-gesture.config.ts', '**/*.store.ts'],
      rules: {
        '@angular-eslint/use-injectable-provided-in': 'off',
      },
    },
    {
      files: '**/test.util.ts',
      rules: {
        '@angular-eslint/use-component-selector': 'off',
      },
    },
    {
      files: ['**/*.html'],
      excludedFiles: ['*inline-template-*.component.html'],
      extends: [
        'plugin:prettier/recommended',
        'plugin:@angular-eslint/template/recommended',
      ],
      rules: {},
    },
  ],
};
