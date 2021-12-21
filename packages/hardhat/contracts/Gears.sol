pragma solidity ^0.8.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./GearsMetadataSvg.sol";

pragma experimental ABIEncoderV2;
import "./GameManager.sol";

contract Gears is ERC721Enumerable, Ownable {
    using SafeMath for uint256;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    uint256 public lastTokenId;

    address public approvedGameContract;

    mapping(uint256 => string[]) loot2Names;

    struct Gear {
        uint256 tokenId;
        uint256 catIdx;
        uint256 titleIdx;
        uint256 health;
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
        loot2Names[0] = ["Pistol", "Cannon", "Phaser", "Sniper", "Zapper"];
        loot2Names[1] = [
            "Exosuit",
            "Power Armor",
            "Biosuit",
            "Gloves",
            "Nnaosuit",
            "Jacket"
        ];
        loot2Names[2] = [
            "Hoverboard",
            "Superbike",
            "Air-ship",
            "Time Machine",
            "Auto-Car",
            "Hushicopter"
        ];
        loot2Names[3] = [
            "Neutralizer",
            "Replicator",
            "Battery",
            "Fuel Canister",
            "Supercomputer"
        ];
        loot2Names[4] = [
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

    modifier onlyBy() {
        require(
            msg.sender == approvedGameContract,
            "Game contract not approved"
        );
        _;
    }

    function pluck(uint256 catIdx, uint256 titleIdx)
        internal
        view
        returns (string[2] memory)
    {
        string[2] memory results;
        results[0] = categories[catIdx];
        string memory name = loot2Names[catIdx][titleIdx];
        results[1] = string(abi.encodePacked(name));
        return results;
    }

    function dropGear(
        string memory alienName,
        uint256 rarity,
        address playerWonAddr
    ) external onlyBy {
        // require(deadAliens[alienId] == false, "Already minted!");
        // require(alienContract.isAlienExists(alienId), "Alien does not exist");
        // require(
        //     alienContract.checkCorrectPlayer(alienId, msg.sender),
        //     "Incorrect player"
        // );

        uint256 id = _tokenIds.current();
        // require(id > 0 && id <= 10000, "Token ID invalid");
        _mint(playerWonAddr, id);

        lastTokenId = id;
        uint256 rand = getRandom(id);
        Gear storage gear = gears[id];
        gear.tokenId = id;
        gear.catIdx = rand % categories.length;
        gear.titleIdx = rand % loot2Names[gear.catIdx].length;
        gear.name = string(abi.encodePacked("Dropped by ", alienName));
        gear.rarity = rarity;
        gear.health = 100;
        gear.exists = true;
        gear.playerWonAddr = playerWonAddr;
        _tokenIds.increment();
        emit GearDropped(gear);
    }

    function decreaseHealth(uint256 tokenId, uint256 factor) external onlyBy {
        require(_exists(tokenId), "not exist");
        Gear storage gear = gears[tokenId];
        if (gear.health > 0) {
            gear.health = gear.health - factor;
        }
    }

    function approveGame(address gameContract) public {
        approvedGameContract = gameContract;
    }

    function approveGear(address gameContract, uint256 tokenId) public {
        require(_exists(tokenId), "not exist");
        approve(gameContract, tokenId);
    }

    function tokenURI(uint256 id) public view override returns (string memory) {
        require(_exists(id), "not exist");
        Gear storage gear = gears[id];
        string[2] memory results = pluck(gear.catIdx, gear.titleIdx);
        return
            GearsMetadataSvg.tokenURI(id, results[0], results[1], gear.rarity);
    }

    function randomTokenURI(uint256 id, Gear memory gear)
        public
        view
        returns (string memory)
    {
        string[2] memory results = pluck(gear.catIdx, gear.titleIdx);
        return
            GearsMetadataSvg.tokenURI(id, results[0], results[1], gear.rarity);
    }

    function getGearCats() public view returns (string[] memory) {
        return categories;
    }

    function transferNft(uint256 tokenId, address address_to)
        external
        onlyBy
        returns (bool)
    {
        require(_exists(tokenId), "not exist");
        require(
            address_to == approvedGameContract,
            "cannot transfer gear to unapproved address"
        );
        transferFrom(ownerOf(tokenId), address_to, tokenId);
        return true;
    }

    function isApproved(uint256 tokenId, address contractAddr)
        public
        view
        returns (bool)
    {
        require(_exists(tokenId), "not exist");
        return _isApprovedOrOwner(contractAddr, tokenId);
    }
}
