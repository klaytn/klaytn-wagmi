import { getNetwork, watchNetwork } from '@klaytn/wagmi-core'

import { useSyncExternalStoreWithTracked } from '../utils'

export function useNetwork() {
  return useSyncExternalStoreWithTracked(watchNetwork, getNetwork)
}
