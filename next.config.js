/* eslint-disable import/no-extraneous-dependencies */

const { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } = require('next/constants')
const {
  rules,
  sassOptions,
  iconsPath,
  addCacheLoaderToScss,
  addSassVariables,
  withBundleAnalyzer,
} = require('./webpack.config')

const getBuildConfig = (phase, ...args) => {
  const withPlugins = require('next-compose-plugins')

  const nextConfig = {
    poweredByHeader: false,
    sassOptions,
    webpack: webpackConfig => {
      webpackConfig.module.rules.push(...rules, {
        test: /\.(jpg|jpeg|png|gif|webp)$/,
        exclude: iconsPath,
        use: [
          {
            loader: 'responsive-loader',
            options: {
              adapter: require('responsive-loader/sharp'),
              esModule: false,
              publicPath: '/_next/static/assets', // https://git.io/JUW07
              outputPath: 'static/assets',
            },
          },
        ],
      })

      /** This adds custom environment variables to sass-loader */
      addSassVariables(webpackConfig)

      if (phase === PHASE_DEVELOPMENT_SERVER) {
        /**
         * This adds a cache-loader to the SCSS rules, making SCSS builds much
         * faster on subsequent builds when running dev server.
         */
        addCacheLoaderToScss(webpackConfig)

        // Uncomment to show how long assets did build and how large they are
        // webpackConfig.plugins.push(new ProfilingPlugin())
      }

      return webpackConfig
    },
  }

  return withPlugins([withBundleAnalyzer(phase === PHASE_PRODUCTION_BUILD)], nextConfig)(phase, ...args)
}

module.exports = (phase, ...rest) => {
  const shouldAddBuildConfig = phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_BUILD
  const config = shouldAddBuildConfig ? getBuildConfig(phase, ...rest) : {}

  const webpack = config.webpack
  config.webpack = (webpackConfig, ...args) => {
    const { APP_TENANT_CODE } = process.env
    if (APP_TENANT_CODE) {
      const prevExtensions = webpackConfig.resolve.extensions
      const newExtensions = ['mjs', 'js', 'ts', 'tsx', 'json', 'jsx']
        .map(ext => `.${APP_TENANT_CODE}.${ext}`)
        .filter(ext => !ext.includes('undefined'))
        .concat(prevExtensions)
      webpackConfig.resolve.extensions = newExtensions
    }
    const result = webpack(webpackConfig, ...args)
    // Uncomment to print out webpack webpackConfig
    // const util = require('util')
    // console.log('------------------------------------------------------')
    // console.log(util.inspect(result, false, null, true /* enable colors */))
    return result
  }

  return {
    ...config,
    async headers() {
      return [
        {
          source: '/(.*)?', // Matches all pages
          headers: [
            {
              key: 'X-Frame-Options',
              value: 'deny',
            },
            {
              key: 'Content-Security-Policy',
              value: "frame-ancestors 'self';",
            },
            {
              key: 'Cache-Control',
              value: 'no-store, max-age=0',
            },
            {
              key: 'Pragma',
              value: 'no-cache',
            },
            {
              key: 'Referrer-Policy',
              value: 'strict-origin-when-cross-origin',
            },
          ],
        },
      ]
    },
    publicRuntimeConfig: {
      ...config.publicRuntimeConfig,
      googleMapKey: process.env.GOOGLE_MAPS_WEB_API_KEY,
      documentationKey: process.env.KNOWLEDGE_BASE_API_KEY_ENCRYPTED,
      publicApiUrl: process.env.API_GATEWAY_URL,
      adminApiUrl: process.env.ADMIN_API_GATEWAY_URL,
      storageAccountUrl: process.env.STORAGE_ACCOUNT_URL,
      launchDarklySdkKey: process.env.LAUNCH_DARKLY_SDK_KEY,
      launchDarklyEmail: process.env.LAUNCH_DARKLY_USER_EMAIL,
      launchDarklyName: process.env.LAUNCH_DARKLY_USER_NAME,
      launchDarklyClientId: process.env.LAUNCH_DARKLY_CLIENT_ID,
      isDevelopment: phase === PHASE_DEVELOPMENT_SERVER,
      tenantId: process.env.APP_TENANT_CODE,
    },
  }
}
