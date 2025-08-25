'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'


const VOTING_ADDRESS = process.env.NEXT_PUBLIC_UMT_VOTING


const VotingABI = [
  {
    inputs: [{ internalType: 'address', name: '_umt', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'proposalId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'finalVotes',
        type: 'uint256',
      },
    ],
    name: 'ProposalClosed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'proposalId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'description',
        type: 'string',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256',
      },
    ],
    name: 'ProposalCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'proposalId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'voter',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Voted',
    type: 'event',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'proposalId', type: 'uint256' }],
    name: 'closeProposal',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'string', name: '_description', type: 'string' },
      { internalType: 'uint256', name: 'duration', type: 'uint256' },
    ],
    name: 'createProposal',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'proposalId', type: 'uint256' }],
    name: 'getProposal',
    outputs: [
      { internalType: 'string', name: 'description', type: 'string' },
      { internalType: 'uint256', name: 'voteCount', type: 'uint256' },
      { internalType: 'bool', name: 'active', type: 'bool' },
      { internalType: 'uint256', name: 'deadline', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'hasVoted',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'proposals',
    outputs: [
      { internalType: 'string', name: 'description', type: 'string' },
      { internalType: 'uint256', name: 'voteCount', type: 'uint256' },
      { internalType: 'bool', name: 'active', type: 'bool' },
      { internalType: 'uint256', name: 'deadline', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'umt',
    outputs: [{ internalType: 'contract IERC20', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'proposalId', type: 'uint256' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'vote',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'votes',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
]

export default function VotingPage() {
  const [wallet, setWallet] = useState(null)
  const [contract, setContract] = useState(null)
  const [proposals, setProposals] = useState([])
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState(60)
  const [loading, setLoading] = useState(false)

  // Connect wallet + contract
  const connectWallet = async () => {
    if (!window.ethereum) return alert('MetaMask required')
    const provider = new ethers.BrowserProvider(window.ethereum)
    const accounts = await provider.send('eth_requestAccounts', [])
    const signer = await provider.getSigner()
    setWallet(accounts[0])

    const c = new ethers.Contract(VOTING_ADDRESS, VotingABI, signer)
    setContract(c)
    console.log('✅ Connected:', c.target)

    fetchProposals(c)
  }

  // Fetch all proposals
  const fetchProposals = async (c = contract) => {
    if (!c) return
    try {
      const props = []
      // assuming your contract has a public array `proposals` you can loop until it fails
      let i = 0
      while (true) {
        try {
          const p = await c.proposals(i)
          props.push({
            id: i,
            description: p.description,
            voteCount: p.voteCount.toString(),
            active: p.active,
            deadline: p.deadline.toString(),
          })
          i++
        } catch (err) {
          break // stop once we go past the array length
        }
      }
      setProposals(props)
    } catch (err) {
      console.error('Error fetching proposals:', err)
    }
  }

  // Create proposal
  const createProposal = async () => {
    if (!contract) return
    setLoading(true)
    try {
      const tx = await contract.createProposal(description, duration)
      await tx.wait()
      alert('Proposal created!')
      setDescription('')
      fetchProposals()
    } catch (err) {
      console.error(err)
      alert('Error creating proposal')
    }
    setLoading(false)
  }

  // Vote for a proposal
  const voteProposal = async (id, amount) => {
    if (!contract) return
    setLoading(true)
    try {
      const tx = await contract.vote(
        id,
        ethers.parseUnits(amount.toString(), 18)
      )
      await tx.wait()
      alert('Vote cast!')
      fetchProposals()
    } catch (err) {
      console.error(err)
      alert('Voting failed')
    }
    setLoading(false)
  }

  return (
    <div className="p-6 bg-slate-800 rounded-xl shadow-lg">
      <h1 className="text-xl font-bold mb-4">UMT Voting Dapp</h1>

      {!wallet ? (
        <button
          onClick={connectWallet}
          className="px-4 py-2 bg-blue-600 rounded"
        >
          Connect Wallet
        </button>
      ) : (
        <p className="mb-4">Connected: {wallet}</p>
      )}

      <div className="mb-6">
        <h2 className="font-semibold">Create Proposal</h2>
        <input
          type="text"
          placeholder="Proposal description"
          className="text-black p-2 rounded w-full my-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="number"
          placeholder="Duration (seconds)"
          className="text-black p-2 rounded w-full my-2"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
        <button
          disabled={loading}
          onClick={createProposal}
          className="px-4 py-2 bg-green-600 rounded"
        >
          {loading ? 'Submitting...' : 'Create'}
        </button>
      </div>

      <div className="space-y-4 mt-6">
        <h2 className="font-semibold text-lg">Proposals</h2>
        {proposals.length === 0 ? (
          <p>No proposals found</p>
        ) : (
          proposals.map((p) => (
            <div
              key={p.id}
              className="p-4 bg-gray-900 rounded-lg border border-gray-700"
            >
              <h3 className="font-semibold">{p.description}</h3>
              <p>Votes: {p.voteCount}</p>
              <p>Status: {p.active ? 'Active' : 'Closed'}</p>
              {p.active && (
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => voteProposal(p.id, 1)} // voting 1 UMT for example
                    className="px-3 py-1 bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
                    disabled={loading}
                  >
                    Vote For (1 UMT)
                  </button>
                  <button
                    onClick={() => voteProposal(p.id, 0)} // voting 0 = against? depends on your contract
                    className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
                    disabled={loading}
                  >
                    Vote Against
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
