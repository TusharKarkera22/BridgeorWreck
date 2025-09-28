// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Pyth Entropy interface for randomness
interface IEntropy {
    function requestRandomness(bytes32 userRandomNumber) external payable returns (bytes32 requestId);
    function getRandomNumber(bytes32 requestId) external view returns (uint256);
    function getFee() external view returns (uint256);
}

// LayerZero interface for cross-chain messaging
interface ILayerZeroEndpoint {
    function send(
        uint16 _dstChainId,
        bytes calldata _destination,
        bytes calldata _payload,
        address payable _refundAddress,
        address _zroPaymentAddress,
        bytes calldata _adapterParams
    ) external payable;
    
    function estimateFees(
        uint16 _dstChainId,
        address _userApplication,
        bytes calldata _payload,
        bool _payInZRO,
        bytes calldata _adapterParam
    ) external view returns (uint nativeFee, uint zroFee);
}

contract CrossChainRiskBridge is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;
    
    IERC20 public immutable token;
    IEntropy public immutable entropy;
    ILayerZeroEndpoint public immutable lzEndpoint;
    
    // Chain IDs for LayerZero
    uint16 public constant BASE_SEPOLIA_CHAIN_ID = 40245;
    uint16 public constant ARBITRUM_SEPOLIA_CHAIN_ID = 40231;
    
    struct UserDeposit {
        uint256 amount;
        bool hasPendingBet;
        bytes32 pendingRequestId;
        uint256 leverageMultiplier; // 2x, 3x, 5x, 10x
        uint256 timestamp;
    }
    
    struct CrossChainBet {
        address user;
        uint256 betAmount;
        uint256 leverageMultiplier;
        uint16 sourceChain;
        bool resolved;
    }
    
    mapping(address => UserDeposit) public userDeposits;
    mapping(bytes32 => address) public requestIdToUser;
    mapping(bytes32 => CrossChainBet) public crossChainBets;
    mapping(uint16 => bytes) public trustedRemoteLookup;
    
    event Deposited(address indexed user, uint256 amount);
    event CrossChainBetPlaced(address indexed user, uint256 leverageMultiplier, bytes32 requestId, uint16 targetChain);
    event BetResolved(address indexed user, bool won, uint256 betAmount, uint256 payout, uint256 newBalance);
    event Withdrawn(address indexed user, uint256 amount);
    event CrossChainMessage(uint16 indexed srcChainId, bytes32 indexed betId, bool won, uint256 payout);
    
    constructor(
        address _entropy,
        address _token,
        address _lzEndpoint
    ) Ownable(msg.sender) {
        entropy = IEntropy(_entropy);
        token = IERC20(_token);
        lzEndpoint = ILayerZeroEndpoint(_lzEndpoint);
    }
    
    // Set trusted remote for LayerZero cross-chain communication
    function setTrustedRemote(uint16 _srcChainId, bytes calldata _path) external onlyOwner {
        trustedRemoteLookup[_srcChainId] = _path;
    }
    
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(!userDeposits[msg.sender].hasPendingBet, "Cannot deposit with pending bet");
        
        token.safeTransferFrom(msg.sender, address(this), amount);
        userDeposits[msg.sender].amount += amount;
        userDeposits[msg.sender].timestamp = block.timestamp;
        
        emit Deposited(msg.sender, amount);
    }
    
    function placeCrossChainBet(
        uint256 leverageMultiplier, 
        bytes32 userRandomNumber,
        uint16 targetChain
    ) external payable nonReentrant {
        require(leverageMultiplier >= 2 && leverageMultiplier <= 10, "Leverage must be between 2x and 10x");
        require(userDeposits[msg.sender].amount > 0, "No deposit found");
        require(!userDeposits[msg.sender].hasPendingBet, "Bet already pending");
        require(targetChain == BASE_SEPOLIA_CHAIN_ID || targetChain == ARBITRUM_SEPOLIA_CHAIN_ID, "Invalid target chain");
        
        uint256 entropyFee = entropy.getFee();
        require(msg.value >= entropyFee, "Insufficient fee for entropy");
        
        uint256 betAmount = userDeposits[msg.sender].amount / leverageMultiplier;
        require(betAmount > 0, "Bet amount must be greater than 0");
        
        bytes32 requestId = entropy.requestRandomness{value: entropyFee}(userRandomNumber);
        
        userDeposits[msg.sender].hasPendingBet = true;
        userDeposits[msg.sender].pendingRequestId = requestId;
        userDeposits[msg.sender].leverageMultiplier = leverageMultiplier;
        requestIdToUser[requestId] = msg.sender;
        
        // Store cross-chain bet info
        crossChainBets[requestId] = CrossChainBet({
            user: msg.sender,
            betAmount: betAmount,
            leverageMultiplier: leverageMultiplier,
            sourceChain: targetChain,
            resolved: false
        });
        
        emit CrossChainBetPlaced(msg.sender, leverageMultiplier, requestId, targetChain);
    }
    
    function fulfillRandomness(bytes32 requestId, uint256 randomness) external payable {
        address user = requestIdToUser[requestId];
        require(user != address(0), "Invalid request ID");
        require(userDeposits[user].hasPendingBet, "No pending bet");
        require(userDeposits[user].pendingRequestId == requestId, "Request ID mismatch");
        
        CrossChainBet storage bet = crossChainBets[requestId];
        require(!bet.resolved, "Bet already resolved");
        
        uint256 leverageMultiplier = userDeposits[user].leverageMultiplier;
        uint256 betAmount = bet.betAmount;
        
        // Determine win/lose (50/50 chance)
        bool won = (randomness % 2) == 0;
        uint256 payout = 0;
        
        if (won) {
            // Win: Get leverage multiplier amount
            payout = betAmount * leverageMultiplier;
            userDeposits[user].amount += payout;
        } else {
            // Lose: Lose the bet amount
            userDeposits[user].amount -= betAmount;
        }
        
        // Clear pending bet
        userDeposits[user].hasPendingBet = false;
        userDeposits[user].pendingRequestId = bytes32(0);
        userDeposits[user].leverageMultiplier = 0;
        bet.resolved = true;
        delete requestIdToUser[requestId];
        
        emit BetResolved(user, won, betAmount, payout, userDeposits[user].amount);
        
        // Send cross-chain message to target chain
        _sendCrossChainMessage(user, won, betAmount, payout, bet.sourceChain);
    }
    
    function _sendCrossChainMessage(
        address user, 
        bool won, 
        uint256 betAmount,
        uint256 payout,
        uint16 targetChain
    ) internal {
        // Create payload for cross-chain message
        bytes memory payload = abi.encode(
            uint8(1), // Message type: BetResult
            user, // User address
            won,
            betAmount,
            payout,
            block.timestamp
        );
        
        // Estimate LayerZero fees
        (uint256 nativeFee,) = lzEndpoint.estimateFees(
            targetChain,
            address(this),
            payload,
            false,
            ""
        );
        
        require(address(this).balance >= nativeFee, "Insufficient balance for LayerZero fee");
        
        // Send cross-chain message via LayerZero
        lzEndpoint.send{value: nativeFee}(
            targetChain,
            trustedRemoteLookup[targetChain],
            payload,
            payable(address(this)),
            address(0),
            ""
        );
        
        emit CrossChainMessage(targetChain, keccak256(abi.encode(user, block.timestamp)), won, payout);
    }
    
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(!userDeposits[msg.sender].hasPendingBet, "Cannot withdraw with pending bet");
        require(userDeposits[msg.sender].amount >= amount, "Insufficient balance");
        
        userDeposits[msg.sender].amount -= amount;
        token.safeTransfer(msg.sender, amount);
        
        emit Withdrawn(msg.sender, amount);
    }
    
    // Emergency functions
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        token.safeTransfer(owner(), balance);
    }
    
    function withdrawNative() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    // View functions
    function getUserDeposit(address user) external view returns (UserDeposit memory) {
        return userDeposits[user];
    }
    
    function getCrossChainBet(bytes32 requestId) external view returns (CrossChainBet memory) {
        return crossChainBets[requestId];
    }
    
    function getUserBalance(address user) external view returns (uint256) {
        return userDeposits[user].amount;
    }
    
    function getUserBetStatus(address user) external view returns (
        bool hasPendingBet, 
        bytes32 pendingRequestId,
        uint256 leverageMultiplier
    ) {
        UserDeposit memory deposit = userDeposits[user];
        return (deposit.hasPendingBet, deposit.pendingRequestId, deposit.leverageMultiplier);
    }
    
    receive() external payable {}
}