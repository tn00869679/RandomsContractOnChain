import { expect } from "chai";
import { keccak256, AbiCoder } from "ethers";
import { ethers as hardhatEthers } from "hardhat";
import { SimpleOracle } from "../typechain-types/contracts/SimpleOracle";

const abiCoder = new AbiCoder();
describe("SimpleOracle", function () {
  let simpleOracle: SimpleOracle;
  let owner: string;
  let otherAccount: string;

  before(async function () {
    const signers = await hardhatEthers.getSigners();
    owner = await signers[0].getAddress();
    otherAccount = await signers[1].getAddress();
  });

  beforeEach(async function () {
    const SimpleOracleFactory = await hardhatEthers.getContractFactory("SimpleOracle");
    simpleOracle = (await SimpleOracleFactory.deploy()) as unknown as SimpleOracle;
    await simpleOracle.waitForDeployment();
  });

  it("Should set the right owner", async function () {
    expect(await simpleOracle.owner()).to.equal(owner);
  });

  it("Should emit RequestedData event when requesting data", async function () {
    const requestId = keccak256(abiCoder.encode(["uint256", "address"], [Date.now(), owner]));
    const subContract = owner; // 這裡模擬一個 subContract 地址
    await expect(simpleOracle.requestData(subContract, requestId))
      .to.emit(simpleOracle, "RequestedData")
      .withArgs(subContract, requestId);
  });

  it("Should revert when non-authorized requests data", async function () {
    const signers = await hardhatEthers.getSigners();
    const requestId = keccak256(abiCoder.encode(["uint256", "address"], [Date.now(), otherAccount]));
    const subContract = otherAccount; // 使用其他帳戶地址
    await expect(simpleOracle.connect(signers[1]).requestData(subContract, requestId)).to.be.revertedWith("Not authorized");
  });

  it("Should allow owner to add and remove providers", async function () {
    const signers = await hardhatEthers.getSigners();
    await simpleOracle.addProvider(signers[1].getAddress());
    expect(await simpleOracle.authorizedProviders(signers[1].getAddress())).to.be.true;

    await simpleOracle.removeProvider(signers[1].getAddress());
    expect(await simpleOracle.authorizedProviders(signers[1].getAddress())).to.be.false;
  });
});
