import assert from 'assert'
import path from 'path'
import { rimraf } from 'rimraf'
import { verifyTypedData } from '@ethersproject/wallet'
import { KeyStore, Identities, useIdentityProvider } from '@orbitdb/core'
import OrbitDBIdentityProviderEthereumEIP712, { domain, types } from '../src/eip712.js'
import { OrbitDBIdentityProviderEthereumEIP712 as namedExport } from '../src/index.js'
import createWallet from './utils/create-wallet.js'

const keypath = path.resolve('./test/keys-eip712')

describe('Ethereum EIP-712 Identity Provider', function () {
  let keystore
  let identities
  let provider
  let wallet

  before(async () => {
    await rimraf(keypath)
    useIdentityProvider(OrbitDBIdentityProviderEthereumEIP712)
    keystore = await KeyStore({ path: keypath })
    identities = await Identities({ keystore })
    wallet = await createWallet()
    provider = OrbitDBIdentityProviderEthereumEIP712({ wallet })
  })

  after(async () => {
    await keystore.close()
    await rimraf(keypath)
  })

  it('is exported from the package entry point', () => {
    assert.strictEqual(namedExport, OrbitDBIdentityProviderEthereumEIP712)
  })

  it('uses the zero address verifyingContract and no chainId', () => {
    assert.strictEqual(domain.chainId, undefined)
    assert.strictEqual(domain.verifyingContract, '0x0000000000000000000000000000000000000000')
  })

  describe('create an identity', () => {
    let identity

    before(async () => {
      identity = await identities.createIdentity({ provider, keystore })
    })

    it('has the ethereum-eip712 type and the wallet address as id', () => {
      assert.strictEqual(identity.type, 'ethereum-eip712')
      assert.strictEqual(identity.id, wallet.address)
    })

    it('signs typed data over the id, public key and id signature', () => {
      const signer = verifyTypedData(
        domain,
        types,
        { id: identity.id, publicKey: identity.publicKey, idSignature: identity.signatures.id },
        identity.signatures.publicKey
      )
      assert.strictEqual(signer, wallet.address)
    })

    it('verifies', async () => {
      assert.strictEqual(await identities.verifyIdentity(identity), true)
    })
  })

  describe('verification failures', () => {
    let identity

    const clone = overrides => ({
      id: identity.id,
      publicKey: identity.publicKey,
      signatures: identity.signatures,
      type: identity.type,
      sign: identities.sign,
      verify: identities.verify,
      ...overrides
    })

    before(async () => {
      identity = await identities.createIdentity({ provider, keystore })
    })

    it('rejects an invalid id', async () => {
      assert.strictEqual(await identities.verifyIdentity(clone({ id: 'NotAnId' })), false)
    })

    it('rejects an id belonging to another wallet', async () => {
      const other = await createWallet()
      assert.strictEqual(await identities.verifyIdentity(clone({ id: other.address })), false)
    })

    it('rejects a tampered id signature', async () => {
      const signatures = { ...identity.signatures, id: identity.signatures.id.replace(/.$/, c => c === '0' ? '1' : '0') }
      assert.strictEqual(await identities.verifyIdentity(clone({ signatures })), false)
    })

    it('rejects a legacy personal_sign signature', async () => {
      const publicKey = await wallet.signMessage(identity.publicKey + identity.signatures.id)
      const signatures = { ...identity.signatures, publicKey }
      assert.strictEqual(await identities.verifyIdentity(clone({ signatures })), false)
    })
  })

  describe('wallet handling', () => {
    it('requires a wallet', async () => {
      await assert.rejects(() => identities.createIdentity({ provider: OrbitDBIdentityProviderEthereumEIP712(), keystore }), /wallet is required/)
    })

    it('requires signTypedData', async () => {
      const w = { getAddress: () => wallet.address }
      await assert.rejects(() => identities.createIdentity({ provider: OrbitDBIdentityProviderEthereumEIP712({ wallet: w }), keystore }), /signTypedData/)
    })

    it('accepts a wallet with signTypedData instead of _signTypedData', async () => {
      const w = {
        getAddress: () => wallet.address,
        signTypedData: (d, t, v) => wallet._signTypedData(d, t, v)
      }
      const identity = await identities.createIdentity({ provider: OrbitDBIdentityProviderEthereumEIP712({ wallet: w }), keystore })
      assert.strictEqual(await identities.verifyIdentity(identity), true)
    })
  })
})
