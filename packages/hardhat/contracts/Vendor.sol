// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Token.sol";

contract Vendor is Ownable {
    // - Atributes.
    Token token;

    // - Constructor.
    constructor(address tokenAddress) public {
        token = Token(tokenAddress);
    }

    // - Public Functions.
    // Buy tokens.
    function buyTokens(uint256 tokens) public {}
}
