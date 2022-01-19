import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// contract TokenDistributor is Ownable {
//     ERC20 public immutable mango;
//     uint256 public escrowPercent = 75;

//     constructor(address _mango, address _owner) {
//         mango = ERC20(_mango);
//         transferOwnership(_owner);
//     }

//     function rewardPlayer(address receipient, uint256 _rewardMango) public {
//         mango.transfer(receipient, _rewardMango);
//         // escrowPercent = 65;
//     }
// }

contract TokenDistributor is Ownable {
    ERC20 public immutable mango;
    uint256 public initialEscrowBalance;
    uint256 public escrowPercent = 75;

    address[] public approvedGames;
    mapping(address => bool) approvedGamesRegistry;

    mapping(address => uint256) public game2maxtokens;
    mapping(address => uint256) public game2currtokens;

    constructor(address _mango, address _owner) {
        mango = ERC20(_mango);
        transferOwnership(_owner);
    }

    function init() public {
        initialEscrowBalance = (mango.totalSupply() * escrowPercent) / 100;
        // mango.transfer(address(this), 60000);
    }

    function addGameContract(address gameContract, uint256 allocationPercent)
        public
    {
        require(!approvedGamesRegistry[gameContract], "Game already approved");
        approvedGames.push(gameContract);
        approvedGamesRegistry[gameContract] = true;
        game2maxtokens[gameContract] =
            (initialEscrowBalance * allocationPercent) /
            100;
        game2currtokens[gameContract] = game2maxtokens[gameContract];
        mango.approve(gameContract, 5000);
    }

    function rewardPlayer(address receipient, uint256 _rewardMango) public {
        require(approvedGamesRegistry[msg.sender], "Caller not approved");
        require(
            game2currtokens[msg.sender] > 0,
            "allocated token balance is 0"
        );
        mango.transfer(receipient, _rewardMango);
        game2currtokens[msg.sender] -= _rewardMango;
    }

    function rewardGameContract(
        address gameContractReceipient,
        uint256 _rewardMango
    ) public {
        require(approvedGamesRegistry[msg.sender], "Caller not approved");
        require(
            game2currtokens[msg.sender] > 0,
            "allocated token balance is 0"
        );
        // mango.transfer(gameContractReceipient, _rewardMango);
        game2currtokens[msg.sender] -= _rewardMango;
    }
}
