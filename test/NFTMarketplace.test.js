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

	async function deployNFTFixture() {
		const { factory, addr1 } = await loadFixture(deployMarketFixture);
		const nftOwner = addr1;
		const royaltyFee = 10; //wei
		const name = "Elysium NFT";
		const symbol = "ENFT";
		const txn = await factory
			.connect(nftOwner)
			.createNFTCollection(name, symbol, royaltyFee, nftOwner.address);
		const receipt = await txn.wait();
		const nftAddress = receipt.logs[0].address;
		const nft = await ethers.getContractAt("ElysiumNFT", nftAddress);
		return {
			nft,
			nftOwner,
			name,
			symbol,
			royaltyFee,
		};
	}

	async function mintNFTFixture() {
		const { nft, nftOwner } = await loadFixture(deployNFTFixture);
		const tokenUri = "QmRaWcj4SsKuYyaemp7upnjHxk44AtC13JBvzwGH3YbJzc";
		const tokenTxn = await nft
			.connect(nftOwner)
			.safeMint(nftOwner.address, tokenUri);
		const receipt = await tokenTxn.wait();
		const tokenId = receipt.logs[0].topics[3];

		return { nft, nftOwner, tokenId, tokenUri };
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

	describe("Listing NFT", function () {
		it("Should list NFT for sale", async function () {
			const { market } = await loadFixture(deployMarketFixture);
			const { nft, nftOwner, tokenId } = await loadFixture(mintNFTFixture);
			const price = 100; //wei
			await nft.connect(nftOwner).approve(market.address, tokenId);
			await market.connect(nftOwner).listNft(nft.address, tokenId, price);
			expect(await nft.balanceOf(market.address)).to.equal(1);
		});
		it("Should not list NFT for sale if not owner", async function () {
			const { market, addr2 } = await loadFixture(deployMarketFixture);
			const { nft, nftOwner, tokenId } = await loadFixture(mintNFTFixture);
			const price = 100; //wei
			await nft.connect(nftOwner).approve(market.address, tokenId);
			await expect(
				market.connect(addr2).listNft(nft.address, tokenId, price)
			).to.be.revertedWith("not nft owner");
		});
		it("Should not list NFT for sale if price < platform fee", async function () {
			const { market } = await loadFixture(deployMarketFixture);
			const { nft, nftOwner, tokenId } = await loadFixture(mintNFTFixture);
			const price = 1; //wei
			await nft.connect(nftOwner).approve(market.address, tokenId);
			await expect(
				market.connect(nftOwner).listNft(nft.address, tokenId, price)
			).to.be.revertedWith("price must be greater than platform fee");
		});
		it("Should cancel list NFT for sale", async function () {
			const { market } = await loadFixture(deployMarketFixture);
			const { nft, nftOwner, tokenId } = await loadFixture(mintNFTFixture);
			const price = 100; //wei
			await nft.connect(nftOwner).approve(market.address, tokenId);
			await market.connect(nftOwner).listNft(nft.address, tokenId, price);
			await market.connect(nftOwner).cancelListNFT(nft.address, tokenId);
			expect(await nft.balanceOf(market.address)).to.equal(0);
		});
		it("Should not cancel list NFT for sale if NFT not listed", async function () {
			const { market } = await loadFixture(deployMarketFixture);
			const { nft, nftOwner, tokenId } = await loadFixture(mintNFTFixture);
			await nft.connect(nftOwner).approve(market.address, tokenId);
			await expect(
				market.connect(nftOwner).cancelListNFT(nft.address, tokenId)
			).to.be.revertedWith("not listed");
		});
		it("Should not cancel list NFT for sale if NFT not seller", async function () {
			const { market, addr2 } = await loadFixture(deployMarketFixture);
			const { nft, nftOwner, tokenId } = await loadFixture(mintNFTFixture);
			const price = 100; //wei
			await nft.connect(nftOwner).approve(market.address, tokenId);
			await market.connect(nftOwner).listNft(nft.address, tokenId, price);
			await expect(
				market.connect(addr2).cancelListNFT(nft.address, tokenId)
			).to.be.revertedWith("Only original owner can cancel listing");
		});
	});
});
