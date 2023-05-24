const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("NFT Contract", function () {
	async function deployNFTFixture() {
		const [owner, addr1, addr2] = await ethers.getSigners();
		const NFT = await hre.ethers.getContractFactory("ElysiumNFT");
		const royaltyFee = 10; //wei
		const name = "Elysium NFT";
		const symbol = "ENFT";
		const nft = await NFT.deploy(
			name,
			symbol,
			owner.address,
			royaltyFee,
			owner.address
		);
		await nft.deployed();

		return {
			nft,
			owner,
			addr1,
			addr2,
			name,
			symbol,
			royaltyFee,
		};
	}

	describe("Deployment", function () {
		it("Should set the right owner", async function () {
			const { nft, owner } = await loadFixture(deployNFTFixture);
			expect(await nft.owner()).to.equal(owner.address);
		});
		it("Should set the right name", async function () {
			const { nft, name } = await loadFixture(deployNFTFixture);
			expect(await nft.name()).to.equal(name);
		});
		it("Should set the right symbol", async function () {
			const { nft, symbol } = await loadFixture(deployNFTFixture);
			expect(await nft.symbol()).to.equal(symbol);
		});
		it("Should set the right royalty fee", async function () {
			const { nft, royaltyFee } = await loadFixture(deployNFTFixture);
			expect(await nft.getRoyalty()).to.equal(royaltyFee);
		});
		it("Should set the right royalty recipient", async function () {
			const { nft, owner } = await loadFixture(deployNFTFixture);
			expect(await nft.getRoyaltyRecipient()).to.equal(owner.address);
		});
	});

	describe("Transactions", function () {
		it("Should mint NFT", async function () {
			const { nft, owner } = await loadFixture(deployNFTFixture);
			const tokenUri = "QmRaWcj4SsKuYyaemp7upnjHxk44AtC13JBvzwGH3YbJzc";
			const tokenTxn = await nft.safeMint(owner.address, tokenUri);
			const receipt = await tokenTxn.wait();
			const tokenId = receipt.logs[0].topics[3];
			expect(await nft.tokenURI(tokenId)).to.equal(tokenUri);
		});
	});
});
