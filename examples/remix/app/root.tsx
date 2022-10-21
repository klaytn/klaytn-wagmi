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
import { useMemo } from 'react'
import type { MetaFunction } from 'remix'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from 'remix'

export function loader() {
  require('dotenv').config()
  return {
    alchemyApiKey: process.env.REMIX_ALCHEMY_API_KEY as string,
  }
}

export const meta: MetaFunction = () => {
  return { title: 'wagmi' }
}

export default function App() {
  const { alchemyApiKey } = useLoaderData()

  const client = useMemo(() => {
    const { chains, provider, webSocketProvider } = configureChains(
      defaultChains,
      [alchemyProvider({ apiKey: alchemyApiKey }), publicProvider()],
    )

    return createClient({
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
  }, [alchemyApiKey])

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <script> var global = global || window; </script>
      </head>
      <body>
        <WagmiConfig client={client}>
          <Outlet />
        </WagmiConfig>
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === 'development' && <LiveReload />}
      </body>
    </html>
  )
}
