// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.0 <0.9.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    // - Constructor.
    constructor() public ERC20("Raven Dynamics Token", "RDT") {
        // We mint 1000 tokens (1000 * 10^8)
        _mint(msg.sender, 1000 * 10**18);
    }
}
