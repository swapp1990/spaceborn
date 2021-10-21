pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./Alien.sol";
import "./Gears.sol";

pragma experimental ABIEncoderV2;

contract GameManager {
	Alien alienContract;
	Gears gearsContract;

	constructor(address alienAddress, address gearsAddress) public {
		alienContract = Alien(alienAddress);
		gearsContract = Gears(gearsAddress);
	}

	event PlayerWon(uint256 tokenId, uint256 finalProbs, address sender);
	event AlienWon(uint256 tokenId, uint256 finalProbs, address sender);

	function random(string memory input) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(input)));
    }

	function getRandom(uint256 clientRandom) public view returns (uint256) {
		uint256 rand = random(string(abi.encodePacked( blockhash(block.number), msg.sender, address(this), clientRandom )));
		uint256 catIdx = rand % 100;
		return catIdx;
	}

	function getFinalProbs(uint256 baseProbs, uint256 equippedCount) public view returns (uint256) {
		uint256 remainProbs = 100 - baseProbs;
		uint256 rarityBuff = 33;
		rarityBuff = rarityBuff * equippedCount;
		uint256 totalRarityBuff = 0;
		totalRarityBuff = totalRarityBuff+rarityBuff;
		if(totalRarityBuff > 99) {
			totalRarityBuff = 99;
		}
		uint256 modifiedBaseProbs = baseProbs - (totalRarityBuff * baseProbs/100);
		uint256 finalProbs = modifiedBaseProbs;
		return finalProbs;
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

	function fightAlien(uint256 alien_id, uint256 clientRandom) public {
		require(alienContract.canFight(alien_id), "Alien not exist/dead");
		uint256 rand100 = getRandom(clientRandom);

		uint256 finalProb = getFinalProbs(alienContract.getAlienBaseProb(alien_id), 0);
		if(rand100 > finalProb) {
			alienContract.setAlienDead(alien_id);
			emit PlayerWon(alien_id, finalProb, msg.sender);
			uint256 rarity = getGearRarity(alienContract.getAlienBaseProb(alien_id));
			gearsContract.dropGear(alienContract.getAlienName(alien_id), rarity, msg.sender);
		} else {
			emit AlienWon(alien_id, finalProb, msg.sender);
		}
	}

	function fightAlienTest(uint256 baseProbs, uint256 clientRandom, uint256 equippedCount) public {
		uint256 rand100 = getRandom(clientRandom);

		uint256 finalProb = getFinalProbs(baseProbs, equippedCount);
		if(rand100 > finalProb) {
			// alienContract.setAlienDead(alien_id);
			emit PlayerWon(0, finalProb, msg.sender);
			// uint256 rarity = getGearRarity(alienContract.getAlienBaseProb(alien_id));
			// gearsContract.dropGear(alienContract.getAlienName(alien_id), rarity, msg.sender);
		} else {
			emit AlienWon(0, finalProb, msg.sender);
		}
	}
}