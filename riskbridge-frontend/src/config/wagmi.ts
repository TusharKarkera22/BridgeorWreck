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
    bridge: '0x91Ac61f7F9c2c06Fe3887987bD494483B39492AB', // CrossChainRiskBridge on Base Sepolia
    token: '0x05b601DD38C04911bf86F067e0Fb6CfF8Bfc961b', // RiskToken address on Base Sepolia
  },
  [arbitrumSepolia.id]: {
    bridge: '0xE6E6A79B8cdc5b5787A2df5A026ed513903BB6e5', // CrossChainRiskBridge on Arbitrum Sepolia
    token: '0x263A11de756e2595FCA1bAE1fb15ba32b77974dd', // RiskToken address on Arbitrum Sepolia
  },
};

// LayerZero Chain IDs
export const LAYERZERO_CHAIN_IDS = {
  [baseSepolia.id]: 40245,
  [arbitrumSepolia.id]: 40231,
};