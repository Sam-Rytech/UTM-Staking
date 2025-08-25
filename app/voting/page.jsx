'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'


const VOTING_ADDRESS = process.env.NEXT_PUBLIC_UMT_VOTING
const UMT_TOKEN = process.env.NEXT_PUBLIC_UTM_TOKEN


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
  const [voteAmounts, setVoteAmounts] = useState({})

  // Connect wallet + contract
  const connectWallet = async () => {
    if (!window.ethereum) return alert('MetaMask required')
    const provider = new ethers.BrowserProvider(window.ethereum)
    const accounts = await provider.send('eth_requestAccounts', [])
    const signer = await provider.getSigner()
    setWallet(accounts[0])
    const c = new ethers.Contract(VOTING_ADDRESS, VotingABI, signer)
    setContract(c)
    fetchProposals(c)
  }

  // Fetch proposals
  const fetchProposals = async (c = contract) => {
    if (!c) return
    const proposalsArr = []
    let i = 0
    while (true) {
      try {
        const p = await c.getProposal(i)
        proposalsArr.push({
          id: i,
          description: p.description,
          voteCount: p.voteCount.toString(),
          active: p.active,
          deadline: p.deadline.toString(),
        })
        i++
      } catch {
        break
      }
    }
    setProposals(proposalsArr)
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

  // Approve UMT tokens
  const approveUMT = async (amount) => {
    if (!wallet || !contract) return
    const amountBN = ethers.parseUnits(amount, 18)

    // Read-only contract for allowance check
    const provider = new ethers.BrowserProvider(window.ethereum)
    const umtReadContract = new ethers.Contract(
      UMT_TOKEN,
      [
        'function allowance(address owner, address spender) view returns (uint256)',
      ],
      provider
    )

    const allowanceRaw = await umtReadContract.allowance(wallet, VOTING_ADDRESS)
    const allowance = ethers.toBigInt(allowanceRaw)

    if (allowance >= amountBN) return // already approved

    // ✅ Use the signer-connected contract for sending tx
    const signer = await provider.getSigner()
    const umtWriteContract = new ethers.Contract(
      UMT_TOKEN,
      ['function approve(address spender, uint256 amount) returns (bool)'],
      signer
    )

    const tx = await umtWriteContract.approve(VOTING_ADDRESS, amountBN)
    await tx.wait()
  }

  // Vote proposal
  const voteProposal = async (id) => {
    if (!contract) return
    const amount = voteAmounts[id]
    if (!amount || isNaN(amount)) return alert('Enter valid vote amount')

    try {
      await approveUMT(amount)
      const tx = await contract.vote(id, ethers.parseUnits(amount, 18))
      await tx.wait()
      alert('Voted!')
      fetchProposals()
      setVoteAmounts({ ...voteAmounts, [id]: '' })
    } catch (err) {
      console.error(err)
      alert('Vote failed')
    }
  }

  // Close proposal
  const closeProposal = async (id) => {
    if (!contract) return
    try {
      const tx = await contract.closeProposal(id)
      await tx.wait()
      alert('Proposal closed')
      fetchProposals()
    } catch (err) {
      console.error(err)
      alert('Failed to close proposal')
    }
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

      {wallet && (
        <>
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

          <div className="mb-6">
            <h2 className="font-semibold">Proposals</h2>
            {proposals.length === 0 && <p>No proposals yet</p>}
            {proposals.map((p) => (
              <div key={p.id} className="bg-gray-700 p-4 rounded mb-2">
                <p className="font-semibold">{p.description}</p>
                <p>Votes: {ethers.formatUnits(p.voteCount, 18)}</p>
                <p>Status: {p.active ? 'Active' : 'Closed'}</p>

                {p.active && (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Vote amount"
                      className="text-black p-1 rounded w-24"
                      value={voteAmounts[p.id] || ''}
                      onChange={(e) =>
                        setVoteAmounts({
                          ...voteAmounts,
                          [p.id]: e.target.value,
                        })
                      }
                    />
                    <button
                      onClick={() => voteProposal(p.id)}
                      className="px-2 py-1 bg-blue-500 rounded"
                    >
                      Vote
                    </button>
                    <button
                      onClick={() => closeProposal(p.id)}
                      className="px-2 py-1 bg-red-600 rounded"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
