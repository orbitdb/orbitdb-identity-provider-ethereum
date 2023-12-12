import assert from 'assert'
import { rimraf } from 'rimraf'
import { createOrbitDB, Identities } from '@orbitdb/core'
import OrbitDBIdentityProviderEthereum from '../src/index.js'
import createWallet from './utils/create-wallet.js'
import * as IPFS from 'ipfs-core'

describe('Use Ethereum Identity Provider with OrbitDB', function () {
  let ipfs
  let wallet
  let provider

  beforeEach(async () => {
    ipfs = await IPFS.create({})
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

  it('should be passed as an preconfigured identity', async () => {
    const identities = await Identities({ ipfs })
    const identity = await identities.createIdentity({ id: 'userA', provider })
    const orbitdb = await createOrbitDB({ ipfs, identities, identity })

    assert.strictEqual(orbitdb.identity.id, wallet.address)
  })
})
