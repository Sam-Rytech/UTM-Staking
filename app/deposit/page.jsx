'use client'
import { useState, useEffect } from 'react'
import {
  stakeTokens,
  claimRewards,
  withdrawTokens,
  getPendingRewards,
  getStakedBalance,
} from '../../lib/contract'

export default function DepositPage() {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [staked, setStaked] = useState('0')
  const [rewards, setRewards] = useState('0')

  async function refreshData() {
    try {
      if (!window.ethereum) return
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()

      const stakedBal = await getStakedBalance(address)
      const pending = await getPendingRewards(address)
      setStaked(stakedBal)
      setRewards(pending)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    refreshData()
  }, [])

  const handleStake = async () => {
    try {
      setLoading(true)
      await stakeTokens(amount)
      alert('Stake successful!')
      setAmount('')
      await refreshData()
    } catch (err) {
      console.error(err)
      alert('Stake failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClaim = async () => {
    try {
      setLoading(true)
      await claimRewards()
      alert('Rewards claimed!')
      await refreshData()
    } catch (err) {
      console.error(err)
      alert('Claim failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async () => {
    try {
      setLoading(true)
      await withdrawTokens(amount)
      alert('Withdraw successful!')
      setAmount('')
      await refreshData()
    } catch (err) {
      console.error(err)
      alert('Withdraw failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-10 max-w-lg mx-auto bg-gray-800 p-6 rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold mb-4">UTM Staking</h1>

      <div className="mb-4">
        <p>Staked Balance: {staked} UTM</p>
        <p>Pending Rewards: {rewards} UTM</p>
      </div>

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount"
        className="w-full p-3 rounded-xl text-black mb-4"
      />

      <button
        onClick={handleStake}
        disabled={loading}
        className={`w-full px-4 py-2 rounded-xl shadow-md ${
          loading ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'
        } mb-2`}
      >
        {loading ? 'Processing...' : 'Stake'}
      </button>

      <button
        onClick={handleClaim}
        disabled={loading}
        className={`w-full px-4 py-2 rounded-xl shadow-md ${
          loading ? 'bg-gray-500' : 'bg-green-600 hover:bg-green-700'
        } mb-2`}
      >
        {loading ? 'Processing...' : 'Claim Rewards'}
      </button>

      <button
        onClick={handleWithdraw}
        disabled={loading}
        className={`w-full px-4 py-2 rounded-xl shadow-md ${
          loading ? 'bg-gray-500' : 'bg-red-600 hover:bg-red-700'
        }`}
      >
        {loading ? 'Processing...' : 'Withdraw'}
      </button>
    </div>
  )
}
