// const hre = require("hardhat");
// const { expect } = require("chai");
// import { Contract } from "ethers";

// describe("NftPfp", function () {
//   let NftPfp: Contract;
//   let owner: any;
//   let player1: any;
//   let player2: any;
//   const genomeRange = [60, 30, 10, 40, 10, 100, 50, 60, 100, 10, 25, 30];

//   const makeRandomUnpackedGenome = () => {
//     let unpackedGenome = [];
//     for (let j = 0; j <= 11; j++) {
//       unpackedGenome.push(Math.floor(Math.random() * (genomeRange[j] + 1)));
//     }
//     return unpackedGenome;
//   };

//   before(async function () {
//     [owner, player1, player2] = await hre.ethers.getSigners();
//     console.log("owner address: ", owner.address);
//     console.log("player1 address: ", player1.address);
//     console.log("player2 address: ", player2.address);

//     const N = await hre.ethers.getContractFactory("NftPfp");
//     NftPfp = await N.deploy();
//     await NftPfp.deployed();
//   });

//   describe("check saveFourGenome", function () {
//     let genomes = [];
//     let unpackedGenomes = [];
//     it("save 5000 NFTs by saveFourGenome", async function () {
//       this.timeout(600000);
//       for (let i = 0; i < 5000; i++) {
//         let unpackedGenome = makeRandomUnpackedGenome();
//         genomes.push(await NftPfp.packGenome(unpackedGenome));
//         unpackedGenomes.push(unpackedGenome);
//       }
//       for (let i = 0; i < 1250; i++) {
//         const packedGenome0 = await NftPfp.packGenome(unpackedGenomes[i * 4]);
//         const packedGenome1 = await NftPfp.packGenome(unpackedGenomes[i * 4 + 1]);
//         const packedGenome2 = await NftPfp.packGenome(unpackedGenomes[i * 4 + 2]);
//         const packedGenome3 = await NftPfp.packGenome(unpackedGenomes[i * 4 + 3]);
//         const packedFourGenome = await NftPfp.packToFourGenome([
//           packedGenome0,
//           packedGenome1,
//           packedGenome2,
//           packedGenome3,
//         ]);
//         await NftPfp.saveFourGenome(packedFourGenome, i);
//       }
//     });
//     it("check the genomes", async function () {
//       this.timeout(600000);
//       for (let i = 0; i < 5000; i++) {
//         expect(await NftPfp.unpackGenome(await NftPfp.getPackedGenome(i))).to.deep.eq(
//           unpackedGenomes[i]
//         );
//       }
//     });
//   });
//   describe("check saveBatchFourGenomes", function () {
//     let genomes = [];
//     let unpackedGenomes = [];
//     let packedFourGenomes = [];
//     it("save 5000 NFTs by saveBatchFourGenomes", async function () {
//       this.timeout(600000);
//       for (let i = 0; i < 5000; i++) {
//         let unpackedGenome = makeRandomUnpackedGenome();
//         genomes.push(await NftPfp.packGenome(unpackedGenome));
//         unpackedGenomes.push(unpackedGenome);
//       }
//       for (let i = 0; i < 1250; i++) {
//         const packedGenome0 = await NftPfp.packGenome(unpackedGenomes[i * 4]);
//         const packedGenome1 = await NftPfp.packGenome(unpackedGenomes[i * 4 + 1]);
//         const packedGenome2 = await NftPfp.packGenome(unpackedGenomes[i * 4 + 2]);
//         const packedGenome3 = await NftPfp.packGenome(unpackedGenomes[i * 4 + 3]);
//         const packedFourGenome = await NftPfp.packToFourGenome([
//           packedGenome0,
//           packedGenome1,
//           packedGenome2,
//           packedGenome3,
//         ]);
//         packedFourGenomes.push(packedFourGenome);
//         console.log(packedFourGenome);
//       }
//       const tx = await NftPfp.saveGenomes(packedFourGenomes, {
//         gasPrice: 500e9,
//         gasLimit: 30590103,
//       });
//       console.log("---gas used:", (await tx.wait()).gasUsed.toString());
//     });
//     it("check the genomes", async function () {
//       this.timeout(600000);
//       for (let i = 0; i < 5000; i++) {
//         expect(await NftPfp.unpackGenome(await NftPfp.getPackedGenome(i))).to.deep.eq(
//           unpackedGenomes[i]
//         );
//       }
//     });
//   });
// });
