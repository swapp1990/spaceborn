pragma solidity ^0.8.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract TestNFT is ERC721Enumerable, ReentrancyGuard, Ownable {
	uint256 public nftPrice = 10000000000000000; // 0.01 ETH

	constructor() public ERC721("TEST", "TEST") {

	}

	function mint(uint256 tokenId) public payable nonReentrant {
		require(tokenId > 0 && tokenId <= 10000, "Token ID invalid");
		require(nftPrice == msg.value, "Ether value sent is not correct");
		_safeMint(_msgSender(), tokenId);
	}

	function exists(uint256 tokenId) external view returns(bool) {
		return _exists(tokenId);
	}
}

