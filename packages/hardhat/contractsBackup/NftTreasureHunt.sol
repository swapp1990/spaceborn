// pragma solidity >=0.8.0 <0.9.0;
// //SPDX-License-Identifier: MIT
// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// import "@openzeppelin/contracts/utils/Counters.sol";

// contract NftTreasureHunt is ERC721URIStorage {
// 	using Counters for Counters.Counter;
// 	Counters.Counter public _tokenIds;
// 	uint public lastMintedCitizenId;

// 	struct CitizenNft {
// 		string name;
// 		uint8 houseGroup;
// 		bool exists;
// 	}

// 	mapping (uint256 => CitizenNft) public tokenIdToCitizens;
// 	mapping (bytes32 => uint256) public uriToTokenId;
// 	mapping (address => uint256) public addrToTokenId;

//   	constructor() public ERC721("NftTreasurehunt", "NTH") {
// 	}

// 	function mintCitizen(string memory tokenURI, string memory name, uint8 houseGroup) public returns (uint256){
// 		bytes32 uriHash = keccak256(abi.encodePacked(tokenURI));
// 		// emit Transfer(address(0), msg.sender, _tokenId);
// 		_tokenIds.increment();
// 		uint256 id = _tokenIds.current();
// 		lastMintedCitizenId = id;
// 		_mint(msg.sender, id);
// 		_setTokenURI(id, tokenURI);
// 		uriToTokenId[uriHash] = id;
// 		addrToTokenId[msg.sender] = id;
// 		CitizenNft storage citizen = tokenIdToCitizens[id];
// 		citizen.name = name;
// 		citizen.houseGroup = houseGroup;
// 		citizen.exists = true;
// 		return id;
// 	}

// 	function getCitizenIdByAddress(address addr) public view returns (uint) {
// 		return addrToTokenId[addr];
// 	}

// 	function getCitizenByTokenId(uint256 tokenId) public view returns (string memory name, uint8 houseGroup) {
// 		if(tokenIdToCitizens[tokenId].exists) {
// 			name = tokenIdToCitizens[tokenId].name;
// 			houseGroup = tokenIdToCitizens[tokenId].houseGroup;
// 		}
// 	}
// }
