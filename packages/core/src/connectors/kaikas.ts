import { KaikasWeb3Provider } from '@klaytn/kaikas-web3-provider'
import { providers } from 'ethers'
import { getAddress, hexValue } from 'ethers/lib/utils'

import { klaytn, klaytnBaobab } from '../chains'
import {
  ConnectorNotFoundError,
  ProviderRpcError,
  SwitchChainNotSupportedError,
  UserRejectedRequestError,
} from '../errors'
import { Chain } from '../types'
import { normalizeChainId } from '../utils'
import { Connector } from './base'

interface KaikasWalletOptions {
  appName: string
}
type Options = KaikasWalletOptions & {
  /**
   * Fallback Ethereum Chain ID
   * @default 1
   */
  chainId?: number
}

export class KaikasWalletConnector extends Connector<
  KaikasWeb3Provider,
  Options,
  providers.JsonRpcSigner
> {
  readonly id = 'kaikasWallet'
  readonly name = 'Kaikas Wallet'
  readonly ready = typeof window != 'undefined' && !!window.klaytn

  #provider?: KaikasWeb3Provider

  constructor(config: { chains?: Chain[]; options: Options }) {
    super({ chains: [klaytn, klaytnBaobab], options: config.options })
  }

  async connect({ chainId }: { chainId?: number } = {}) {
    try {
      const provider = await this.getProvider()
      if (!provider) throw new ConnectorNotFoundError()
      provider.on('accountsChanged', this.onAccountsChanged)
      provider.on('networkChanged', this.onChainChanged)
      provider.on('disconnect', this.onDisconnect)

      const accounts = await provider.enable()
      const account = getAddress(<string>accounts[0])
      let id = await this.getChainId()
      let unsupported = this.isChainUnsupported(id)

      if (chainId && id !== chainId) {
        const chain = await this.switchChain(chainId)
        id = chain.id
        unsupported = this.isChainUnsupported(id)
      }

      console.log('unsupported', unsupported)
      return {
        account,
        chain: { id, unsupported },
        provider: new providers.Web3Provider(
          //kaikasweb3provider not sufficiently overlap with ExternalProvider
          <providers.ExternalProvider>(<unknown>provider),
        ),
      }
    } catch (error) {
      if (
        /(user closed modal|accounts received is empty)/i.test(
          (<ProviderRpcError>error).message,
        )
      )
        throw new UserRejectedRequestError(error)
      throw error
    }
  }

  async disconnect() {
    if (!this.#provider) return
    const provider = await this.getProvider()
    provider.removeListener('accountsChanged', this.onAccountsChanged)
    provider.removeListener('networkChanged', this.onChainChanged)
  }

  async getAccount() {
    const provider = await this.getProvider()
    const accounts = await provider.request<string[]>({
      method: 'eth_accounts',
    })
    return getAddress(<string>accounts[0])
  }

  async getProvider() {
    if (!this.#provider) {
      this.#provider = new KaikasWeb3Provider(window.klaytn)
    }
    return this.#provider
  }

  async getChainId() {
    const provider = await this.getProvider()
    const chainId = normalizeChainId(provider.chainId)
    return chainId
  }

  async getSigner({ chainId }: { chainId?: number } = {}) {
    const [provider, account] = await Promise.all([
      this.getProvider(),
      this.getAccount(),
    ])
    return new providers.Web3Provider(
      <providers.ExternalProvider>(<unknown>provider),
      chainId,
    ).getSigner(account)
  }

  async isAuthorized() {
    try {
      const account = await this.getAccount()
      return !!account
    } catch {
      return false
    }
  }

  async switchChain(chainId: number) {
    const provider = await this.getProvider()
    const id = hexValue(chainId)
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: id }],
      })
      return (
        this.chains.find((x) => x.id === chainId) ?? {
          id: chainId,
          name: `Chain ${id}`,
          network: `${id}`,
          rpcUrls: { default: '' },
        }
      )
    } catch (error) {
      throw new SwitchChainNotSupportedError({ connector: this })
    }
  }

  async watchAsset({
    address,
    decimals = 18,
    image,
    symbol,
  }: {
    address: string
    decimals?: number
    image?: string
    symbol: string
  }) {
    const provider = await this.getProvider()
    return await provider.request<boolean>({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address,
          decimals,
          image,
          symbol,
        },
      },
    })
  }

  protected onChainChanged = (chainId: string | number) => {
    const id = normalizeChainId(chainId)
    const unsupported = this.isChainUnsupported(id)
    this.emit('change', { chain: { id, unsupported } })
  }

  protected onAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) this.emit('disconnect')
    else this.emit('change', { account: getAddress(<string>accounts[0]) })
  }

  protected onDisconnect = () => {
    this.emit('disconnect')
  }
}
