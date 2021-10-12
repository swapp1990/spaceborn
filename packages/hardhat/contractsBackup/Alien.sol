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

	struct Alien {
		uint256 tokenId;
		string name;
		bool exists;
		bool isDead;
	}

	mapping (uint256 => Alien) public aliens;

	constructor() public ERC721("Alien", "ALN") {

  	}

	function mintMultipleAliens(string[] memory names) public {
		for(uint i=0; i<names.length; i++) {
			_tokenIds.increment();
			uint256 id = _tokenIds.current();
     		_mint(msg.sender, id);
			Alien storage alien = aliens[id];
			alien.tokenId = id;
			alien.name = names[i];
			alien.exists = true;
		}
	}
}