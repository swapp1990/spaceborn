//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import 'base64-sol/base64.sol';
import "@openzeppelin/contracts/utils/Strings.sol";
/// @title NFTSVG
/// @notice Provides a function for generating an SVG associated with a Uniswap NFT
library PlayerMetadataSvg {
	using Strings for uint256;
	using Strings for uint8;

	function generateSVGofTokenById(address owner, string memory name, uint8 level, uint256 xp) internal pure returns (string memory) {
		string memory svg = string(abi.encodePacked(
		'<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">',
		'<style>.title {fill: white; font-family: serif; font-size: 16px;}</style>',
		'<rect width="100%" height="100%" fill="black"/>',
		'<text x="50%" y="10%" dominant-baseline="middle" text-anchor="middle" class="title">',name,'</text>',
		'<text x="50%" y="30%" dominant-baseline="middle" text-anchor="middle" class="title">Level: ',level.toString(),'</text>',
		'<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" class="title">XP: ',xp.toString(),'</text>',
		'</svg>'
		));
		return svg;
	}

	function tokenURI(address owner, uint256 tokenId, string memory playerName, uint8 level, uint256 xp) internal pure returns (string memory) {
		string memory name = string(abi.encodePacked('#',tokenId.toString(),': ', playerName));
		string memory image = Base64.encode(bytes(generateSVGofTokenById(owner, playerName, level, xp)));

		return string(
			abi.encodePacked(
				'data:application/json;base64,',
				Base64.encode(
					bytes(
						abi.encodePacked(
							'{"name":"',
							name,
							// '","level":', level,
							// '","xp":', xp,
							'","image": "',
							'data:image/svg+xml;base64,',
							image,
							'"}'
						)
					)
				)
			)
		);
	}
}
