const { setConfig } = require('next/config')
const generateNextConfig = require('./next.config')

setConfig({
  publicRuntimeConfig: generateNextConfig('', {}).publicRuntimeConfig,
})
