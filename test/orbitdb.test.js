import assert from 'assert'
import { rimraf } from 'rimraf'
import { createHelia, libp2pDefaults } from 'helia'
import { createOrbitDB, Identities } from '@orbitdb/core'
import OrbitDBIdentityProviderEthereum from '../src/index.js'
import createWallet from './utils/create-wallet.js'

describe('Use Ethereum Identity Provider with OrbitDB', function () {
  this.timeout(10000)

  let ipfs
  let wallet
  let provider

  beforeEach(async () => {
    const libp2pOptions = libp2pDefaults()
    ipfs = await createHelia({ libp2p: libp2pOptions })
    wallet = await createWallet()
    provider = OrbitDBIdentityProviderEthereum({ wallet })
  })

  afterEach(async () => {
    await ipfs.stop()
    await rimraf('./orbitdb')
  })

  it('should be passed using identity.provider', async () => {
    const orbitdb = await createOrbitDB({ ipfs, identity: { provider } })

    assert.strictEqual(orbitdb.identity.id, wallet.address)
  })

  it('should be passed as a preconfigured identity', async () => {
    const identities = await Identities({ ipfs })
    const identity = await identities.createIdentity({ id: 'userA', provider })
    const orbitdb = await createOrbitDB({ ipfs, identities, identity })

    assert.strictEqual(orbitdb.identity.id, wallet.address)
  })
})
