import { expect } from "chai";
import { keccak256, AbiCoder } from "ethers";
import { ethers as hardhatEthers } from "hardhat";
import { MockSimpleOracle } from "../typechain-types/contracts/MockSimpleOracle";
import { ApplicationContract } from "../typechain-types/contracts/ApplicationContract.sol/ApplicationContract";

const abiCoder = new AbiCoder();
describe("ApplicationContract", function () {
  let applicationContract: ApplicationContract;
  let owner: string;
  let otherAccount: string;
  let mockOracle: MockSimpleOracle;

  before(async function () {
    const signers = await hardhatEthers.getSigners();
    owner = await signers[0].getAddress();
    otherAccount = await signers[1].getAddress();
  });

  beforeEach(async function () {
    const MockOracleFactory = await hardhatEthers.getContractFactory("MockSimpleOracle");
    mockOracle = (await MockOracleFactory.deploy()) as unknown as MockSimpleOracle;
    await mockOracle.waitForDeployment();

    const ApplicationContractFactory = await hardhatEthers.getContractFactory("ApplicationContract");
    applicationContract = (await ApplicationContractFactory.deploy(mockOracle.getAddress())) as unknown as ApplicationContract;
    await applicationContract.waitForDeployment();
  });

  it("應該設置正確的 oracle 地址", async function () {
    expect(await applicationContract.simpleOracle()).to.equal(await mockOracle.getAddress());
  });

  it("應該允許合約擁有者更改合約狀態", async function () {
    await applicationContract.changeContractStatus(true);
    expect(await applicationContract.contractIsOpen()).to.be.true;

    await applicationContract.changeContractStatus(false);
    expect(await applicationContract.contractIsOpen()).to.be.false;
  });

  it("應該在請求隨機數據時觸發事件", async function () {
    await applicationContract.changeContractStatus(true);

    await expect(applicationContract.requestRandoms())
      .to.emit(applicationContract, "RequestRandoms")
      .withArgs((arg: any) => typeof arg === "string");

    expect(await applicationContract.showRequestedProgression()).to.be.true;
  });

  it("應該在進行中的請求時拒絕新請求", async function () {
    await applicationContract.changeContractStatus(true);
    await applicationContract.requestRandoms();

    await expect(applicationContract.requestRandoms()).to.be.revertedWith("A request is already in progress!");
  });

  it("應該允許擁有者更新 requestId 和隨機數值", async function () {
    const newRequestId = keccak256(abiCoder.encode(["string"], ["requestId"]));
    const newRandoms = 666;

    await applicationContract.updateRequestIdAndRandoms(newRequestId, newRandoms);

    expect(await applicationContract.showRequestId()).to.equal(newRequestId);
    expect(await applicationContract.showRandoms()).to.equal(newRandoms);
    expect(await applicationContract.showRequestedProgression()).to.be.false;
  });

  it("應該允許擁有者重置請求狀態", async function () {
    await applicationContract.changeRequestedStatus();
    expect(await applicationContract.showRequestedProgression()).to.be.false;
  });
});
