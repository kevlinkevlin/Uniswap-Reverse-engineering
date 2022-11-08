import React, { useState, useEffect } from "react";

import Web3 from "web3";
import Dex from "./abis/Dex.json";
import ERC20Mock from "./abis/ERC20Mock.json";

import WalletInfo from "./components/WalletInfo/WalletInfo";
import SwapEth from "./components/SwapEth/SwapEth";
import SwapBUSD from "./components/SwapBUSD/SwapBUSD";
import MainHeader from "./components/MainHeader/MainHeader";
import Table from "./components/Table/Table"

const BUSD_MAINNET = "0x4Fabb145d64652a948d72533023f6E7A623C7C53";
const BUSD_DECIMALS = 18;

function App() {
  const [web3, setWeb3] = useState("");
  const [ethBalance, setEthBalance] = useState(1);
  const [tokenBalance, setTokenBalance] = useState(1000000000);
  const [investor, setInvestor] = useState(1000000000);
  const [tokenContract, setTokenContract] = useState({});
  const [dexContract, setDexContract] = useState({});
  const [ethAmount, setEthAmount] = useState(0);
  const [tokenAmount, setTokenAmount] = useState(0);
  //Transaction Table
  const [rowdata, setRowData] = useState([]);
  const onAddRowClick = (transation, from, to, amount) => {
    setRowData(
      rowdata.concat({ transation: transation, from: from, to: to, amount: amount })
    )
  };
  const columns = [
    {
      Header: "Tx hash",
      accessor: "transation",
    },
    {
      Header: "From",
      accessor: "from",
    },
    {
      Header: "To",
      accessor: "to",
    },
    {
      Header: "Amount",
      accessor: "amount",
    },
  ]

  useEffect(() => {
    const init = async () => {
      await loadWeb3();
    };
    init();
  }, []);

  useEffect(() => {
    const load = async () => {
      await loadBlockchainData();
    };
    load();
  }, [web3]);

  const loadWeb3 = async () => {
    if (window.ethereum) {
      try {
        const _web3 = new Web3(window.ethereum);
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setWeb3(_web3);
      } catch (error) {
        console.error(error);
      }
    } else {
      console.log("Please Install MetaMask");
    }
  };

  const loadBlockchainData = async () => {
    if (web3) {
      const [investor] = await web3.eth.getAccounts();
      setInvestor(investor);
      const balance = await web3.eth.getBalance(investor);
      setEthBalance(web3.utils.fromWei(balance, "ether"));
      const _tokenContract = new web3.eth.Contract(ERC20Mock.abi, BUSD_MAINNET);
      setTokenContract(_tokenContract);
      let _tokenBalance = await _tokenContract.methods
        .balanceOf(investor)
        .call();
      setTokenBalance(_tokenBalance / Math.pow(10, BUSD_DECIMALS));
      const networkId = await web3.eth.net.getId();
      console.log("Network ID = " + networkId)
      const dexData = Dex.networks[networkId];
      if (dexData) {
        const _dexContract = new web3.eth.Contract(Dex.abi, dexData.address);
        setDexContract(_dexContract);
      } else {
        window.alert("Dex contract not deployed to detected network");
      }

      //Get transaction at address
      var lastBlockNumber = await web3.eth.getBlockNumber();
      await logTansaction(lastBlockNumber);

      // const [myAddr] = await web3.eth.getAccounts();
      // var currentBlock = web3.eth.blockNumber;
      // var n = web3.eth.getTransactionCount(myAddr, currentBlock);
      // var bal = web3.eth.getBalance(myAddr, currentBlock);

      // for (var i = currentBlock; i >= 0 && (n > 0 || bal > 0); --i) {
      //   try {
      //     var block = web3.eth.getBlock(i, true);
      //     if (block && block.transactions) {
      //       block.transactions.forEach(function (e) {
      //         if (myAddr == e.from) {
      //           if (e.from != e.to)
      //             bal = bal.plus(e.value);
      //           console.log(i, e.from, e.to, e.value.toString(10));
      //           --n;
      //         }
      //         if (myAddr == e.to) {
      //           if (e.from != e.to)
      //             bal = bal.minus(e.value);
      //           console.log(i, e.from, e.to, e.value.toString(10));
      //         }
      //       });
      //     }
      //   } catch (e) { console.error("Error in block " + i, e); }
      // }


    }
  };

  const swapEthHandler = async () => {
    if (dexContract) {
      await dexContract.methods
        .swapEthForBUSD(web3.utils.toWei(ethAmount, "ether"))
        .send({
          value: web3.utils.toWei(ethAmount, "ether"),
          from: investor,
        });

      const balance = await web3.eth.getBalance(investor);
      const _tokenBalance = await tokenContract.methods
        .balanceOf(investor)
        .call();
      setTokenBalance(_tokenBalance / Math.pow(10, BUSD_DECIMALS));
      setEthBalance(web3.utils.fromWei(balance, "ether"));
      //Get transaction
      var lastBlockNumber = await web3.eth.getBlockNumber();
      await logTansaction(lastBlockNumber);
    }
  };

  const swapBUSDHandler = async () => {
    if (dexContract) {
      const networkId = await web3.eth.net.getId();
      const dexData = Dex.networks[networkId];
      if (dexData) {
        // const sendBUSD = tokenAmount * Math.pow(10, BUSD_DECIMALS);
        await tokenContract.methods.approve(dexData.address, web3.utils.toWei(tokenAmount, "ether")).send({
          from: investor,
        });
        await dexContract.methods
          .swapBUSDForEth(web3.utils.toWei(tokenAmount, "ether"))
          .send({ from: investor });
        const balance = await web3.eth.getBalance(investor);
        const _tokenBalance = await tokenContract.methods
          .balanceOf(investor)
          .call();
        setTokenBalance(_tokenBalance / Math.pow(10, BUSD_DECIMALS));
        setEthBalance(web3.utils.fromWei(balance, "ether"));
      } else {
        window.alert("Dex contract not deployed to detected network");
      }
    }
  };

  const onEthEnteredHandler = (ethAmount) => {
    setEthAmount(ethAmount);
  };
  const onTokenEnteredHandler = (tokenAmount) => {
    setTokenAmount(tokenAmount);
  };

  const logTansaction = (lastBlockNumber) => {
    web3.eth.getBlock(lastBlockNumber, function (err, blockInfo) {
      {
        if (!blockInfo && blockInfo.transactions) {
          console.log("No transaction");
          return;
        }
        for (var j = 0; j < blockInfo.transactions.length; j++) {
          var tx = blockInfo.transactions[j];
          web3.eth.getTransaction(tx, function (err, txInfo) {
            if (txInfo.from == investor) { onAddRowClick(txInfo.hash, txInfo.from, txInfo.to, txInfo.value); }
            console.log(txInfo);
          });

        }
      }

    });
  };
  return (
    <React.Fragment>
      <MainHeader />
      <main>
        <WalletInfo ethBalance={ethBalance} tokenBalance={tokenBalance} />
        <SwapEth onEthEntered={onEthEnteredHandler} onSwap={swapEthHandler} />
        <SwapBUSD onTokenEntered={onTokenEnteredHandler} onSwap={swapBUSDHandler} />
        <div className="container mx-auto">
          <div className="flex justify-center mt-8">
            <Table columns={columns} data={rowdata} />
          </div>
        </div>
      </main>
    </React.Fragment >
  );
}

export default App;
