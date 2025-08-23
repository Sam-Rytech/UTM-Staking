'use client'
import { useState } from 'react'
import { ethers } from 'ethers'
import { getStakingContract, getUTMToken } from '../../lib/contract'

export default function Deposit() {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  async function depositTokens() {
    try {
      if (!window.ethereum) return alert('MetaMask not found')
      setLoading(true)

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const staking = await getStakingContract(signer)
      const token = await getUTMToken(signer)

      const userAddr = await signer.getAddress()
      const value = ethers.parseUnits(amount, 18)

      // 🔹 Check balance first
      const balance = await token.balanceOf(userAddr)
      if (balance < value) {
        setLoading(false)
        return alert('Not enough UTM balance')
      }

      // 🔹 Approve staking contract if needed
      const allowance = await token.allowance(userAddr, staking.target)
      if (allowance < value) {
        const approveTx = await token.approve(staking.target, value)
        await approveTx.wait()
      }

      // 🔹 Stake tokens
      const tx = await staking.stake(value)
      await tx.wait()

      alert('Stake successful!')
    } catch (err) {
      console.error(err)
      alert('Stake failed. See console for details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-10 max-w-lg mx-auto bg-gray-800 p-6 rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Stake UTM</h1>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount"
        className="w-full p-3 rounded-xl text-black mb-4"
      />
      <button
        onClick={depositTokens}
        disabled={loading}
        className={`w-full px-4 py-2 rounded-xl shadow-md ${
          loading ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Staking...' : 'Stake'}
      </button>
    </div>
  )
}
