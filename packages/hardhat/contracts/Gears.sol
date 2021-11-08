pragma solidity ^0.8.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./GearsMetadataSvg.sol";

pragma experimental ABIEncoderV2;

contract Gears is ERC721Enumerable, Ownable {
    using SafeMath for uint256;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    uint256 public lastTokenId;

    mapping(string => string[]) loot2Names;

    struct Gear {
        uint256 tokenId;
        string name;
        uint256 rarity;
        address playerWonAddr;
        bool exists;
    }

    string[] private categories = [
        "Weapon",
        "Apparel",
        "Vehicle",
        "Pill",
        "Gizmo"
    ];

    mapping(uint256 => Gear) public gears;

    event GearDropped(Gear gear);

    constructor() public ERC721("Gears", "GEAR") {
        loot2Names["Weapon"] = [
            "Pistol",
            "Cannon",
            "Phaser",
            "Sniper",
            "Zapper"
        ];
        loot2Names["Apparel"] = [
            "Exosuit",
            "Power Armor",
            "Biosuit",
            "Gloves",
            "Nnaosuit",
            "Jacket"
        ];
        loot2Names["Vehicle"] = [
            "Hoverboard",
            "Superbike",
            "Air-ship",
            "Time Machine",
            "Auto-Car",
            "Hushicopter"
        ];
        loot2Names["Gizmo"] = [
            "Neutralizer",
            "Replicator",
            "Battery",
            "Fuel Canister",
            "Supercomputer"
        ];
        loot2Names["Pill"] = [
            "Soma",
            "Nootropic",
            "LSX",
            "Regeneration",
            "Food Replacement"
        ];
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
        uint256 rand = random(
            string(
                abi.encodePacked(
                    blockhash(block.number - 1),
                    msg.sender,
                    address(this),
                    toString(tokenId)
                )
            )
        );
        return rand % 100;
    }

    function pluck(uint256 tokenId) internal view returns (string[2] memory) {
        string[2] memory results;
        uint256 rand = getRandom(tokenId);
        string memory cat = categories[rand % categories.length];
        results[0] = cat;
        string[] memory gears = loot2Names[cat];
        string memory name = string(
            abi.encodePacked(gears[rand % gears.length])
        );
        results[1] = name;
        return results;
    }

    function dropGear(
        string memory alienName,
        uint256 rarity,
        address playerWonAddr
    ) external {
        uint256 id = _tokenIds.current();
        _mint(playerWonAddr, id);
        lastTokenId = id;
        Gear storage gear = gears[id];
        gear.tokenId = id;
        gear.name = string(abi.encodePacked("Dropped by ", alienName));
        gear.rarity = rarity;
        gear.exists = true;
        gear.playerWonAddr = playerWonAddr;
        _tokenIds.increment();
        emit GearDropped(gear);
    }

    function tokenURI(uint256 id) public view override returns (string memory) {
        require(_exists(id), "not exist");
        Gear storage gear = gears[id];
        string[2] memory results = pluck(id);
        return
            GearsMetadataSvg.tokenURI(id, results[0], results[1], gear.rarity);
    }

    function getGearCats() public view returns (string[] memory) {
        return categories;
    }

    function randomTokenURI(uint256 id, uint256 rarityLevel)
        public
        view
        returns (string memory)
    {
        string[2] memory results = pluck(id);
        return
            GearsMetadataSvg.tokenURI(id, results[0], results[1], rarityLevel);
    }
}
