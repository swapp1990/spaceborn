// const { ethers } = require("hardhat");
// const { use, expect } = require("chai");
// const { solidity } = require("ethereum-waffle");

// use(solidity);

// describe("Game", function () {
//   let owner;
//   let player1;
//   let player2;
//   let tokenDistContract;
//   let gearsContract;
//   let alienContract;
//   let gameContract1;

//   describe("Gears", function () {
//     it("Should deploy token", async function () {
//       [owner, player1, player2] = await ethers.getSigners();

//       const Mango = await ethers.getContractFactory("MangoToken");
//       tokenContract = await Mango.deploy("MANGO", "MNG", 100000, owner.address);
//       let tokenSupply = await tokenContract.balanceOf(owner.address);
//       // console.log(tokenSupply.toNumber());
//       expect(await tokenSupply).to.equal(100000);
//     });

//     it("Should escrow tokens to distribution contract", async function () {
//       //Deploy token distribution contract
//       const TokenDistributor = await ethers.getContractFactory("TokenDistributor");
//       tokenDistContract = await TokenDistributor.deploy(tokenContract.address, owner.address);
//       await tokenDistContract.init();
//       let escrowBalCalculated = await tokenDistContract.initialEscrowBalance();
//       tokenContract.transfer(tokenDistContract.address, escrowBalCalculated);

//       //error:
//       //tokenContract.connect(player1).transfer(tokenDistContract.address, 1000);

//       let ownerBal = await tokenContract.balanceOf(owner.address);
//       // console.log(ownerBal.toNumber());
//       expect(await ownerBal).to.equal(25000);
//       let escrowBal = await tokenContract.balanceOf(tokenDistContract.address)
//       // console.log(escrowBal.toNumber());
//       expect(await escrowBal).to.equal(escrowBalCalculated);
//     });

//     it("Should deploy contracts", async function () {
//       const Alien = await ethers.getContractFactory("Alien");
//       alienContract = await Alien.deploy();
//       const Gears = await ethers.getContractFactory("Gears");
//       gearsContract = await Gears.deploy();

//       const Spaceborn = await ethers.getContractFactory("Spaceborn");
//       gameContract1 = await Spaceborn.deploy(alienContract.address, gearsContract.address, tokenDistContract.address);

//       await tokenDistContract.addGameContract(gameContract1.address, 5);
//     });

//     it("Mint 2 aliens", async function () {
//       await alienContract.mintMultipleAliens(["Allen", "Bernard"], [0, 35], [0, 1], 1);
//       let balance = await alienContract.balanceOf(owner.address);
//       expect(await balance).to.equal(2);
//     });

//     it("Claim available free gears", async function () {
//       await gameContract1.connect(player1).claimRandomGear();
//       let p1_gears_balance = await gearsContract.balanceOf(player1.address);
//       expect(await p1_gears_balance).to.equal(1);
//       let available_free_gears = await gameContract1.freeGearsRemaining();
//       expect(await available_free_gears).to.equal(99);

//       //Should return error "Not eligible for free gear"
//       //await gameContract1.connect(player1).claimRandomGear();
//     });

//     it("combat alien", async function () {
//       let alienId = 0;
//       let roundId = 1;
//       let gearsIdx = [{
//         rarityIdx: 0, catIdx: 0, gearIdx: 0
//       }];
//       let clientRandom = Math.floor(Math.random() * 100);
//       await gameContract1.connect(player1).fightAlien(roundId, alienId, clientRandom, gearsIdx);
//       let gearUsed = await gearsContract.gears(0);
//       // console.log(gearUsed.health.toNumber());
//       expect(await gearUsed.health).to.equal(95);

//       let escrowBal = await tokenContract.balanceOf(tokenDistContract.address)
//       // console.log(escrowBal.toNumber());
//       expect(await escrowBal).to.equal(74800);
//       let gameMax = await tokenDistContract.game2maxtokens(gameContract1.address);
//       // console.log({gameMax: gameMax.toNumber()})
//       let gameBal = await tokenDistContract.game2currtokens(gameContract1.address);
//       // console.log({gameBal: gameBal.toNumber()})
//       let player1Bal = await tokenContract.balanceOf(player1.address)
//       // console.log(player1Bal.toNumber());
//       expect(await player1Bal).to.equal(100);
//       let player2Bal = await tokenContract.balanceOf(player2.address)
//       expect(await player2Bal).to.equal(0);
//       // expect(await escrowBal).to.equal(60000);

//       //error: "caller not approved"
//       // tokenDistContract.rewardPlayer(player1.address, 100);
//     });

//     // it("game probs", async function () {
//     //   let clientRandom = Math.floor(Math.random() * 100);
//     //   await gameContract1.connect(player2).claimGear(0, 0);
//     //   let p2_gears_balance = await gearsContract.balanceOf(player2.address);
//     //   console.log({ p1_gears_balance: p2_gears_balance.toNumber() });
//     //   await alienContract.mintMultipleAliens(["Tim"], [30], [0], 1);
//     //   let alien = await alienContract.aliens(2);
//     //   console.log(alien)
//     // });
//   });

// });

// // describe("Bad Kids", function () {
// //   describe("BadKids", function () {
// //     it("Should deploy BadKids", async function () {
// //       const BadKids = await ethers.getContractFactory("BadKidsAlley");
// //       const baseUri =
// //         "https://gateway.pinata.cloud/ipfs/QmTV8L1G1D4ow9SA5Bnw3XZw7mdLkHo5uYfDsPbRqZqNm2/";
// //       let badKidsContract = await BadKids.deploy(baseUri);
// //       const [owner] = await ethers.getSigners();
// //       await badKidsContract.mint(owner.address, 1);
// //       const tokenUri = await badKidsContract.tokenURI(0);
// //       console.log({ tokenUri });
// //     });
// //   });
// // });

// // describe("My NFT Game", function () {
// //   let alienContract;
// //   let lootContract;
// //   let firstPlayer;

// //     describe("test buffs", function () {
// //       it("test buff values", async function () {
// //         let buff = await alienContract.testFight(20, 10, [1, 2, 3]);
// //         console.log(buff.toNumber());
// //         buff = await alienContract.testFight(50, 3, [1, 2]);
// //         console.log(buff.toNumber());
// //         buff = await alienContract.testFight(90, 3, [1]);
// //         console.log(buff.toNumber());
// //       });
// //     });

// // });
