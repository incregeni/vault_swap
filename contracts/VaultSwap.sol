// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

contract VaultSwap {
    IERC20 public srcToken;
    IERC20 public targetToken;

    uint256 public startTimeStamp;
    uint256 public constant epochDuration = 7 days;

    uint256 public srcProportionRate; //  to indicates remaining src token amount after deposit
    uint256 public lastSwapTimestamp; //  last swap timestamp
    uint256 public lastSwapEpochId; //  last swap epoch id

    uint256 public currentCumulatedSwapedSrcTokenAmount; // current cumulated swaped src token amount
    uint256 public currentCumulatedSwapedTargetTokenAmount; // current cumulated swaped target token amount

    uint256 public lastRateUpdateTimestamp; //  last srcProportionRate initialization timestamp (to 1e18)
    // user's position
    struct position {
        uint256 totalDepositAmount;
        uint256 lastDepositTimestamp;
        uint256 cumulatedSwapedSrcTokenAmount;
        uint256 cumulatedSwapedTargetTokenAmount;
    }
    // user => position
    mapping(address => uint256) public userPositions;

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
        lastRateUpdateTimestamp = _startTimeStamp;
        lastSwapTimestamp = _startTimeStamp;
        srcProportionRate = 1e18;
    }

    function deposit(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");

        srcToken.transferFrom(msg.sender, address(this), amount);
    }
}
