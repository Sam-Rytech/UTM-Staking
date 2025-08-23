'use client'

import StatsCard from '../components/StatsCard'
import TokenBalance from '../components/TokenBalance'
import StakeForm from '../components/StakeForm'
import WithdrawForm from '../components/WithdrawForm'
import ClaimRewards from '../components/ClaimRewards'

export default function HomePage() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-6">
        <TokenBalance />
        <StatsCard />
      </div>
      <div className="space-y-6">
        <StakeForm />
        <WithdrawForm />
        <ClaimRewards />
      </div>
    </div>
  )
}
