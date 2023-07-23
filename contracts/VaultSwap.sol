// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

import "hardhat/console.sol";

contract VaultSwap is Ownable {
    IERC20 public srcToken;
    IERC20 public targetToken;
    IUniswapV2Router02 public router02;

    uint256 public startTimeStamp;
    // uint256 public constant epochDuration = 7 days;
    uint256 public constant epochDuration = 2 minutes; //  for Test

    uint256 public lastSwapedEpochId;

    // user's position
    struct Position {
        uint256 totalDepositAmount;
        uint256 accruedTargetTokenAmount;
        uint256 lastSwapedEpochId;
        uint256 lastWithdrawEpochId; // to check that user can withdraw only once in an epoch
    }
    // user => position
    mapping(address => Position) public userPositions;

    struct EpochInfo {
        uint256 epochId; // epochId starts from 1. epochId = (block.timestamp - startTimeStamp) / epochDuration + 1
        uint256 swapTimestamp;
        uint256 totalSrcTokenAmount;
        uint256 swapedSrcTokenAmount;
        uint256 swapedTargetTokenAmount;
    }
    // epochId => EpochInfo
    mapping(uint256 => EpochInfo) public epochInfos;

    constructor(
        address _router02,
        address _srcToken,
        address _targetToken,
        uint256 _startTimeStamp
    ) {
        require(
            _startTimeStamp >= block.timestamp,
            "Start time must be in the future"
        );

        router02 = IUniswapV2Router02(_router02);
        srcToken = IERC20(_srcToken);
        targetToken = IERC20(_targetToken);
        startTimeStamp = _startTimeStamp;
    }

    function swap(uint256 swapAmount) external onlyOwner {
        require(lastSwapedEpochId < getCurrentEpochId(), "Already swapped");
        require(
            srcToken.balanceOf(address(this)) >= swapAmount,
            "Insufficent Source Token Amount"
        );

        lastSwapedEpochId = getCurrentEpochId();
        epochInfos[lastSwapedEpochId].epochId = lastSwapedEpochId;
        epochInfos[lastSwapedEpochId].swapTimestamp = block.timestamp;
        epochInfos[lastSwapedEpochId].totalSrcTokenAmount = srcToken.balanceOf(
            address(this)
        );
        epochInfos[lastSwapedEpochId].swapedSrcTokenAmount = swapAmount;

        uint256 oldTargetTokenBal = targetToken.balanceOf(address(this));

        // implement swap logic
        address[] memory path;
        path = new address[](2);
        path[0] = address(srcToken);
        path[1] = address(targetToken);

        srcToken.approve(address(router02), swapAmount);
        router02.swapExactTokensForTokens(
            swapAmount,
            (swapAmount * 997 * 997) / 1000 / 1000, // Considering Fee and slippage (0.3%)
            path,
            address(this),
            block.timestamp + 100
        );
        ////
        epochInfos[lastSwapedEpochId].swapedTargetTokenAmount =
            targetToken.balanceOf(address(this)) -
            oldTargetTokenBal;
    }

    function deposit(
        uint256 srcTokenAmount,
        uint256 targetTokenAmount
    ) external {
        require(
            srcTokenAmount > 0 || targetTokenAmount > 0,
            "At least one amount must be greater than 0"
        );

        srcToken.transferFrom(msg.sender, address(this), srcTokenAmount);
        targetToken.transferFrom(msg.sender, address(this), targetTokenAmount);

        (
            userPositions[msg.sender].totalDepositAmount,
            userPositions[msg.sender].accruedTargetTokenAmount
        ) = getUserSrcAndTargetTokenBalance(msg.sender);

        userPositions[msg.sender].totalDepositAmount += srcTokenAmount;
        userPositions[msg.sender].accruedTargetTokenAmount += targetTokenAmount;
        userPositions[msg.sender].lastSwapedEpochId = lastSwapedEpochId;
    }

    function withdraw(
        uint256 srcTokenAmount,
        uint256 targetTokenAmount
    ) external {
        require(
            userPositions[msg.sender].lastWithdrawEpochId < getCurrentEpochId(),
            "Already withdrawn in this epoch"
        );

        (
            userPositions[msg.sender].totalDepositAmount,
            userPositions[msg.sender].accruedTargetTokenAmount
        ) = getUserSrcAndTargetTokenBalance(msg.sender);

        require(
            srcTokenAmount <= userPositions[msg.sender].totalDepositAmount,
            "Insufficient SrcToken Balance"
        );
        require(
            targetTokenAmount <=
                userPositions[msg.sender].accruedTargetTokenAmount,
            "Insufficient TargetToken Balance"
        );

        userPositions[msg.sender].totalDepositAmount -= srcTokenAmount;
        userPositions[msg.sender].accruedTargetTokenAmount -= targetTokenAmount;
        userPositions[msg.sender].lastSwapedEpochId = lastSwapedEpochId;
        userPositions[msg.sender].lastWithdrawEpochId = getCurrentEpochId();

        srcToken.transfer(msg.sender, srcTokenAmount);
        targetToken.transfer(msg.sender, targetTokenAmount);
    }

    function getUserSrcAndTargetTokenBalance(
        address user
    )
        public
        view
        returns (uint256 userSrcTokenAmount, uint256 userTargetTokenAmount)
    {
        userSrcTokenAmount = userPositions[user].totalDepositAmount;

        for (
            uint256 i = userPositions[user].lastSwapedEpochId + 1;
            i <= getCurrentEpochId();
            i++
        ) {
            if (epochInfos[i].swapedSrcTokenAmount == 0) {
                continue;
            }
            userTargetTokenAmount +=
                (epochInfos[i].swapedTargetTokenAmount * userSrcTokenAmount) /
                epochInfos[i].totalSrcTokenAmount;
            userSrcTokenAmount =
                (userSrcTokenAmount *
                    (epochInfos[i].totalSrcTokenAmount -
                        epochInfos[i].swapedSrcTokenAmount)) /
                epochInfos[i].totalSrcTokenAmount;
        }
        userTargetTokenAmount =
            userPositions[user].accruedTargetTokenAmount +
            userTargetTokenAmount;
    }

    function getCurrentEpochId() public view returns (uint256) {
        return (block.timestamp - startTimeStamp) / epochDuration + 1;
    }
}
