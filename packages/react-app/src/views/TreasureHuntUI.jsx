import { SyncOutlined } from "@ant-design/icons";
import { utils } from "ethers";
import { Button, Card, DatePicker, Divider, Input, List, Progress, Slider, Spin, Switch, Row, Col } from "antd";
import React, { useEffect, useState } from "react";
import { Address, Balance } from "../components";
import { useTokenList, useContractLoader, useContractReader } from "../hooks";
import assets from "../assets.js";
import StackGrid from "react-stack-grid";
// console.log("📦 Assets: ", assets);

export default function TreasureHuntUI({
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
}) {
  const [loadedAssets, setLoadedAssets] = useState();
  const [citizenId, setCitizenid] = useState(0);
  const [isAlreadyMinted, setIsAlreadyMinted] = useState(false);
  const [citizens, setCitizens] = useState([]);

  const houses = ["R", "G", "B", "Y"];

  const addEventListener = async (contractName, eventName, callback) => {
    await readContracts[contractName].removeListener(eventName);
    readContracts[contractName].on(eventName, (...args) => {
      let eventBlockNum = args[args.length - 1].blockNumber;
      if (eventBlockNum >= localProvider._lastBlockNumber) {
        let msg = args.pop().args;
        callback(msg);
      }
    });
  };

  function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  const init = async () => {
    let loaded_assets = [];
    for (let a in assets) {
      loaded_assets.push({ id: a, ...assets[a] });
    }
    console.log({ loaded_assets });
    setLoadedAssets(loaded_assets);
    let red_zens = [];
    red_zens.push({ name: "Reddy" });
    red_zens.push({ name: "Laal" });
    let green_zens = [];
    let blue_zens = [];
    blue_zens.push({ name: "Bluey" });
    let yellow_zens = [];
    let citizens = [];
    citizens.push(red_zens);
    citizens.push(green_zens);
    citizens.push(blue_zens);
    citizens.push(yellow_zens);
    setCitizens(citizens);
    update();
    let contractName = "NftTreasureHunt";
    // addEventListener(contractName, "NftMinted", onNftMinted);
  };

  const update = async () => {
    //   let owner;
    try {
      const currCitizenId = (await readContracts.NftTreasureHunt.getCitizenIdByAddress(address)).toNumber();
      console.log({ currCitizenId });
      if (currCitizenId != 0) {
        setIsAlreadyMinted(true);
        const citizen = await readContracts.NftTreasureHunt.getCitizenByTokenId(currCitizenId);
        console.log(citizen.name, citizen.houseGroup);
      }

      let redZens = [];
      let greenZens = [];
      let blueZens = [];
      let yellowZens = [];

      const lastMintedCitizenId = (await readContracts.NftTreasureHunt.lastMintedCitizenId()).toNumber();
      console.log({ lastMintedCitizenId });
      for (let i = 1; i <= lastMintedCitizenId; i++) {
        const citizen = await readContracts.NftTreasureHunt.getCitizenByTokenId(i);
        console.log(citizen.name, citizen.houseGroup);
        if (citizen.houseGroup == 0) {
          redZens.push({ name: citizen.name });
        } else if (citizen.houseGroup == 1) {
          greenZens.push({ name: citizen.name });
        } else if (citizen.houseGroup == 2) {
          blueZens.push({ name: citizen.name });
        } else if (citizen.houseGroup == 3) {
          yellowZens.push({ name: citizen.name });
        }
        let citizens = [];
        citizens.push(redZens);
        citizens.push(greenZens);
        citizens.push(blueZens);
        citizens.push(yellowZens);
        setCitizens(citizens);
      }
      //     if (Number(tokenId) != 0) {
      //       owner = await readContracts.NftTreasureHunt.ownerOf(tokenId);
      //     }
      //     assetUpdate.push({ id: a, ...assets[a], owner: owner });
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (readContracts && readContracts.NftTreasureHunt) {
      init();
    }
  }, [assets, readContracts]);

  //Events callback
  function onNftMinted(msg) {
    console.log(onNftMinted, msg);
  }

  async function mintYourCitizen() {
    let rand_asset_idx = getRandomArbitrary(0, loadedAssets.length);
    console.log({ rand_asset_idx });
    let random_house_idx = Math.floor(Math.random() * houses.length);
    let name = "Citizen " + citizenId;
    const result = tx(
      writeContracts.NftTreasureHunt.mintCitizen(loadedAssets[rand_asset_idx].id, name, random_house_idx),
      update => {
        console.log("📡 Transaction Update:", update);
      },
    );
    console.log("minted ", await result);
    update();
  }

  const colCount = 4;
  const houseHeaders = [];

  for (let i = 0; i < colCount; i++) {
    houseHeaders.push(
      <Col key={i.toString()} span={24 / colCount} style={{ border: "1px solid #cccccc" }}>
        <div>{houses[i]}</div>
      </Col>,
    );
  }

  const houseCitizens = [];
  for (let i = 0; i < colCount; i++) {
    houseCitizens.push(
      <Col key={i.toString()} span={24 / colCount} style={{ border: "1px solid #cccccc" }}>
        <List
          itemLayout="horizontal"
          dataSource={citizens[i]}
          renderItem={item => <List.Item>{item.name}</List.Item>}
        />
      </Col>,
    );
  }
  return (
    <div style={{ maxWidth: 1024, margin: "auto", paddingBottom: 56 }}>
      <Button disabled={isAlreadyMinted} onClick={mintYourCitizen} style={{ marginBottom: "25px" }}>
        Mint your citizen
      </Button>
      <div style={{ border: "1px solid #cccccc", width: 1000, margin: "auto", padding: 16 }}>
        <Row gutter={[16, 16]}>{houseHeaders}</Row>
        <Row gutter={[16, 16]}>{houseCitizens}</Row>
      </div>
      {/* <StackGrid columnWidth={300} gutterWidth={16} gutterHeight={16}>
        {galleryList}
      </StackGrid> */}
    </div>
  );
}
