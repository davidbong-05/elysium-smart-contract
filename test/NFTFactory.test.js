const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("NFT Contract", function () {
	async function deployNFTFactoryFixture() {
		const [owner, addr1, addr2] = await ethers.getSigners();
		const Factory = await hre.ethers.getContractFactory("ElysiumNFTFactory");
		const factory = await Factory.deploy();
		await factory.deployed();

		return {
			factory,
			owner,
			addr1,
			addr2,
		};
	}

	describe("Transactions", function () {
		it("Should deploy NFT contract", async function () {
			const { factory, owner } = await loadFixture(deployNFTFactoryFixture);
			const name = "Elysium NFT";
			const symbol = "ENFT";
			const royaltyFee = 10; //wei
			await factory.createNFTCollection(
				name,
				symbol,
				royaltyFee,
				owner.address
			);
			const collections = await factory.getOwnCollections();
			expect(await collections.length).to.equal(1);
		});

		it("Should identify if the NFT is created from the factory", async function () {
			const { factory, owner } = await loadFixture(deployNFTFactoryFixture);
			const name = "Elysium NFT";
			const symbol = "ENFT";
			const royaltyFee = 10; //wei
			await factory.createNFTCollection(
				name,
				symbol,
				royaltyFee,
				owner.address
			);
			const collections = await factory.getOwnCollections();
			const isElysium = await factory.isElysiumNFT(collections[0]);
			expect(isElysium).to.equal(true);
		});

		it("Should identify if the NFT is not created from to the factory", async function () {
			const { factory } = await loadFixture(deployNFTFactoryFixture);
			const isElysium = await factory.isElysiumNFT(
				"0x6802669e33c20E371dE7A33Fc74aF8534eDAfA57"
			);
			expect(isElysium).to.equal(false);
		});
	});
});
