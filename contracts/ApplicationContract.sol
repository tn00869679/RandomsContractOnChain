// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

interface ISimpleOracle {
    function requestData(address subContract, bytes32 requestId) external;
}

contract ApplicationContract is Ownable {
    ISimpleOracle public simpleOracle;

    event RequestRandoms(bytes32 requestId);

    bytes32 _requestId = "0x0";
    uint256 _randoms = 0;
    bool _contractStatus = false;
    bool _requestInProgress = false;

    constructor(address _oracleAddress) Ownable(msg.sender) {
        simpleOracle = ISimpleOracle(_oracleAddress);
    }

    function requestRandoms() public {
        require(_contractStatus, "The contract is disabled!");
        require(!_requestInProgress, "A request is already in progress!");

        _requestInProgress = true;
        bytes32 newRequestId = keccak256(abi.encodePacked(block.timestamp, msg.sender));
        simpleOracle.requestData(address(this), newRequestId);
        emit RequestRandoms(newRequestId);
    }

    function updateRequestIdAndRandoms(bytes32 newRequestId, uint256 newRandoms) public onlyOwner {
        _requestId = newRequestId;
        _randoms = newRandoms;
        _requestInProgress = false;
    }

    function changeContractStatus(bool mode) public onlyOwner {
        require(_contractStatus != mode, "The same status!");

        _contractStatus = mode;
    }

    function changeRequestedStatus() public onlyOwner {
        _requestInProgress = false;
    }

    function showRequestId() public view returns (bytes32) {
        return _requestId;
    }

    function showRandoms() public view returns (uint256) {
        return _randoms;
    }

    function contractIsOpen() public view returns (bool) {
        return _contractStatus;
    }

    function showRequestedProgression() public view returns (bool) {
        return _requestInProgress;
    }
}
