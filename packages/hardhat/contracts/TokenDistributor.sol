import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenDistributor is Ownable {
    ERC20 public immutable mango;
    address[] public approvedGames;
    mapping(address => bool) approvedGamesRegistry;

    mapping(address => uint256) game2maxtokens;

    constructor(address _mango, address _owner) {
        mango = ERC20(_mango);
        transferOwnership(_owner);
        // approveTransfer();
    }

    function addGameContract(address gameContract) public {
        require(!approvedGamesRegistry[gameContract], "Game already approved");
        approvedGames.push(gameContract);
        approvedGamesRegistry[gameContract] = true;
    }

    function rewardPlayer(address receipient, uint256 _rewardMango) public {
        require(approvedGamesRegistry[msg.sender], "Caller not approved");
        mango.transfer(receipient, _rewardMango);
    }

    function rewardGameContract(
        address gameContractReceipient,
        uint256 _rewardMango
    ) public {
        require(approvedGamesRegistry[msg.sender], "Caller not approved");
        mango.transfer(gameContractReceipient, _rewardMango);
    }
}
