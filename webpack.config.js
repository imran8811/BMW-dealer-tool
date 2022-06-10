/* eslint-disable no-console, import/no-extraneous-dependencies */
const path = require('path')

const iconsPath = path.join(process.cwd(), 'src', 'components', 'Icon', 'assets')
const rootPath = path.resolve(__dirname)
const sassOptions = {
  includePaths: [path.join(process.cwd(), 'src', 'common', 'styles', process.env.APP_TENANT_CODE || 'fair')],
}

const getSvgrLoader = options => ({
  test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
  issuer: {
    test: /\.(t|j)sx?$/,
  },
  use: [
    {
      loader: 'cache-loader',
      options: {
        cacheDirectory: path.resolve(__dirname, '.cache'),
      },
    },
    {
      loader: '@svgr/webpack',
      options,
    },
  ],
})

const rules = [
  {
    ...getSvgrLoader({ icon: true }),
    include: iconsPath,
  },
  {
    ...getSvgrLoader(),
    exclude: iconsPath,
  },
]

function ProfilingPlugin() {
  return {
    apply: compiler => {
      compiler.hooks.compilation.tap('otoz-profiling', compilation => {
        console.log('got compilation')
        const start = new Date().now()
        compilation.hooks.buildModule.tap('otoz-profiling', module => {
          // const now = new Date().now()
          // const when = `${now - start}ms`
          module.buildStart = new Date().now()
        })

        compilation.hooks.succeedModule.tap('otoz-profiling', module => {
          const now = new Date().now()
          const total = now - module.buildStart
          const when = `${now - start}ms`
          const size = ((module._source || {})._value || '').length / 1024
          console.log(`${when.padEnd(10)} [${total}ms] [${size.toFixed(2)}KB] ${module.userRequest}`)
        })

        compilation.hooks.afterHash.tap('otoz-profiling', () => {
          const total = new Date().now() - start
          console.log(`hashing compilation. took ${total} ms`)
        })
      })
      compiler.hooks.done.tap('otoz-profiling', () => {
        console.log('compiler done')
      })
    },
  }
}

/**
 * This function adds a cache-loader to SCSS rules in webpack config. It will result
 * in much faster subsequent build times. But it's kinda hacky and if the default next.js
 * config changes you may have to update it.
 *
 * It will also not be needed anymore when next.js migrates to webpack 5.
 */
const addCacheLoaderToScss = webpackConfig => {
  webpackConfig.module.rules[1].oneOf.forEach(rule => {
    if (Array.isArray(rule.use)) {
      const sassLoader = rule.use.find(({ loader }) => loader.includes('sass-loader'))
      if (sassLoader != null) {
        sassLoader.options.sourceMap = false

        // cache-loader needs to be inserted between style-loader and css-loader
        const ind = rule.use.findIndex(({ loader }) => loader.includes('css-loader'))
        if (ind != -1) {
          rule.use.splice(ind, 0, {
            loader: 'cache-loader',
            options: { cacheDirectory: path.resolve(rootPath, '.cache') },
          })
        }
      }
    }
  })
}

/** adding global sass variables */
const addSassVariables = webpackConfig => {
  webpackConfig.module.rules[1].oneOf.forEach(rule => {
    if (Array.isArray(rule.use)) {
      const sassLoader = rule.use.find(({ loader }) => loader.includes('sass-loader'))
      if (sassLoader != null) {
        sassLoader.options.additionalData = '$NODE_ENV: ' + process.env.NODE_ENV + ';'
      }
    }
  })
}

/**
 * Customized @next/bundle-analyzer
 */
const withBundleAnalyzer = enabled => (nextConfig = {}) =>
  Object.assign({}, nextConfig, {
    webpack(config, options) {
      if (enabled) {
        const reportFile = `${options.isServer ? '../' : './'}../public/.well-known/next_webpack_bundle_statistics/${
          options.isServer ? 'server' : 'client'
        }`
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            defaultSizes: 'gzip',
            generateStatsFile: true,
            openAnalyzer: false,
            statsFilename: `${reportFile}.json`,
            reportFilename: `${reportFile}.html`,
          }),
        )
      }

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options)
      }
      return config
    },
  })

module.exports = {
  sassOptions,
  rules,
  iconsPath,
  rootPath,
  ProfilingPlugin,
  addCacheLoaderToScss,
  addSassVariables,
  withBundleAnalyzer,
}
