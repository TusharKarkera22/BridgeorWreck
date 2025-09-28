# RiskBridge Deployment & Testing Guide

## 🎯 Project Overview

RiskBridge is a cross-chain gambling dApp that combines:
- **Base Chain**: Smart contract deployment with Pyth Entropy for randomness
- **Solana Integration**: Cross-chain bridging via Wormhole Portal
- **Modern Frontend**: Vite + TypeScript + Wagmi + RainbowKit

## 📋 Deployed Contracts

### RiskBridge Contract
- **Address**: `0x9F1A1E32EeBEdB21f3Ca34200A1DE5E98a6f7f9C`
- **Network**: Base Sepolia Testnet
- **Features**: 
  - ERC-20 token deposits/withdrawals
  - Variable leverage betting (5-25%)
  - Pyth Entropy integration for randomness
  - Real-time event emission

## 🚀 Testing the Complete Flow

### 1. Prerequisites
- MetaMask wallet with Base Sepolia testnet configured
- Test ETH for gas fees on Base Sepolia
- ERC-20 test tokens (USDC or custom TestUSDC)

### 2. Frontend Testing Steps

#### Connect Wallet
1. Open the frontend at `http://localhost:5173/`
2. Click "Connect Wallet" and select MetaMask
3. Switch to Base Sepolia network if prompted

#### Deposit Tokens
1. Enter deposit amount in the "Deposit" section
2. Click "Deposit" and confirm the transaction
3. Wait for transaction confirmation
4. Verify balance updates in the UI

#### Place Bets
1. Adjust leverage slider (5-25%)
2. Review bet amount calculation
3. Click "Place Bet" (requires 0.001 ETH fee for Pyth Entropy)
4. Confirm transaction and wait for randomness callback
5. Watch for BetResolved events in the "Recent Bet Results" feed

#### Withdraw Funds
1. Enter withdrawal amount
2. Click "Withdraw" and confirm transaction
3. Verify balance updates

### 3. Cross-Chain Bridge Testing

#### Using Wormhole Portal (Recommended)
1. Click "Open Wormhole Portal Bridge" in the frontend
2. Visit https://portalbridge.com/#/transfer
3. Connect Base wallet (MetaMask) and Solana wallet (Phantom)
4. Select source chain (Base) and destination (Solana)
5. Choose token and amount to bridge
6. Complete the transfer process

## 🔧 Technical Implementation

### Smart Contract Features
```solidity
// Key functions implemented:
- deposit(uint256 amount)           // Deposit ERC-20 tokens
- placeBet(uint256 leveragePercent) // Place bet with leverage
- withdraw(uint256 amount)          // Withdraw winnings
- fulfillRandomness(...)            // Pyth Entropy callback
```

### Frontend Features
- **Wallet Connection**: RainbowKit integration
- **Real-time Updates**: Contract event listening
- **Bet Results Feed**: Live win/lose tracking
- **Cross-chain Bridge**: Wormhole Portal integration
- **Modern UI**: Glassmorphism design with animations

### Event Monitoring
The frontend listens for `BetResolved` events:
```typescript
useWatchContractEvent({
  address: RISKBRIDGE_ADDRESS,
  abi: RISKBRIDGE_ABI,
  eventName: 'BetResolved',
  onLogs(logs) {
    // Display real-time bet results
  }
})
```

## 🎮 Betting Mechanics

### Leverage Calculation
- **Bet Amount** = (User Balance × Leverage Percentage) / 100
- **Win**: Balance += Bet Amount
- **Lose**: Balance -= Bet Amount

### Example Scenarios
1. **Deposit**: 100 TUSDC
2. **5% Leverage Bet**: Risk 5 TUSDC
   - Win: Balance becomes 105 TUSDC
   - Lose: Balance becomes 95 TUSDC
3. **25% Leverage Bet**: Risk 25 TUSDC
   - Win: Balance becomes 125 TUSDC
   - Lose: Balance becomes 75 TUSDC

## 🌉 Cross-Chain Integration

### Wormhole Portal Bridge
- **Purpose**: Transfer tokens between Base and Solana
- **Process**: Lock → Mint → Burn → Unlock
- **Time**: ~15 minutes for finality
- **Supported Tokens**: USDC, ETH, and other major tokens

### Integration Points
1. **Funding**: Bridge tokens from Solana to Base for betting
2. **Cashout**: Bridge winnings from Base back to Solana
3. **Demonstration**: Show cross-chain capabilities

## 🛠 Development Commands

### Frontend Development
```bash
cd riskbridge-frontend
npm install
npm run dev          # Start development server
npm run build        # Build for production
```

### Smart Contract Development
```bash
cd riskbridge
yarn install
yarn build           # Compile contracts
yarn deploy          # Deploy to testnet
```

## 🔍 Troubleshooting

### Common Issues
1. **Transaction Fails**: Check gas fees and token approvals
2. **Events Not Showing**: Verify contract address and network
3. **Bridge Issues**: Ensure both wallets are connected
4. **Balance Not Updating**: Wait for block confirmation

### Network Configuration
- **Chain ID**: 84532 (Base Sepolia)
- **RPC URL**: https://sepolia.base.org
- **Block Explorer**: https://sepolia-explorer.base.org

## 📚 Resources

- [Pyth Entropy Documentation](https://docs.pyth.network/entropy)
- [Wormhole Portal Bridge](https://portalbridge.com)
- [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
- [Thirdweb Documentation](https://portal.thirdweb.com)

## ✅ Success Criteria

The project is successfully deployed when:
- ✅ Smart contract deployed and verified on Base Sepolia
- ✅ Frontend connects to wallet and displays balance
- ✅ Users can deposit, bet, and withdraw tokens
- ✅ Bet results are displayed in real-time
- ✅ Wormhole bridge integration is accessible
- ✅ Cross-chain token transfers work via Portal Bridge

## 🎉 Demo Flow

1. **Setup**: Connect MetaMask to Base Sepolia
2. **Fund**: Get test tokens and ETH
3. **Deposit**: Add tokens to RiskBridge contract
4. **Bet**: Choose leverage and place bet
5. **Results**: Watch real-time win/lose outcomes
6. **Bridge**: Demonstrate cross-chain transfer via Wormhole
7. **Withdraw**: Cash out winnings to wallet