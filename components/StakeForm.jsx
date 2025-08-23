'use client'

import { useState } from 'react'
import { stakeTokens } from '../lib/contract'

export default function StakeForm() {
  const [amount, setAmount] = useState('')

  async function handleStake() {
    if (!amount) return
    await stakeTokens(amount)
    setAmount('')
  }

  return (
    <div className="p-6 bg-slate-800 rounded-2xl shadow-lg">
      <h2 className="text-lg font-semibold mb-4">Stake Tokens</h2>
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-2 mb-4 rounded bg-slate-700"
      />
      <button
        onClick={handleStake}
        className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg"
      >
        Stake
      </button>
    </div>
  )
}
