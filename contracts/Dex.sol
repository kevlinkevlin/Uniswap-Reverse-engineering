pragma solidity 0.6.6;

import '@uniswap/v2-periphery/contracts/UniswapV2Router02.sol';
contract Dex {
  string public name = "Dex";
  address internal constant UNISWAP_V2_ROUTER = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
  IUniswapV2Router02 public uniswapRouter;
  address internal constant BUSD = 0x4Fabb145d64652a948d72533023f6E7A623C7C53;

  constructor() public payable {
    uniswapRouter = IUniswapV2Router02(UNISWAP_V2_ROUTER);
  }
  function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
  function swapEthForBUSD(uint ethAmount) external payable {
    uint deadline = block.timestamp + 150;
    address[] memory path = getEthForBUSDPath();
    uint amountOutMin = uniswapRouter.getAmountsOut(ethAmount, path)[1];
    uniswapRouter.swapExactETHForTokens{value: msg.value}(amountOutMin, path, msg.sender, deadline);
  }

  function swapBUSDForEth(uint tokenAmount) external payable {
    uint deadline = block.timestamp + 150;
    address[] memory path = getBUSDForEthPath();
    uint amountOutMin = uniswapRouter.getAmountsOut(tokenAmount, path)[1];
    IERC20(BUSD).transferFrom(msg.sender, address(this), tokenAmount);
    IERC20(BUSD).approve(UNISWAP_V2_ROUTER, tokenAmount);
    uniswapRouter.swapExactTokensForETH(tokenAmount, amountOutMin, path, msg.sender, deadline);
  }

  function getEthForBUSDPath() private view returns (address[] memory) {
    address[] memory path = new address[](2);
    path[0] = uniswapRouter.WETH();
    path[1] = BUSD;

    return path;
  }

  function getBUSDForEthPath() private view returns (address[] memory) {
    address[] memory path = new address[](2);
    path[0] = BUSD;
    path[1] = uniswapRouter.WETH();

    return path;
  }
  
}