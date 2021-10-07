pragma solidity ^0.8.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./LootMetadataSvg.sol";
import "./Alien.sol";

contract ScifiLoot is ERC721Enumerable, Ownable {
	using Counters for Counters.Counter;
  	Counters.Counter private _tokenIds;
	Alien alienContract;  
	// address public owner;

	// string[] categories = [
	// 	"WEAPON",
	// 	"PILL",
	// 	"VEHICLE",
	// 	"DEFFENSE"
	// ];

	string[] private typePrefix = [
		"Powercore",
		"Electrifying",
		"Ultimate",
		"Unholy",
		"Axiomatic",
		"Freezing",
		"Magma",
		"Evasive",
		"Silver Shadow",
		"Swift",
		"Reverberating"
	];

	string[] private typeSuffix = [
		"of Brilliance",
		"of Reflection",
		"Sonic Blast",
		"of Resistence",
		"of Fury",
		"of earthly core"
	];

	string[] private latin = [
		"Acanthuridae", "Achatina", "Achatinoidea", "Acinonyx"
	];

	string[] private categories = [
		"Weapon", "Apparel", "Vehicle", "Pill", "Gizmo"
	];

	string[] private factions = ["Munitiers", "Ancients", "Rogue", "Freelance"];

	mapping (string => string[]) loot2Names;
	mapping (string => string[]) faction2Corps;
	mapping (string => string[]) faction2lore;
	
	struct ScifiLoot {
		uint256 tokenId;
		uint256 alienId;
		string alienName;
		uint256 rarityLevel;
		uint256 category; 
		bool exists;
	}

	mapping (uint256 => ScifiLoot) public lootItems;
	mapping (uint256 => bool) public deadAliens;

	event LootMinted(uint256 tokenId, uint256 rand);

	// modifier onlyOwner {
  	// 	require(msg.sender == owner);_;
	// }

	// function changeBase(address alienAddress) public onlyOwner returns(bool success) {
	// 	alien = Alien(alienAddress);
	// 	return true;
	// }

	constructor(address alienAddress) public ERC721("ScifiLoot", "SFL") {
		alienContract = Alien(alienAddress);
		alienContract.setLootAddress(address(this));
		// owner = msg.sender;
		//https://www.fantasynamegenerators.com/sci-fi-gun-names.php
		loot2Names["Weapon"] = ["Pistol", "Cannon", "Phaser", "Sniper", "Zapper"];
		loot2Names["Apparel"] = ["Exosuit", "Power Armor", "Biosuit", "Gloves", "Nnaosuit", "Jacket"];
		//http://www.technovelgy.com/ct/Science_List_Detail.asp?BT=Transportation
		loot2Names["Vehicle"] = ["Hoverboard", "Superbike", "Air-ship", "Time Machine", "Auto-Car", "Hushicopter"];
		loot2Names["Gizmo"] = ["Neutralizer","Replicator","Battery","Fuel Canister","Supercomputer"];
		loot2Names["Pill"] = ["Soma","Nootropic","LSX","Regeneration","Food Replacement"];

		faction2Corps["Munitiers"] = ["Tempest Space Corps","Stalker Armada","Demolition Star Division","Giant Claw Division" ];
		faction2Corps["Ancients"] = ["Eternal Dominion","Unity Space Forces","Angel Wing Care","Federation Navy"];
		faction2Corps["Rogue"] = ["Infernal Squadron","Darkness Fleet", "Black Hole Division", "Crimson Skies"];
		faction2Corps["Freelance"] = ["Limbo Corp", "Void Stellar", "Aurora Navy", "Frostfire Legion"];

		faction2lore["Munitiers"] = ["Humans conquered the stars.", "And then we promptly stained the stars", "with blood sacrifices."];
		faction2lore["Ancients"] = ["We knew that freedom wouldnt be free.", "But we didnt anticipate", "that it would be so expensive."];
		faction2lore["Rogue"] = ["Moloch hired numerous guards to", "protect this item from thieves.", "He never counted on the guards stealing."];
		faction2lore["Freelance"] = ["The multiverse is a strange and wonderful place", "filled with wonderful ideas", "ready to be imported into our galaxy."];
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
	
	function pluck(uint256 tokenId) internal view returns (string[4] memory) {
		uint256 rand = getRandom(tokenId);
		string memory cat = categories[rand % categories.length];
		string memory faction = factions[rand % factions.length];
		string[] memory gears = loot2Names[cat];
		string[] memory corps = faction2Corps[faction];

		string memory prefix = typePrefix[rand % typePrefix.length];
		string memory suffix = typeSuffix[rand % typeSuffix.length];
		string memory name = string(abi.encodePacked(prefix, ' ' ,gears[rand % gears.length], ' ', suffix));
		string[4] memory results;
		results[0] = name;
		results[1] = cat;
		results[2] = corps[rand % corps.length];
		results[3] = faction;
		return results;
	}

	function pluck_lore(uint256 tokenId, string memory faction) internal view returns (string[] memory) {
		// uint256 rand = getRandom(tokenId);
		return faction2lore[faction];
	}

	function conditionalMint(uint256 alienId) public returns (string memory) {
		return alienContract.getAlienName(alienId);
	}

	function transferNft(uint256 tokenId, address address_to) public returns (bool) {
		require(_exists(tokenId), "not exist");
		transferFrom(ownerOf(tokenId), address_to, tokenId);
		return true;
	}

	function mintFreeLoot() public returns (uint256) {
		_tokenIds.increment();
		uint256 id = _tokenIds.current();
		_mint(msg.sender, id);
		ScifiLoot storage loot = lootItems[id];
		loot.tokenId = id;
		loot.alienId = 0;
		loot.alienName = "Unknown";
		loot.rarityLevel = 0;
		loot.exists = true;

		uint256 rand = random(string(abi.encodePacked( blockhash(block.number-1), msg.sender, address(this) )));
		uint256 catIdx = rand % categories.length;

		loot.category = catIdx;
		approve(alienContract.getAddress(), id);
		emit LootMinted(_tokenIds.current(), rand);
	}

	function mintLoot(uint256 alienId)
		public
		returns (uint256) {
			require(deadAliens[alienId] == false, "Already minted!");
			require(alienContract.isAlienExists(alienId), "Alien does not exist");
			require(alienContract.checkCorrectPlayer(alienId, msg.sender), "Incorrect player");
			uint256 rarityLevel = alienContract.getRarityFromDrop(alienId);
			_tokenIds.increment();
			uint256 id = _tokenIds.current();
     		_mint(msg.sender, id);
			ScifiLoot storage loot = lootItems[id];
			loot.tokenId = id;
			loot.alienId = alienId;
			loot.alienName = alienContract.getAlienName(alienId);
			loot.rarityLevel = rarityLevel;
			loot.exists = true;
			deadAliens[alienId] = true;

			uint256 rand = random(string(abi.encodePacked( blockhash(block.number-1), msg.sender, address(this) )));
			uint256 catIdx = rand % categories.length;

			loot.category = catIdx;

			approve(alienContract.getAddress(), id);

			emit LootMinted(_tokenIds.current(), rand);
			return id;
		}
	
	function tokenURI(uint256 id) public view override returns (string memory) {
		require(_exists(id), "not exist");
		ScifiLoot storage a = lootItems[id];
		string[4] memory results = pluck(id);
		string[] memory lores = pluck_lore(id, results[3]);
		return LootMetadataSvg.tokenURI( ownerOf(id), id, results[0], results[1], a.rarityLevel, results[2], lores, a.alienName );
	}

	function randomTokenURI(uint256 id) public view returns (string memory) {
		// require(_exists(id), "not exist");
		string[4] memory results = pluck(id);
		string[] memory lores = pluck_lore(id, results[3]);
		return LootMetadataSvg.tokenURI( address(this), id, results[0], results[1], 0, results[2], lores, "Thoniun" );
	}

	function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");

        _transfer(from, to, tokenId);
    }

	function isTokenExists(uint256 id) public view returns(bool) {
		return _exists(id);
	}

	function getAddress() public view returns (address) {
		return address(this);
	}

	function getLootRarity(uint256 tokenId) public view returns (uint256) {
		return lootItems[tokenId].rarityLevel;
	}
}