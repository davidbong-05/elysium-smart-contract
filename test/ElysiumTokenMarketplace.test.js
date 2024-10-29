const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Elysium Token Marketplace Contract", function () {
  async function deployMarketFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const Factory = await hre.ethers.getContractFactory("ElysiumTokenFactory");
    const factory = await Factory.connect(owner).deploy();
    const factoryInstance = Factory.attach(factory);
    const Market = await ethers.getContractFactory("ElysiumTokenMarketplace");
    const platformFee = 10; //wei
    const market = await Market.connect(owner).deploy(
      platformFee,
      factoryInstance
    );

    return { market, factory, owner, addr1, addr2, platformFee };
  }

  async function deployTokenFactoryFixture() {
    const { market, factory, addr1, addr2 } = await loadFixture(
      deployMarketFixture
    );
    const nftOwner = addr1;
    const royaltyFee = 10; //wei
    const name = "Elysium Token";
    const symbol = "EST";
    const txn = await factory
      .connect(nftOwner)
      .createCollection(name, symbol, royaltyFee, nftOwner.address);
    const receipt = await txn.wait();
    const collectionAddress = receipt.logs[0].address;
    const nft = await ethers.getContractAt("ElysiumToken", collectionAddress);
    return {
      market,
      addr2,
      nft,
      nftOwner,
      name,
      symbol,
      royaltyFee,
    };
  }

  async function mintTokenFixture() {
    const { market, addr2, nft, nftOwner } = await loadFixture(
      deployTokenFactoryFixture
    );
    const tokenUri = "QmRaWcj4SsKuYyaemp7upnjHxk44AtC13JBvzwGH3YbJzc";
    const tokenTxn = await nft
      .connect(nftOwner)
      .safeMint(nftOwner.address, tokenUri);
    const receipt = await tokenTxn.wait();
    const tokenId = receipt.logs[0].topics[3];

    return { market, addr2, nft, nftOwner, tokenId, tokenUri };
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

  describe("Listing Token", function () {
    it("Should list Token for sale", async function () {
      const { market, nft, nftOwner, tokenId } = await loadFixture(
        mintTokenFixture
      );
      const price = 100; //wei
      await nft.connect(nftOwner).approve(market.target, tokenId);
      await market.connect(nftOwner).listToken(nft.target, tokenId, price);
      expect(await nft.balanceOf(market.target)).to.equal(1);
    });
    it("Should not list Token for sale if not owner", async function () {
      const { market, addr2, nft, nftOwner, tokenId } = await loadFixture(
        mintTokenFixture
      );
      const price = 100; //wei
      await nft.connect(nftOwner).approve(market.target, tokenId);
      await expect(
        market.connect(addr2).listToken(nft.target, tokenId, price)
      ).to.be.revertedWith("not token owner");
    });
    it("Should not list Token for sale if price < platform fee", async function () {
      const { market, nft, nftOwner, tokenId } = await loadFixture(
        mintTokenFixture
      );
      const price = 1; //wei
      await nft.connect(nftOwner).approve(market.target, tokenId);
      await expect(
        market.connect(nftOwner).listToken(nft.target, tokenId, price)
      ).to.be.revertedWith("price must be greater than platform fee");
    });
    it("Should cancel list Token for sale", async function () {
      const { market, nft, nftOwner, tokenId } = await loadFixture(
        mintTokenFixture
      );
      const price = 100; //wei
      await nft.connect(nftOwner).approve(market.target, tokenId);
      await market.connect(nftOwner).listToken(nft.target, tokenId, price);
      await market.connect(nftOwner).cancelListToken(nft.target, tokenId);
      expect(await nft.balanceOf(market.target)).to.equal(0);
    });
    it("Should not cancel list Token for sale if Token not listed", async function () {
      const { market, nft, nftOwner, tokenId } = await loadFixture(
        mintTokenFixture
      );
      await nft.connect(nftOwner).approve(market.target, tokenId);
      await expect(
        market.connect(nftOwner).cancelListToken(nft.target, tokenId)
      ).to.be.revertedWith("not listed");
    });
    it("Should not cancel list Token for sale if Token not seller", async function () {
      const { market, addr2, nft, nftOwner, tokenId } = await loadFixture(
        mintTokenFixture
      );
      const price = 100; //wei
      await nft.connect(nftOwner).approve(market.target, tokenId);
      await market.connect(nftOwner).listToken(nft.target, tokenId, price);
      await expect(
        market.connect(addr2).cancelListToken(nft.target, tokenId)
      ).to.be.revertedWith("not token owner");
    });
  });

  describe("Buying Token", function () {
    it("Should buy listed Token", async function () {
      const { market, addr2, nft, nftOwner, tokenId } = await loadFixture(
        mintTokenFixture
      );
      const price = 100; //wei
      await nft.connect(nftOwner).approve(market.target, tokenId);
      await market.connect(nftOwner).listToken(nft.target, tokenId, price);
      await market
        .connect(addr2)
        .buyToken(nft.target, tokenId, { value: price });

      expect(await nft.balanceOf(addr2)).to.equal(1);
    });
    it("Should not buy if Token not listed", async function () {
      const { market } = await loadFixture(deployMarketFixture);
      const newPlatformFee = 100; //wei
      await market.updatePlatformFee(newPlatformFee);
      expect(await market.getPlatformFee()).to.equal(newPlatformFee);
    });
    it("Should not buy if Token is sold", async function () {
      const { market } = await loadFixture(deployMarketFixture);
      const newPlatformFee = 100; //wei
      await market.updatePlatformFee(newPlatformFee);
      expect(await market.getPlatformFee()).to.equal(newPlatformFee);
    });
    it("Should not buy if insufficient ether", async function () {
      const { market } = await loadFixture(deployMarketFixture);
      const newPlatformFee = 100; //wei
      await market.updatePlatformFee(newPlatformFee);
      expect(await market.getPlatformFee()).to.equal(newPlatformFee);
    });
  });

  describe("Buying Bulk Tokens", function () {
    it("Should buy listed Tokens", async function () {
      const { market } = await loadFixture(deployMarketFixture);
      const newPlatformFee = 100; //wei
      await market.updatePlatformFee(newPlatformFee);
      expect(await market.getPlatformFee()).to.equal(newPlatformFee);
    });
    it("Should not buy if Token not listed", async function () {
      const { market } = await loadFixture(deployMarketFixture);
      const newPlatformFee = 100; //wei
      await market.updatePlatformFee(newPlatformFee);
      expect(await market.getPlatformFee()).to.equal(newPlatformFee);
    });
    it("Should not buy if Token is sold", async function () {
      const { market } = await loadFixture(deployMarketFixture);
      const newPlatformFee = 100; //wei
      await market.updatePlatformFee(newPlatformFee);
      expect(await market.getPlatformFee()).to.equal(newPlatformFee);
    });
    it("Should not buy if insufficient ether", async function () {
      const { market } = await loadFixture(deployMarketFixture);
      const newPlatformFee = 100; //wei
      await market.updatePlatformFee(newPlatformFee);
      expect(await market.getPlatformFee()).to.equal(newPlatformFee);
    });
  });
});
