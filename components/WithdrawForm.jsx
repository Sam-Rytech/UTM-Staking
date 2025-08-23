'use client'

import { useState } from 'react'
import { withdrawTokens } from '@/lib/contract'

export default function WithdrawForm() {
  const [amount, setAmount] = useState('')

  async function handleWithdraw() {
    if (!amount) return
    await withdrawTokens(amount)
    setAmount('')
  }

  return (
    <div className="p-6 bg-slate-800 rounded-2xl shadow-lg">
      <h2 className="text-lg font-semibold mb-4">Withdraw Tokens</h2>
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-2 mb-4 rounded bg-slate-700"
      />
      <button
        onClick={handleWithdraw}
        className="w-full px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg"
      >
        Withdraw
      </button>
    </div>
  )
}
