import { verifyMessage } from '@ethersproject/wallet'

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

const OrbitDBIdentityProviderEthereum = ({ wallet } = {}) => {
  // Returns the signer's id
  const getId = async (options = {}) => {
    return wallet.getAddress()
  }

  // Returns a signature of pubkeysignature
  const signIdentity = async (data) => {
    if (!wallet) {
      throw new Error('wallet is required')
    }

    return wallet.signMessage(data)
  }

  return {
    getId,
    signIdentity
  }
}

export { OrbitDBIdentityProviderEthereum as default, verifyIdentity, type }
