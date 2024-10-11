import { ethers as hardhatEthers } from "hardhat";

async function main() {
  const SimpleOracle = await hardhatEthers.getContractFactory("SimpleOracle");
  const simpleOracle = await SimpleOracle.deploy();
  await simpleOracle.waitForDeployment();
  const oracleAddress = await simpleOracle.getAddress();
  console.log("SimpleOracle deployed to:", oracleAddress);

  const ApplicationContract = await hardhatEthers.getContractFactory("ApplicationContract");
  const applicationContract = await ApplicationContract.deploy(oracleAddress);
  await applicationContract.waitForDeployment();
  console.log("ApplicationContract deployed to:", await applicationContract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
