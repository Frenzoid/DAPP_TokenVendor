// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.0 <0.9.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    /**
     * @author MrFrenzoid
     * @title Raven Dynamics Token Contract.
     * @notice A token contract.
     */

    /**
     * @notice Constructor of the contract, it also mints a static ammount of RDT and sends them to the deployer.
     */
    /// - Constructor.
    constructor() public ERC20("Raven Dynamics Token", "RDT") {
        // We mint 1000 tokens (1000 * 10^8)
        _mint(msg.sender, 1000 * 10**18);
    }
}
