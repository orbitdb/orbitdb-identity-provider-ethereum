import { verifyTypedData } from '@ethersproject/wallet'

const type = 'ethereum-eip712'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

// Length of a compressed secp256k1 public key encoded as hex (as returned by KeyStore.getPublic).
const PUBLIC_KEY_LENGTH = 66

/**
 * The EIP-712 domain used for all OrbitDB identity signatures. The values are
 * fixed so that identities can be verified from the identity alone: an
 * OrbitDB identity is not bound to a chain or a contract. chainId is omitted
 * because wallets reject typed data whose chainId differs from the active chain.
 */
export const domain = Object.freeze({
  name: 'OrbitDB Identity',
  version: '1',
  verifyingContract: ZERO_ADDRESS
})

export const types = Object.freeze({
  OrbitDBIdentity: [
    { name: 'id', type: 'address' },
    { name: 'publicKey', type: 'string' },
    { name: 'idSignature', type: 'string' }
  ]
})

const toMessage = (id, publicKey, idSignature) => ({ id, publicKey, idSignature })

// OrbitDB hands signIdentity a single string: publicKey + idSignature.
const splitData = data => {
  const publicKey = data.slice(0, PUBLIC_KEY_LENGTH)
  const idSignature = data.slice(PUBLIC_KEY_LENGTH)

  if (!/^0[23][0-9a-fA-F]{64}$/.test(publicKey) || idSignature.length === 0) {
    throw new Error('data must be a compressed public key followed by an id signature')
  }

  return { publicKey, idSignature }
}

/**
 * Verifies an identity created by the EIP-712 provider.
 * @param {module:Identity} identity
 * @return {boolean} True if the identity is valid, false otherwise.
 * @static
 */
const verifyIdentity = async identity => {
  try {
    const signerAddress = verifyTypedData(
      domain,
      types,
      toMessage(identity.id, identity.publicKey, identity.signatures.id),
      identity.signatures.publicKey
    )

    return signerAddress.toLowerCase() === identity.id.toLowerCase()
  } catch (e) {
    // Malformed ids, public keys or signatures can't be verified.
    return false
  }
}

/**
 * An identity provider that signs the OrbitDB identity as EIP-712 typed data
 * so wallets can display labeled fields rather than an opaque hex string.
 *
 * The wallet must implement getAddress() and signTypedData(domain, types,
 * value) (ethers v5's _signTypedData is also accepted).
 */
const OrbitDBIdentityProviderEthereumEIP712 = ({ wallet } = {}) => async () => {
  const getId = async (options = {}) => {
    if (!wallet) {
      throw new Error('wallet is required')
    }

    return wallet.getAddress()
  }

  const signIdentity = async (data) => {
    if (!wallet) {
      throw new Error('wallet is required')
    }

    const sign = wallet.signTypedData || wallet._signTypedData
    if (typeof sign !== 'function') {
      throw new Error('wallet must implement signTypedData')
    }

    const { publicKey, idSignature } = splitData(data)
    const id = await wallet.getAddress()

    return sign.call(wallet, domain, types, toMessage(id, publicKey, idSignature))
  }

  return {
    type,
    getId,
    signIdentity
  }
}

OrbitDBIdentityProviderEthereumEIP712.type = type
OrbitDBIdentityProviderEthereumEIP712.verifyIdentity = verifyIdentity

export default OrbitDBIdentityProviderEthereumEIP712
