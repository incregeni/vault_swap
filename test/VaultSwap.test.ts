const hre = require("hardhat");
const { expect } = require("chai");
import { Contract } from "ethers";
import IUniswapV2Router02Abi from "../abi/IUniswapV2Router02.json";

const uniswapV2Router02Address_sepolia = "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008";

describe("VaultSwap", function () {
  let VaultSwap: Contract;
  let USTT: Contract;
  let BACON: Contract;
  let UniswapV2Router02: Contract;
  let owner: any;
  let Alice: any;
  let Bob: any;
  let Charlie: any;

  const getCurrentTimeStamp = async () => {
    const block = await hre.ethers.provider.getBlock("latest");
    return block.timestamp;
  };
  const timeTravel = async (days: number) => {
    await hre.network.provider.request({
      method: "evm_increaseTime",
      params: [days * 24 * 60 * 60],
    });
    await hre.network.provider.request({
      method: "evm_mine",
      params: [],
    });
  };

  before(async function () {
    [owner, Alice, Bob, Charlie] = await hre.ethers.getSigners();
    console.log("owner address: ", owner.address);
    console.log("Alice address: ", Alice.address);
    console.log("Bob address: ", Bob.address);
    console.log("Charlie address: ", Bob.address);

    UniswapV2Router02 = new hre.ethers.Contract(
      uniswapV2Router02Address_sepolia,
      IUniswapV2Router02Abi,
      hre.ethers.provider
    );

    console.log(await UniswapV2Router02.factory());
    console.log("123");

    const U = await hre.ethers.getContractFactory("Mock_erc20");
    USTT = await U.deploy("$USTT", "USTT", hre.ethers.utils.parseEther("100000000000000000"));
    await USTT.deployed();

    const B = await hre.ethers.getContractFactory("Mock_erc20");
    BACON = await B.deploy("$BACON", "BACON", hre.ethers.utils.parseEther("100000000000000000"));
    await BACON.deployed();

    const V = await hre.ethers.getContractFactory("VaultSwap");
    VaultSwap = await V.deploy(
      UniswapV2Router02.address,
      USTT.address,
      BACON.address,
      (await getCurrentTimeStamp()) + 2000
    );
    await VaultSwap.deployed();

    console.log("22");
    await USTT.connect(owner).approve(
      UniswapV2Router02.address,
      hre.ethers.utils.parseEther("9000000000000000")
    );
    await BACON.connect(owner).approve(
      UniswapV2Router02.address,
      hre.ethers.utils.parseEther("90000000000000000")
    );

    console.log("22_1");
    await UniswapV2Router02.connect(owner).addLiquidity(
      USTT.address,
      BACON.address,
      hre.ethers.utils.parseEther("100000000000000"),
      hre.ethers.utils.parseEther("1000000000000000"),
      hre.ethers.utils.parseEther("100000000000000"),
      hre.ethers.utils.parseEther("1000000000000000"),
      owner.address,
      (await getCurrentTimeStamp()) + 100
    );
    console.log("33");

    await USTT.transfer(Alice.address, hre.ethers.utils.parseEther("2000"));
    await USTT.transfer(Bob.address, hre.ethers.utils.parseEther("3000"));
    await USTT.transfer(Charlie.address, hre.ethers.utils.parseEther("5000"));

    console.log("44");
    await timeTravel(1);
  });
  it("epoch1", async function () {
    await USTT.connect(Alice).approve(VaultSwap.address, hre.ethers.utils.parseEther("1000"));
    await USTT.connect(Bob).approve(VaultSwap.address, hre.ethers.utils.parseEther("2000"));
    await USTT.connect(Charlie).approve(VaultSwap.address, hre.ethers.utils.parseEther("3000"));

    await VaultSwap.connect(Alice).deposit(hre.ethers.utils.parseEther("1000"), 0);
    await VaultSwap.connect(Bob).deposit(hre.ethers.utils.parseEther("2000"), 0);
    await VaultSwap.connect(Charlie).deposit(hre.ethers.utils.parseEther("3000"), 0);

    await VaultSwap.swap(hre.ethers.utils.parseEther("3000"));
  });
  it("epoch2", async function () {
    await timeTravel(7);

    await USTT.connect(Alice).approve(VaultSwap.address, hre.ethers.utils.parseEther("1000"));
    await USTT.connect(Charlie).approve(VaultSwap.address, hre.ethers.utils.parseEther("2000"));

    await VaultSwap.connect(Alice).deposit(hre.ethers.utils.parseEther("1000"), 0);
    await VaultSwap.connect(Charlie).deposit(hre.ethers.utils.parseEther("2000"), 0);

    await VaultSwap.swap(hre.ethers.utils.parseEther("1200"));

    console.log(await VaultSwap.getUserSrcAndTargetTokenBalance(Alice.address));
    console.log(await VaultSwap.getUserSrcAndTargetTokenBalance(Bob.address));
    console.log(await VaultSwap.getUserSrcAndTargetTokenBalance(Charlie.address));

    expect((await VaultSwap.getUserSrcAndTargetTokenBalance(Alice.address)).userSrcTokenAmount).eq(
      hre.ethers.utils.parseEther("1200")
    );
    expect((await VaultSwap.getUserSrcAndTargetTokenBalance(Bob.address)).userSrcTokenAmount).eq(
      hre.ethers.utils.parseEther("800")
    );
    expect(
      (await VaultSwap.getUserSrcAndTargetTokenBalance(Charlie.address)).userSrcTokenAmount
    ).eq(hre.ethers.utils.parseEther("2800"));

    await USTT.connect(Bob).approve(VaultSwap.address, hre.ethers.utils.parseEther("1000"));
    await VaultSwap.connect(Bob).deposit(hre.ethers.utils.parseEther("1000"), 0);
  });
  it("epoch3", async function () {
    await timeTravel(7);
    console.log(
      (await VaultSwap.getUserSrcAndTargetTokenBalance(Bob.address)).userTargetTokenAmount
    );
    expect(
      (await VaultSwap.getUserSrcAndTargetTokenBalance(Bob.address)).userTargetTokenAmount
    ).to.be.within(
      hre.ethers.utils.parseEther("1200").mul(997).mul(997).div(1000).div(1000), // Considering Fee and slippage (0.3%)
      hre.ethers.utils.parseEther("1200")
    );

    await VaultSwap.swap(hre.ethers.utils.parseEther("2000"));
  });
});
