const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("Wands NFT Game", function () {
  let testContract;
  let wandsContract;
  let firstPlayer;
  let secondPlayer;

  describe("TestNFT", function () {
    it("Should deploy TestNFT", async function () {
      const TestNFT = await ethers.getContractFactory("TestNFT");
      testContract = await TestNFT.deploy();
      const [owner] = await ethers.getSigners();
      firstPlayer = owner;
    });

    describe("mint test", function () {
      it("should mint nft", async function () {
        await testContract.mint(123, {
          value: ethers.utils.parseEther("0.01"),
        });
        expect(await testContract.exists(123)).to.equal(true);
        expect(await testContract.exists(122)).to.equal(false);
      });
    });
  });

  describe("WandsNFT", function () {
    it("Should deploy WandsNFT", async function () {
      const WandsNFT = await ethers.getContractFactory("Wands");
      wandsContract = await WandsNFT.deploy();
      const TestNFT = await ethers.getContractFactory("TestNFT");
      testContract = await TestNFT.deploy();
      const [owner, second] = await ethers.getSigners();
      firstPlayer = owner;
      secondPlayer = second;
    });

    describe("mint wands", function () {
      it("should mint nft", async function () {
        await wandsContract.mint(123, {
          value: ethers.utils.parseEther("0.05"),
        });
        expect(await wandsContract.exists(123)).to.equal(true);
        expect(await wandsContract.exists(122)).to.equal(false);
      });
    });

    describe("add TestNFT connector to Wands", function () {
      it("should add connector", async function () {
        await wandsContract.setConnector(testContract.address, 10, 1000);
        expect(await wandsContract.hasConnector(testContract.address)).to.equal(
          true
        );
      });
    });

    describe("Mint Wands as partner", function () {
      it("should mint as partner", async function () {
        await testContract.mint(123, {
          value: ethers.utils.parseEther("0.01"),
        });
        expect(await testContract.exists(123)).to.equal(true);

        await testContract.connect(secondPlayer).mint(111, {
          value: ethers.utils.parseEther("0.01"),
        });
        expect(await testContract.exists(111)).to.equal(true);

        expect(await wandsContract.hasConnector(testContract.address)).to.equal(
          true
        );
        expect(
          await wandsContract.balanceOfPartner(
            testContract.address,
            firstPlayer.address
          )
        ).to.equal(1);

        await wandsContract.mintAsPartner(testContract.address, 123, 400, {
          value: ethers.utils.parseEther("0.01"),
        });
        expect(await wandsContract.exists(400)).to.equal(true);
        expect(await wandsContract.exists(401)).to.equal(false);

        await wandsContract.mintAsPartner(testContract.address, 123, 401, {
          value: ethers.utils.parseEther("0.01"),
        });

        expect(await wandsContract.exists(401)).to.equal(true);

        //Error: 'You do not own the _partnerId'
        // except(
        //   await wandsContract.mintAsPartner(testContract.address, 111, 402, {
        //     value: ethers.utils.parseEther("0.01"),
        //   })
        // ).eventually.to.rejectWith(
        //   Error,
        //   "VM Exception while processing transaction: reverted with reason string 'You do not own the _partnerId'"
        // );

        await wandsContract.removeConnector(testContract.address);
        expect(await wandsContract.hasConnector(testContract.address)).to.equal(
          false
        );

        //Error: 'Contract not allowed'
        // await wandsContract.mintAsPartner(testContract.address, 123, 402, {
        //   value: ethers.utils.parseEther("0.01"),
        // });
      });
    });
  });
});
