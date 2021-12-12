// deploy/00_deploy_your_contract.js

//const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("Alien", {
    from: deployer,
    //args: [ "Hello", ethers.utils.parseEther("1.5") ],
    log: true,
  });

  let alienContract = await ethers.getContract("Alien", deployer);
  // let names = ["Allen", "Bernard", "Lucy", "Karen", "Chad", "Kevin", "Bob", "Camden", "Roger", "Sheryl"];
  // let baseProbs = [10, 35, 95, 67, 89, 45, 22, 49, 76, 17];
  // let dropGearRarity = [0, 0, 2, 0, 0, 0, 1, 1, 0, 0];
  // await alienContract.mintMultipleAliens(names, baseProbs, dropGearRarity, 1);

  // names = ["Shila", "Roxanne", "Scarlet", "Paula", "Emma", "Rani"];
  // baseProbs = [45, 67, 69, 35, 56, 35];
  // dropGearRarity = [0, 1, 1, 0, 1, 0];
  // await alienContract.mintMultipleAliens(names, baseProbs, dropGearRarity, 2);

  // names = ["Donald", "Rumsfeld", "Anthony", "King", "Jeffrey", "Elon"];
  // baseProbs = [75, 85, 95, 58, 87, 70];
  // dropGearRarity = [0, 1, 2, 2, 1, 0];
  // await alienContract.mintMultipleAliens(names, baseProbs, dropGearRarity, 3);

  await deploy("Gears", {
    from: deployer,
    log: true,
  });

  let gearsContract = await ethers.getContract("Gears", deployer);

  await deploy("GameManager", {
    from: deployer,
    args: [alienContract.address, gearsContract.address],
    log: true,
  });
  const gameContract = await ethers.getContract("GameManager", deployer);

  // let address = "0xeAe052b6C4B18F05d74DFc32Ecce5d43011195DB";
  // await gearsContract.dropGear("Moloch", 0, address);
  // await gearsContract.dropGear("Moloch", 1, address);

  await deploy("Player", {
    from: deployer,
    args: [gameContract.address],
    log: true,
  });

  //   const baseUri =
  //     "https://gateway.pinata.cloud/ipfs/QmTV8L1G1D4ow9SA5Bnw3XZw7mdLkHo5uYfDsPbRqZqNm2/";
  //   await deploy("BadKidsAlley", {
  //     from: deployer,
  //     args: [baseUri],
  //     log: true,
  //   });

  /*
  //If you want to send value to an address from the deployer
  const deployerWallet = ethers.provider.getSigner()
  await deployerWallet.sendTransaction({
    to: "0x34aA3F359A9D614239015126635CE7732c18fDF3",
    value: ethers.utils.parseEther("0.001")
  })
  */

  /*
  //If you want to send some ETH to a contract on deploy (make your constructor payable!)
  const yourContract = await deploy("YourContract", [], {
  value: ethers.utils.parseEther("0.05")
  });
  */

  /*
  //If you want to link a library into your contract:
  // reference: https://github.com/austintgriffith/scaffold-eth/blob/using-libraries-example/packages/hardhat/scripts/deploy.js#L19
  const yourContract = await deploy("YourContract", [], {}, {
   LibraryName: **LibraryAddress**
  });
  */
};
module.exports.tags = ["Loot"];
