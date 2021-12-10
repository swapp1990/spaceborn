pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./Alien.sol";
import "./Gears.sol";

pragma experimental ABIEncoderV2;

contract GameManager {
    Alien alienContract;
    Gears gearsContract;

    struct UsedGear {
        uint256 rarityIdx;
        uint256 catIdx;
        uint256 gearIdx;
    }

    // struct GearCatToAlienCat {
    //     uint256 gearCatIdx;
    //     uint256 alienCatIdx;
    // }

    // mapping(string => uint256) alienNameToIdx;
    // mapping(string => uint256) gearTypeToIdx;
    mapping(uint256 => uint256) public gearCat2AlienBuffs;

    constructor(address alienAddress, address gearsAddress) public {
        alienContract = Alien(alienAddress);
        gearsContract = Gears(gearsAddress);
        initBuffs();
    }

    event PlayerWon(uint256 tokenId, uint256 finalProbs, address sender);
    event AlienWon(uint256 tokenId, uint256 finalProbs, address sender);

    function random(string memory input) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(input)));
    }

    function getRandom(uint256 clientRandom) public view returns (uint256) {
        uint256 rand = random(
            string(
                abi.encodePacked(
                    blockhash(block.number),
                    msg.sender,
                    address(this),
                    clientRandom
                )
            )
        );
        uint256 catIdx = rand % 100;
        return catIdx;
    }

    function initBuffs() internal {
        // string[] memory catsAlien = alienContract.getAlienCats();
        // string[] memory catsGears = gearsContract.getGearCats();
        // for (uint256 i = 0; i < catsGears.length; i++) {
        //     gearTypeToIdx[catsGears[i]] = i;
        // }
        // uint256 mapCount = 0;
        // for (uint256 i = 0; i < catsAlien.length; i++) {
        //     alienNameToIdx[catsAlien[i]] = i;
        // }

        /*	Agility -> Weapon - 2
					-> Apparel - 1
					-> Vehicle - 5
					-> Pill - 4
					-> Gizmo - 3
		*/
        gearCat2AlienBuffs[11] = 2;
        gearCat2AlienBuffs[12] = 1;
        gearCat2AlienBuffs[13] = 5;
        gearCat2AlienBuffs[14] = 4;
        gearCat2AlienBuffs[15] = 3;

        /*	Power	-> Weapon - 5
					-> Apparel - 2
					-> Vehicle - 1
					-> Pill - 3
					-> Gizmo - 4
		*/
        gearCat2AlienBuffs[21] = 5;
        gearCat2AlienBuffs[22] = 2;
        gearCat2AlienBuffs[23] = 1;
        gearCat2AlienBuffs[24] = 3;
        gearCat2AlienBuffs[25] = 4;

        /*	Mind	-> Weapon - 1
					-> Apparel - 3
					-> Vehicle - 2
					-> Pill - 5
					-> Gizmo - 4
		*/
        gearCat2AlienBuffs[31] = 1;
        gearCat2AlienBuffs[32] = 3;
        gearCat2AlienBuffs[33] = 2;
        gearCat2AlienBuffs[34] = 5;
        gearCat2AlienBuffs[35] = 4;

        /*	Charm	-> Weapon - 2
					-> Apparel - 5
					-> Vehicle - 1
					-> Pill - 4
					-> Gizmo - 3
		*/
        gearCat2AlienBuffs[41] = 2;
        gearCat2AlienBuffs[42] = 5;
        gearCat2AlienBuffs[43] = 1;
        gearCat2AlienBuffs[44] = 4;
        gearCat2AlienBuffs[45] = 3;

        /*	Replication	-> Weapon - 4
					-> Apparel - 2
					-> Vehicle - 3
					-> Pill - 1
					-> Gizmo - 5
		*/
        gearCat2AlienBuffs[51] = 4;
        gearCat2AlienBuffs[52] = 2;
        gearCat2AlienBuffs[53] = 3;
        gearCat2AlienBuffs[54] = 1;
        gearCat2AlienBuffs[55] = 5;

        /*	Mimic	-> Weapon - 1
					-> Apparel - 5
					-> Vehicle - 3
					-> Pill - 4
					-> Gizmo - 2
		*/
        gearCat2AlienBuffs[61] = 1;
        gearCat2AlienBuffs[62] = 5;
        gearCat2AlienBuffs[63] = 3;
        gearCat2AlienBuffs[64] = 4;
        gearCat2AlienBuffs[65] = 2;

        /*	AGI		-> Weapon - 3
					-> Apparel - 4
					-> Vehicle - 2
					-> Pill - 1
					-> Gizmo - 5
		*/
        gearCat2AlienBuffs[71] = 3;
        gearCat2AlienBuffs[72] = 4;
        gearCat2AlienBuffs[73] = 2;
        gearCat2AlienBuffs[74] = 1;
        gearCat2AlienBuffs[75] = 5;

        /*	NPC		-> Weapon - 1
					-> Apparel - 4
					-> Vehicle - 3
					-> Pill - 5
					-> Gizmo - 2
		*/
        gearCat2AlienBuffs[81] = 1;
        gearCat2AlienBuffs[82] = 4;
        gearCat2AlienBuffs[83] = 3;
        gearCat2AlienBuffs[84] = 5;
        gearCat2AlienBuffs[85] = 2;
    }

    function getCat2AlienBuff(uint256 alienCatIdx, uint256 gearCatIdx)
        public
        view
        returns (uint256)
    {
        uint256 findMapIdx = (alienCatIdx + 1) * 10 + (gearCatIdx + 1);
        return gearCat2AlienBuffs[findMapIdx];
    }

    function getBuff(uint256 idx) public view returns (uint256) {
        return gearCat2AlienBuffs[idx];
    }

    function calculateBuff(
        uint256 baseProbs,
        UsedGear[] memory usedGears,
        uint256 alienCatIdx
    ) public view returns (uint256) {
        uint256 remainProbs = 100 - baseProbs;
        uint256 additionalBuffAlien = 0;
        uint256 totalRarityBuff = 0;
        //calculate rarity buff of gears which reduces the probability of winning
        for (uint256 i = 0; i < usedGears.length; i++) {
            uint256 rarityBuff = 33;
            uint256 rarityLoot = usedGears[i].rarityIdx;
            if (rarityLoot == 4) {
                rarityBuff = rarityBuff * 2;
            } else if (rarityLoot == 0) {
                rarityBuff = 10;
            } else if (rarityLoot == 1) {
                rarityBuff = 20;
            }
            // rarityBuff = rarityBuff * equippedCount;

            totalRarityBuff = totalRarityBuff + rarityBuff;
        }

        //calculate category buff of gears
        uint256 totalCatBuff = 0;
        for (uint256 i = 0; i < usedGears.length; i++) {
            uint256 catBuff = 33;
            uint256 catBuffLevel = getCat2AlienBuff(
                alienCatIdx,
                usedGears[i].gearIdx
            );
            uint256 percentEffectOfCat = catBuffLevel * 20;
            catBuff = (percentEffectOfCat * catBuff) / 100;
            totalCatBuff = totalCatBuff + catBuff;
        }
        uint256 totalBuff = totalRarityBuff + totalCatBuff;
        if (totalBuff > 99) {
            totalBuff = 99;
        }
        return (totalBuff * baseProbs) / 100;
    }

    function getTotalBuff(
        uint256 baseProbs,
        UsedGear[] memory usedGears,
        uint256 alienCatIdx
    ) public view returns (uint256) {
        return calculateBuff(baseProbs, usedGears, alienCatIdx);
    }

    function getFinalProbs(
        uint256 baseProbs,
        UsedGear[] memory usedGears,
        uint256 alienCatIdx
    ) public view returns (uint256) {
        uint256 modifiedBaseProbs = baseProbs -
            calculateBuff(baseProbs, usedGears, alienCatIdx);
        // uint256 finalProbs = modifiedBaseProbs;
        return modifiedBaseProbs;
    }

    function getGearRarity(uint256 baseProb) public view returns (uint256) {
        // string memory rarity = "Common";
        // if(baseProb >=50 && baseProb <= 80) {
        // 	rarity = "Uncommon";
        // } else if(baseProb > 80) {
        // 	rarity = "Rare";
        // }
        return 0;
    }

    function claimRandomGear() public {
        gearsContract.dropGear("Moloch", 0, msg.sender);
    }

    function fightAlien(
        uint256 alien_id,
        uint256 clientRandom,
        UsedGear[] memory usedGears
    ) public {
        require(alienContract.canFight(alien_id), "Alien not exist/dead");
        uint256 rand100 = getRandom(clientRandom);

        uint256 finalProb = getFinalProbs(
            alienContract.getAlienBaseProb(alien_id),
            usedGears,
            alienContract.getAlienCatIdx(alien_id)
        );
        if (rand100 > finalProb) {
            alienContract.setAlienDead(alien_id);
            uint256 rarity = alienContract.getAlienGearRarity(alien_id);
            gearsContract.dropGear(
                alienContract.getAlienName(alien_id),
                rarity,
                msg.sender
            );
            emit PlayerWon(0, finalProb, msg.sender);
        } else {
            emit AlienWon(0, finalProb, msg.sender);
        }
    }

    function fightAlienTest(
        uint256 baseProbs,
        uint256 clientRandom,
        UsedGear[] memory usedGears,
        uint256 alienCatIdx
    ) public {
        uint256 rand100 = getRandom(clientRandom);

        uint256 finalProb = getFinalProbs(baseProbs, usedGears, alienCatIdx);
        if (rand100 > finalProb) {
            // alienContract.setAlienDead(alien_id);
            emit PlayerWon(0, finalProb, msg.sender);
            // uint256 rarity = getGearRarity(alienContract.getAlienBaseProb(alien_id));
            // gearsContract.dropGear(alienContract.getAlienName(alien_id), rarity, msg.sender);
        } else {
            emit AlienWon(0, finalProb, msg.sender);
        }
    }
}
