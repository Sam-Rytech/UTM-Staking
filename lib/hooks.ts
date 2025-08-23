'use client'

import { useEffect, useState } from 'react'
import { getBalance, getStakingInfo } from './contract'

// Add ethereum property to the Window interface
declare global {
  interface Window {
    ethereum?: any
  }
}

export function useBalance() {
  const [balance, setBalance] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBalance() {
      if (!window.ethereum) return
      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      if (accounts.length > 0) {
        const b = await getBalance(accounts[0])
        setBalance(b)
      }
    }
    fetchBalance()
  }, [])

  return balance
}

export function useStaking() {
  const [staked, setStaked] = useState<string | null>(null)
  const [rewards, setRewards] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStaking() {
      if (!window.ethereum) return
      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      if (accounts.length > 0) {
        const info = await getStakingInfo(accounts[0])
        setStaked(info.staked)
        setRewards(info.rewards)
      }
    }
    fetchStaking()
  }, [])

  return { staked, rewards }
}
