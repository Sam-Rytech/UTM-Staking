'use client'
import { ethers } from 'ethers'
import UTM from '../abi/UTM.json'
import UTMStaking from '../abi/UTMStaking.json'

const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_UTM_TOKEN as string
const STAKING_ADDRESS = process.env.NEXT_PUBLIC_UTM_STAKING as string

function getProvider() {
  if (!window.ethereum) throw new Error('MetaMask not found')
  return new ethers.BrowserProvider(window.ethereum)
}

async function getSigner() {
  const provider = getProvider()
  return await provider.getSigner()
}

// ✅ Stake tokens
export async function stakeTokens(amount: string) {
  const signer = await getSigner()
  const token = new ethers.Contract(TOKEN_ADDRESS, UTM.abi, signer)
  const staking = new ethers.Contract(STAKING_ADDRESS, UTMStaking.abi, signer)
  const value = ethers.parseUnits(amount, 18)
  const userAddr = await signer.getAddress()

  // Check balance
  const balance = await token.balanceOf(userAddr)
  if (balance < value) throw new Error('Not enough UTM balance')

  // Approve if needed
  const allowance = await token.allowance(userAddr, STAKING_ADDRESS)
  if (allowance < value) {
    const approveTx = await token.approve(STAKING_ADDRESS, value)
    await approveTx.wait()
  }

  // Stake
  const tx = await staking.stake(value)
  await tx.wait()
}

// ✅ Claim rewards
export async function claimRewards() {
  const signer = await getSigner()
  const staking = new ethers.Contract(STAKING_ADDRESS, UTMStaking.abi, signer)
  const tx = await staking.claim() // ✅ correct function
  await tx.wait()
}

// ✅ Withdraw staked tokens
export async function withdrawTokens(amount: string) {
  const signer = await getSigner()
  const staking = new ethers.Contract(STAKING_ADDRESS, UTMStaking.abi, signer)
  const tx = await staking.withdraw(ethers.parseUnits(amount, 18))
  await tx.wait()
}

// ✅ Get pending rewards
export async function getPendingRewards(address: string) {
  const provider = getProvider()
  const staking = new ethers.Contract(STAKING_ADDRESS, UTMStaking.abi, provider)
  const rewards = await staking.pendingRewards(address)
  return ethers.formatUnits(rewards, 18)
}

// ✅ Get staked balance
export async function getStakedBalance(address: string) {
  const provider = getProvider()
  const staking = new ethers.Contract(STAKING_ADDRESS, UTMStaking.abi, provider)
  const balance = await staking.stakedBalance(address)
  return ethers.formatUnits(balance, 18)
}
