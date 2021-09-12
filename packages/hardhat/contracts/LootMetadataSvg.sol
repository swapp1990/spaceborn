pragma solidity >=0.6.0 <0.8.0;

import 'base64-sol/base64.sol';
import "@openzeppelin/contracts/utils/Strings.sol";
/// @title NFTSVG
/// @notice Provides a function for generating an SVG associated with a Uniswap NFT
library LootMetadataSvg {
	using Strings for uint256;

	function generateSVGofTokenById(address owner, uint256 id, string memory name, string memory catName, uint256 rarityLevel, string memory corpName, string[] memory lores, string memory alienName) internal pure returns (string memory) {
		string memory rarity = "Common";
		if(rarityLevel == 1) {
			rarity = "Uncommon";
		} else if(rarityLevel == 2) {
			rarity = "Rare";
		} else if(rarityLevel == 3) {
			rarity = "Ultra Rare";
		}

		string memory svg = string(abi.encodePacked(
		'<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">',
		'<style>.title {fill: white; font-family: serif; font-size: 16px;}.subtitle  {fill: white; font-family: serif; font-size: 16px;}.base { fill: white; font-family: serif; font-size: 22px; }.quote { fill: black; font-family: serif; font-size: 12px; font-style = italic; }.note{fill: white; font-size: 16px;}</style>',
		'<rect width="100%" height="100%" fill="black"/>',
		'<text x="50%" y="8%" dominant-baseline="middle" text-anchor="middle" class="base">',name,'</text>',
		'<text x="50%" y="15%" dominant-baseline="middle" text-anchor="middle" class="title">',rarity,'</text>',
		'<rect width="230" height="140" fill="floralwhite" x="85" y="90" rx="5"/>',
		// '<text x="50%" y="10%" dominant-baseline="middle" text-anchor="middle" class="title">Loot Dropped by Alien named ',name,'</text>',
		'<text x="50%" y="30%" dominant-baseline="middle" text-anchor="middle" class="quote" font-style="italic"><tspan dy="1.2em" x="50%">',lores[0],'</tspan><tspan dy="1.2em" x="50%">',lores[1],'</tspan><tspan dy="1.2em" x="50%">',lores[2],'</tspan><tspan dy="1.2em" x="50%"></tspan></text>',
		'<text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" class="base">',catName,'</text>',
		// '<text x="50%" y="75%" dominant-baseline="middle" text-anchor="middle" class="subtitle">Super Alloy</text>',
		'<text x="50%" y="83%" dominant-baseline="middle" text-anchor="middle" class="subtitle">Manufacturer: ',corpName,'</text>',
		'<text x="50%" y="95%" dominant-baseline="middle" text-anchor="middle" class="note" font-style="italic">Dropped by alien named ',alienName,'</text>',
		'</svg>'
		));
		return svg;
	}

	function tokenURI(address owner, uint256 tokenId, string memory playerName, string memory catName, uint256 rarityLevel, string memory corpName, string[] memory lores, string memory alienName) internal pure returns (string memory) {
		string memory name = string(abi.encodePacked('SciFi Loot #',tokenId.toString()));
		string memory image = Base64.encode(bytes(generateSVGofTokenById(owner,tokenId, playerName, catName, rarityLevel, corpName, lores, alienName)));

		return string(
			abi.encodePacked(
				'data:application/json;base64,',
				Base64.encode(
					bytes(
						abi.encodePacked(
							'{"name":"',
							name,
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