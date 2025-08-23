'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

export default function WalletConnect() {
  const [account, setAccount] = useState(null)

  async function connectWallet() {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.send('eth_requestAccounts', [])
        setAccount(accounts[0])
      } catch (err) {
        console.error('Wallet connection failed:', err)
      }
    } else {
      alert('MetaMask not found! Please install it.')
    }
  }

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0] || null)
      })
    }
  }, [])

  return (
    <button
      onClick={connectWallet}
      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition duration-200"
    >
      {account
        ? `${account.slice(0, 6)}...${account.slice(-4)}`
        : 'Connect Wallet'}
    </button>
  )
}
