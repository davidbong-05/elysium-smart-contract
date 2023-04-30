const hre = require("hardhat");

async function main() {
	const Factory = await hre.ethers.getContractFactory("ElysiumNFTFactory");
	const factory = await Factory.deploy();
	await factory.deployed();

	const Market = await hre.ethers.getContractFactory("ElysiumNFTMarketplace");
	const platformFee = 10; //wei
	const market = await Market.deploy(platformFee, factory.address);
	await market.deployed();

	console.log(`Elysium smart contract deployed to ${market.address}`);
	console.log(`NFT Factory smart contract deployed to ${factory.address}`);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
