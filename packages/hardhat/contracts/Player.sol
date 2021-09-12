pragma solidity >=0.6.0 <0.8.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./PlayerMetadataSvg.sol";

contract Player is ERC721, Ownable {
	using Counters for Counters.Counter;
  	Counters.Counter private _tokenIds;
	
	struct Player {
		uint256 tokenId;
		bool exists;
		string name;
	}

	mapping (address => uint256) public addr2token;
	mapping (address => Player) public players;

	event PlayerCreated(uint256 tokenId);

	constructor() public ERC721("Player", "PLR") {
    // RELEASE THE LOOGIES!
  	}

	function mintYourPlayer(string memory name)
		public
		returns (uint256) {
			_tokenIds.increment();
			uint256 id = _tokenIds.current();
     		_mint(msg.sender, id);
			Player storage player = players[msg.sender];
			player.tokenId = id;
			player.name = name;
			player.exists = true;
			addr2token[msg.sender] = id;
			emit PlayerCreated(_tokenIds.current());
			return id; 
		}
	
	function tokenURI(uint256 id) public view override returns (string memory) {
		require(_exists(id), "not exist");
		Player storage p = players[ownerOf(id)];
		return PlayerMetadataSvg.tokenURI( ownerOf(id), id, p.name );
	}

	function getTokenId(address addr) public view returns (uint256) {
		return addr2token[addr];
	}
}