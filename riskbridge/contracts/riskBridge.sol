// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Pyth Entropy interface
interface IEntropy {
    function requestRandomness(bytes32 userRandomNumber) external payable returns (bytes32 requestId);
    function getRandomNumber(bytes32 requestId) external view returns (uint256);
    function getFee() external view returns (uint256);
}

contract RiskBridge is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;
    
    IERC20 public immutable token;
    IEntropy public immutable entropy;
    
    struct UserDeposit {
        uint256 amount;
        bool hasPendingBet;
        bytes32 pendingRequestId;
        uint256 leveragePercent;
    }
    
    mapping(address => UserDeposit) public userDeposits;
    mapping(bytes32 => address) public requestIdToUser;
    
    event Deposited(address indexed user, uint256 amount);
    event BetPlaced(address indexed user, uint256 leveragePercent, bytes32 requestId);
    event BetResolved(address indexed user, bool won, uint256 betAmount, uint256 newBalance);
    event Withdrawn(address indexed user, uint256 amount);
    
    constructor(address _entropy, address _token) Ownable(msg.sender) {
        entropy = IEntropy(_entropy);
        token = IERC20(_token);
    }
    
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(!userDeposits[msg.sender].hasPendingBet, "Cannot deposit with pending bet");
        
        token.safeTransferFrom(msg.sender, address(this), amount);
        userDeposits[msg.sender].amount += amount;
        
        emit Deposited(msg.sender, amount);
    }
    
    function placeBet(uint256 leveragePercent) external payable nonReentrant {
        require(leveragePercent >= 5 && leveragePercent <= 25, "Leverage must be between 5-25%");
        require(userDeposits[msg.sender].amount > 0, "No deposit found");
        require(!userDeposits[msg.sender].hasPendingBet, "Bet already pending");
        require(msg.value >= entropy.getFee(), "Insufficient fee for randomness");
        
        uint256 betAmount = (userDeposits[msg.sender].amount * leveragePercent) / 100;
        require(betAmount <= userDeposits[msg.sender].amount, "Bet amount exceeds deposit");
        
        // Generate user random number (simple implementation)
        bytes32 userRandomNumber = keccak256(abi.encodePacked(msg.sender, block.timestamp, block.difficulty));
        
        // Request randomness from Pyth Entropy
        bytes32 requestId = entropy.requestRandomness{value: msg.value}(userRandomNumber);
        
        userDeposits[msg.sender].hasPendingBet = true;
        userDeposits[msg.sender].pendingRequestId = requestId;
        userDeposits[msg.sender].leveragePercent = leveragePercent;
        requestIdToUser[requestId] = msg.sender;
        
        emit BetPlaced(msg.sender, leveragePercent, requestId);
    }
    
    function fulfillRandomness(bytes32 requestId, uint256 randomness) external {
        address user = requestIdToUser[requestId];
        require(user != address(0), "Invalid request ID");
        require(userDeposits[user].hasPendingBet, "No pending bet");
        require(userDeposits[user].pendingRequestId == requestId, "Request ID mismatch");
        
        uint256 leveragePercent = userDeposits[user].leveragePercent;
        uint256 betAmount = (userDeposits[user].amount * leveragePercent) / 100;
        
        // Determine win/lose (50/50 chance)
        bool won = (randomness % 2) == 0;
        
        if (won) {
            userDeposits[user].amount += betAmount;
        } else {
            userDeposits[user].amount -= betAmount;
        }
        
        // Clear pending bet
        userDeposits[user].hasPendingBet = false;
        userDeposits[user].pendingRequestId = bytes32(0);
        userDeposits[user].leveragePercent = 0;
        delete requestIdToUser[requestId];
        
        emit BetResolved(user, won, betAmount, userDeposits[user].amount);
    }
    
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(!userDeposits[msg.sender].hasPendingBet, "Cannot withdraw with pending bet");
        require(userDeposits[msg.sender].amount >= amount, "Insufficient balance");
        
        userDeposits[msg.sender].amount -= amount;
        token.safeTransfer(msg.sender, amount);
        
        emit Withdrawn(msg.sender, amount);
    }
    
    function getUserBalance(address user) external view returns (uint256) {
        return userDeposits[user].amount;
    }
    
    function getUserBetStatus(address user) external view returns (bool hasPendingBet, bytes32 requestId, uint256 leveragePercent) {
        UserDeposit memory userDeposit = userDeposits[user];
        return (userDeposit.hasPendingBet, userDeposit.pendingRequestId, userDeposit.leveragePercent);
    }
    
    // Emergency function to withdraw contract balance (owner only)
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance > 0) {
            payable(owner()).transfer(balance);
        }
    }
    
    // Function to receive ETH for entropy fees
    receive() external payable {}
}