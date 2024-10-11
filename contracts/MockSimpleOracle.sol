// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockSimpleOracle {
    event RequestedData(address subContract, bytes32 requestId);

    function requestData(address subContract, bytes32 requestId) external {
        emit RequestedData(subContract, requestId);
    }
}
