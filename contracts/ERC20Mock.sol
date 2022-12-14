pragma solidity 0.6.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Mock is ERC20 {
  constructor(uint256 initialSupply) public ERC20('Binance USD', 'BUSD') {
    _mint(msg.sender, initialSupply);
  }
}