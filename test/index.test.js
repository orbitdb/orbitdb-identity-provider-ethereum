import assert from 'assert'
import path from 'path'
import rmrf from 'rimraf'
import { KeyStore, Identities, addIdentityProvider } from 'orbit-db'
import * as EthereumIdentityProvider from '../src/index.js'
import createWallet from './utils/create-wallet.js'

const keypath = path.resolve('./test/keys')
let keystore
let identities
let wallet

const type = EthereumIdentityProvider.type
describe('Ethereum Identity Provider', function () {
  before(async () => {
    rmrf.sync(keypath)
    addIdentityProvider(EthereumIdentityProvider)
    keystore = await KeyStore({ path: keypath })
    identities = await Identities({ keystore })
    wallet = await createWallet()
  })

  after(async () => {
    await keystore.close()
    rmrf.sync(keypath)
  })

  describe('create an ethereum identity', () => {
    let identity

    before(async () => {
      identity = await identities.createIdentity({ type, keystore, wallet })
    })

    it('has the correct id', async () => {
      assert.strictEqual(identity.id, wallet.address)
    })

    it('created a key for id in keystore', async () => {
      const key = await keystore.getKey(wallet.address)
      assert.notStrictEqual(key, undefined)
    })

    it('has the correct public key', async () => {
      const signingKey = await keystore.getKey(wallet.address)
      assert.notStrictEqual(signingKey, undefined)
      assert.strictEqual(identity.publicKey, keystore.getPublic(signingKey))
    })

    /*
    it('has a signature for the id', async () => {
      const signingKey = await keystore.getKey(wallet.address)
      const idSignature = await keystore.sign(signingKey, wallet.address)
      const verifies = await KeyStore.verify(idSignature, Buffer.from(signingKey.public.marshal()).toString('hex'), wallet.address)
      assert.strictEqual(verifies, true)
      assert.strictEqual(identity.signatures.id, idSignature)
    })
    */

    /*
    it('has a signature for the publicKey', async () => {
      const signingKey = await keystore.getKey(wallet.address)
      const idSignature = await keystore.sign(signingKey, wallet.address)
      const publicKeyAndIdSignature = await wallet.signMessage(identity.publicKey + idSignature)
      assert.strictEqual(identity.signatures.publicKey, publicKeyAndIdSignature)
    })
    */
  })

  describe('verify identity', () => {
    let identity

    before(async () => {
      identity = await identities.createIdentity({ keystore, type, wallet })
    })

    it('ethereum identity verifies', async () => {
      const verified = await identities.verifyIdentity(identity)
      assert.strictEqual(verified, true)
    })

    /*
    it('ethereum identity with incorrect id does not verify', async () => {
      const identity2 = new Identity('NotAnId', identity.publicKey, identity.signatures.id, identity.signatures.publicKey, identity.type, identity.provider)
      const verified = await Identities.verifyIdentity(identity2)
      assert.strictEqual(verified, false)
    })
    */
  })

  describe('sign data with an identity', () => {
    // let identity
    // const data = 'hello friend'

    before(async () => {
      // identity = await identities.createIdentity({ keystore, type, wallet })
    })

    /*
    it('sign data', async () => {
      const signingKey = await keystore.getKey(identity.id)
      const expectedSignature = await keystore.sign(signingKey, data)
      const signature = await identity.sign(identity, data, keystore)
      assert.strictEqual(signature, expectedSignature)
    })
    */

    /*
    it('throws an error if private key is not found from keystore', async () => {
      // Remove the key from the keystore (we're using a mock storage in these tests)
      const modifiedIdentity = new Identity('this id does not exist', identity.publicKey, '<sig>', identity.signatures, identity.type, identity.provider)
      let signature
      let err
      try {
        signature = await identity.provider.sign(modifiedIdentity, data, keystore)
      } catch (e) {
        err = e.toString()
      }
      assert.strictEqual(signature, undefined)
      assert.strictEqual(err, 'Error: Private signing key not found from KeyStore')
    })
    */

    describe('verify data signed by an identity', () => {
      const data = 'hello friend'
      let identity
      let signature

      before(async () => {
        identity = await identities.createIdentity({ type, keystore, wallet })
        signature = await identity.sign(identity, data, keystore)
      })

      it('verifies that the signature is valid', async () => {
        const verified = await identity.verify(signature, identity.publicKey, data)
        assert.strictEqual(verified, true)
      })

      it('verifies that the signature is invalid', async () => {
        const verified = await identity.verify('invalid', identity.publicKey, data)
        assert.strictEqual(verified, false)
      })
    })
  })
})
