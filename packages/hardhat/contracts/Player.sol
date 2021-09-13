//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./PlayerMetadataSvg.sol";

contract Player is ERC721("Player", "PLR") {
	using Counters for Counters.Counter;
  	Counters.Counter private _tokenIds;
  	address owner = address(0);
	
	struct Player {
		uint256 tokenId;
		bool exists;
		string name;
		uint8 level;
		uint256 xp;
	}

	mapping (address => uint256) public addr2token;
	mapping (address => Player) public players;

	event PlayerCreated(uint256 tokenId);

	modifier onlyOwner() {
		require(msg.sender == owner, "ONLY_OWNER");
		_;
	}

	function initialize() public {
		require(owner == address(0), "ALREADY_INITIALIZED");
		owner = msg.sender;
  	}

	function mint(string memory name)
		external returns (uint256) {
			_tokenIds.increment();
			uint256 id = _tokenIds.current();
     		_mint(msg.sender, id);
			Player storage player = players[msg.sender];
			player.tokenId = id;
			player.name = name;
			player.exists = true;
			player.xp = (uint8(blockhash(block.number)[0]) + uint8(bytes32(uint256(uint160(msg.sender)))[0])) * 2;
			addr2token[msg.sender] = id;
			emit PlayerCreated(_tokenIds.current());
			return id; 
		}

	function addXP(uint256 id, uint256 _xp) external onlyOwner returns (bool) {
		require(_exists(id), "Non-existent player");
		Player storage p = players[ownerOf(id)];
		p.xp += _xp;
		if ((p.xp > 100**((10+p.level)/10)) && (p.level <= type(uint8).max)) {
			p.level++;
			p.xp = 0;
		}
		return true;
	}
	
	function tokenURI(uint256 id) public view override returns (string memory) {
		require(_exists(id), "Non-existent player");
		Player storage p = players[ownerOf(id)];
		return PlayerMetadataSvg.tokenURI(ownerOf(id), id, p.name, p.level, p.xp);
	}

	function getTokenId(address addr) public view returns (uint256) {
		return addr2token[addr];
	}
}
