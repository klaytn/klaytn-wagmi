import {
  WagmiConfig,
  configureChains,
  createClient,
  defaultChains,
} from '@klaytn/wagmi'
import { CoinbaseWalletConnector } from '@klaytn/wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from '@klaytn/wagmi/connectors/injected'
import { KaikasWalletConnector } from '@klaytn/wagmi/connectors/kaikas'
import { MetaMaskConnector } from '@klaytn/wagmi/connectors/metaMask'
import { WalletConnectConnector } from '@klaytn/wagmi/connectors/walletConnect'
import { alchemyProvider } from '@klaytn/wagmi/providers/alchemy'
import { publicProvider } from '@klaytn/wagmi/providers/public'

import * as React from 'react'
import * as ReactDOM from 'react-dom/client'

import { App } from './App'
import reportWebVitals from './reportWebVitals'
import { Buffer } from 'buffer'

// polyfill Buffer for client
if (!window.Buffer) {
  window.Buffer = Buffer
}

const { chains, provider, webSocketProvider } = configureChains(defaultChains, [
  alchemyProvider({ apiKey: process.env.REACT_APP_ALCHEMY_API_KEY }),
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
    new KaikasWalletConnector({
      chains,
      options: {
        appName: 'wagmi',
      },
    }),
  ],
  provider,
  webSocketProvider,
})

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <WagmiConfig client={client}>
      <App />
    </WagmiConfig>
  </React.StrictMode>,
)

reportWebVitals()
