require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  networks: {
    ethereum_sepolia: {
      url: process.env.ETHEREUM_SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
    polygon_amoy: {
      url: process.env.POLYGON_AMOY_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
    localhost: {
      url: "http://localhost:8545",
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
