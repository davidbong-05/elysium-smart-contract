const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("ElysiumTokenFactoryModule", (m) => {
  const tokenFactory = m.contract("ElysiumTokenFactory");
  // m.call(tokenFactory, "createCollection", [
  //   "Elysium Prestige Collection",
  //   "EPC",
  //   0,
  //   msg.sender,
  // ]);

  return { tokenFactory };
});
