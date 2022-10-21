import { useAccount, useEnsName } from '@klaytn/wagmi'

export function Account() {
  const { address } = useAccount()
  const { data: ensNameData } = useEnsName({ address })

  return (
    <div>
      {ensNameData ?? address}
      {ensNameData ? ` (${address})` : null}
    </div>
  )
}
