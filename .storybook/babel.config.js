const config = require('../babel.config.json')

module.exports = {
  presets: [
    [
      'next/babel',
      {
        'preset-react': {},
      },
    ],
  ],
  plugins: [...config.plugins],
}
