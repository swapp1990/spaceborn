pragma solidity ^0.8.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "./WandMetadataSvg.sol";

pragma experimental ABIEncoderV2;

interface CastlesInterface {
    function ownerOf(uint256 tokenId) external view returns (address owner);
}

contract Wands is ERC721Enumerable, ReentrancyGuard, Ownable {
	uint256 public castlesPrice = 10000000000000000; // 0.01 ETH
	uint256 public price = 50000000000000000; //0.05 ETH

	using Strings for uint256;

	//Castle Contract (arbitrum)
    address public castlesAddress = 0x71f5C328241fC3e03A8c79eDCD510037802D369c;
    CastlesInterface public castlesContract = CastlesInterface(castlesAddress);

	// Allow to extract from the smart contract, otherwise.. you're ded
    function ownerWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
	
	struct Wands {
		uint256 tokenId;
		bool exists;
	}

	mapping (uint256 => Wands) public wandItems;

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

	event WandMinted(uint256 tokenId, address sender);

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

	function mint(uint256 tokenId) public payable nonReentrant {
		require(tokenId > 0 && tokenId <= 10000, "Token ID invalid");
		require(price <= msg.value, "Ether value sent is not correct");
		_safeMint(_msgSender(), tokenId);
		emit WandMinted(tokenId, _msgSender());
	}

	function mintWithcastle(uint256 tokenId) public payable nonReentrant {
		require(tokenId > 0 && tokenId <= 10000, "Token ID invalid");
		require(castlesPrice <= msg.value, "Ether value sent is not correct");
		require(castlesContract.ownerOf(tokenId) == msg.sender, "Not the owner of this castle");
		_safeMint(_msgSender(), tokenId);
	}

	function randomTokenURI(uint256 id) public view returns (string memory) {
		// require(_exists(id), "not exist");
		string[] memory results = pluck(id, 5);
		return WandMetadataSvg.tokenURI( address(this), id, results);
	}

	function getTokenURI(uint256 id) public view returns (string memory) {
		// require(_exists(id), "not exist");
		string[] memory results = pluck(id, 5);
		return WandMetadataSvg.tokenURI( address(this), id, results);
	}

	function getTokenOwner(uint256 id) public view returns (address) {
		if(!_exists(id)) return address(0);
		return ownerOf(id);
	}

	// Allow the owner to claim in case some item remains unclaimed in the future
    function ownerClaim(uint256 tokenId) public nonReentrant onlyOwner {
        require(tokenId <= 10000, "Token ID invalid");
        _safeMint(owner(), tokenId);
    }
}