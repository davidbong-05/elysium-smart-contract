require("@nomicfoundation/hardhat-toolbox");

const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
// const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("NFT Contract", function () {
  async function deployNftFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const Nft = await hre.ethers.getContractFactory("ElysiumToken");
    const royaltyFee = 10; //wei
    const name = "Elysium NFT";
    const symbol = "EST";
    const nft = await Nft.deploy(
      name,
      symbol,
      owner.address,
      royaltyFee,
      owner.address
    );

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

  async function mintNftFixture() {
    const { nft, owner } = await loadFixture(deployNftFixture);
    const tokenUri = "QmRaWcj4SsKuYyaemp7upnjHxk44AtC13JBvzwGH3YbJzc";
    const tokenTxn = await nft.safeMint(owner.address, tokenUri);
    const receipt = await tokenTxn.wait();
    const tokenId = receipt.logs[0].topics[3];

    return { nft, owner, tokenId, tokenUri };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { nft, owner } = await loadFixture(deployNftFixture);
      expect(await nft.owner()).to.equal(owner.address);
    });
    it("Should set the right name", async function () {
      const { nft, name } = await loadFixture(deployNftFixture);
      expect(await nft.name()).to.equal(name);
    });
    it("Should set the right symbol", async function () {
      const { nft, symbol } = await loadFixture(deployNftFixture);
      expect(await nft.symbol()).to.equal(symbol);
    });
    it("Should set the right royalty fee", async function () {
      const { nft, royaltyFee } = await loadFixture(deployNftFixture);
      expect(await nft.getRoyalty()).to.equal(royaltyFee);
    });
    it("Should set the right royalty recipient", async function () {
      const { nft, owner } = await loadFixture(deployNftFixture);
      expect(await nft.getRoyaltyRecipient()).to.equal(owner.address);
    });
  });

  describe("Managements", function () {
    it("Should update royalty fee", async function () {
      const { nft } = await loadFixture(deployNftFixture);
      const newRoyaltyFee = 100; //wei
      await nft.updateRoyalty(newRoyaltyFee);
      expect(await nft.getRoyalty()).to.equal(newRoyaltyFee);
    });
  });

  describe("Minting NFT", function () {
    it("Should mint NFT to the right owner", async function () {
      const { nft, owner, tokenId } = await loadFixture(mintNftFixture);
      expect(await nft.ownerOf(tokenId)).to.equal(owner.address);
    });
    it("Should mint NFT right uri", async function () {
      const { nft, tokenId, tokenUri } = await loadFixture(mintNftFixture);
      expect(await nft.tokenURI(tokenId)).to.equal(tokenUri);
    });
  });

  describe("Burn NFT", function () {
    it("Should burn NFT", async function () {
      const { nft, tokenId } = await loadFixture(mintNftFixture);
      await nft.burn(tokenId);
      expect(await nft.totalSupply()).to.equal(0);
    });
  });
});
