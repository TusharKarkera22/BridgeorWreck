Base chain

Host the RiskBridge contract. Users deposit ERC-20 (e.g. USDC test token or ETH wrapped), choose leverage, and gamble.

Thirdweb + Solidity + Pyth Entropy

Pyth Entropy

Provides verifiable random numbers for win/lose.

Pyth Entropy contract on Base

Wormhole

Bridges tokens between Base and Solana.

Wormhole Portal (fast) or Wormhole TypeScript SDK

⚙️ Project Flow
Bridge Funding (Optional)

User bridges tokens from Solana → Base using Wormhole Portal to fund their Base wallet.

Deposit & Bet

User connects wallet in your Thirdweb React app.

Deposits ERC-20 into RiskBridge.

Chooses a leverage % (frontend input).

Contract calls Pyth Entropy for randomness.

Settlement

If win → deposit increases by +leverage%.

If lose → deposit decreases by -leverage%.

Cash Out / Bridge Back

User withdraws funds to Base wallet.

Uses Wormhole to bridge winnings back to Solana.

1️⃣ Smart Contract: 
RiskBridge.sol


Deploy this to Base with Thirdweb. Key features:

Variable Leverage: User supplies leveragePercent when betting (e.g. 5–25).

Pyth Entropy: Requests randomness and handles callback.

ERC-20 token deposit & withdrawal.



Pseudo-structure:

constructor(address _entropy, address _token) { ... }

function deposit(uint256 amount) external;
function placeBet(uint256 leveragePercent) external; // frontend picks %
function fulfillRandomness(bytes32 requestId, uint256 randomness) external; // Pyth Entropy callback
function withdraw(uint256 amount) external;
🔹 Bet Calculation

betAmount = (deposit * leveragePercent) / 100.

Win → deposit += betAmount.

Lose → deposit -= betAmount.



Pyth Entropy Base address: check docs here

(copy the Base contract address into your deploy constructor).

2️⃣ Deploy to Base with Thirdweb
Install Thirdweb CLI:

npm install -g thirdweb
Scaffold:

npx thirdweb create contract
# select Hardhat or Foundry
Add RiskBridge.sol to contracts/.

Deploy:

npx thirdweb deploy
Choose Base Goerli (for testnet) or Base Mainnet.

Pass constructor args:

entropy = Pyth Entropy contract address on Base.

token = ERC-20 token address (e.g. USDC test token you deploy with Thirdweb dashboard).



Thirdweb will auto-verify and create SDK bindings.

3️⃣ Frontend dApp (Thirdweb React)


Install:

npm install @thirdweb-dev/react @thirdweb-dev/sdk ethers
Key UI flows:

ConnectWallet (<ConnectWallet />) — connect Base wallet.

Deposit / Approve — approve + deposit.

Leverage Slider — user picks 5–25%.

Place Bet — call placeBet(leveragePercent).

Event Feed — listen to BetResolved events, show win/lose outcome.

Withdraw — call withdraw.

Bridge Button (optional) — trigger Wormhole bridging.



Example snippet:

<Web3Button
  contractAddress={RISKBRIDGE_ADDRESS}
  action={async (contract) => await contract.call("placeBet", leveragePercent)}
>
  Place Bet
</Web3Button>
Docs:

Thirdweb React

useContract / Web3Button examples

4️⃣ Wormhole Bridging (Base ↔ Solana)


⚡ Fast Demo (recommended for hackathon)


Use Portal Bridge UI:

👉 https://portalbridge.com/#/transfer

Connect Base wallet (MetaMask) and Solana wallet (Phantom).

Transfer tokens in or out.

Show cross-chain transfer live (guardians sign VAA behind the scenes).



💡 Integrated UX (if time)


Use Wormhole TypeScript SDK + WTT (Wrapped Token Transfers):

Install:

npm install @wormhole-foundation/sdk @wormhole-foundation/sdk-evm
In frontend, initialize Wormhole SDK with Base & Solana.

Call WTT methods:

Approve Wormhole bridge contract to spend tokens.

transfer → fetch VAA → redeem on Solana.

Docs & tutorial:

WTT Guide

5️⃣ Suggested Hackathon Timeline
Hour

Task

0–2

Scaffold Thirdweb contract, add RiskBridge.sol.

2–4

Deploy ERC-20 test token on Base with Thirdweb dashboard.

4–6

Deploy RiskBridge to Base Goerli (testnet).

6–10

Build Thirdweb React frontend: deposit, slider for leverage, place bet, withdraw.

10–12

Connect Pyth Entropy Base address and test randomness.

12–15

Demonstrate bridging with Wormhole Portal (Base ↔ Solana).

15–24

(Optional) Integrate Wormhole SDK for in-app Bridge button + polish UI.

🔗 Key Links
Pyth Entropy (Base): https://docs.pyth.network/entropy/generate-random-numbers/evm

Thirdweb Deploy: https://portal.thirdweb.com/deploy

Thirdweb React: https://portal.thirdweb.com/react

Wormhole Portal (UI): https://portalbridge.com

Wormhole SDK: https://docs.wormhole.com/wormhole/reference/sdk

✅ Final Deliverable
Base Contract: RiskBridge (Thirdweb) with Pyth Entropy randomness + variable leverage.

Thirdweb React App: Connect wallet → deposit → choose leverage → place bet → view result → withdraw.

Cross-Chain: Use Wormhole Portal (or SDK) to bridge tokens between Base and Solana.