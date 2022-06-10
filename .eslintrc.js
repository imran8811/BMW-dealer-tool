const path = require('path')

const plugins = [
  '@babel',
  'deprecation',
  'import',
  // 'jest',
  // 'jest-dom',
  'json',
  'jsx-a11y',
  'promise',
  'react',
  'react-hooks',
  'security',
  'unicorn',
  'prettier',
]

const extendedConfigs = [
  'eslint:recommended',
  'plugin:unicorn/recommended',
  'plugin:react/recommended',
  'plugin:json/recommended',
  'plugin:promise/recommended',
  // 'plugin:jest/recommended',
  // 'plugin:jest/style',
  'plugin:import/errors',
  'plugin:import/warnings',
]

const prettierConfig = ['prettier', 'prettier/react', 'prettier/unicorn', 'plugin:prettier/recommended']

const rules = {
  indent: ['warn', 2, { ignoredNodes: ['TemplateLiteral'] }],
  semi: ['warn', 'never'],
  'linebreak-style': ['error', 'unix'],
  'no-tabs': 'off',
  'eol-last': ['warn', 'always'],
  'no-trailing-spaces': 'warn',
  'arrow-parens': ['warn', 'as-needed'],
  'operator-linebreak': 'off', // prettier
  'react/jsx-indent': 'off', // prettier
  '@typescript-eslint/indent': 'off', // prettier
  'comma-dangle': 'off', // prettier
  'no-underscore-dangle': 'off', // prettier
  'react/button-has-type': 'off',
  quotes: [
    'warn',
    'single',
    {
      allowTemplateLiterals: false,
      avoidEscape: true,
    },
  ],
  'no-void': ['warn', { allowAsStatement: true }],
  'array-bracket-spacing': ['warn', 'never'],
  'object-curly-spacing': ['warn', 'always'],
  'max-len': ['warn', { code: 120 }],
  'no-shadow': 'warn',
  'no-console': 'warn',
  'implicit-arrow-linebreak': 'off',
  'unicorn/filename-case': 'off',
  'unicorn/prevent-abbreviations': 'off',
  'unicorn/no-null': 'off',
  'unicorn/no-fn-reference-in-iterator': 'off',
  'react/jsx-props-no-spreading': 'off',
  'react/jsx-no-literals': ['warn', { ignoreProps: true }],
  'react/prop-types': 'off',
  'react/jsx-filename-extension': [1, { extensions: ['.jsx', '.tsx'] }],
  'import/extensions': ['error', 'never', { scss: 'always' }],
  'react/jsx-one-expression-per-line': 'off',
  'react/react-in-jsx-scope': 'off',
  'react/state-in-constructor': 'off',
  'unicorn/no-reduce': 'off',
  'class-methods-use-this': 'off',
  'object-curly-newline': [
    'error',
    {
      ObjectExpression: { multiline: true, consistent: true },
      ObjectPattern: { multiline: true, consistent: true },
      ImportDeclaration: { multiline: true, consistent: true },
      ExportDeclaration: { multiline: true, consistent: true },
    },
  ],
  'import/no-extraneous-dependencies': [
    'error',
    {
      devDependencies: ['**/*.stories.*', '**/*.test.*'],
    },
  ],
  'jsx-a11y/anchor-is-valid': 'off', // NextJS <Link>
  'consistent-return': 'off',
  'unicorn/no-useless-undefined': 'off',
  'unicorn/consistent-function-scoping': 'off',
  'global-require': 'off',
  'react/require-default-props': 'off',
  'react/no-unused-prop-types': 'off',
  'unicorn/no-array-callback-reference': 'off',
  'unicorn/prefer-array-some': 'off',
  'unicorn/no-array-reduce': 'off',
  'unicorn/no-abusive-eslint-disable': 'off',
}

module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
  plugins,
  extends: [...extendedConfigs, ...prettierConfig],
  ignorePatterns: ['**/vendor/**/*', '**/*.gen.ts'],
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    // jest: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx'],
      },
      typescript: {
        project: path.resolve(__dirname, 'tsconfig.json'),
        extensions: ['.ts', '.tsx'],
      },
    },
    'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
  },
  overrides: [
    {
      files: ['**/*.js'],
      rules: {
        'template-curly-spacing': 'off', // https://git.io/Jkcwi
      },
    },
    {
      files: ['**/*.ts?(x)'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
        project: path.resolve(__dirname, 'tsconfig.json'),
        ecmaFeatures: {
          jsx: true,
        },
        warnOnUnsupportedTypeScriptVersion: true,
      },
      plugins: [...plugins, '@typescript-eslint'],
      extends: [
        ...extendedConfigs,
        'airbnb-typescript',
        'airbnb/hooks',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:import/typescript',
        ...prettierConfig,
        'prettier/@typescript-eslint',
      ],
      rules: {
        ...rules,
        indent: 'off',
        // '@typescript-eslint/indent': rules['indent'],
        'no-shadow': 'off', // https://github.com/typescript-eslint/typescript-eslint/issues/2471#issuecomment-685828962
        '@typescript-eslint/no-shadow': rules['no-shadow'],
        '@typescript-eslint/semi': rules['semi'],
        '@typescript-eslint/consistent-type-assertions': 'warn',
        '@typescript-eslint/no-array-constructor': 'warn',
        '@typescript-eslint/unbound-method': ['warn', { ignoreStatic: true }],
        '@typescript-eslint/no-use-before-define': [
          'warn', // https://github.com/typescript-eslint/typescript-eslint/issues/1856
          {
            functions: false,
            classes: false,
            variables: false,
            typedefs: false,
          },
        ],
        'deprecation/deprecation': 'warn',
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
  rules,
}
