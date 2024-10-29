const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const PLATFORM_FEE = 1_000_000_000n; //1 GWEI

module.exports = buildModule("ElysiumTokenMarketplaceModule", (m) => {
  const platformFee = m.getParameter("platformFee", PLATFORM_FEE);

  //Need to deploy the token contract to get the artifacts
  const token = m.contract("ElysiumToken", [
    "Elysium Prestige Collection",
    "EPC",
    "0x36c4406399ed3D79f6BAca37720c188d4353d5f0",
    0,
    "0x36c4406399ed3D79f6BAca37720c188d4353d5f0",
  ]);

  const factory = m.contract("ElysiumTokenFactory");

  const marketplace = m.contract("ElysiumTokenMarketplace", [
    platformFee,
    factory,
  ]);

  return { token, factory, marketplace };
});

//RUN npx hardhat ignition deploy ignition/modules/ElysiumTokenMarketplace.js --network localhost to deploy
