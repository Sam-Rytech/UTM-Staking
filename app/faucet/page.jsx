'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import UTMFaucetJSON from '../../../UTM Staking/abi/UTMFaucet.json'
import UTMJSON from '../../abi/UTM.json'

const FAUCET_ADDRESS = process.env.NEXT_PUBLIC_FAUCET_ADDRESS
const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_UTM_TOKEN

// Extract the raw ABI array from JSON
const UTMFaucetABI = UTMFaucetJSON.abi || UTMFaucetJSON
const UTMABI = UTMJSON.abi || UTMJSON

export default function FaucetPage() {
  const [wallet, setWallet] = useState(null)
  const [userBalance, setUserBalance] = useState('0')
  const [faucetBalance, setFaucetBalance] = useState('0')
  const [loading, setLoading] = useState(false)

  // Connect wallet
  async function connectWallet() {
    if (!window.ethereum) return alert('MetaMask not found')
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    })
    setWallet(accounts[0])
    fetchBalances(accounts[0])
  }

  // Fetch user token balance + faucet balance
  async function fetchBalances(user) {
    if (!window.ethereum) return
    const provider = new ethers.BrowserProvider(window.ethereum)

    const token = new ethers.Contract(TOKEN_ADDRESS, UTMABI, provider)
    const faucet = new ethers.Contract(FAUCET_ADDRESS, UTMFaucetABI, provider)

    const [userBal, faucetBal] = await Promise.all([
      token.balanceOf(user),
      faucet.faucetBalance(),
    ])

    setUserBalance(ethers.formatUnits(userBal, 18))
    setFaucetBalance(ethers.formatUnits(faucetBal, 18))
  }

  // Claim tokens from faucet
  async function claim() {
    if (!wallet || !window.ethereum) return
    try {
      setLoading(true)
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const faucet = new ethers.Contract(FAUCET_ADDRESS, UTMFaucetABI, signer)

      const tx = await faucet.claim()
      await tx.wait()

      alert('Claim successful!')
      fetchBalances(wallet)
    } catch (err) {
      console.error(err)
      alert(err?.data?.message || err.message || 'Claim failed')
    } finally {
      setLoading(false)
    }
  }

  // Refresh balances on wallet change
  useEffect(() => {
    if (window.ethereum && wallet) fetchBalances(wallet)
  }, [wallet])

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-gray-800 rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold mb-4 text-white">UTM Token Faucet</h1>

      {!wallet ? (
        <button
          onClick={connectWallet}
          className="w-full py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
        >
          Connect Wallet
        </button>
      ) : (
        <>
          <p className="text-white mb-2">Connected: {wallet}</p>
          <p className="text-white mb-2">Your Balance: {userBalance} UTM</p>
          <p className="text-white mb-4">Faucet Balance: {faucetBalance} UTM</p>

          <button
            onClick={claim}
            disabled={loading}
            className={`w-full py-2 px-4 rounded-xl text-white ${
              loading ? 'bg-gray-500' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? 'Claiming...' : 'Claim 100 UTM'}
          </button>
        </>
      )}
    </div>
  )
}
