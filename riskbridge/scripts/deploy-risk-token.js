const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying RiskToken...");

  // Get the contract factory
  const RiskToken = await ethers.getContractFactory("RiskToken");

  // Deploy the contract
  const riskToken = await RiskToken.deploy();
  await riskToken.waitForDeployment();

  const address = await riskToken.getAddress();
  console.log("RiskToken deployed to:", address);

  // Get deployer address
  const [deployer] = await ethers.getSigners();
  console.log("Deployed by:", deployer.address);

  // Get initial balance
  const balance = await riskToken.balanceOf(deployer.address);
  console.log("Initial balance:", ethers.formatEther(balance), "RISK");

  // Verify contract if on a testnet
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await riskToken.deploymentTransaction().wait(5);
    
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
      console.log("Contract verified successfully");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }

  return address;
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;