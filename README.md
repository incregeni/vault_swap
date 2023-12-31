# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.ts
```

# Vault Swap

## Preparation

Deploy two standard ERC20 contracts called $USTT and $BACON on a testnet of your choosing with a DEX contract deployed. We recommend using Polygon Mumbai, but you may also use other networks, such as Ethereum Goerli or Sepolia.

1. Mint some $USTT and $BACON and create an initial liquidity pool for $USTT/$BACON pair such that 1 $USTT = 10 $BACON. Decide on the amount of $USTT & $BACON to mint and create the LP.
2. In subsequent , we will do swaps of up to 10,000 USTT. Create an LP pool of sufficient liquidity to ensure the slippage is <0.3%.
3. Mint 10,000 USTT to three addresses and label them as Alice, Bob, Charlie
   List down the following on a text file

## Vault Swaps

Smart Contract Engineer Test 1
Create a vault contract that stores deposits and allows an administrator to do recurring swaps on the deposits. Here are the functional requirements:

1. During the instantiation of the vault, the admin has to specify the source token and target token. You should also decide on what other data is required to make the swaps between $USTT to $BACON work.
   a. The vault contract should also state what is the starting block where the first swap will happen and what is the frequency of the subsequent swaps.
2. This vault does a swap every week (epoch). In each epoch,
   a. An admin can perform a swap for all depositors for $USTT to $BACON once every week. If the admin tries to do another swap within the same epoch, it should fail.
   b. Depositors can deposit any amount of $USTT. Depositors can deposit more $USTT or withdraw all remaining $USTT anytime.
   c. New depositors can deposit USTT anytime. If a swap has happened for that given epoch, the new depositors' swap will happen in the next epoch.
3. An admin cannot withdraw funds that should belong to the depositors.
4. The depositors should be able to withdraw their funds (both $USTT and $BACON) every week.

## Things you don't have to include:

This exercise is designed to be basic to be completed in a short amount of time. As such, you may assume the following:

- Set a reasonable amount of slippage so that most swaps pass without throwing errors.
- You do not need to worry about the scheduled jobs. We are comfortable as long as a special role can execute swaps.
- You do not have to handle swap instructions for the other direction. This vault can only swap $USTT to $BACON.

PS D:\Blockchain_Projects\Mine\vault_swap> npx hardhat run .\scripts\deployVaultSwap.ts --network sepolia
Signer's Address : 0xcF41efD2Efc47F8bc58acfA281854eea13B4fC96
Signer's Balance : BigNumber { value: "1983357977303276004" }
owner address: 0xcF41efD2Efc47F8bc58acfA281854eea13B4fC96
Bob address: 0x02C3d66D7C959FC45025ec85c5075cBfEF31b584
Charlie address: 0xd64f1184447fb9264a847A31bDBB5276bD4Ee498
0x7E0987E5b3a30e3f2828572Bb659A548460a3003
123
USTT deployed to : 0xD630341327c3676161bdF914441bC466d9BBeB07
BACON deployed to : 0x53de4427f33f172862c79B7E478fa43224A306bb
VaultSwap deployed to : 0x9Bd8B557CEbe2dc5b93F13CAF00F93E3aA673a26
22
22_1
33
44
PS D:\Blockchain_Projects\Mine\vault_swap>
