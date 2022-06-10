module.exports = {
  extends: ['stylelint-config-recommended', 'stylelint-config-prettier'],
  plugins: ['stylelint-scss'],
  rules: {
    'at-rule-no-unknown': null,
    'max-nesting-depth': 3,
    'color-no-invalid-hex': true,
    'value-no-vendor-prefix': true,
    'at-rule-no-vendor-prefix': true,
    'number-leading-zero': 'always',
    'unit-case': 'lower',
    'declaration-colon-space-before': 'never',
    'declaration-colon-space-after': 'always',
    'media-feature-name-no-vendor-prefix': true,
    'declaration-property-value-allowed-list': {
      '/color$/': ['/^\\$|initial|inherit|transparent|currentColor|darken|lighten|rgba|#/'],
      fill: ['/^\\$|initial|inherit|transparent|currentColor|darken|lighten|rgba|#/'],
      stroke: ['/^\\$|initial|inherit|transparent|currentColor|darken|lighten|rgba|#/'],
    },
    'string-quotes': 'double',
    'scss/at-rule-no-unknown': true,
    'scss/media-feature-value-dollar-variable': 'always',
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global'],
      },
    ],
  },
}
