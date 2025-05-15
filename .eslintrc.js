module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:jsx-a11y/recommended',
    'prettier'
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: [
    'react',
    'react-hooks',
    'import',
    'jsx-a11y',
    'prettier'
  ],
  settings: {
    react: {
      version: 'detect'
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx']
      }
    }
  },
  rules: {
    // Code Organization
    'import/order': [
      'error',
      {
        'groups': [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index'
        ],
        'newlines-between': 'always',
        'alphabetize': {
          'order': 'asc',
          'caseInsensitive': true
        }
      }
    ],
    'import/no-duplicates': 'error',
    'import/no-unresolved': 'error',
    'import/no-cycle': 'error',
    'import/no-self-import': 'error',
    'import/no-useless-path-segments': 'error',

    // React Best Practices
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/jsx-sort-props': [
      'error',
      {
        'callbacksLast': true,
        'shorthandFirst': true,
        'ignoreCase': true,
        'reservedFirst': true
      }
    ],

    // General Code Quality
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'warn',
    'no-duplicate-imports': 'error',
    'no-unused-vars': ['warn', { 
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_'
    }],
    'no-multiple-empty-lines': ['error', { 'max': 1 }],
    'prefer-const': 'warn',
    'no-var': 'error',
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'max-lines-per-file': ['warn', { 'max': 300 }],
    'max-lines': ['warn', { 'max': 500 }],
    'max-params': ['warn', { 'max': 4 }],
    'complexity': ['warn', { 'max': 10 }],

    // File Organization
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-mutable-exports': 'error',
    'import/no-named-as-default': 'error',
    'import/no-named-as-default-member': 'error',

    // Naming Conventions
    'camelcase': ['error', { 'properties': 'never' }],
    'new-cap': ['error', { 
      'newIsCap': true,
      'capIsNew': false
    }],

    // Formatting (handled by Prettier)
    'prettier/prettier': 'error'
  },
  overrides: [
    {
      // Server-specific rules
      files: ['server/**/*.js'],
      env: {
        node: true
      },
      rules: {
        'import/no-extraneous-dependencies': ['error', {
          'devDependencies': ['**/*.test.js', '**/*.spec.js']
        }]
      }
    },
    {
      // Client-specific rules
      files: ['client/src/**/*.{js,jsx}'],
      env: {
        browser: true
      },
      rules: {
        'react/jsx-filename-extension': ['error', { 
          'extensions': ['.jsx'] 
        }]
      }
    }
  ]
}; 