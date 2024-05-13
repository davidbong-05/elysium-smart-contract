require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	solidity: "0.8.17",
	networks: {
		sepolia: {
			url: process.env.SEPOLIA_RPC_URL,
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
