export const BRIDGE_ADDRESS = '0xD669D9dFa9C15522F10b06BCe581098358429aFA' as const;

// USDC token address on Base Sepolia
export const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as const;

export const BRIDGE_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "_entropy", "type": "address"},
      {"internalType": "address", "name": "_token", "type": "address"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "leveragePercent", "type": "uint256"}],
    "name": "placeBet",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserBalance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserBetStatus",
    "outputs": [
      {"internalType": "bool", "name": "hasPendingBet", "type": "bool"},
      {"internalType": "bytes32", "name": "requestId", "type": "bytes32"},
      {"internalType": "uint256", "name": "leveragePercent", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "Deposited",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "leveragePercent", "type": "uint256"},
      {"indexed": false, "internalType": "bytes32", "name": "requestId", "type": "bytes32"}
    ],
    "name": "BetPlaced",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "bool", "name": "won", "type": "bool"},
      {"indexed": false, "internalType": "uint256", "name": "betAmount", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "newBalance", "type": "uint256"}
    ],
    "name": "BetResolved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "Withdrawn",
    "type": "event"
  }
] as const;