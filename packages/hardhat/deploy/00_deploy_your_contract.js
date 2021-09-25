// deploy/00_deploy_your_contract.js

//const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  //   await deploy("Wands", {
  //     from: deployer,
  //     //args: [ "Hello", ethers.utils.parseEther("1.5") ],
  //     log: true,
  //   });

  //   await deploy("TestNFT", {
  //     from: deployer,
  //     //args: [ "Hello", ethers.utils.parseEther("1.5") ],
  //     log: true,
  //   });

  //   const testContract = await ethers.getContract("TestNFT", deployer);

  //   await testContract.mint(1, {
  //     value: ethers.utils.parseEther("0.01"),
  //   });

  const MyContract = await ethers.getContractFactory("Wands");
  const wandsContract = await MyContract.attach(
    "0x991866c101521355153dec646a767246784c87af" // The deployed contract address
  );

  //   const wandsContract = await ethers.getContract("Wands", deployer);
  //   await wandsContract.setConnector(testContract.address, 10, 10000);
  await wandsContract.transferOwnership(
    "0x76c48E1F02774C40372a3497620D946136136172"
  );
  //   console.log("connect ", testContract.address);

  //   const hasConnector = await wandsContract.hasConnector(testContract.address);
  //   console.log({ hasConnector });
  /*
  //If you want to send value to an address from the deployer
  const deployerWallet = ethers.provider.getSigner()
  await deployerWallet.sendTransaction({
    to: "0x34aA3F359A9D614239015126635CE7732c18fDF3",
    value: ethers.utils.parseEther("0.001")
  })
  */

  /*
  //If you want to link a library into your contract:
  // reference: https://github.com/austintgriffith/scaffold-eth/blob/using-libraries-example/packages/hardhat/scripts/deploy.js#L19
  const yourContract = await deploy("YourContract", [], {}, {
   LibraryName: **LibraryAddress**
  });
  */
};
module.exports.tags = ["Wands"];
