const path = require('path')
const { rules, sassOptions } = require('../webpack.config.js')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

const sassLoaderConfig = {
  loader: 'sass-loader',
  options: {
    sassOptions,
    sourceMap: true,
  },
}

module.exports = {
  webpackFinal: async config => {
    config.module.rules.push(
      {
        test: /\.scss$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          sassLoaderConfig,
        ],
        exclude: /\.module\.scss$/,
      },
      {
        test: /\.module\.scss$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: {
                localIdentName: '[local]__[name]_[hash:base64:6]',
              },
              sourceMap: true,
            },
          },
          sassLoaderConfig,
        ],
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        issuer: {
          test: /\.s?css$/,
        },
        loader: 'url-loader',
      },
      {
        test: /\.(jpg|jpeg|png|gif|webp)$/,
        use: [
          {
            loader: 'responsive-loader',
            options: {
              adapter: require('responsive-loader/sharp'),
            },
          },
        ],
      },
      ...rules,
    )

    config.resolve.plugins = [
      new TsconfigPathsPlugin({
        configFile: path.resolve(__dirname, '../tsconfig.json'),
      }),
    ]

    // https://github.com/storybookjs/storybook/issues/6188
    const fileLoaderRule = config.module.rules.find(rule => !Array.isArray(rule.test) && rule.test.test('.svg'))
    fileLoaderRule.exclude = /\.(jpg|jpeg|png|gif|webp|svg)$/

    return config
  },
  stories: ['./**/*.stories.mdx', '../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  typescript: {
    check: false,
    checkOptions: {},
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: prop => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
}
