'use client'

import { useState, useEffect } from 'react'
import { useStaking } from '@/lib/hooks'

export default function StatsCard() {
  const { staked, rewards } = useStaking()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (staked !== null && rewards !== null) setLoading(false)
  }, [staked, rewards])

  return (
    <div className="p-6 bg-slate-800 rounded-2xl shadow-lg">
      <h2 className="text-lg font-semibold mb-4">Your Staking Stats</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-2">
          <p>
            Staked: <span className="font-bold">{staked} UTM</span>
          </p>
          <p>
            Rewards: <span className="font-bold">{rewards} UTM</span>
          </p>
        </div>
      )}
    </div>
  )
}
