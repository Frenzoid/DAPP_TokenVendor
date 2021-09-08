// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Token.sol";

contract Vendor is Ownable {
    // - Atributes.
    // Token contract addr.
    Token token;

    // Token x Eth conversion price.
    uint256 public tokensPerEth;

    // - Events.
    event BuyTokens(address buyer, uint256 amountOfETH, uint256 amountOfTokens);
    event SellTokens(
        address seller,
        uint256 amountOfEth,
        uint256 amountOfTokens
    );

    // - Constructor.
    constructor(address tokenAddress) public {
        token = Token(tokenAddress);
        tokensPerEth = 1000;
    }

    // - Public Functions.
    // Buy tokens.
    function buyTokens() external payable {
        // We check if the sender sent some eth.
        require(msg.value > 0, "RDT-Vendor: You didn't send any eth!.");

        // We calculate how many tokens the customer wants to buy
        uint256 amountToBuy = msg.value * tokensPerEth;

        // Check if we have enough tokens to sell.
        require(
            amountToBuy <= token.balanceOf(address(this)),
            "RDT-Vendor: We're out of tokens :c."
        );

        // Transfer the tokens.
        token.transfer(msg.sender, amountToBuy);

        emit BuyTokens(msg.sender, msg.value, msg.value * tokensPerEth);
    }

    // Sell tokens.
    function sellTokens(uint256 _tokens) external {
        // Check if _tokens is 0 or negative.
        require(_tokens > 0, "RDT-Vendor: You need to sell at least 1 token");

        // Transfer tokens.
        token.transferFrom(msg.sender, address(this), _tokens);

        // Calculate eth to transfer.
        uint256 amountEth = _tokens / tokensPerEth;

        // Transfer the eth.
        (bool success, ) = msg.sender.call{value: amountEth}("");
        require(success, "RDT-Vendor: CRITICAL: sellTokens transfer failed.");

        emit SellTokens(msg.sender, amountEth, _tokens);
    }

    // - Admin functions.
    // Emergency withdraw.
    function withdrawEth(address _to) external onlyOwner {
        // If _to is empty, set reciever as sender.
        if (address(_to) == address(0)) _to = msg.sender;

        // Send eth to admin's address.
        (bool success, ) = address(_to).call{value: address(this).balance}("");
        require(success, "RDT-Vendor: CRITICAL: withdrawEth transfer failed.");
    }

    // Emergency withdraw.
    function withdrawTokens(address _to) external onlyOwner {
        // If _to is empty, set reciever as sender.
        if (address(_to) == address(0)) _to = msg.sender;

        // Transfer tokens.
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }
}
