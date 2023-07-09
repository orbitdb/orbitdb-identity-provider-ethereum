import { Wallet, verifyMessage } from '@ethersproject/wallet'

const type = 'ethereum'

/**
 * Verifies an identity using the identity's id.
 * @param {module:Identity} identity
 * @return {boolean} True if the identity is valid, false otherwise.
 * @static
 */
const verifyIdentity = identity => {
  // Verify that identity was signed by the id
  const signerAddress = verifyMessage(
    identity.publicKey + identity.signatures.id,
    identity.signatures.publicKey
  )

  return (signerAddress === identity.id)
}

const OrbitDBIdentityProviderEthereum = ({ wallet }) => {
  // Returns the signer's id
  const getId = async (options = {}) => {
    if (!wallet) {
      wallet = await _createWallet(options)
    }
    return wallet.getAddress()
  }

  // Returns a signature of pubkeysignature
  const signIdentity = async (data) => {
    if (!wallet) {
      throw new Error('wallet is required')
    }

    return wallet.signMessage(data)
  }

  const _createWallet = async (options = {}) => {
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

  return {
    getId,
    signIdentity
  }
}

export { OrbitDBIdentityProviderEthereum as default, verifyIdentity, type }
