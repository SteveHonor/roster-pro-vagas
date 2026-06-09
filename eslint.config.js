import pluginVue from 'eslint-plugin-vue'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'public/**', '.vite/**']
  },
  ...pluginVue.configs['flat/recommended'],
  prettier,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-reserved-component-names': 'off',
      'vue/no-unused-vars': 'error',
      'vue/component-definition-name-casing': ['error', 'PascalCase'],
      'no-console': 'warn',
      'no-unused-vars': ['error', {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
      'no-undef': 'error'
    }
  },
  {
    files: ['src/sw.js'],
    languageOptions: {
      globals: globals.serviceworker
    }
  }
]
