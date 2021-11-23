import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Carousel,
  DatePicker,
  Divider,
  Form,
  Input,
  List,
  Progress,
  Select,
  Slider,
  Spin,
  Switch,
  Row,
  Col,
  Space,
  Typography,
  Modal,
} from "antd";
import * as svgUtils from "../../helpers/svgUtils";

const { Text, Link, Title } = Typography;
export default function WalletWindow({ address, tx, readContracts, writeContracts, localProvider }) {
  const [walletLoot, setWalletLoot] = useState([]);

  useEffect(async () => {
    if (readContracts && readContracts.Gears) {
      init();
    }
  }, [readContracts, address]);

  const init = async () => {
    updateWallet();
    if (readContracts && readContracts.Gears) {
      addEventListener("Gears", "GearDropped", onGearDropped);
    }
  };

  const addEventListener = async (contractName, eventName, callback) => {
    await readContracts[contractName].removeListener(eventName);
    readContracts[contractName].on(eventName, (...args) => {
      let eventBlockNum = args[args.length - 1].blockNumber;
      //   console.log(eventName, eventBlockNum, localProvider._lastBlockNumber);
      if (eventBlockNum >= localProvider._lastBlockNumber - 1) {
        let msg = args.pop().args;
        callback(msg);
      }
    });
  };
  async function onGearDropped(msg) {
    console.log({ onGearDropped: msg });
    updateWallet();
  }

  const claimFree = async () => {
    const result = await tx(writeContracts.GameManager.claimRandomGear(), update => {
      if (update && (update.status === "confirmed" || update.status === 1)) {
        console.log("claimed gear");
      }
    });
  };

  async function getSvgImg(tokenId) {
    let tokenUri = await readContracts.Gears.tokenURI(tokenId);
    const base64_data = tokenUri.split("base64,")[1];
    const decoded_str = svgUtils.atob(base64_data);
    const decoded_json = JSON.parse(decoded_str);
    // console.log(decoded_json);
    return decoded_json.image;
  }

  async function updateWallet() {
    const balanceLoot = await readContracts.Gears.balanceOf(address);
    console.log({ balanceLoot: balanceLoot.toNumber() });
    if (balanceLoot.toNumber() == walletLoot.length) {
      console.log("wallet is updated!");
      return;
    }
    const walletLootUpdate = [];
    for (let tokenIndex = 0; tokenIndex < balanceLoot; tokenIndex++) {
      try {
        const tokenId = await readContracts.Gears.tokenOfOwnerByIndex(address, tokenIndex);
        const gearObj = await readContracts.Gears.gears(tokenId);
        console.log({ gearObj });
        if (gearObj.playerWonAddr == address) {
          let gearJsObj = {};
          gearJsObj.note = gearObj.name;
          gearJsObj.rarity = gearObj.rarity.toNumber();
          gearJsObj.tokenId = gearObj.tokenId.toNumber();
          let svgImg = await getSvgImg(gearJsObj.tokenId);
          gearJsObj.image = svgImg;
          // console.log(svgImg);
          walletLootUpdate.push(gearJsObj);
        }

      } catch (e) {
        console.log(e);
      }
    }
    console.log(walletLootUpdate);
    setWalletLoot(walletLootUpdate.reverse());
  }

  async function walletGearClicked(item) {
    console.log("walletGearClicked ", item);
  }

  function getWalletItemBgColor(idx) {
    // let equippedFound = equipped.find(loot => loot.id == idx);
    // // console.log({ equippedFound });
    // if (equippedFound) {
    //   return { backgroundColor: "lightgreen" };
    // }
    return { backgroundColor: "black" };
  }

  const walletWindow = (
    <>
      <Card
        title="Wallet"
        extra={
          <Button onClick={claimFree} type="dashed" disabled={walletLoot.length != 0}>
            Claim a free loot
          </Button>
        }
      >
        <List
          grid={{ gutter: 16, column: 2 }}
          dataSource={walletLoot}
          style={{ overflowY: "auto", overflowX: "hidden", height: "400px" }}
          renderItem={item => (
            <List.Item>
              <Card title={item.name} hoverable onClick={() => walletGearClicked(item)} style={getWalletItemBgColor(item.id)}>
                <div>{item.rarity}</div>
                <img src={item.image} style={{ width: 150 }}></img>
                <a href={"https://opensea.io/assets/"} target="_blank">
                  View on OpenSea
                </a>
              </Card>
            </List.Item>
          )}
        />
      </Card>
    </>
  );

  return (
    <>
      <div>{walletWindow}</div>
    </>
  );
}
