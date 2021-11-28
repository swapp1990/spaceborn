import React, { useEffect, useState, useContext } from "react";
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

const GEAR_CATS = ["Weapon",
  "Apparel",
  "Vehicle",
  "Pill",
  "Gizmo"];

const GEARS = {
  "Weapon": ["Pistol",
    "Cannon",
    "Phaser",
    "Sniper",
    "Zapper"],
  "Apparel": ["Exosuit",
    "Power Armor",
    "Biosuit",
    "Gloves",
    "Nnaosuit",
    "Jacket"],
  "Vehicle": ["Hoverboard",
    "Superbike",
    "Air-ship",
    "Time Machine",
    "Auto-Car",
    "Hushicopter"],
  "Gizmo": ["Neutralizer",
    "Replicator",
    "Battery",
    "Fuel Canister",
    "Supercomputer"],
  "Pill": ["Soma",
    "Nootropic",
    "LSX",
    "Regeneration",
    "Food Replacement"]
}

export default function WalletWindow({ address, tx, contracts, provider, context }) {
  //Global state
  const { state, dispatch } = useContext(context);
  const [walletLoot, setWalletLoot] = useState([]);

  useEffect(async () => {
    if (contracts && contracts.Gears) {
      init();
    }
  }, [contracts, address]);

  const init = async () => {
    updateWallet();
    if (contracts && contracts.Gears) {
      addEventListener("Gears", "GearDropped", onGearDropped);
    }
  };

  const addEventListener = async (contractName, eventName, callback) => {
    await contracts[contractName].removeListener(eventName);
    contracts[contractName].on(eventName, (...args) => {
      let eventBlockNum = args[args.length - 1].blockNumber;
      // console.log(eventName, eventBlockNum, provider._lastBlockNumber);
      if (eventBlockNum >= provider._lastBlockNumber - 10) {
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
    const result = await tx(contracts.GameManager.claimRandomGear(), update => {
      if (update) {
        if (update.status === "confirmed" || update.status === 1) {
          console.log("claimed gear");
        }
        if (update.events) {
          console.log({ "event": update.events });
          updateWallet();
        }
      }
    });
  };

  async function getSvgJson(tokenId) {
    let tokenUri = await contracts.Gears.tokenURI(tokenId);
    const base64_data = tokenUri.split("base64,")[1];
    const decoded_str = svgUtils.atob(base64_data);
    const decoded_json = JSON.parse(decoded_str);
    // console.log(decoded_json);
    return decoded_json;
  }

  async function updateWallet() {
    const balanceLoot = await contracts.Gears.balanceOf(address);
    // console.log({ "balanceLoot": balanceLoot.toNumber() });
    if (balanceLoot.toNumber() == walletLoot.length) {
      console.log("wallet is updated!");
      return;
    }
    const walletLootUpdate = [];
    for (let tokenIndex = 0; tokenIndex < balanceLoot; tokenIndex++) {
      try {
        const tokenId = await contracts.Gears.tokenOfOwnerByIndex(address, tokenIndex);
        const gearObj = await contracts.Gears.gears(tokenId);
        // console.log({ gearObj });
        if (gearObj.playerWonAddr == address) {
          let gearJsObj = {};
          gearJsObj.note = gearObj.name;
          gearJsObj.rarity = gearObj.rarity.toNumber();
          gearJsObj.tokenId = gearObj.tokenId.toNumber();
          let svgJson = await getSvgJson(gearJsObj.tokenId);
          // gearJsObj.image = svgJson.image;
          gearJsObj.gearJson = svgJson;
          // console.log(svgImg);
          walletLootUpdate.push(gearJsObj);
        }

      } catch (e) {
        console.log(e);
      }
    }
    // console.log(walletLootUpdate);
    setWalletLoot(walletLootUpdate.reverse());
  }

  async function walletGearClicked(item) {
    console.log("walletGearClicked ", item);
    let equippedFound = state.equippedGears.find(loot => loot.id == item.tokenId);
    // console.log({ equippedFound });
    if (equippedFound) {
      let selEquippedSlotIdx = state.equippedGears.findIndex(loot => loot.id === item.tokenId);
      // console.log({ selEquippedSlotIdx });
      let newState = [...state.equippedGears];
      newState[selEquippedSlotIdx].id = -1;
      newState[selEquippedSlotIdx].name = "Select from wallet";
      newState[selEquippedSlotIdx].image = null;
      dispatch({ type: "setEquippedGears", payload: newState, fieldName: "equippedGears" })
    } else {
      let newState = [...state.equippedGears];
      let emptySlotIdx = state.equippedGears.findIndex(loot => loot.id === -1);
      // console.log({ emptySlotIdx });
      if (emptySlotIdx == -1) {
        return;
      }
      let walletLootFound = walletLoot.find(loot => loot.tokenId == item.tokenId);
      // console.log({ walletLootFound })
      if (walletLootFound) {
        newState[emptySlotIdx].id = walletLootFound.tokenId;
        newState[emptySlotIdx].name = walletLootFound.note;
        newState[emptySlotIdx].image = walletLootFound.gearJson.image;
        const gearCatIdx = GEAR_CATS.indexOf(walletLootFound.gearJson.category);
        const gearIdx = GEARS[walletLootFound.gearJson.category].indexOf(walletLootFound.gearJson.item);
        newState[emptySlotIdx].usedGear = {
          rarityIdx: parseInt(walletLootFound.gearJson.rarityLevel), catIdx: gearCatIdx, gearIdx: gearIdx
        };
        // console.log({ newState });
        dispatch({ type: "setEquippedGears", payload: newState, fieldName: "equippedGears" })
      }
    }
  }

  function getWalletItemBgColor(idx) {
    let equippedFound = state.equippedGears.find(loot => loot.id == idx);
    // console.log({ "gears": state.equippedGears }, idx);
    if (equippedFound) {
      return { backgroundColor: "lightgreen" };
    }
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
              <Card title={item.name} hoverable onClick={() => walletGearClicked(item)} style={getWalletItemBgColor(item.tokenId)}>
                <Space direction="vertical">
                  <div>{item.tokenId}</div>
                  <img src={item.gearJson.image} style={{ width: 150 }}></img>
                  <a href={"https://opensea.io/assets/"} target="_blank">
                    View on OpenSea
                  </a>
                </Space>
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
