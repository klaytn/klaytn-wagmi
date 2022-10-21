import {
  WagmiConfig,
  configureChains,
  createClient,
  defaultChains,
} from '@klaytn/wagmi'
import { CoinbaseWalletConnector } from '@klaytn/wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from '@klaytn/wagmi/connectors/injected'
import { MetaMaskConnector } from '@klaytn/wagmi/connectors/metaMask'
import { WalletConnectConnector } from '@klaytn/wagmi/connectors/walletConnect'
import { alchemyProvider } from '@klaytn/wagmi/providers/alchemy'
import { publicProvider } from '@klaytn/wagmi/providers/public'
import * as React from 'react'
import * as ReactDOM from 'react-dom/client'

import { App } from './App'

const { chains, provider, webSocketProvider } = configureChains(defaultChains, [
  alchemyProvider({ apiKey: import.meta.env.VITE_ALCHEMY_API_KEY as string }),
  publicProvider(),
])

const client = createClient({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'wagmi',
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        qrcode: true,
      },
    }),
    new InjectedConnector({
      chains,
      options: {
        name: 'Injected',
        shimDisconnect: true,
      },
    }),
  ],
  provider,
  webSocketProvider,
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiConfig client={client}>
      <App />
    </WagmiConfig>
  </React.StrictMode>,
)
