'use client'
import { useState } from 'react'
import { ethers } from 'ethers'
import { getStakingContract, getUTMToken } from '../../lib/contract'

export default function Deposit() {
  const [amount, setAmount] = useState('')

  async function depositTokens() {
    try {
      if (!window.ethereum) return alert('MetaMask not found')

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const staking = await getStakingContract(signer)
      const token = await getUTMToken(signer)

      const value = ethers.parseUnits(amount, 18)

      // Approve staking contract to spend UTM
      const approveTx = await token.approve(staking.target, value)
      await approveTx.wait()

      // Stake tokens
      const tx = await staking.stake(value)
      await tx.wait()

      alert('Deposit (stake) successful!')
    } catch (err) {
      console.error(err)
      alert('Deposit failed')
    }
  }

  return (
    <div className="mt-10 max-w-lg mx-auto bg-gray-800 p-6 rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Deposit UTM</h1>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount"
        className="w-full p-3 rounded-xl text-black mb-4"
      />
      <button
        onClick={depositTokens}
        className="w-full bg-blue-600 px-4 py-2 rounded-xl hover:bg-blue-700"
      >
        Deposit
      </button>
    </div>
  )
}
