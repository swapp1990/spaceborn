const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("My NFT Game", function () {
  let firstPlayer;
  let alienContract;
  let gearsContract;
  let playerContract;
  let gameManagerContract;
  describe("Alien", function () {
    it("Should deploy contracts", async function () {
      const [owner] = await ethers.getSigners();
      firstPlayer = owner;
      const Alien = await ethers.getContractFactory("Alien");
      alienContract = await Alien.deploy();
      const gameManager = await ethers.getContractFactory("GameManager");
      const Gears = await ethers.getContractFactory("Gears");
      gearsContract = await Gears.deploy();
      gameManagerContract = await gameManager.deploy(alienContract.address, gearsContract.address);
      const Player = await ethers.getContractFactory("Player");
      playerContract = await Player.deploy(gameManagerContract.address);
      await playerContract.mint({ name: "Swap" });
      //   await playerContract.mint({ name: "Alex" });
    });

    it("Mint 5 tokens", async function () {
      await alienContract.mintMultipleAliens(["a1", "a2"], [30, 45]);
      let balance = await alienContract.balanceOf(firstPlayer.address);
      console.log({ balance: balance.toNumber() });
    });

    it("Game manager", async function () {
      const canFightB4 = await alienContract.canFight(0);
      console.log({ canFightB4 });
      const alienBuff = await gameManagerContract.getCat2AlienBuff(0, 0);
      console.log({ alienBuff: alienBuff.toNumber() });
      // const buffs = await gameManagerContract.gearCat2AlienBuffs;
      // console.log({ buffs })
      let alienBuff2 = await gameManagerContract.getCat2AlienBuff(1, 1);
      console.log({ alienBuff2: alienBuff2.toNumber() });
      alienBuff2 = await gameManagerContract.getCat2AlienBuff(2, 3);
      console.log({ alienBuff2: alienBuff2.toNumber() });

      const finalProb = await gameManagerContract.getFinalProbs(95, [{ rarityIdx: 0, catIdx: 0, gearIdx: 4 }, { rarityIdx: 0, catIdx: 0, gearIdx: 2 }], 0);
      console.log({ finalProb: finalProb.toNumber() });
    })
    // let random = Math.floor(Math.random() * (100 - 0 + 1) + 0);
    // console.log({ random });
    // await playerContract.takeAction(0, random);
    // const canFight = await alienContract.canFight(0);
    // console.log({ canFight });
  });
});
// describe("Bad Kids", function () {
//   describe("BadKids", function () {
//     it("Should deploy BadKids", async function () {
//       const BadKids = await ethers.getContractFactory("BadKidsAlley");
//       const baseUri =
//         "https://gateway.pinata.cloud/ipfs/QmTV8L1G1D4ow9SA5Bnw3XZw7mdLkHo5uYfDsPbRqZqNm2/";
//       let badKidsContract = await BadKids.deploy(baseUri);
//       const [owner] = await ethers.getSigners();
//       await badKidsContract.mint(owner.address, 1);
//       const tokenUri = await badKidsContract.tokenURI(0);
//       console.log({ tokenUri });
//     });
//   });
// });

// describe("My NFT Game", function () {
//   let alienContract;
//   let lootContract;
//   let firstPlayer;

//   describe("Alien", function () {
//     it("Should deploy Alien", async function () {
//       const Alien = await ethers.getContractFactory("Alien");
//       alienContract = await Alien.deploy();
//       const [owner] = await ethers.getSigners();
//       firstPlayer = owner;
//     });

//     describe("test buffs", function () {
//       it("test buff values", async function () {
//         let buff = await alienContract.testFight(20, 10, [1, 2, 3]);
//         console.log(buff.toNumber());
//         buff = await alienContract.testFight(50, 3, [1, 2]);
//         console.log(buff.toNumber());
//         buff = await alienContract.testFight(90, 3, [1]);
//         console.log(buff.toNumber());
//       });
//     });

//     //     describe("mintAlien()", function () {
//     //       it("Should be able to mint a new NFT", async function () {
//     //         await alienContract.mintAlien("Alen", 0);
//     //         expect(await alienContract.lastTokenId()).to.equal(1);
//     //       });
//     //       it("Should be able to mint multiple NFTs", async function () {
//     //         await alienContract.mintAlien("Trish", 0);
//     //         await alienContract.mintAlien("Lina", 20);
//     //         expect(await alienContract.lastTokenId()).to.equal(3);
//     //       });
//     //       it("Player should win fight", async function () {
//     //         await alienContract.fightAlien(1, 23);
//     //         const aln = await alienContract.aliens(1);
//     //         expect(await aln.isDead).to.equal(true);
//     //       });
//     //     });
//     //   });

//     //   describe("Loot", function () {
//     //     it("Should deploy Loot", async function () {
//     //       const ScifiLoot = await ethers.getContractFactory("ScifiLoot");
//     //       lootContract = await ScifiLoot.deploy(alienContract.address);
//     //     });
//     //     it("Should mint new loot", async function () {
//     //       const killedAlienId = 1;
//     //       await lootContract.mintLoot(killedAlienId);
//     //       const lootItem = await lootContract.lootItems(1);
//     //       //   console.log(await lootContract.ownerOf(lootItem.tokenId));
//     //       //   console.log(await lootContract.getAddress());
//     //       expect(await lootItem.tokenId).to.equal(1);
//     //       expect(await lootItem.alienId).to.equal(1);
//     //       expect(await lootItem.alienName).to.equal("Alen");
//     //       expect(await lootContract.ownerOf(lootItem.tokenId)).to.equal(
//     //         firstPlayer.address
//     //       );
//     //     });
//     //     it("Should transfer loot to alien", async function () {
//     //       await alienContract.transferLoot(1);
//     //       const alienContractAddress = await alienContract.getAddress();
//     //       expect(await lootContract.isTokenExists(1)).to.equal(true);
//     //       expect(await lootContract.ownerOf(1)).to.equal(alienContractAddress);
//     //     });
//     //     it("Should fight aliens with equipped loot", async function () {
//     //       const killedAlienId = 2;
//     //       await alienContract.fightAlien(killedAlienId, 77);
//     //       const aln = await alienContract.aliens(killedAlienId);
//     //       expect(await aln.isDead).to.equal(true);

//     //       await lootContract.mintLoot(killedAlienId);
//     //       const lootItem = await lootContract.lootItems(2);
//     //       expect(await lootItem.alienName).to.equal("Trish");
//     //       await alienContract.fightAlien(1, 23);
//     //     });
//   });
// });
