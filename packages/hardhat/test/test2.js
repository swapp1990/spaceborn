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

    it("game probs", async function () {
        await gameContract1.connect(player2).claimGear(0, 0);
        let p2_gears_balance = await gearsContract.balanceOf(player2.address);
        console.log({ p1_gears_balance: p2_gears_balance.toNumber() });
        await gearsContract.connect(player2).approveGear(gameContract1.address, 0);
        await alienContract.mintMultipleAliens2(["Tim"], [15], [1], [0], 1);
        
        let nFights = 100;
        // let playerWonCount = 0;
        // let alienWonCount = 0;
        // for (let i = 0; i < nFights; i++) {
        //     let clientRandom = Math.floor(Math.random() * 100);
        //     let gearsIdx = [];
        //     let res = await gameContract1.connect(player2).fightAlien(1, 2, clientRandom, gearsIdx);
        //     let receipt = await res.wait();
        //     let evnts = receipt.events?.filter((x) => { return (x.event == "PlayerWon") ||  (x.event == "AlienWon")})
        //     if (evnts.length > 0 && evnts[0].event == "PlayerWon") {
        //         playerWonCount++;
        //     } else if (evnts.length > 0 && evnts[0].event == "AlienWon") {
        //         alienWonCount++;
        //     }
        // }
        // console.log(playerWonCount, alienWonCount);

        playerWonCount = 0;
        alienWonCount = 0;
        let gearsLostCount = 0;
        let currGearIdx = 0;
        let gearsIdx = [{
            rarityIdx: 0, catIdx: 0, gearIdx: 0
        }];
        let gearsCat = GEAR_CATS[currGearIdx];
        let alien = await alienContract.aliens(2);
        let alienCat = ALIEN_CATS[alien.catIdx];
        console.log(gearsCat + " -> " + alienCat + " (" + alien.baseProb.toNumber() + ")");
        let finalProb = 0;
        for (let i = 0; i < nFights; i++) {
            let clientRandom = Math.floor(Math.random() * 100);
            let res = await gameContract1.connect(player2).fightAlien(1, 2, clientRandom, gearsIdx);
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
        let gearsLostAvg = (gearsLostCount/alienWonCount) * 100;
        
        console.log("Final Prob: " + finalProb.toNumber());
        console.log("Result: " + playerWonCount + ":" + alienWonCount);
        console.log("gearsLostAvg: " + gearsLostCount + "/" + alienWonCount);
    });
  });

});
