pragma solidity ^0.8.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

pragma experimental ABIEncoderV2;

contract Alien is ERC721, Ownable  {
	using SafeMath for uint256;
	using Counters for Counters.Counter;
  	Counters.Counter private _tokenIds;
	uint public lastTokenId;

	struct Alien {
		uint256 tokenId;
		string name;
		uint256 baseProb;
		bool exists;
		bool isDead;
	}

	mapping (uint256 => Alien) public aliens;

	constructor() public ERC721("Alien", "ALN") {

  	}

	function mintMultipleAliens(string[] memory names, uint256[] memory baseProbs) public {
		for(uint i=0; i<names.length; i++) {
			uint256 id = _tokenIds.current();
     		_mint(msg.sender, id);
			lastTokenId = id;
			Alien storage alien = aliens[id];
			alien.tokenId = id;
			alien.name = names[i];
			alien.baseProb = baseProbs[i];
			alien.exists = true;
			_tokenIds.increment();
		}
	}

	function canFight(uint256 tokenId) public view returns (bool) {
		return aliens[tokenId].exists && !aliens[tokenId].isDead;
	}

	function getAlienBaseProb(uint256 tokenId) public view returns (uint256) {
		return aliens[tokenId].baseProb;
	}

	function getAlienName(uint256 tokenId) public view returns (string memory) {
		return aliens[tokenId].name;
	}

	function setAlienDead(uint256 tokenId) public {
		Alien storage alien = aliens[tokenId];
		alien.isDead = true;
	}
}