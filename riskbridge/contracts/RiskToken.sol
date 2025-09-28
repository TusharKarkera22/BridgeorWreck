// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RiskToken is ERC20, Ownable {
    uint8 private _decimals;
    
    constructor() ERC20("Risk Token", "RISK") Ownable(msg.sender) {
        _decimals = 18; // Standard 18 decimals for better demo
        // Mint initial supply to deployer (10 million RISK tokens)
        _mint(msg.sender, 10000000 * 10**_decimals);
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    // Function to mint more tokens for testing
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    // Function to mint tokens to any address (for easy testing)
    function faucet(address to, uint256 amount) external {
        require(amount <= 1000 * 10**_decimals, "Amount too large for faucet");
        _mint(to, amount);
    }
    
    // Function for users to get free tokens for testing
    function claimTokens() external {
        require(balanceOf(msg.sender) < 100 * 10**_decimals, "You already have enough tokens");
        _mint(msg.sender, 100 * 10**_decimals);
    }
}