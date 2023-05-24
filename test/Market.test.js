const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("NFT Marketplace Contract", function () {
	async function deployMarketFixture() {
		const [owner, addr1, addr2] = await ethers.getSigners();
		const Factory = await hre.ethers.getContractFactory("ElysiumNFTFactory");
		const factory = await Factory.deploy();
		await factory.deployed();

		const Market = await ethers.getContractFactory("ElysiumNFTMarketplace");
		const platformFee = 10; //wei
		const market = await Market.deploy(platformFee, factory.address);
		await market.deployed();

		return { market, factory, owner, addr1, addr2, platformFee };
	}

	describe("Deployment", function () {
		it("Should set the right owner", async function () {
			const { market, owner } = await loadFixture(deployMarketFixture);
			expect(await market.owner()).to.equal(owner.address);
		});

		it("Should set the right platform fee recipient", async function () {
			const { market, owner } = await loadFixture(deployMarketFixture);
			expect(await market.getFeeRecipient()).to.equal(owner.address);
		});

		it("Should set the right platform fee", async function () {
			const { market, platformFee } = await loadFixture(deployMarketFixture);
			expect(await market.getPlatformFee()).to.equal(platformFee);
		});
	});

	describe("Managements", function () {
		it("Should update platform fee", async function () {
			const { market } = await loadFixture(deployMarketFixture);
			const newPlatformFee = 100; //wei
			await market.updatePlatformFee(newPlatformFee);
			expect(await market.getPlatformFee()).to.equal(newPlatformFee);
		});

		it("Should change platform fee recipient", async function () {
			const { market, addr1 } = await loadFixture(deployMarketFixture);
			await market.changeFeeRecipient(addr1.address);
			expect(await market.getFeeRecipient()).to.equal(addr1.address);
		});
	});

	describe("Transactions", function () {
		it("Should update platform fee", async function () {
			const { market } = await loadFixture(deployMarketFixture);
			const newPlatformFee = 100; //wei
			await market.updatePlatformFee(newPlatformFee);
			expect(await market.getPlatformFee()).to.equal(newPlatformFee);
		});
	});
});
