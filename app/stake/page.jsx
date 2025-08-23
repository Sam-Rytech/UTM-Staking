'use client'

import StakeForm from '@/components/StakeForm'

export default function StakePage() {
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Stake UTM</h1>
      <StakeForm />
    </div>
  )
}
