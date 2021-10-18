pragma solidity ^0.8.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./GearsMetadataSvg.sol";

pragma experimental ABIEncoderV2;

contract Gears is ERC721Enumerable, Ownable  {
	using SafeMath for uint256;
	using Counters for Counters.Counter;
  	Counters.Counter private _tokenIds;
	uint public lastTokenId;

	struct Gear {
		uint256 tokenId;
		string name;
		uint256 rarity;
		address playerWonAddr;
		bool exists;
	}

	mapping (uint256 => Gear) public gears;

	event GearDropped(Gear gear);

	constructor() public ERC721("Gears", "GEAR") {

  	}

	function dropGear(string memory alienName, uint256 rarity, address playerWonAddr) external {
		uint256 id = _tokenIds.current();
		_mint(playerWonAddr, id);
		lastTokenId = id;
		Gear storage gear = gears[id];
		gear.tokenId = id;
		gear.name = string(abi.encodePacked("Dropped by ",  alienName));
		gear.rarity = rarity;
		gear.exists = true;
		gear.playerWonAddr = playerWonAddr;
		_tokenIds.increment();
		emit GearDropped(gear);
	}

	function tokenURI(uint256 id) public view override returns (string memory) {
		require(_exists(id), "not exist");
		Gear storage gear = gears[id];
		return GearsMetadataSvg.tokenURI(id, gear.rarity);
	}

	function randomTokenURI(uint256 id, uint256 rarityLevel) public view returns (string memory) {
		return GearsMetadataSvg.tokenURI(id, rarityLevel);
	}
}