import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenDistributor is Ownable {
    ERC20 public immutable mango;
    address[] public approvedGames;

    constructor(address _mango, address _owner) {
        mango = ERC20(_mango);
        transferOwnership(_owner);
        // approveTransfer();
    }

    function rewardPlayer(address receipient, uint256 _rewardMango) public {
        mango.transfer(receipient, _rewardMango);
    }

    function rewardGameContract(
        address gameContractReceipient,
        uint256 _rewardMango
    ) public {
        mango.transfer(gameContractReceipient, _rewardMango);
    }
}
