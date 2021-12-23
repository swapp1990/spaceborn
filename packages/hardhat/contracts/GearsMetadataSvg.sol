pragma solidity ^0.8.0;

import "base64-sol/base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./GearsTypeSvg.sol";

library GearsMetadataSvg {
    using Strings for uint256;

    function generateSVGofTokenById(
        string memory cat,
        string memory itemName,
        uint256 rarityLevel,
        uint256 catIdx
    ) internal pure returns (string memory) {
        string memory rarity = "Common";
        if (rarityLevel == 1) {
            rarity = "Uncommon";
        } else if (rarityLevel == 2) {
            rarity = "Rare";
        } else if (rarityLevel == 3) {
            rarity = "Ultra Rare";
        }
        string memory svg = string(
            abi.encodePacked(
                '<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">',
                "<style>.title {fill: white; font-family: serif; font-size: 16px;}.subtitle  {fill: white; font-family: serif; font-size: 16px;}.base { fill: white; font-family: serif; font-size: 24px; }.quote { fill: black; font-family: serif; font-size: 12px; font-style = italic; }.note{fill: white; font-size: 16px;}</style>",
                '<rect width="100%" height="100%" fill="black"/>'
            )
        );

        svg = string(abi.encodePacked(svg, GearsTypeSvg.gearsSvg(catIdx)));

        svg = string(
            abi.encodePacked(
                svg,
                '<text x="50%" y="8%" dominant-baseline="middle" text-anchor="middle" class="base">',
                itemName,
                '</text><text x="50%" y="15%" dominant-baseline="middle" text-anchor="middle" class="title">',
                rarity
            )
        );
        svg = string(
            abi.encodePacked(
                svg,
                '</text><text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" class="base">',
                cat
            )
        );
        svg = string(
            abi.encodePacked(
                svg,
                '</text><text x="50%" y="83%" dominant-baseline="middle" text-anchor="middle" class="subtitle">',
                "Manufacturer: Black Hole Division"
            )
        );
        svg = string(
            abi.encodePacked(
                svg,
                '</text><text x="50%" y="95%" dominant-baseline="middle" text-anchor="middle" class="base" font-style="italic">',
                "Dropped by alien named Moloch",
                "</text>",
                "</svg>"
            )
        );
        return svg;
    }

    function tokenURI(
        uint256 tokenId,
        string memory cat,
        string memory itemName,
        uint256 rarityLevel,
        uint256 catIdx
    ) internal pure returns (string memory) {
        string memory name = string(
            abi.encodePacked("Gears #", tokenId.toString())
        );
        string memory image = Base64.encode(
            bytes(generateSVGofTokenById(cat, itemName, rarityLevel, catIdx))
        );
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name,
                                '", "category": "',
                                cat,
                                '", "item": "',
                                itemName,
                                '", "rarityLevel": "',
                                rarityLevel.toString(),
                                '", "image": "',
                                "data:image/svg+xml;base64,",
                                image,
                                '"}'
                            )
                        )
                    )
                )
            );
    }
}
