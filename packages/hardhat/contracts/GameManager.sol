pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./Alien.sol";

pragma experimental ABIEncoderV2;

contract GameManager {
	Alien alienContract;

	constructor(address alienContractAddress) public {
		alienContract = Alien(alienContractAddress);
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

	function getFinalProbs(uint256 base) public view returns (uint256) {
		return base;
	}

	function fightAlien(uint256 alien_id, uint256 clientRandom) public {
		require(alienContract.canFight(alien_id), "Alien not exist/dead");
		uint256 rand100 = getRandom(clientRandom);

		uint256 finalProb = getFinalProbs(alienContract.getAlienBaseProb(alien_id));
		if(rand100 > finalProb) {
			alienContract.setAlienDead(alien_id);
			emit PlayerWon(alien_id, finalProb, msg.sender);
		} else {
			emit AlienWon(alien_id, finalProb, msg.sender);
		}
	}
}