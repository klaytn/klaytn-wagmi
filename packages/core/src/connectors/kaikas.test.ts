import { describe, expect, it } from 'vitest'

import { defaultChains } from '../constants'
import { KaikasWalletConnector } from './kaikas'

describe('KaikasWalletConnector', () => {
  it('inits', () => {
    const connector = new KaikasWalletConnector({
      chains: defaultChains,
      options: {
        appName: 'wagmi',
      },
    })
    expect(connector.name).toEqual('Kaikas Wallet')
  })
})
