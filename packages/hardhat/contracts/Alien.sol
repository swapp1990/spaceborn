pragma solidity ^0.8.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./AlienMetadataSvg.sol";

pragma experimental ABIEncoderV2;

contract Alien is ERC721, Ownable {
    using SafeMath for uint256;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    uint256 public lastTokenId;

    struct Alien {
        uint256 tokenId;
        string name;
        uint256 baseProb;
        uint256 catIdx;
        bool exists;
        bool isDead;
        uint256 roundId;
        uint256 dropGearRarity;
    }

    mapping(uint256 => Alien) public aliens;
    uint256[] public deadAliens;

    string[] private categories = [
        "Agility",
        "Powerful",
        "Mind Control",
        "Charm",
        "Replication",
        "Mimic",
        "Superintelligent",
        "NPC"
    ];

    constructor() public ERC721("Alien", "ALN") {}

    function mintMultipleAliens(
        string[] memory names,
        uint256[] memory baseProbs,
        uint256[] memory dropGearRarity,
        uint256 roundId
    ) public {
        for (uint256 i = 0; i < names.length; i++) {
            uint256 id = _tokenIds.current();
            uint256 rand = getRandom(id);
            _mint(msg.sender, id);
            lastTokenId = id;
            Alien storage alien = aliens[id];
            alien.tokenId = id;
            alien.name = names[i];
            alien.baseProb = baseProbs[i];
            alien.dropGearRarity = dropGearRarity[i];
            alien.roundId = roundId;
            uint256 alienCatIdx = rand % categories.length;
            alien.catIdx = alienCatIdx;
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

    function getAlienGearRarity(uint256 tokenId) public view returns (uint256) {
        return aliens[tokenId].dropGearRarity;
    }

    function getAlienCatIdx(uint256 tokenId) public view returns (uint256) {
        return aliens[tokenId].catIdx;
    }

    function getAlienName(uint256 tokenId) public view returns (string memory) {
        return aliens[tokenId].name;
    }

    function getAlienCats() public view returns (string[] memory) {
        return categories;
    }

    function getDeadAliens() public view returns (uint256[] memory) {
        return deadAliens;
    }

    function setAlienDead(uint256 tokenId) public {
        Alien storage alien = aliens[tokenId];
        alien.isDead = true;
        deadAliens.push(tokenId);
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

    function tokenURI(uint256 id) public view override returns (string memory) {
        require(_exists(id), "not exist");
        Alien storage alien = aliens[id];
        string memory cat = categories[alien.catIdx];
        return AlienMetadataSvg.tokenURI(id, alien.baseProb, cat);
    }

    function randomTokenURI(uint256 id) public view returns (string memory) {
        return AlienMetadataSvg.tokenURI(id, 0, "");
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

    function fixedAlien(
        uint256 id,
        uint256 baseProbs,
        uint256 catIdx
    ) public view returns (string memory) {
        uint256 rand = getRandom(id);
        // string memory cat = categories[rand % categories.length];
        string memory cat = categories[catIdx];
        return AlienMetadataSvg.tokenURI(id, baseProbs, cat);
    }
}
