const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Nft Factory Contract", function () {
  async function deployNftFactoryFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const Factory = await hre.ethers.getContractFactory("ElysiumTokenFactory");
    const factory = await Factory.deploy();

    return {
      factory,
      owner,
      addr1,
      addr2,
    };
  }

  describe("Transactions", function () {
    it("Should deploy NFT contract", async function () {
      const { factory, owner } = await loadFixture(deployNftFactoryFixture);
      const name = "Elysium NFT";
      const symbol = "EST";
      const royaltyFee = 10; //wei
      await factory.createCollection(name, symbol, royaltyFee, owner.address);
      const collections = await factory.getUserCollections(owner.address);
      expect(await collections.length).to.equal(1);
    });

    it("Should identify if the NFT is created from the factory", async function () {
      const { factory, owner } = await loadFixture(deployNftFactoryFixture);
      const name = "Elysium NFT";
      const symbol = "EST";
      const royaltyFee = 10; //wei
      await factory.createCollection(name, symbol, royaltyFee, owner.address);
      const collections = await factory.getUserCollections(owner.address);
      const isElysium = await factory.isElysiumCollection(collections[0]);
      expect(isElysium).to.equal(true);
    });

    it("Should identify if the NFT is not created from to the factory", async function () {
      const { factory } = await loadFixture(deployNftFactoryFixture);
      const isElysium = await factory.isElysiumCollection(
        "0x6802669e33c20E371dE7A33Fc74aF8534eDAfA57"
      );
      expect(isElysium).to.equal(false);
    });
  });
});
