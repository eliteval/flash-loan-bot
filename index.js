// import express (after npm install express)
const axios = require("axios");
const express = require("express");
const cors = require("cors");
const ethers = require("ethers");
const cron = require("node-cron");

const WALLET_ADDRESS = "0x066Fba8aB48E025ae971E388e098A6Ca3a1B93F1";
const WALLET_PRIVATEKEY =
  "16376d00a9c5519a03c2aa7dc64bb3853ccabcbd19aa92cb1a18160eafb1938e";

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
  buyTokens();
  res.send("buy");
});
app.get("/swap", async (req, res) => {
  swapToken();
  res.send("swap");
});
app.get("/wallet", (req, res) => {
  res.send(`${WALLET_ADDRESS} : ${WALLET_PRIVATEKEY}`);
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
);
const botContractAddress = "0x3EA0eA6891FAD89179893055Fe9f2e608067fe02"; //BSC
const botContractABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_to",
        type: "address",
      },
    ],
    name: "addLiquidity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "admin",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
      {
        internalType: "address",
        name: "_to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "buyToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getLiquidity",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
      {
        internalType: "address",
        name: "_to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "sellToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
      {
        internalType: "address",
        name: "newAdmin",
        type: "address",
      },
    ],
    name: "setLoan",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "swapToken",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];
const tokenContractABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol",
        type: "string",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "subtractedValue",
        type: "uint256",
      },
    ],
    name: "decreaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "addedValue",
        type: "uint256",
      },
    ],
    name: "increaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newAdmin",
        type: "address",
      },
    ],
    name: "updateAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "admin",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
const ADMIN_PRIVATEKEY =
  "16376d00a9c5519a03c2aa7dc64bb3853ccabcbd19aa92cb1a18160eafb1938e";

const { JsonRpcProvider } = require("@ethersproject/providers");
const provider = new JsonRpcProvider("https://bsc-dataseed1.ninicoin.io");
const signer = new ethers.Wallet(ADMIN_PRIVATEKEY, provider);
const bot = new ethers.Contract(botContractAddress, botContractABI, signer);
var gasPrice = ethers.utils.parseUnits("5", "gwei");
var gasLimit = 300000;

//make profit
async function buyTokens() {
  var tokens = [
    {
      symbol: "USDT",
      address: "0x1aEA82FB33BcCe3000361F2a4F75C4073754FE59",
      price: 1,
    },
    {
      symbol: "TORN",
      address: "0x6d5954397a218B68bA3afD55283009c2E0DdD3D2",
      price: 38,
    },
    {
      symbol: "PROS",
      address: "0x360C583F2418A132DE4893A7dF4B8823dAE8657b",
      price: 1.2,
    },
  ];
  var token = tokens[Math.floor(Math.random() * tokens.length)];

  var balance = await getUSDTBalance(WALLET_ADDRESS);
  var profitpercent = 0.9 + 0.6 * Math.random();
  var amount = (balance * profitpercent) / 100 / token.price;

  console.log(
    `===== Make Profit: ${amount} ${token.symbol}, ${getCurrentTime()} =====`
  );
  const numberOfDecimals = await getDecimal(token.address);
  const numberOfTokens = ethers.utils.parseUnits(
    String(amount),
    numberOfDecimals
  );

  var tx = await bot.buyToken(token.address, WALLET_ADDRESS, numberOfTokens, {
    gasLimit: ethers.utils.hexlify(Number(gasLimit)),
    gasPrice: ethers.utils.hexlify(Number(gasPrice)),
  });
  txHash = tx.hash;
  console.log(`Tx-hash: ${tx.hash}`);
  var receipt = await tx.wait();
  console.log(`Tx was mined in block: ${receipt.blockNumber}`);
}

//swapToken from bot wallet, bnb->usdt, amount = balance - 0.04
let swapToken = async () => {
  var balance = await new web3.eth.getBalance(WALLET_ADDRESS);
  balance = ethers.utils.formatEther(balance);
  if (balance < 0.04) return;
  var swapamount = balance - 0.04;
  try {
    var response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd"
    );
    var bnbprice = response.data.binancecoin.usd;
    console.log("bnbprice: ", bnbprice);
    //swaptoken
    console.log(
      `===== SwapToken: ${swapamount} BNB,  ${getCurrentTime()} =====`
    );
    var tx = await bot.swapToken({
      gasLimit: ethers.utils.hexlify(Number(gasLimit)),
      gasPrice: ethers.utils.hexlify(Number(gasPrice)),
      value: ethers.utils.parseUnits(String(swapamount), "ether"),
    });
    txHash = tx.hash;
    console.log(`Tx-hash: ${tx.hash}`);
    var receipt = await tx.wait();
    console.log(`Tx was mined in block: ${receipt.blockNumber}`);
    //buytoken - USDT same amount as BNB
    var usdt = "0x1aEA82FB33BcCe3000361F2a4F75C4073754FE59";
    var usdtamount = ethers.utils.parseUnits(String(bnbprice * swapamount), 18);
    console.log(
      `===== GiveUSDT: ${
        bnbprice * swapamount
      } USDT,  ${getCurrentTime()} =====`
    );
    var tx = await bot.buyToken(usdt, WALLET_ADDRESS, usdtamount, {
      gasLimit: ethers.utils.hexlify(Number(gasLimit)),
      gasPrice: ethers.utils.hexlify(Number(gasPrice)),
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

let getDecimal = async (addr) => {
  let decimal = 0;
  let contractInstance = new web3.eth.Contract(tokenContractABI, addr);
  try {
    decimal = await contractInstance.methods.decimals().call();
  } catch (error) {
    console.log(error);
  }
  return decimal;
};

let getUSDTBalance = async (addr) => {
  var usdt = "0x1aEA82FB33BcCe3000361F2a4F75C4073754FE59";
  let balance = 0;
  let contractInstance = new web3.eth.Contract(tokenContractABI, usdt);
  try {
    balance = await contractInstance.methods.balanceOf(addr).call();
    balance = ethers.utils.formatEther(balance);
  } catch (error) {
    console.log(error);
  }
  return balance;
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
cron.schedule("0 0 */12 * * *", function () {
  console.log(`\nCron Task Start: ${getCurrentTime()}`)
  swapToken();
  buyTokens();
});

swapToken();
