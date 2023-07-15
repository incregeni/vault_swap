// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

contract VaultSwap is Ownable {
    IERC20 public srcToken;
    IERC20 public targetToken;

    uint256 public startTimeStamp;
    uint256 public constant epochDuration = 7 days;
    uint256 public lastSwapedEpochId;

    // user's position
    struct Position {
        uint256 totalDepositAmount;
        uint256 accruedTargetTokenAmount;
        uint256 lastSwapedEpochId;
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
        address _srcToken,
        address _targetToken,
        uint256 _startTimeStamp
    ) {
        require(
            _startTimeStamp >= block.timestamp,
            "Start time must be in the future"
        );

        srcToken = IERC20(_srcToken);
        targetToken = IERC20(_targetToken);
        startTimeStamp = _startTimeStamp;
    }

    function swap(uint256 swapAmount) external onlyOwner {
        require(lastSwapedEpochId < getCurrentEpochId(), "Already swapped");

        lastSwapedEpochId = getCurrentEpochId();
        epochInfos[lastSwapedEpochId].epochId = lastSwapedEpochId;
        epochInfos[lastSwapedEpochId].swapTimestamp = block.timestamp;
        epochInfos[lastSwapedEpochId].totalSrcTokenAmount = srcToken.balanceOf(
            address(this)
        );
        epochInfos[lastSwapedEpochId].swapedSrcTokenAmount = swapAmount;

        uint256 oldTargetTokenBal = targetToken.balanceOf(address(this));

        // implement swap logic

        ////
        epochInfos[lastSwapedEpochId].swapedTargetTokenAmount =
            targetToken.balanceOf(address(this)) -
            oldTargetTokenBal;
    }

    function deposit(
        uint256 srcTokenAmount,
        uint256 targetTokenAmount
    ) external {
        require(srcTokenAmount > 0, "Amount must be greater than 0");
        require(targetTokenAmount > 0, "Amount must be greater than 0");

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