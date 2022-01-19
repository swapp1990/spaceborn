const { ethers } = require("hardhat");

// module.exports = async ({ getNamedAccounts, deployments }) => {
//   const { deploy } = deployments;
//   const { deployer } = await getNamedAccounts();
//   // let walletAddress = "0x76c48E1F02774C40372a3497620D946136136172";

//   await deploy("MangoToken", {
//     from: deployer,
//     args: ["MANGO", "MNG", 100000, deployer],
//     log: true
//   });
//   let tokenContract = await ethers.getContract("MangoToken", deployer);

//   await deploy("TokenDistributor", {
//     from: deployer,
//     args: [tokenContract.address, deployer],
//     log: true
//   });

//   let tokenDistContract = await ethers.getContract("TokenDistributor", deployer);
//   await tokenContract.transfer(tokenDistContract.address, 75000);
//   console.log(tokenDistContract.address);
// }

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  console.log({ deployer })
  await deploy("MangoToken", {
    from: deployer,
    args: ["MANGO", "MNG", 100000, deployer],
    log: true
  });
  let tokenContract = await ethers.getContract("MangoToken", deployer);
  // let tokenSupply = await tokenContract.balanceOf(deployer);
  // console.log({ tokenSupply: tokenSupply.toNumber() });

  await deploy("TokenDistributor", {
    from: deployer,
    args: [tokenContract.address, deployer],
    log: true
  });
  let tokenDistContract = await ethers.getContract("TokenDistributor", deployer);

  await deploy("Alien", {
    from: deployer,
    //args: [ "Hello", ethers.utils.parseEther("1.5") ],
    log: true,
  });

  let alienContract = await ethers.getContract("Alien", deployer);
  // let names = ["Allen", "Bernard", "Lucy", "Karen", "Chad", "Kevin", "Bob", "Camden", "Roger", "Sheryl"];
  // let baseProbs = [10, 35, 95, 67, 89, 45, 22, 49, 76, 17];
  // // let baseProbs = [95, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95];
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

  await deploy("Spaceborn", {
    from: deployer,
    args: [alienContract.address, gearsContract.address, tokenDistContract.address],
    log: true,
  });
  const game1Contract = await ethers.getContract("Spaceborn", deployer);

  // let address = "0xeAe052b6C4B18F05d74DFc32Ecce5d43011195DB";
  // await gearsContract.mintGearTest("Moloch", 0, 0, address);
  // await gearsContract.mintGearTest("Moloch", 0, 1, address);
  // await gearsContract.mintGearTest("Moloch", 0, 2, address);
  // await gearsContract.mintGearTest("Moloch", 0, 3, address);
  // await gearsContract.mintGearTest("Moloch", 0, 4, address);
  // await gearsContract.dropGear("Moloch", 1, address);

  await deploy("Player", {
    from: deployer,
    args: [],
    log: true,
  });

  await tokenDistContract.init();
  let escrowBalCalculated = await tokenDistContract.initialEscrowBalance();
  await tokenContract.transfer(tokenDistContract.address, escrowBalCalculated);

  // let escrowBal = await tokenContract.balanceOf(tokenDistContract.address);
  // console.log({ escrowBal: escrowBal.toNumber() });
  await tokenDistContract.addGameContract(game1Contract.address, 5);
};
module.exports.tags = ["Spaceborn"];
