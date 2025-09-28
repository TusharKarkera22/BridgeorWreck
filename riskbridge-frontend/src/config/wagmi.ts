import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia, arbitrumSepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Bridge',
  projectId: 'YOUR_PROJECT_ID', // Get this from WalletConnect Cloud
  chains: [baseSepolia, arbitrumSepolia],
  ssr: false,
});

// Contract addresses for different chains
export const CONTRACT_ADDRESSES = {
  [baseSepolia.id]: {
    bridge: '0x88A2AaDe4666903fDab0d9BC986Ed8cad521C3b8', // CrossChainRiskBridge on Base Sepolia
    token: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC token address on Base Sepolia
  },
  [arbitrumSepolia.id]: {
    bridge: '0x9F1A1E32EeBEdB21f3Ca34200A1DE5E98a6f7f9C', // CrossChainRiskBridge on Arbitrum Sepolia
    token: '0xf3c3351d6bd0098eeb33ca8f830faf2a141ea2e1', // USDC token address on Arbitrum Sepolia
  },
};

// LayerZero Chain IDs
export const LAYERZERO_CHAIN_IDS = {
  [baseSepolia.id]: 40245,
  [arbitrumSepolia.id]: 40231,
};