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
import type { AppProps } from 'next/app'
import NextHead from 'next/head'
import * as React from 'react'

const { chains, provider, webSocketProvider } = configureChains(defaultChains, [
  alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY }),
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

function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={client}>
      <NextHead>
        <title>wagmi</title>
      </NextHead>

      <Component {...pageProps} />
    </WagmiConfig>
  )
}

export default App
