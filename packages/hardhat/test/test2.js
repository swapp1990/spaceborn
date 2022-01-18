const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);


const GEAR_CATS = ["Weapon",
  "Apparel",
  "Vehicle",
  "Pill",
    "Gizmo"];

const ALIEN_CATS = ["Agility",
  "Powerful",
  "Mind Control",
  "Charm",
  "Replication",
  "Mimic",
  "Superintelligent",
  "NPC"];

describe("Game", function () {
  let owner;
  let player1;
  let player2;
  let gearsContract;
  let alienContract;
  let gameContract1;

  describe("Gears", function () {
    it("Should deploy token", async function () {
      [owner, player1, player2] = await ethers.getSigners();
    });

    it("Should deploy contracts", async function () {
      const Alien = await ethers.getContractFactory("Alien");
      alienContract = await Alien.deploy();
      const Gears = await ethers.getContractFactory("Gears");
      gearsContract = await Gears.deploy();

      const SpacebornTest = await ethers.getContractFactory("SpacebornTest");
      gameContract1 = await SpacebornTest.deploy(alienContract.address, gearsContract.address);
    });

    it("Mint 2 aliens", async function () {
      await alienContract.mintMultipleAliens(["Allen", "Bernard"], [0, 35], [0, 1], 1);
      let balance = await alienContract.balanceOf(owner.address);
      expect(await balance).to.equal(2);
    });

    async function testCombatProbs(gameContract, player, gearsIdxs = [], nFights = 10) {
      let gearsObjList = [];
      let alien_idx = 2;
      let alien = await alienContract.aliens(alien_idx);
      for (let i = 0; i < gearsIdxs.length; i++) {
        let gearFound = await gearsContract.gears(gearsIdxs[i]);
        let buffLevel = await gameContract.getCat2AlienBuff(alien.catIdx, gearFound.catIdx)
        gearsObjList.push({
          gearIdx: gearFound.tokenId,
          catIdx: gearFound.catIdx,
          rarityIdx: gearFound.rarity,
          catName: GEAR_CATS[gearFound.catIdx],
          buffLevel: buffLevel
        })
      }
      let gearsCat = "";
      if (gearsObjList.length == 0) {
        gearsCat = "()"
      } else {
        gearsCat = "(";
        
        gearsObjList.forEach(gl => {
          gearsCat += gl.catName + "[" + gl.buffLevel + "],"
        });
        gearsCat += ")"
      }
      
      let alienCat = ALIEN_CATS[alien.catIdx];
      console.log("Alien-" + alienCat + " (" + alien.baseProb.toNumber() + ")" + " -> " + gearsCat);
      let playerWonCount = 0;
      let alienWonCount = 0;
      let gearsLostCount = 0;
      let finalProb = 0;
      for (let i = 0; i < nFights; i++) {
          let clientRandom = Math.floor(Math.random() * 100);
          let res = await gameContract.connect(player).fightAlien(1, 2, clientRandom, gearsObjList);
          let receipt = await res.wait();
          let evnts = receipt.events?.filter((x) => { return (x.event == "PlayerWon") || (x.event == "AlienWon") || (x.event == "PlayerLostGear") })
          // console.log(evnts);
          if (evnts.length > 0) {
              // console.log(evnts[0]);
              finalProb= evnts[0].args.finalProb;
              // console.log(finalProb.toNumber())
              if (evnts[0].event == "PlayerWon") {
                  playerWonCount++;
              } else if (evnts[0].event == "AlienWon") {
                  alienWonCount++;
                  // console.log(evnts.length);
                  if (evnts.length > 1) {
                      // console.log("Lost Gear ", evnts[1].args.lostGearId.toNumber())
                      gearsLostCount++;
                  }
              }
          }
      }
              
      console.log("Final Alien Win %: " + finalProb.toNumber());
      console.log("Final Player Win %: " + (100-finalProb.toNumber()));
      // console.log("Result (player/alien): " + playerWonCount + ":" + alienWonCount);
      // console.log("gearsLostAvg: " + gearsLostCount + "/" + alienWonCount);
    }

    it("game probs", async function () {
      await gameContract1.connect(player2).claimGear(0, 0); //weapon
      await gameContract1.connect(player2).claimGear(1, 0); //apparel
      await gameContract1.connect(player2).claimGear(2, 0); //vehicle
      await gameContract1.connect(player2).claimGear(3, 0); //pill
      await gameContract1.connect(player2).claimGear(4, 0); //gizmo
      let p2_gears_balance = await gearsContract.balanceOf(player2.address);
      console.log({ p2_gears_balance: p2_gears_balance.toNumber() });
      await gearsContract.connect(player2).approveGear(gameContract1.address, 0);
      await alienContract.mintMultipleAliens2(["Tim"], [100], [3], [0], 1);
      let nFights = 10;
      // await testCombatProbs(gameContract1, player2, [0], nFights);
      // await testCombatProbs(gameContract1, player2, [1], nFights);
      // await testCombatProbs(gameContract1, player2, [2], nFights);
      // await testCombatProbs(gameContract1, player2, [3], nFights);
      // await testCombatProbs(gameContract1, player2, [4], nFights);
      // await testCombatProbs(gameContract1, player2, [0, 2], nFights);
    });
  });

});
