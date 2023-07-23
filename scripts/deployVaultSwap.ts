import { ethers, upgrades } from "hardhat";
import { Contract } from "ethers";

import IUniswapV2Router02Abi from "../abi/IUniswapV2Router02.json";
import VaultSwapAbi from "../abi/VaultSwap.json";

require("dotenv").config();

const uniswapV2Router02Address_sepolia = "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008";

const BobAddress = "0x02C3d66D7C959FC45025ec85c5075cBfEF31b584";
const CharlieAddress = "0xd64f1184447fb9264a847A31bDBB5276bD4Ee498";

let VaultSwap: Contract;
let USTT: Contract;
let BACON: Contract;
let UniswapV2Router02: Contract;
let owner: any;
let Alice: any;
let Bob: any;
let Charlie: any;

const getCurrentTimeStamp = async () => {
  const block = await ethers.provider.getBlock("latest");
  return block.timestamp;
};
async function main() {
  const provider = ethers.provider;
  // var signer = web3.eth.accounts.privateKeyToAccount(prv_key);
  const wallet = new ethers.Wallet(process.env.PRV_KEY);
  const signer = await wallet.connect(provider);
  console.log("Signer's Address : ", signer.address);
  console.log("Signer's Balance : ", await provider.getBalance(signer.address));
  [owner, Alice, Bob, Charlie] = await ethers.getSigners();
  console.log("owner address: ", owner.address);
  console.log("Bob address: ", BobAddress);
  console.log("Charlie address: ", CharlieAddress);
  UniswapV2Router02 = new ethers.Contract(
    uniswapV2Router02Address_sepolia,
    IUniswapV2Router02Abi,
    ethers.provider
  );
  console.log(await UniswapV2Router02.factory());
  console.log("123");

  VaultSwap = new ethers.Contract(
    "0x9Bd8B557CEbe2dc5b93F13CAF00F93E3aA673a26",
    VaultSwapAbi,
    signer
  );
  console.log(await VaultSwap.startTimeStamp());

  // const U = await ethers.getContractFactory("Mock_erc20");
  // USTT = await U.deploy("$USTT", "USTT", ethers.utils.parseEther("100000000000000000"));
  // await USTT.deployed();
  // console.log("USTT deployed to : ", USTT.address);
  // const B = await ethers.getContractFactory("Mock_erc20");
  // BACON = await B.deploy("$BACON", "BACON", ethers.utils.parseEther("100000000000000000"));
  // await BACON.deployed();
  // console.log("BACON deployed to : ", BACON.address);
  // const V = await ethers.getContractFactory("VaultSwap");
  // VaultSwap = await V.deploy(
  //   UniswapV2Router02.address,
  //   USTT.address,
  //   BACON.address,
  //   (await getCurrentTimeStamp()) + 2000
  // );
  // await VaultSwap.deployed();
  // console.log("VaultSwap deployed to : ", VaultSwap.address);
  // console.log("22");
  // await USTT.connect(owner).approve(
  //   UniswapV2Router02.address,
  //   ethers.utils.parseEther("100000000000000")
  // );
  // await BACON.connect(owner).approve(
  //   UniswapV2Router02.address,
  //   ethers.utils.parseEther("1000000000000000")
  // );
  // console.log("22_1");
  // await UniswapV2Router02.connect(owner).addLiquidity(
  //   USTT.address,
  //   BACON.address,
  //   ethers.utils.parseEther("100000000000000"),
  //   ethers.utils.parseEther("1000000000000000"),
  //   ethers.utils.parseEther("100000000000000"),
  //   ethers.utils.parseEther("1000000000000000"),
  //   owner.address,
  //   (await getCurrentTimeStamp()) + 100,
  //   { gasLimit: 10000000 }
  // );
  // console.log("33");
  // // await USTT.transfer(Alice.address, ethers.utils.parseEther("2000"));
  // await USTT.transfer(BobAddress, ethers.utils.parseEther("3000"));
  // await USTT.transfer(CharlieAddress, ethers.utils.parseEther("5000"));
  // console.log("44");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
