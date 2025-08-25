'use client'

import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

const VOTING_ADDRESS = process.env.NEXT_PUBLIC_UMT_VOTING
const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_UMT_TOKEN

// Minimal voting contract ABI (functions used)
const votingABI = [
  'function createProposal(string memory _description, uint256 duration) external',
  'function vote(uint256 proposalId, uint256 amount) external',
  'function closeProposal(uint256 proposalId) external',
  'function getProposal(uint256 proposalId) external view returns (string memory description, uint256 voteCount, bool active, uint256 deadline)',
]

// Minimal ERC20 ABI (balance/approve/allowance)
const tokenABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() view returns (uint8)',
]

// assume 18 decimals unless token reports otherwise
const TOKEN_DECIMALS_FALLBACK = 18

export default function UMTVotingPage() {
  const [wallet, setWallet] = useState(null)
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [votingContract, setVotingContract] = useState(null)
  const [tokenContract, setTokenContract] = useState(null)
  const [loading, setLoading] = useState(false)

  // UI state
  const [createDesc, setCreateDesc] = useState('')
  const [createDuration, setCreateDuration] = useState(86400) // default 1 day
  const [viewId, setViewId] = useState('')
  const [viewProposal, setViewProposal] = useState(null)
  const [voteAmount, setVoteAmount] = useState('') // human readable e.g. "10"
  const [tokenDecimals, setTokenDecimals] = useState(TOKEN_DECIMALS_FALLBACK)

  // connect wallet
  async function connectWallet() {
    if (!window.ethereum) return alert('MetaMask / Ethereum provider not found')
    try {
      const _provider = new ethers.BrowserProvider(window.ethereum)
      await _provider.send('eth_requestAccounts', [])
      const _signer = await _provider.getSigner()
      const addr = await _signer.getAddress()

      setProvider(_provider)
      setSigner(_signer)
      setWallet(addr)

      // setup contracts (use signer for write)
      const voting = new ethers.Contract(VOTING_ADDRESS, votingABI, _signer)
      const token = new ethers.Contract(TOKEN_ADDRESS, tokenABI, _signer)
      setVotingContract(voting)
      setTokenContract(token)

      // try to read token decimals (fallback to 18)
      try {
        const d = await token.decimals()
        setTokenDecimals(Number(d))
      } catch (err) {
        setTokenDecimals(TOKEN_DECIMALS_FALLBACK)
      }
    } catch (err) {
      console.error(err)
      alert('Connection failed: ' + (err.message || err))
    }
  }

  // create a proposal
  async function handleCreateProposal() {
    if (!votingContract) return alert('Connect wallet first')
    if (!createDesc || !createDuration)
      return alert('Provide description and duration (seconds)')
    try {
      setLoading(true)
      const tx = await votingContract.createProposal(
        createDesc,
        Number(createDuration)
      )
      await tx.wait()
      alert('Proposal created!')
      setCreateDesc('')
    } catch (err) {
      console.error(err)
      alert(err?.data?.message || err.message || 'Create failed')
    } finally {
      setLoading(false)
    }
  }

  // view a single proposal by id
  async function handleViewProposal() {
    if (!votingContract) return alert('Connect wallet first')
    if (viewId === '') return alert('Provide proposal id')
    try {
      setLoading(true)
      const p = await votingContract.getProposal(Number(viewId))
      // getProposal returns: (description, voteCount, active, deadline)
      const proposal = {
        id: Number(viewId),
        description: p[0],
        voteCount: ethers.formatUnits(p[1].toString(), tokenDecimals),
        active: p[2],
        deadline: Number(p[3]),
      }
      setViewProposal(proposal)
    } catch (err) {
      console.error(err)
      alert(err?.data?.message || err.message || 'Fetch failed')
      setViewProposal(null)
    } finally {
      setLoading(false)
    }
  }

  // vote (will approve token if allowance insufficient)
  async function handleVote() {
    if (!votingContract || !tokenContract) return alert('Connect wallet first')
    if (viewId === '') return alert('Enter proposal id to vote on')
    if (!voteAmount || Number(voteAmount) <= 0)
      return alert('Enter vote amount > 0')

    try {
      setLoading(true)
      const amtUnits = ethers.parseUnits(voteAmount.toString(), tokenDecimals)

      // check allowance
      const owner = await signer.getAddress()
      const allowance = await tokenContract.allowance(owner, VOTING_ADDRESS)
      if (allowance.lt(amtUnits)) {
        // need to approve - set exact amount (or you can approve bigger)
        const approveTx = await tokenContract.approve(VOTING_ADDRESS, amtUnits)
        await approveTx.wait()
      }

      // now vote
      const tx = await votingContract.vote(Number(viewId), amtUnits)
      await tx.wait()
      alert('Vote submitted!')
      // refresh view
      handleViewProposal()
      setVoteAmount('')
    } catch (err) {
      console.error(err)
      alert(err?.data?.message || err.message || 'Vote failed')
    } finally {
      setLoading(false)
    }
  }

  // close proposal after deadline
  async function handleCloseProposal() {
    if (!votingContract) return alert('Connect wallet first')
    if (viewId === '') return alert('Enter proposal id to close')
    try {
      setLoading(true)
      const tx = await votingContract.closeProposal(Number(viewId))
      await tx.wait()
      alert('Proposal closed')
      handleViewProposal()
    } catch (err) {
      console.error(err)
      alert(err?.data?.message || err.message || 'Close failed')
    } finally {
      setLoading(false)
    }
  }

  // helper to show remaining time nicely
  function formatDeadline(ts) {
    if (!ts) return '-'
    const now = Math.floor(Date.now() / 1000)
    if (ts <= now) return 'Ended'
    const diff = ts - now
    const h = Math.floor(diff / 3600)
    const m = Math.floor((diff % 3600) / 60)
    const s = diff % 60
    return `${h}h ${m}m ${s}s`
  }

  // effect: try to auto-connect if accounts already available
  useEffect(() => {
    if (!window.ethereum) return
    window.ethereum.request({ method: 'eth_accounts' }).then((accs) => {
      if (accs && accs.length > 0 && !wallet) {
        connectWallet().catch((e) => console.error(e))
      }
    })
  }, [])

  return (
    <div className="max-w-3xl mx-auto p-6 bg-slate-800 rounded-2xl mt-8 text-white">
      <h1 className="text-2xl font-bold mb-4">UMT On-Chain Voting</h1>

      {!wallet ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-300">
            Connect your wallet to create proposals and vote on-chain.
          </p>
          <button
            onClick={connectWallet}
            className="px-4 py-2 bg-blue-600 rounded"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-300">
            Connected: <span className="font-mono">{wallet}</span>
          </p>

          {/* Create Proposal */}
          <div className="bg-slate-700 p-4 rounded">
            <h2 className="font-semibold mb-2">Create Proposal</h2>
            <input
              placeholder="Short description"
              value={createDesc}
              onChange={(e) => setCreateDesc(e.target.value)}
              className="w-full mb-2 p-2 rounded bg-slate-600 text-white"
            />
            <div className="flex gap-2 items-center mb-2">
              <input
                type="number"
                min="1"
                value={createDuration}
                onChange={(e) => setCreateDuration(Number(e.target.value))}
                className="p-2 rounded bg-slate-600 text-white w-40"
              />
              <span className="text-sm text-gray-300">Duration (seconds)</span>
            </div>
            <button
              onClick={handleCreateProposal}
              className="px-3 py-2 bg-green-600 rounded"
            >
              {loading ? 'Working...' : 'Create Proposal'}
            </button>
          </div>

          {/* View / Vote on Proposal */}
          <div className="bg-slate-700 p-4 rounded">
            <h2 className="font-semibold mb-2">View / Vote</h2>
            <div className="flex gap-2 mb-3">
              <input
                placeholder="Proposal ID"
                value={viewId}
                onChange={(e) => setViewId(e.target.value)}
                className="p-2 rounded bg-slate-600 text-white w-32"
              />
              <button
                onClick={handleViewProposal}
                className="px-3 py-2 bg-indigo-600 rounded"
              >
                Load
              </button>
              <button
                onClick={handleCloseProposal}
                className="px-3 py-2 bg-red-600 rounded"
              >
                Close Proposal
              </button>
            </div>

            {viewProposal ? (
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>ID:</strong> {viewProposal.id}
                </p>
                <p className="text-sm">
                  <strong>Description:</strong> {viewProposal.description}
                </p>
                <p className="text-sm">
                  <strong>Votes (UMT):</strong> {viewProposal.voteCount}
                </p>
                <p className="text-sm">
                  <strong>Active:</strong> {viewProposal.active ? 'Yes' : 'No'}
                </p>
                <p className="text-sm">
                  <strong>Deadline:</strong>{' '}
                  {formatDeadline(viewProposal.deadline)}
                </p>

                <div className="mt-2 flex gap-2">
                  <input
                    placeholder="Amount to stake (UMT)"
                    value={voteAmount}
                    onChange={(e) => setVoteAmount(e.target.value)}
                    className="p-2 rounded bg-slate-600 text-white w-48"
                  />
                  <button
                    onClick={handleVote}
                    className="px-3 py-2 bg-blue-600 rounded"
                  >
                    {loading ? 'Working...' : 'Approve & Vote'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-300">
                Load a proposal by ID to see details and vote.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
