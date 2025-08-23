// lib/utils.ts
import { ethers } from 'ethers'

/**
 * Get Ethereum provider (MetaMask or default RPC)
 */
export function getProvider(): ethers.BrowserProvider {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    return new ethers.BrowserProvider((window as any).ethereum)
  }
  throw new Error('No crypto wallet found. Please install MetaMask.')
}

/**
 * Get signer for transactions
 */
export async function getSigner(): Promise<ethers.Signer> {
  const provider = getProvider()
  await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
  return await provider.getSigner()
}

/**
 * Format big number to human-readable token amount
 */
export function formatUnits(value: any, decimals = 18): string {
  try {
    return ethers.formatUnits(value, decimals)
  } catch {
    return '0'
  }
}

/**
 * Parse human-readable input into wei
 */
export function parseUnits(value: string, decimals = 18): ethers.BigNumberish {
  try {
    return ethers.parseUnits(value || '0', decimals)
  } catch {
    return ethers.parseUnits('0', decimals)
  }
}

/**
 * Truncate Ethereum address
 */
export function truncateAddress(address: string, length = 4): string {
  if (!address) return ''
  return `${address.substring(0, length + 2)}...${address.substring(
    address.length - length
  )}`
}

/**
 * Handle transaction confirmations
 */
export async function handleTransaction(
  txPromise: Promise<any>
): Promise<void> {
  try {
    const tx = await txPromise
    console.log('Transaction sent:', tx.hash)
    await tx.wait()
    console.log('Transaction confirmed:', tx.hash)
  } catch (error: any) {
    console.error('Transaction failed:', error)
    throw error
  }
}
