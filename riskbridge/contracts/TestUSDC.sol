// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestUSDC is ERC20, Ownable {
    uint8 private _decimals;
    
    constructor() ERC20("Test USDC", "TUSDC") Ownable(msg.sender) {
        _decimals = 6; // USDC has 6 decimals
        // Mint initial supply to deployer (1 million TUSDC)
        _mint(msg.sender, 1000000 * 10**_decimals);
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
        require(amount <= 10000 * 10**_decimals, "Amount too large for faucet");
        _mint(to, amount);
    }
}