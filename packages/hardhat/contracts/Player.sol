//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./GameManager.sol";

contract Player is ERC721("Player", "PLR") {
	using Counters for Counters.Counter;
  	Counters.Counter private _tokenIds;
  	address owner = address(0);

	GameManager gameManager;
	constructor(address gameContractAddress) public {
		gameManager = GameManager(gameContractAddress);
	}
	
	struct Player {
		uint256 tokenId;
		bool exists;
		string name;
	}

	struct PlayerInp {
		string name;
	}

	mapping (address => Player) public players;
	mapping (address => uint256) public addr2token;

	event PlayerCreated(uint256 tokenId, Player player);

	modifier onlyOwner() {
		require(msg.sender == owner, "ONLY_OWNER");
		_;
	}

	function initialize() public {
		require(owner == address(0), "ALREADY_INITIALIZED");
		owner = msg.sender;
  	}

	function mint(PlayerInp memory playerInp) external {
		require(!players[msg.sender].exists, "Player already minted");
		_tokenIds.increment();
		uint256 id = _tokenIds.current();
		_mint(msg.sender, id);
		Player storage player = players[msg.sender];
		player.tokenId = id;
		player.name = playerInp.name;
		player.exists = true;
		addr2token[msg.sender] = id;
		emit PlayerCreated(_tokenIds.current(), player);
	}

	function getPlayer(uint256 id) public view returns (Player memory) {
		require(_exists(id), "Non-existent player");
		Player storage p = players[ownerOf(id)];
		return p;
	}

	function getTokenId(address addr) public view returns (uint256) {
		return addr2token[addr];
	}

	function takeAction(uint256 alien_id, uint256 clientRandom) public {
		gameManager.fightAlien(alien_id, clientRandom);
	}
}