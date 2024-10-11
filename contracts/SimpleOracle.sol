// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleOracle is Ownable {
    mapping(address => bool) public authorizedProviders;

    event RequestedData(address subContract, bytes32 requestId);

    constructor() Ownable(msg.sender) {
        authorizedProviders[msg.sender] = true;
    }

    modifier onlyAuthorized() {
        require(authorizedProviders[msg.sender], "Not authorized");
        _;
    }

    function requestData(address subContract, bytes32 requestId) public onlyAuthorized {
        emit RequestedData(subContract, requestId);
    }

    function addProvider(address provider) public onlyOwner {
        authorizedProviders[provider] = true;
    }

    function removeProvider(address provider) public onlyOwner {
        authorizedProviders[provider] = false;
    }
}
