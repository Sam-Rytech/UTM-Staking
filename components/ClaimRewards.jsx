'use client'

import { claimRewards } from '../lib/contract'

export default function ClaimRewards() {
  return (
    <div className="p-6 bg-slate-800 rounded-2xl shadow-lg">
      <h2 className="text-lg font-semibold mb-4">Claim Rewards</h2>
      <button
        onClick={claimRewards}
        className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
      >
        Claim
      </button>
    </div>
  )
}
