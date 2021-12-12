pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./Alien.sol";

pragma experimental ABIEncoderV2;

contract GameManager {
    Alien alienContract;

    constructor(address alienContractAddress) public {
        alienContract = Alien(alienContractAddress);
    }

    struct AliensInCombat {
        uint256 tokenId;
        bool busy;
    }

    mapping(address => Alien) public player2alien;

    // function getRandom(uint256 clientRandom) public view returns (uint256) {
    // 	uint256 rand = random(string(abi.encodePacked( blockhash(block.number), msg.sender, address(this), clientRandom )));
    // 	uint256 catIdx = rand % 100;
    // 	return catIdx;
    // }

    function fightAlien(
        uint256 alien_id,
        uint256[] memory gears_used,
        uint256 clientRandom
    ) {
        require(alienContract.canFight(alien_id), "Alien not exist/dead");
        // uint256 rand100 = getRandom(clientRandom);
        player2alien[msg.sender] = new AliensInCombat(alien_id, true);
    }

    function getAddress() public view returns (address) {
        return address(this);
    }
}
