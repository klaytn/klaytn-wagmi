import {
  SignTypedDataArgs,
  SignTypedDataResult,
  signTypedData,
} from '@klaytn/wagmi-core'
import { Optional } from '@klaytn/wagmi-core/internal'
import { TypedData } from 'abitype'
import * as React from 'react'

import { MutationConfig } from '../../types'
import { useMutation } from '../utils'

export type UseSignTypedDataArgs<TTypedData = unknown> = Optional<
  SignTypedDataArgs<TTypedData>,
  'domain' | 'types' | 'value'
>

export type UseSignTypedDataConfig<TTypedData = unknown> = MutationConfig<
  SignTypedDataResult,
  Error,
  SignTypedDataArgs<TTypedData>
> &
  UseSignTypedDataArgs<TTypedData>

function mutationKey<TTypedData = unknown>({
  domain,
  types,
  value,
}: UseSignTypedDataArgs<TTypedData>) {
  return [{ entity: 'signTypedData', domain, types, value }] as const
}

function mutationFn<TTypedData extends TypedData>(
  args: SignTypedDataArgs<TTypedData>,
) {
  const { domain, types, value } = args
  if (!domain) throw new Error('domain is required')
  if (!types) throw new Error('types is required')
  if (!value) throw new Error('value is required')
  return signTypedData({
    domain,
    types,
    value,
  } as unknown as SignTypedDataArgs<TTypedData>)
}

export function useSignTypedData<TTypedData extends TypedData>(
  {
    domain,
    types,
    value,
    onError,
    onMutate,
    onSettled,
    onSuccess,
  }: UseSignTypedDataConfig<TTypedData> = {} as any,
) {
  const {
    data,
    error,
    isError,
    isIdle,
    isLoading,
    isSuccess,
    mutate,
    mutateAsync,
    reset,
    status,
    variables,
  } = useMutation(
    mutationKey({
      domain,
      types,
      value,
    } as UseSignTypedDataArgs<TTypedData>),
    mutationFn,
    {
      onError,
      onMutate,
      onSettled,
      onSuccess,
    },
  )

  const signTypedData = React.useCallback(
    <TTypedDataMutate extends TypedData = TTypedData>(
      args?: UseSignTypedDataArgs<TTypedDataMutate>,
    ) =>
      mutate({
        domain: args?.domain ?? domain,
        types: args?.types ?? types,
        value: args?.value ?? value,
      } as unknown as SignTypedDataArgs<TTypedData>),
    [domain, types, value, mutate],
  )

  const signTypedDataAsync = React.useCallback(
    <TTypedDataMutate extends TypedData = TTypedData>(
      args?: UseSignTypedDataArgs<TTypedDataMutate>,
    ) =>
      mutateAsync({
        domain: args?.domain ?? domain,
        types: args?.types ?? types,
        value: args?.value ?? value,
      } as unknown as SignTypedDataArgs<TTypedData>),
    [domain, types, value, mutateAsync],
  )

  return {
    data,
    error,
    isError,
    isIdle,
    isLoading,
    isSuccess,
    reset,
    signTypedData,
    signTypedDataAsync,
    status,
    variables,
  }
}
