pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./Alien.sol";
import "./Gears.sol";
import "./TokenDistributor.sol";

pragma experimental ABIEncoderV2;

contract Spaceborn {
    Alien alienContract;
    Gears gearsContract;
    TokenDistributor tokenDistContract;

    uint256 public freeGearsRemaining = 100;
    uint256 public allocatedReward = 5;

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
    mapping(uint256 => uint256) public round2GearLostProb;

    constructor(
        address alienAddress,
        address gearsAddress,
        address tokenDistAddress
    ) public {
        alienContract = Alien(alienAddress);
        gearsContract = Gears(gearsAddress);
        tokenDistContract = TokenDistributor(tokenDistAddress);
        gearsContract.approveGame(address(this));
        setupGame();
        initBuffs();
    }

    event PlayerWon(
        uint256 tokenId,
        uint256 finalProbs,
        address sender,
        uint256 playerReward
    );
    event AlienWon(
        uint256 tokenId,
        uint256 finalProbs,
        address sender,
        uint256 playerReward
    );
    event PlayerLostGear(uint256 tokenId, uint256 lostGearId, address sender);

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

    function setupGame() internal {
        round2GearLostProb[1] = 50;
        round2GearLostProb[2] = 70;
        round2GearLostProb[3] = 90;
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
                rarityBuff = 5;
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
                usedGears[i].catIdx
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

    function claimRandomGear() public {
        require(
            gearsContract.balanceOf(msg.sender) == 0,
            "Not eligible for free gear"
        );
        require(freeGearsRemaining > 0, "All free gears have been claimed");
        gearsContract.dropGear("Moloch", 0, msg.sender);
        freeGearsRemaining = freeGearsRemaining - 1;
    }

    function claimGear(uint256 catIdx, uint256 rarityIdx) public {
        gearsContract.dropGearByCat("Moloch", rarityIdx, catIdx, msg.sender);
    }

    function fightAlien(
        uint256 roundId,
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
        // // uint256 finalProb = 100;
        uint256 factor = 5;
        uint256 totalHealth = 0;
        for (uint256 i = 0; i < usedGears.length; i++) {
            UsedGear memory gear = usedGears[i];
            gearsContract.decreaseHealth(gear.gearIdx, factor);
        }

        uint256 playerReward = 100;
        tokenDistContract.rewardPlayer(msg.sender, playerReward);
        // tokenDistContract.rewardGameContract(address(this), 100);
        if (rand100 > finalProb) {
            alienContract.setAlienDead(alien_id);
            uint256 rarity = alienContract.getAlienGearRarity(alien_id);
            gearsContract.dropGear(
                alienContract.getAlienName(alien_id),
                rarity,
                msg.sender
            );
            emit PlayerWon(alien_id, finalProb, msg.sender, playerReward);
        } else {
            emit AlienWon(alien_id, finalProb, msg.sender, playerReward);
            if (usedGears.length > 0) {
                uint256 rand1002 = getRandom(clientRandom + 5);
                uint256 dropProb = round2GearLostProb[roundId];
                if (rand1002 < dropProb) {
                    UsedGear memory gear = usedGears[
                        rand100 % usedGears.length
                    ];
                    gearsContract.transferNft(gear.gearIdx, address(this));
                    emit PlayerLostGear(alien_id, gear.gearIdx, msg.sender);
                }
            }
        }
    }

    function getAddress() public view returns (address) {
        return address(this);
    }

    function getRoundLostProb(uint256 roundId) public view returns (uint256) {
        return round2GearLostProb[roundId];
    }
}
