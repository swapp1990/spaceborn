pragma solidity ^0.8.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

pragma experimental ABIEncoderV2;

import "./AlienMetadataSvg.sol";
import "./ScifiLoot.sol";

contract AlienOld is ERC721, Ownable  {
	using SafeMath for uint256;
	using Counters for Counters.Counter;
  	Counters.Counter private _tokenIds;
	uint public lastTokenId;
	uint private maxWinCount;

	ScifiLoot lootContract;

	struct Alien {
		uint256 tokenId;
		string name;
		uint256 wonCount;
		uint256 baseProbs;
		bool isDead;
		bool exists;
	}

	mapping (uint256 => Alien) public aliens;
	mapping (address => uint256[]) public player2deadAliens;
	mapping (address => uint256) public player2wins;

	event PlayerWon(uint256 tokenId, uint256 startProbs, uint256 finalProbs, address sender);
	event AlienWon(uint256 tokenId, uint256 startProbs, uint256 finalProbs, address sender);
	event PlayerLostLoot(uint256 tokenId, uint256 lostLootId, address sender);
	event MintedAliens(address sender);
	
	constructor() public ERC721("Alien", "ALN") {
		maxWinCount = 20;
  	}

	function setLootAddress(address lootAddress) public {
		lootContract = ScifiLoot(lootAddress);
	}

	function mintAlien(string memory name, uint256 baseProbs)
		public
		returns (uint256) {
			_tokenIds.increment();
			uint256 id = _tokenIds.current();
     		_mint(msg.sender, id);
			lastTokenId = id;
			Alien storage alien = aliens[id];
			alien.tokenId = id;
			alien.name = name;
			alien.baseProbs = baseProbs;
			alien.exists = true;
			return id; 
		}
	
	function mintMultipleAliens(string[] memory names, uint256[] memory baseProbs) public {
		for(uint i=0; i<baseProbs.length; i++) {
			_tokenIds.increment();
			uint256 id = _tokenIds.current();
     		_mint(msg.sender, id);
			lastTokenId = id;
			Alien storage alien = aliens[id];
			alien.tokenId = id;
			alien.name = names[i];
			alien.baseProbs = baseProbs[i];
			alien.exists = true;
		}
		emit MintedAliens(msg.sender);
	}

	function getFinalProbs(uint256 baseProbs, uint256 wonCount, uint256[] memory loot_idxs) public view returns (uint256) {

		uint256 remainProbs = 100 - baseProbs;
		uint256 additionalBuff = getBuffValue(wonCount, remainProbs);
		uint256 totalRarityBuff = 0;
		for(uint i=0; i<loot_idxs.length; i++) {
			uint256 rarityBuff = 33;
			uint256 rarityLoot = lootContract.getLootRarity(loot_idxs[i]);
			if(rarityLoot == 4) {
				rarityBuff=rarityBuff*2;
			} else if(rarityLoot == 0) {
				rarityBuff = 10;
			} else if(rarityLoot == 1) {
				rarityBuff = 20;
			}
			totalRarityBuff = totalRarityBuff+rarityBuff;
		}
		if(totalRarityBuff > 99) {
			totalRarityBuff = 99;
		}
		
		uint256 modifiedBaseProbs = baseProbs - (totalRarityBuff * baseProbs/100);
		uint256 finalProbs = modifiedBaseProbs + additionalBuff;
		return finalProbs;
	}

	function testFight(uint256 baseProbs, uint256 wonCount, uint256[] memory loot_idxs) public view returns(uint256){
		uint256 rand100 = getRandom(23);
		uint256 lootIdx = rand100 % loot_idxs.length;
		// return getFinalProbs(baseProbs, wonCount, loot_idxs);
		return lootIdx;
	}

	function fightAlien(uint256 id, uint256 clientRandom, uint256[] memory loot_idxs) public returns(uint256) {
		uint256 rand100 = getRandom(clientRandom);
		Alien storage alien = aliens[id];
		uint256 finalProbs = getFinalProbs(alien.baseProbs, alien.wonCount, loot_idxs);
		if(rand100 > finalProbs) {
			player2wins[msg.sender] = player2wins[msg.sender]+1;
			player2deadAliens[msg.sender].push(id);
			alien.isDead = true;
			emit PlayerWon(id, alien.baseProbs, finalProbs, msg.sender);
		} else {
			alien.wonCount = alien.wonCount+1;
			emit AlienWon(id, alien.baseProbs, finalProbs, msg.sender);
			if(loot_idxs.length > 0 && rand100>50) {
				uint256 lootIdx = rand100 % loot_idxs.length;
				lootContract.transferNft(loot_idxs[lootIdx], address(this));
				emit PlayerLostLoot(id, loot_idxs[lootIdx], msg.sender); 
			}
		}
		return finalProbs;
	}
	
	function tokenURI(uint256 id) public view override returns (string memory) {
		require(_exists(id), "not exist");
		Alien storage a = aliens[id];
		return AlienMetadataSvg.tokenURI( ownerOf(id), id, a.name, a.wonCount );
	}

	function getKilledAliens(address player) public view returns (uint256[] memory aliens) {
		return player2deadAliens[player];
	}

	function random(string memory input) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(input)));
    }

	function getRandom(uint256 clientRandom) public view returns (uint256) {
		uint256 rand = random(string(abi.encodePacked( blockhash(block.number), msg.sender, address(this), clientRandom )));
		uint256 catIdx = rand % 100;
		return catIdx;
	}

	function getRandomWin(uint256 clientRandom, uint256 probs) public view returns (string memory) {
		uint256 rand = random(string(abi.encodePacked( blockhash(block.number-1), msg.sender, address(this), clientRandom )));
		uint256 rand100 = rand % 100;
		if(rand100 < probs) {
			return "Won";
		} else {
			return "Loss";
		}
	}

	function getBuffValue(uint256 wonCount, uint256 remainProbs) public view returns (uint256) {
		uint256 additionalBuff = (100 * wonCount)/20;
		if(additionalBuff > 100) {
			additionalBuff = 99;
		}
		uint256 additionalBuffFinal = additionalBuff * remainProbs;
		additionalBuffFinal = (additionalBuffFinal - (additionalBuffFinal % 100))/100;

		// additionalBuff = remainProbs * additionalBuff / remainProbs;
		return additionalBuffFinal;
	}

	function isAlienExists(uint256 tokenId) public view returns (bool) {
		return aliens[tokenId].exists;
	}

	function canFight(uint256 tokenId) public view returns (bool) {
		return aliens[tokenId].exists && !aliens[tokenId].isDead;
	}

	function getAlienName(uint256 tokenId) public view returns (string memory) {
		return aliens[tokenId].name;
	}

	function checkCorrectPlayer(uint256 tokenId, address player) public view returns (bool) {
		uint arrayLength = player2deadAliens[player].length;
		if(arrayLength == 0) return false;
		bool correct=false;
		for(uint i=0; i<arrayLength; i++) {
			if(player2deadAliens[player][i]==tokenId) {
				correct=true;
				break;
			}
		}
		return correct;
	}

	function getRarityFromDrop(uint256 tokenId) public view returns (uint256) {
		require(_exists(tokenId), "not exist");
		Alien storage a = aliens[tokenId];
		if(a.wonCount > 0) {
			if(a.wonCount > 2) {
				if(a.wonCount > 10) {
					return 3;
				}
				return 2;
			}
			return 1;
		}
		return 0;
	}

	function getAddress() public view returns (address) {
		return address(this);
	}
	
}