'use client'

import WalletConnect from './WalletConnect'

export default function Navbar() {
  return (
    <nav className="bg-slate-900 px-6 py-4 shadow-md flex justify-between items-center">
      <h1 className="text-xl font-bold text-indigo-400">UTM Staking</h1>
      <WalletConnect />
    </nav>
  )
}
