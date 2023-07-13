import { Wallet } from '@ethersproject/wallet'

export default async (options = {}) => {
  if (options.mnemonicOpts) {
    if (!options.mnemonicOpts.mnemonic) {
      throw new Error('mnemonic is required')
    }

    const { mnemonic, path, wordlist } = options.mnemonicOpts
    return Wallet.fromMnemonic(mnemonic, path, wordlist)
  }

  if (options.encryptedJsonOpts) {
    if (!options.encryptedJsonOpts.json) {
      throw new Error('encrypted json is required')
    }

    if (!options.encryptedJsonOpts.password) {
      throw new Error('password for encrypted json is required')
    }

    const { json, password, progressCallback } = options.encryptedJsonOpts
    return Wallet.fromEncryptedJson(json, password, progressCallback)
  }

  return Wallet.createRandom()
}
