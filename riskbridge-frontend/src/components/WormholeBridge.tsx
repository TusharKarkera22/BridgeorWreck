import React, { useState, useEffect } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { X, ArrowRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { USDC_ADDRESS } from '../contracts/RiskBridge'

// Wormhole SDK imports
import { 
  Wormhole, 
  wormhole
} from '@wormhole-foundation/sdk'
import type { Network } from '@wormhole-foundation/sdk'
import evm from '@wormhole-foundation/sdk/evm'

interface WormholeBridgeProps {
  isOpen: boolean
  onClose: () => void
}

export const WormholeBridge: React.FC<WormholeBridgeProps> = ({ isOpen, onClose }) => {
  const { address } = useAccount()
  const [bridgeAmount, setBridgeAmount] = useState('')
  const [targetChain, setTargetChain] = useState<'solana' | 'ethereum'>('solana')
  const [recipientAddress, setRecipientAddress] = useState('')
  const [bridgeStatus, setBridgeStatus] = useState<'idle' | 'approving' | 'bridging' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [wormholeInstance, setWormholeInstance] = useState<Wormhole<Network> | null>(null)

  // Get USDC balance
  const { data: usdcBalance } = useBalance({
    address: address,
    token: USDC_ADDRESS,
  })

  // Contract write hooks (removed since we're using Portal Bridge)
  // const { writeContract: approveUSDC, data: approveHash } = useWriteContract()
  // const { isLoading: isApproving, isSuccess: approveSuccess } = useWaitForTransactionReceipt({
  //   hash: approveHash,
  // })

  // Initialize Wormhole SDK
  useEffect(() => {
    const initWormhole = async () => {
      try {
        const wh = await wormhole('Testnet', [evm])
        setWormholeInstance(wh)
      } catch (error) {
        console.error('Failed to initialize Wormhole:', error)
        setErrorMessage('Failed to initialize Wormhole SDK')
      }
    }

    if (isOpen) {
      initWormhole()
    }
  }, [isOpen])

  // Set recipient address to current address by default
  useEffect(() => {
    if (address && !recipientAddress) {
      setRecipientAddress(address)
    }
  }, [address, recipientAddress])

  const handleApprove = async () => {
    if (!bridgeAmount || !wormholeInstance) return

    try {
      setBridgeStatus('approving')
      setErrorMessage('')

      // For now, we'll use a simplified approach and direct users to Portal Bridge
      // The Wormhole SDK integration requires more complex setup for production use
      window.open('https://portalbridge.com/#/transfer', '_blank')
      
      setBridgeStatus('idle')
      onClose()
    } catch (error) {
      console.error('Bridge error:', error)
      setErrorMessage('Please use Portal Bridge for cross-chain transfers')
      setBridgeStatus('error')
    }
  }

  const handleBridge = async () => {
    if (!bridgeAmount || !recipientAddress || !wormholeInstance || !address) return

    try {
      setBridgeStatus('bridging')
      setErrorMessage('')

      // Direct users to Portal Bridge for actual bridging
      const portalUrl = `https://portalbridge.com/#/transfer?sourceChain=base&targetChain=${targetChain === 'solana' ? 'solana' : 'ethereum'}`
      window.open(portalUrl, '_blank')
      
      setBridgeStatus('success')
      
      // Reset form after opening Portal Bridge
      setTimeout(() => {
        setBridgeAmount('')
        setRecipientAddress(address)
        setBridgeStatus('idle')
        onClose()
      }, 2000)

    } catch (error) {
      console.error('Bridge error:', error)
      setErrorMessage('Please use Portal Bridge for cross-chain transfers')
      setBridgeStatus('error')
    }
  }

  const isFormValid = bridgeAmount && recipientAddress && parseFloat(bridgeAmount) > 0
  const maxAmount = usdcBalance ? formatUnits(usdcBalance.value, 6) : '0'

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">Cross-Chain Bridge</h2>
        
        <div className="space-y-6">
          {/* Source Chain Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">From: Base Sepolia</h3>
            <p className="text-sm text-blue-600">
              USDC Balance: {usdcBalance ? formatUnits(usdcBalance.value, 6) : '0'} USDC
            </p>
          </div>

          {/* Target Chain Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bridge To:
            </label>
            <select
              value={targetChain}
              onChange={(e) => setTargetChain(e.target.value as 'solana' | 'ethereum')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="solana">Solana Devnet</option>
              <option value="ethereum">Ethereum Sepolia</option>
            </select>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (USDC)
            </label>
            <div className="relative">
              <input
                type="number"
                value={bridgeAmount}
                onChange={(e) => setBridgeAmount(e.target.value)}
                placeholder="0.00"
                step="0.000001"
                min="0"
                max={maxAmount}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-16"
              />
              <button
                onClick={() => setBridgeAmount(maxAmount)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 text-sm font-medium hover:text-blue-800"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Recipient Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Address
            </label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder={targetChain === 'solana' ? 'Solana wallet address' : 'Ethereum address'}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
              <AlertCircle className="text-red-500" size={20} />
              <span className="text-red-700 text-sm">{errorMessage}</span>
            </div>
          )}

          {/* Bridge Actions */}
          <div className="space-y-3">
            {bridgeStatus === 'idle' && (
              <button
                onClick={handleApprove}
                disabled={!isFormValid}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <ArrowRight size={20} />
                <span>Open Portal Bridge</span>
              </button>
            )}

            {bridgeStatus === 'bridging' && (
              <div className="w-full bg-blue-100 text-blue-800 py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2">
                <Loader2 className="animate-spin" size={20} />
                <span>Bridging tokens...</span>
              </div>
            )}

            {bridgeStatus === 'success' && (
              <div className="w-full bg-green-100 text-green-800 py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2">
                <CheckCircle size={20} />
                <span>Portal Bridge opened!</span>
              </div>
            )}

            {bridgeStatus === 'error' && (
              <button
                onClick={() => setBridgeStatus('idle')}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 flex items-center justify-center space-x-2"
              >
                <span>Try Again</span>
              </button>
            )}
          </div>

          {/* Bridge Info */}
          <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
            <p className="mb-2">
              <strong>Bridge Method:</strong> Wormhole Portal Bridge
            </p>
            <p className="mb-2">
              <strong>Bridge Fee:</strong> ~$0.50 (varies by network congestion)
            </p>
            <p className="mb-2">
              <strong>Time:</strong> 5-15 minutes
            </p>
            <p>
              <strong>Note:</strong> You'll be redirected to Portal Bridge to complete the transfer
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}