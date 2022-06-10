#!/usr/bin/env node
/**
 * So next.config.js doesn't allow async functions, but we need to read
 * runtime config variables from Key Vault.
 *
 * So instead we will read them and then start next.js server in  custom script.
 *
 */
const path = require('path')
const { default: startServer } = require('next/dist/server/lib/start-server')
const { OtozKeyVault } = require('@otoz/common')

// Make sure commands gracefully respect termination signals (e.g. from Docker)
process.on('SIGTERM', () => process.exit(0))
process.on('SIGINT', () => process.exit(0))

const KEY_VAULT_SERVICE = 'dealer-tool'

const readEnv = (key, missing = undefined) => {
  const value = process.env[key] || ''
  if (value.trim() === '') {
    if (missing !== undefined) {
      return missing
    }
    throw new Error(`Missing '${key}' env variable.`)
  }
  return value
}

const makeKeyVault = () => {
  const token = readEnv('KEY_VAULT_TOKEN', '')

  if (token) {
    const kv = new OtozKeyVault('', '')
    kv.token = token
    return kv
  }

  return new OtozKeyVault(readEnv('KEY_VAULT_URL'), readEnv('KEY_VAULT_NAME'), KEY_VAULT_SERVICE)
}

async function main() {
  const port = process.env.PORT || 3000
  const dir = path.resolve(__dirname, '..')
  const hostname = '0.0.0.0'
  // load keys from key vault
  const keyVault = makeKeyVault()
  await keyVault.readAndSetEnvVariables(readEnv('KEY_VAULT_KEYS'))
  console.log('KEY  VAULT DONE')

  // start the app
  const app = await startServer({ dir }, port, hostname)
  console.log(`started server on http://${hostname}:${port}`)
  await app.prepare()
}

main().catch(error => console.error(error))
