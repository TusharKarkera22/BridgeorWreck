const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🔗 Setting up trusted remotes for CrossChainRiskBridge...\n");

  // Contract addresses (update these after deployment)
  const contracts = {
    baseSepolia: {
      address: "0x...", // Update with actual deployed address
      lzChainId: 40245
    },
    arbitrumSepolia: {
      address: "0x...", // Update with actual deployed address  
      lzChainId: 40231
    }
  };

  const currentNetwork = hre.network.name;
  
  if (!contracts[currentNetwork]) {
    throw new Error(`Unsupported network: ${currentNetwork}. Please use baseSepolia or arbitrumSepolia.`);
  }

  const currentContract = contracts[currentNetwork];
  const remoteNetwork = currentNetwork === "baseSepolia" ? "arbitrumSepolia" : "baseSepolia";
  const remoteContract = contracts[remoteNetwork];

  console.log(`📍 Current network: ${currentNetwork}`);
  console.log(`🏠 Local contract: ${currentContract.address}`);
  console.log(`🌐 Remote network: ${remoteNetwork}`);
  console.log(`🔗 Remote contract: ${remoteContract.address}\n`);

  // Get contract instance
  const CrossChainRiskBridge = await ethers.getContractFactory("CrossChainRiskBridge");
  const contract = CrossChainRiskBridge.attach(currentContract.address);

  // Encode the remote contract address as bytes32
  const remoteAddressBytes32 = ethers.zeroPadValue(remoteContract.address, 32);

  console.log("⏳ Setting trusted remote...");
  console.log(`Remote Chain ID: ${remoteContract.lzChainId}`);
  console.log(`Remote Address (bytes32): ${remoteAddressBytes32}`);

  // Set trusted remote
  const tx = await contract.setTrustedRemote(
    remoteContract.lzChainId,
    remoteAddressBytes32
  );

  console.log(`🔄 Transaction submitted: ${tx.hash}`);
  await tx.wait();

  console.log("✅ Trusted remote set successfully!");
  
  // Verify the trusted remote was set
  const trustedRemote = await contract.trustedRemoteLookup(remoteContract.lzChainId);
  console.log(`🔍 Verified trusted remote: ${trustedRemote}`);

  console.log("\n📋 Summary:");
  console.log(`- Network: ${currentNetwork}`);
  console.log(`- Local Contract: ${currentContract.address}`);
  console.log(`- Remote Chain ID: ${remoteContract.lzChainId}`);
  console.log(`- Remote Address: ${remoteContract.address}`);
  console.log(`- Transaction: ${tx.hash}`);

  console.log("\n🔧 Next Steps:");
  console.log(`1. Run this script on ${remoteNetwork} to set the reverse trusted remote`);
  console.log("2. Test cross-chain messaging between contracts");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  });