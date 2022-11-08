const Dex = artifacts.require("Dex");
const ERC20Mock = artifacts.require("ERC20Mock");

const BUSD_MAINNET = "0x4Fabb145d64652a948d72533023f6E7A623C7C53";
const UNLOCKED_ACCOUNT = "0x6262998ced04146fa42253a5c0af90ca02dfd2a3";

module.exports = async function (deployer, networks, accounts) {
  const busd = await ERC20Mock.at(BUSD_MAINNET);

  // await deployer.deploy(ERC20Mock, "100000000000000000000", {
  //   from: accounts[1],
  // });
  // const busd = await ERC20Mock.deployed();

  // Create Dex Contract with 1 ether from the deployer account
  await deployer.deploy(Dex, {
    from: accounts[1],
    value: "10000000000000000000",
  });

  const dex = await Dex.deployed();

  // Transfer busd from unlocked account to Dex Contract
  await busd.transfer(dex.address, "1600000000000000000000", {
    from: UNLOCKED_ACCOUNT,
  });

  // Transfer busd from unlocked account to user account
  await busd.transfer(accounts[0], "1600000000000000000000", {
    from: UNLOCKED_ACCOUNT,
  });
};
