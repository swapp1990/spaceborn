pragma solidity >=0.6.0 <0.8.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./WandMetadataSvg.sol";

pragma experimental ABIEncoderV2;

contract Wands is ERC721, Ownable {
	using Counters for Counters.Counter;
  	Counters.Counter private _tokenIds;
	
	struct Wands {
		uint256 tokenId;
		bool exists;
	}

	mapping (uint256 => Wands) public wandItems;

	event WandMinted(uint256 tokenId, uint256 rand);

	constructor() public ERC721("Wands", "WAND") {

	}

	function toString(uint256 value) internal pure returns (string memory) {
    // Inspired by OraclizeAPI's implementation - MIT license
    // https://github.com/oraclize/ethereum-api/blob/b42146b063c7d6ee1358846c198246239e9360e8/oraclizeAPI_0.4.25.sol

        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

	function random(string memory input) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(input)));
    }

	function getRandom(uint256 tokenId) public view returns (uint256) {
		uint256 rand = random(string(abi.encodePacked( blockhash(block.number-1), msg.sender, address(this), toString(tokenId) )));
		return rand % 100;
	}

	//Attributes
	string[] private creatures = [
		"Cat",
		"Cow",
		"Horse",
		"Pangolin",
		"Axolotl",
		"Deer",
		"Spider",
		"Salamander",
		"Centaur",
		"Griffin",
		"Minotaur",
		"Mermaid",
		"Unicorn",
		"Cyclops",
		"Phoenix",
		"Dragon",
		"Warewolf"
	];

	string[] private parts = [
		"Feather",
		"Skin",
		"Fur",
		"Hair",
		"Claw",
		"Tooth",
		"Whisker",
		"Bone",
		"Hoof",
		"Antler",
		"Flesh",
		"Blood"
	];

	string[] private prefix = [
		"Red",
		"Golden",
		"Ebony"
	];

	string[] private woodType = [
		"Ash",
		"Pine",
		"Maple",
		"Hazelnut",
		"Redwood",
		"Rowan",
		"Spruce",
		"Walnut",
		"Holly",
		"Willow",
		"Yew",
		"Sandalwood",
		"Pink Ivory",
		"Bubinga",
		"African Blackwood",
		"Purple Heart",
		"Lignum Vitae"
	];

	string[] private wandMakers = [
		"Romeo Zeigler",
		"Isaac Scamander",
		"Johannes Jonker",
		"Willow Wisp",
		"Arnold Peasegood",
		"Melvin Wimple",
		"Penguin Brothers",
		"Cornelius Agrippa"
	];

	function pluck(uint256 tokenId, uint size) internal view returns (string[] memory) {
		uint256 rand = getRandom(tokenId);
		string[] memory results = new string[](size);

		uint start = 0;
		uint end = 8;
		if(rand > 70) {
			start = 8;
			end = 13;
			if(rand > 90) {
				start = 12;
				end = creatures.length;
			}
		}

		string memory part = parts[rand%parts.length];
		uint idx = (rand % (end-start))+ start;
		string memory creature = creatures[idx];
		string memory coreType = "Birthstone";
		if(idx < 9 && rand < 40) {
			coreType = "Synthetic";
		}
		if(rand > 90) {
			start = 12;
			end = woodType.length;
		}
		uint lengthIdx = rand % 9+9;
		string memory length = string(abi.encodePacked(lengthIdx.toString(), '"'));
		string memory pre = "";
		if(rand > 50) {
			pre = prefix[rand%prefix.length];
			pre = string(abi.encodePacked(pre, ' '));
		}
		
		uint woodIdx = (rand % (end-start))+ start;
		results[0] = string(abi.encodePacked(pre,part," of ", creature));
		results[1] = coreType;
		results[2] = woodType[woodIdx];
		results[3] = wandMakers[rand%wandMakers.length];
		results[4] = length;
		return results;
	}

	function randomTokenURI(uint256 id, string memory alienName) public view returns (string memory) {
		// require(_exists(id), "not exist");
		string[] memory results = pluck(id, 5);
		return WandMetadataSvg.tokenURI( address(this), id, results);
	}
}