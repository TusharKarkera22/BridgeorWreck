const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🚀 Starting CrossChainRiskBridge deployment...\n");

  // Network configurations
  const networks = {
    baseSepolia: {
      name: "Base Sepolia",
      lzEndpoint: process.env.BASE_SEPOLIA_LZ_ENDPOINT || "0x6EDCE65403992e310A62460808c4b910D972f10f",
      entropy: process.env.BASE_SEPOLIA_ENTROPY || "0x41c9e39574F40Ad34c79f1C99B66A45eFB830d4c",
      usdc: process.env.BASE_SEPOLIA_USDC || "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      lzChainId: 40245 // Base Sepolia LayerZero Chain ID
    },
    arbitrumSepolia: {
      name: "Arbitrum Sepolia",
      lzEndpoint: process.env.ARBITRUM_SEPOLIA_LZ_ENDPOINT || "0x6EDCE65403992e310A62460808c4b910D972f10f",
      entropy: process.env.ARBITRUM_SEPOLIA_ENTROPY || "0x549Ebba8036Ab746611B4fFA1423eb0A4Df61440",
      usdc: process.env.ARBITRUM_SEPOLIA_USDC || "0xf3c3351d6bd0098eeb33ca8f830faf2a141ea2e1",
      lzChainId: 40231 // Arbitrum Sepolia LayerZero Chain ID
    }
  };

  const currentNetwork = hre.network.name;
  const config = networks[currentNetwork];

  if (!config) {
    throw new Error(`Unsupported network: ${currentNetwork}. Please use baseSepolia or arbitrumSepolia.`);
  }

  console.log(`📍 Deploying to ${config.name}`);
  console.log(`🔗 LayerZero Endpoint: ${config.lzEndpoint}`);
  console.log(`🎲 Pyth Entropy: ${config.entropy}`);
  console.log(`💰 USDC Token: ${config.usdc}\n`);

  // Get the contract factory
  const CrossChainRiskBridge = await ethers.getContractFactory("CrossChainRiskBridge");

  // Deploy the contract
  console.log("⏳ Deploying CrossChainRiskBridge...");
  const crossChainRiskBridge = await CrossChainRiskBridge.deploy(
    config.entropy,
    config.usdc,
    config.lzEndpoint
  );

  await crossChainRiskBridge.waitForDeployment();
  const contractAddress = await crossChainRiskBridge.getAddress();

  console.log(`✅ CrossChainRiskBridge deployed to: ${contractAddress}`);
  console.log(`🔍 Transaction hash: ${crossChainRiskBridge.deploymentTransaction().hash}\n`);

  // Save deployment info
  const deploymentInfo = {
    network: currentNetwork,
    networkName: config.name,
    contractAddress: contractAddress,
    lzEndpoint: config.lzEndpoint,
    entropy: config.entropy,
    usdc: config.usdc,
    lzChainId: config.lzChainId,
    deploymentHash: crossChainRiskBridge.deploymentTransaction().hash,
    timestamp: new Date().toISOString()
  };

  console.log("📋 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  console.log("\n🔧 Next Steps:");
  console.log("1. Deploy to the other network (Base Sepolia or Arbitrum Sepolia)");
  console.log("2. Set trusted remotes between both contracts");
  console.log("3. Update frontend CONTRACT_ADDRESSES with deployed addresses");
  console.log("4. Test cross-chain functionality");

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });