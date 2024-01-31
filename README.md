# OrbitDB Ethereum Identity Provider

<p align="left">
  <img src="https://github.com/orbitdb/orbitdb/blob/main/images/orbit_db_logo_color.png" width="256" />
</p>

[![Matrix](https://img.shields.io/matrix/orbit-db:matrix.org?label=chat%20on%20matrix)](https://app.element.io/#/room/#orbit-db:matrix.org) [![npm (scoped)](https://img.shields.io/npm/v/%40orbitdb/identity-provider-ethereum)](https://www.npmjs.com/package/%40orbitdb/identity-provider-ethereum) [![node-current (scoped)](https://img.shields.io/node/v/%40orbitdb/identity-provider-ethereum)](https://www.npmjs.com/package/@orbitdb/identity-provider-ethereum)

Create and sign OrbitDB identities using an Ethereum wallet.

## Install

This project uses [npm](http://npmjs.com/) and [nodejs](https://nodejs.org/).

```sh
npm i @orbitdb/identity-provider-ethereum
```

## Usage

Start by registering the OrbitDBIdentityProviderEthereum identity provider with [useIdentityProvider](https://api.orbitdb.org/module-Identities.html#.useIdentityProvider).

Once registered, you can simply pass in the identity provider when creating an OrbitDB instance:

```js
import { createOrbitDB, useIdentityProvider } from '@orbitdb/core'
import * as OrbitDBIdentityProviderEthereum from '@orbitdb/identity-provider-ethereum'
import { Wallet } from '@ethersproject/wallet'

const wallet = Wallet.createRandom()

useIdentityProvider(OrbitDBIdentityProviderEthereum)
const provider = OrbitDBIdentityProviderEthereum({ wallet })
await createOrbitDB({ ipfs, identity: { provider } })
```

If you require a more custom approach to managing identities, you can create an identity by passing the identity provider to [createIdentity](https://api.orbitdb.org/module-Identities-Identities.html#createIdentity) then use the resulting identity with OrbitDB:

```js
import { createHelia, libp2pDefaults } from 'helia'
import { createOrbitDB, Identities, useIdentityProvider } from '@orbitdb/core'
import * as OrbitDBIdentityProviderEthereum from '@orbitdb/identity-provider-ethereum'

const libp2pOptions = libp2pDefaults()
const ipfs = await createHelia({ libp2p: libp2pOptions })

useIdentityProvider(OrbitDBIdentityProviderEthereum)
const provider = OrbitDBIdentityProviderEthereum({ wallet })

const identities = await Identities({ ipfs })
const identity = await identities.createIdentity({ id: 'userA', provider })

await createOrbitDB({ ipfs, identities, identity })
```

## Contributing

**Take a look at our organization-wide [Contributing Guide](https://github.com/orbitdb/welcome/blob/master/contributing.md).** You'll find most of your questions answered there. Some questions may be answered in the [FAQ](FAQ.md), as well.

If you want to code but don't know where to start, check out the issues labelled ["help wanted"](https://github.com/orbitdb/orbitdb/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22+sort%3Areactions-%2B1-desc).

## License

[MIT](LICENSE) Haja Networks Oy, OrbitDB Community