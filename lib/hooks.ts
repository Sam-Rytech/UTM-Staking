'use client'

import { useEffect, useState } from 'react'
import { getStakedBalance, getPendingRewards } from './contract'
import { ethers } from 'ethers'

// Add ethereum property to the Window interface
declare global {
  interface Window {
    ethereum?: any
  }
}

// ✅ Hook to fetch ERC20 token balance
export function useBalance(tokenAddress?: string) {
  const [balance, setBalance] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBalance() {
      if (!window.ethereum) return
      if (!tokenAddress) return

      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      if (accounts.length === 0) return

      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const tokenContract = new ethers.Contract(
          tokenAddress,
          ['function balanceOf(address) view returns (uint256)'],
          provider
        )

        const bal = await tokenContract.balanceOf(accounts[0])
        setBalance(ethers.formatUnits(bal, 18))
      } catch (err) {
        console.error('Failed to fetch balance:', err)
      }
    }

    fetchBalance()
  }, [tokenAddress])

  return balance
}

// ✅ Hook to fetch staking info
export function useStaking() {
  const [staked, setStaked] = useState<string | null>(null)
  const [rewards, setRewards] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStaking() {
      if (!window.ethereum) return

      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      if (accounts.length === 0) return

      try {
        const address = accounts[0]
        const stakedBal = await getStakedBalance(address)
        const pending = await getPendingRewards(address)
        setStaked(stakedBal)
        setRewards(pending)
      } catch (err) {
        console.error('Failed to fetch staking info:', err)
      }
    }

    fetchStaking()

    // Optional: auto-refresh every 15 seconds
    const interval = setInterval(fetchStaking, 15000)
    return () => clearInterval(interval)
  }, [])

  return { staked, rewards }
}
