'use client'

import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import VotingABI from '../../abi/UTMVoting.json'

export default function VotingPage() {
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [account, setAccount] = useState(null)
  const [votingContract, setVotingContract] = useState(null)
  const [proposals, setProposals] = useState([])
  const [newProposal, setNewProposal] = useState('')

  // Load contract addresses from env
  const VOTING_ADDRESS = process.env.NEXT_PUBLIC_UMT_VOTING

  useEffect(() => {
    console.log('Loaded Voting Address:', VOTING_ADDRESS)

    if (!VOTING_ADDRESS) {
      console.error('❌ Voting contract address not found. Check .env.local')
    }
  }, [VOTING_ADDRESS])

  // Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask not detected!')
      return
    }

    const prov = new ethers.BrowserProvider(window.ethereum)
    await prov.send('eth_requestAccounts', [])
    const signer = await prov.getSigner()
    const addr = await signer.getAddress()

    setProvider(prov)
    setSigner(signer)
    setAccount(addr)

    // Init contract
    if (VOTING_ADDRESS) {
      const contract = new ethers.Contract(VOTING_ADDRESS, VotingABI, signer)
      setVotingContract(contract)
      console.log('✅ Voting contract loaded:', contract.target)
      fetchProposals(contract)
    } else {
      console.error('❌ VOTING_ADDRESS is null. Check your env file.')
    }
  }

  // Fetch proposals
  const fetchProposals = async (contract) => {
    try {
      const count = await contract.proposalCount()
      const all = []
      for (let i = 1; i <= count; i++) {
        const p = await contract.proposals(i)
        all.push({
          id: i,
          description: p.description,
          votes: Number(p.voteCount),
        })
      }
      setProposals(all)
    } catch (err) {
      console.error('Failed to fetch proposals:', err)
    }
  }

  // Create proposal
  const createProposal = async () => {
    if (!votingContract || !newProposal) return
    try {
      const tx = await votingContract.createProposal(newProposal)
      await tx.wait()
      alert('✅ Proposal created!')
      setNewProposal('')
      fetchProposals(votingContract)
    } catch (err) {
      console.error('Create proposal error:', err)
    }
  }

  // Vote
  const vote = async (id) => {
    if (!votingContract) return
    try {
      const tx = await votingContract.vote(id)
      await tx.wait()
      alert('✅ Voted successfully!')
      fetchProposals(votingContract)
    } catch (err) {
      console.error('Vote error:', err)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">UMT Voting Dapp</h1>

      {!account ? (
        <button
          onClick={connectWallet}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Connect Wallet
        </button>
      ) : (
        <p className="mb-4">Connected: {account}</p>
      )}

      {/* Create Proposal */}
      <div className="my-6">
        <input
          type="text"
          value={newProposal}
          onChange={(e) => setNewProposal(e.target.value)}
          placeholder="Enter proposal description"
          className="border px-3 py-2 rounded w-full mb-2"
        />
        <button
          onClick={createProposal}
          className="px-4 py-2 bg-green-600 text-white rounded-lg"
        >
          Create Proposal
        </button>
      </div>

      {/* Proposal List */}
      <h2 className="text-xl font-semibold mb-2">Proposals</h2>
      {proposals.length === 0 ? (
        <p>No proposals yet</p>
      ) : (
        <ul className="space-y-3">
          {proposals.map((p) => (
            <li
              key={p.id}
              className="border p-3 rounded flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{p.description}</p>
                <p className="text-sm text-gray-600">Votes: {p.votes}</p>
              </div>
              <button
                onClick={() => vote(p.id)}
                className="px-3 py-1 bg-purple-600 text-white rounded-lg"
              >
                Vote
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
