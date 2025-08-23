'use client'

import { useBalance } from '@/lib/hooks'

export default function TokenBalance() {
  const balance = useBalance()

  return (
    <div className="p-6 bg-slate-800 rounded-2xl shadow-lg">
      <h2 className="text-lg font-semibold mb-4">Wallet Balance</h2>
      <p>{balance !== null ? `${balance} UTM` : 'Loading...'}</p>
    </div>
  )
}
