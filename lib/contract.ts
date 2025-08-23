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

export async function stakeTokens(amount: string) {
  const signer = await getSigner()
  const contract = new ethers.Contract(STAKING_ADDRESS, UTMStaking.abi, signer)
  const tx = await contract.stake(ethers.parseUnits(amount, 18))
  await tx.wait()
}

export async function withdrawTokens(amount: string) {
  const signer = await getSigner()
  const contract = new ethers.Contract(STAKING_ADDRESS, UTMStaking.abi, signer)
  const tx = await contract.withdraw(ethers.parseUnits(amount, 18))
  await tx.wait()
}

export async function claimRewards() {
  const signer = await getSigner()
  const contract = new ethers.Contract(STAKING_ADDRESS, UTMStaking.abi, signer)
  const tx = await contract.claimRewards()
  await tx.wait()
}

export async function getBalance(address: string) {
  const provider = getProvider()
  const contract = new ethers.Contract(TOKEN_ADDRESS, UTM.abi, provider)
  const balance = await contract.balanceOf(address)
  return ethers.formatUnits(balance, 18)
}

export async function getStakingInfo(address: string) {
  const provider = getProvider()
  const contract = new ethers.Contract(
    STAKING_ADDRESS,
    UTMStaking.abi,
    provider
  )

  // mapping is `stakes`, not `stakers`
  const info = await contract.stakes(address)

  return {
    staked: ethers.formatUnits(info.amount, 18),
    rewards: ethers.formatUnits(info.rewardDebt, 18), // use rewardDebt, claimable is pendingRewards()
  }
}
