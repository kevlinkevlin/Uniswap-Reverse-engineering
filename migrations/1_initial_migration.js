const Migrations = artifacts.require("Migrations");
// const ERC20Mock = artifacts.require("ERC20Mock");
module.exports = function (deployer, networks, accounts) {
  deployer.deploy(Migrations);
};
