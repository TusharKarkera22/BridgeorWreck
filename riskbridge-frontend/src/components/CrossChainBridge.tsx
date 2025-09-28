import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useSwitchChain, useBalance } from 'wagmi';
import { parseEther, formatUnits, parseUnits, maxUint256 } from 'viem';
import { baseSepolia, arbitrumSepolia } from 'wagmi/chains';
import { CROSSCHAIN_BRIDGE_ABI } from '../contracts/CrossChainRiskBridge';
import { RISK_TOKEN_ABI } from '../contracts/RiskToken';
import { CONTRACT_ADDRESSES, LAYERZERO_CHAIN_IDS } from '../config/wagmi';

interface CrossChainBridgeProps {
  onClose: () => void;
}

export const CrossChainBridge: React.FC<CrossChainBridgeProps> = ({ onClose }) => {
  const { address, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const [leverageMultiplier, setLeverageMultiplier] = useState(2);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [depositAmount, setDepositAmount] = useState('100');
  const [errorMessage, setErrorMessage] = useState('');
  
  const { writeContract, data: hash } = useWriteContract();
  const { writeContract: writeApproval, data: approvalHash } = useWriteContract();
  
  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const { isSuccess: isApprovalConfirmed } = useWaitForTransactionReceipt({
    hash: approvalHash,
  });

  // Get user balance from the cross-chain contract
  const currentChainId = chain?.id;
  const contractAddress = currentChainId === baseSepolia.id 
    ? CONTRACT_ADDRESSES[baseSepolia.id]?.bridge
    : CONTRACT_ADDRESSES[arbitrumSepolia.id]?.bridge;

  const tokenAddress = currentChainId === baseSepolia.id 
    ? CONTRACT_ADDRESSES[baseSepolia.id]?.token
    : CONTRACT_ADDRESSES[arbitrumSepolia.id]?.token;

  const { data: userBalance } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: CROSSCHAIN_BRIDGE_ABI,
    functionName: 'getUserBalance',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!contractAddress }
  });

  // Get user's RiskToken balance
  const { data: riskTokenBalance } = useBalance({
    address: address,
    token: tokenAddress as `0x${string}`,
  });

  // Read user's RiskToken allowance for the cross-chain contract
  const { data: riskTokenAllowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: RISK_TOKEN_ABI,
    functionName: 'allowance',
    args: address && contractAddress ? [address as `0x${string}`, contractAddress as `0x${string}`] : undefined,
    query: { enabled: !!address && !!contractAddress && !!tokenAddress }
  });

  const handleApproveRiskToken = async () => {
    if (!address || !contractAddress || !tokenAddress) {
      setErrorMessage('Missing required addresses');
      return;
    }

    setIsApproving(true);
    setErrorMessage('');

    try {
      await writeApproval({
        address: tokenAddress as `0x${string}`,
        abi: RISK_TOKEN_ABI,
        functionName: 'approve',
        args: [contractAddress as `0x${string}`, maxUint256],
      });
    } catch (error: any) {
      console.error('Approval error:', error);
      setErrorMessage(error.message || 'Failed to approve RiskToken');
      setIsApproving(false);
    }
  };

  const handleDeposit = async () => {
    if (!address || !contractAddress) {
      setErrorMessage('Missing required addresses');
      return;
    }

    const amount = parseUnits(depositAmount, 18); // RiskToken has 18 decimals
    
    // Check if approval is needed
    if (!riskTokenAllowance || riskTokenAllowance < amount) {
      setErrorMessage('Please approve RiskToken spending first');
      return;
    }

    setIsDepositing(true);
    setErrorMessage('');

    try {
      await writeContract({
        address: contractAddress as `0x${string}`,
        abi: CROSSCHAIN_BRIDGE_ABI,
        functionName: 'deposit',
        args: [amount],
      });
    } catch (error: any) {
      console.error('Deposit failed:', error);
      setErrorMessage(`Deposit failed: ${error.message || 'Unknown error'}`);
      setIsDepositing(false);
    }
  };

  // Reset loading states when transactions are confirmed
  useEffect(() => {
    if (isConfirmed) {
      setIsPlacingBet(false);
      setIsDepositing(false);
      setErrorMessage('');
    }
  }, [isConfirmed]);

  useEffect(() => {
    if (isApprovalConfirmed) {
      setIsApproving(false);
      setErrorMessage('');
      refetchAllowance();
    }
  }, [isApprovalConfirmed, refetchAllowance]);

  const needsApproval = !riskTokenAllowance || riskTokenAllowance < parseUnits(depositAmount, 18);
  const hasInsufficientBalance = !riskTokenBalance || riskTokenBalance.value < parseUnits(depositAmount, 18);

  const handlePlaceCrossChainBet = async () => {
    if (!address || !userBalance || userBalance === 0n) {
      setErrorMessage('No balance available for cross-chain betting');
      return;
    }
    
    setIsPlacingBet(true);
    setErrorMessage('');
    
    try {
      const targetChainId = currentChainId === baseSepolia.id ? arbitrumSepolia.id : baseSepolia.id;
      const targetChain = LAYERZERO_CHAIN_IDS[targetChainId];
      const userRandomNumber = `0x${Math.random().toString(16).slice(2).padStart(64, '0')}` as `0x${string}`;
      const entropyFee = parseEther('0.001');
      
      writeContract({
        address: contractAddress as `0x${string}`,
        abi: CROSSCHAIN_BRIDGE_ABI,
        functionName: 'placeCrossChainBet',
        args: [BigInt(leverageMultiplier), userRandomNumber, targetChain],
        value: entropyFee,
      });
    } catch (err) {
      console.error('Error placing cross-chain bet:', err);
      setErrorMessage('Failed to place cross-chain bet');
      setIsPlacingBet(false);
    }
  };

  useEffect(() => {
    if (isConfirmed) {
      if (isPlacingBet) {
        setIsPlacingBet(false);
      }
    }
  }, [isConfirmed, isPlacingBet]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border-2 border-purple-400 rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-purple-400">🌉 Cross-Chain Bridge</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Current Chain Status */}
          <div className="bg-gray-800 p-4 rounded border border-gray-700">
            <h3 className="text-blue-400 font-semibold mb-2">🔗 Current Chain</h3>
            <p className="text-sm text-gray-300">
              {chain?.name || 'Unknown Chain'} - Balance: {userBalance ? formatUnits(userBalance, 18) : '0'} RISK
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Wallet RISK: {riskTokenBalance?.value ? formatUnits(riskTokenBalance.value, 18) : '0'} RISK
            </p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => switchChain({ chainId: baseSepolia.id })}
                className={`px-3 py-1 rounded text-xs ${
                  chain?.id === baseSepolia.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Base Sepolia
              </button>
              <button
                onClick={() => switchChain({ chainId: arbitrumSepolia.id })}
                className={`px-3 py-1 rounded text-xs ${
                  chain?.id === arbitrumSepolia.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Arbitrum Sepolia
              </button>
            </div>
          </div>

          {/* Deposit Section */}
          <div className="bg-gray-800 p-4 rounded border border-gray-700">
            <h3 className="text-green-400 font-semibold mb-2">💰 Deposit RISK</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-300 block mb-1">Amount (RISK):</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  placeholder="100"
                  min="0"
                  step="0.01"
                />
              </div>
              
              {hasInsufficientBalance && (
                <div className="text-red-400 text-xs">
                  ⚠️ Insufficient RISK balance
                </div>
              )}
              
              {needsApproval ? (
                <button
                  onClick={handleApproveRiskToken}
                  disabled={isApproving || hasInsufficientBalance}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded text-sm w-full font-semibold"
                >
                  {isApproving ? '⏳ Approving...' : '✅ Approve RISK'}
                </button>
              ) : (
                <button
                  onClick={handleDeposit}
                  disabled={isDepositing || hasInsufficientBalance}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded text-sm w-full font-semibold"
                >
                  {isDepositing ? '⏳ Depositing...' : '💰 Deposit RISK'}
                </button>
              )}
            </div>
          </div>

          {/* Cross-Chain Betting */}
          <div className="bg-gray-800 p-4 rounded border border-gray-700">
            <h3 className="text-yellow-400 font-semibold mb-2">🎲 Cross-Chain Betting</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-300 block mb-1">Leverage Multiplier:</label>
                <select
                  value={leverageMultiplier}
                  onChange={(e) => setLeverageMultiplier(Number(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                >
                  <option value={2}>2x Leverage</option>
                  <option value={3}>3x Leverage</option>
                  <option value={5}>5x Leverage</option>
                  <option value={10}>10x Leverage</option>
                </select>
              </div>
              
              {errorMessage && (
                <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded">
                  ⚠️ {errorMessage}
                </div>
              )}
              
              <button
                onClick={handlePlaceCrossChainBet}
                disabled={!userBalance || userBalance === 0n || isPlacingBet}
                className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white px-4 py-2 rounded text-sm w-full font-semibold"
              >
                {isPlacingBet ? (
                  '⏳ Placing Cross-Chain Bet...'
                ) : (
                  `🎲 Place ${leverageMultiplier}x Cross-Chain Bet`
                )}
              </button>
            </div>
          </div>

          {/* Cross-Chain Features */}
          <div className="bg-gray-800 p-4 rounded border border-gray-700">
            <h3 className="text-blue-400 font-semibold mb-2">🚀 Cross-Chain Features</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Bet on Base or Arbitrum, receive payouts on the same chain</li>
              <li>• Automatic LayerZero message relay</li>
              <li>• Powered by LayerZero & Pyth Entropy</li>
              <li>• Real-time cross-chain notifications</li>
            </ul>
          </div>

          {/* Instructions */}
          <div className="bg-blue-900/20 p-4 rounded border border-blue-500/30">
            <h4 className="text-blue-400 font-semibold mb-2">📋 How it works:</h4>
            <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
              <li>Choose your leverage multiplier</li>
              <li>Place a cross-chain bet from Base or Arbitrum</li>
              <li>Win or lose based on Pyth Entropy randomness</li>
              <li>Receive payouts directly to your connected wallet</li>
              <li>Cross-chain messages handled automatically via LayerZero</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};