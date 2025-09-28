require("@matterlabs/hardhat-zksync-solc");
require("@matterlabs/hardhat-zksync-verify");
require("@nomicfoundation/hardhat-toolbox");
require("@layerzerolabs/toolbox-hardhat");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  zksolc: {
    version: "1.4.1",
    compilerSource: "binary",
    settings: {
      optimizer: {
        enabled: true,
      },
    },
  },
  networks: {
    // Base Networks
    baseSepolia: {
      url: "https://sepolia.base.org",
      chainId: 84532,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    base: {
      url: "https://mainnet.base.org",
      chainId: 8453,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    // Arbitrum Networks
    arbitrumSepolia: {
      url: "https://sepolia-rollup.arbitrum.io/rpc",
      chainId: 421614,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    arbitrum: {
      url: "https://arb1.arbitrum.io/rpc",
      chainId: 42161,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    // ZkSync Networks (keeping existing)
    zkSyncSepoliaTestnet: {
      url: "https://sepolia.era.zksync.dev",
      ethNetwork: "sepolia",
      zksync: true,
      chainId: 300,
      verifyURL:
        "https://explorer.sepolia.era.zksync.dev/contract_verification",
    },
    zkSyncMainnet: {
      url: "https://mainnet.era.zksync.io",
      ethNetwork: "mainnet",
      zksync: true,
      chainId: 324,
      verifyURL:
        "https://zksync2-mainnet-explorer.zksync.io/contract_verification",
    },
  },
  paths: {
    artifacts: "./artifacts-zk",
    cache: "./cache-zk",
    sources: "./contracts",
    tests: "./test",
  },
  solidity: {
    version: "0.8.23",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
