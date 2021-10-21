pragma solidity ^0.8.0;

import 'base64-sol/base64.sol';
import "@openzeppelin/contracts/utils/Strings.sol";
/// @title NFTSVG
/// @notice Provides a function for generating an SVG associated with a Uniswap NFT
library AlienMetadataSvg {
	using Strings for uint256;

	function generateSVGofTokenById(string memory name, uint256 baseProbs) internal pure returns (string memory) {
		string memory svg = string(abi.encodePacked(
		'<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">',
		'<style>.title {fill: white; font-family: serif; font-size: 16px;}.subtitle  {fill: white; font-family: serif; font-size: 16px;}.base { fill: white; font-family: serif; font-size: 22px; }.quote { fill: black; font-family: serif; font-size: 12px; font-style = italic; }.note{fill: white; font-size: 16px;}</style>',
		'<rect width="100%" height="100%" fill="black"/>',
		'<text x="50%" y="8%" dominant-baseline="middle" text-anchor="middle" class="base">',
		name,
		'</text><text x="50%" y="15%" dominant-baseline="middle" text-anchor="middle" class="title">',
		string(abi.encodePacked("Base Probs ", baseProbs.toString())),
		'</text>'));
		svg = string(abi.encodePacked(svg,'</svg>'
		));
		return svg;
	}

	function tokenURI(uint256 tokenId, uint256 baseProbs) internal pure returns (string memory) {
		string memory name = string(abi.encodePacked('Alien #',tokenId.toString()));
		string memory image = Base64.encode(bytes(generateSVGofTokenById(name, baseProbs)));
		return string(
			abi.encodePacked(
				'data:application/json;base64,',
				Base64.encode(
					bytes(
						abi.encodePacked(
							'{"name":"',
							name,
							// '", "rarityLevel": "',
							// rarityLevel.toString(),
							'", "image": "',
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