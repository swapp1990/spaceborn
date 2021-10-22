import {
  Button,
  Card,
  DatePicker,
  Divider,
  Input,
  List,
  Progress,
  Slider,
  Spin,
  Switch,
  Row,
  Col,
  Space,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import { ReactComponent as CardEx } from "../card_ex.svg";
const { Text, Link, Title } = Typography;
import * as svgUtils from "../helpers/svgUtils";

export default function CombatTest({
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
}) {
  const [imgSrc, setImgSrc] = useState(null);
  const [equipped, setEquipped] = useState([]);
  const [walletGears, setWalletGears] = useState([]);
  const [gameActionMsg, setgameActionMsg] = useState("");
  const [baseProb, setBaseProb] = useState(0);
  const [alienIdx, setAlienIdx] = useState(0);

  const init = async () => {
    initEmptyEquip();
    initRandomWalletGears();
    showAlien();
    if (readContracts && readContracts.GameManager) {
      addEventListener("GameManager", "PlayerWon", onPlayerWon);
      addEventListener("GameManager", "AlienWon", onAlienWon);
    }
  };
  useEffect(() => {
    if (readContracts && readContracts.Alien) {
      init();
    }
  }, [readContracts]);

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

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
  const renderAlien = async (token_idx, base_probs) => {
    const result = await readContracts.Alien.fixedAlien(token_idx, base_probs);
    const base64_data = result.split("base64,")[1];
    const decoded_str = svgUtils.atob(base64_data);
    const decoded_json = JSON.parse(decoded_str);
    // console.log(decoded_json);
    const svg_img = decoded_json.image;
    setImgSrc(svg_img);
  };

  const showAlien = async () => {
    const token_idx = getRandomInt(1000);
    setAlienIdx(token_idx);
    renderAlien(token_idx, baseProb);
  };

  const fightAlien = async () => {
    setgameActionMsg("");
    const clientRandom = Math.floor(Math.random() * 100);
    const rarities = equipped.filter(e => e.id != -1).map(i => i.rarity);
    console.log({ rarities: rarities });
    const result = await tx(writeContracts.GameManager.fightAlienTest(baseProb, clientRandom, rarities), update => {
      if (update && (update.status === "confirmed" || update.status === 1)) {
        console.log("fightAlien success");
      }
    });
  };
  const updateAlien = async () => {
    renderAlien(alienIdx, baseProb);
  };

  async function onPlayerWon(msg) {
    console.log({ onPlayerWon: msg });
    const txt = "Player won with final prob of alien to be " + msg.finalProbs.toNumber();
    setgameActionMsg(txt);
  }

  async function onAlienWon(msg) {
    console.log({ onAlienWon: msg.finalProbs.toNumber() });
    const txt = "Alien won with final prob of " + msg.finalProbs.toNumber();
    setgameActionMsg(txt);
  }

  function initEmptyEquip() {
    let emptyEquipped = [];
    emptyEquipped.push({ id: -1, name: "Select from wallet" });
    emptyEquipped.push({ id: -1, name: "Select from wallet" });
    emptyEquipped.push({ id: -1, name: "Select from wallet" });
    setEquipped(emptyEquipped);
  }

  async function initRandomWalletGears() {
    let walletGears = [];
    let gearsCount = 5;
    for (let i = 0; i < gearsCount; i++) {
      const result = await readContracts.Gears.randomTokenURI(i, 0);
      const base64_data = result.split("base64,")[1];
      const decoded_str = svgUtils.atob(base64_data);
      const decoded_json = JSON.parse(decoded_str);
      const svg_img = decoded_json.image;
      walletGears.push({ id: i, imgSrc: svg_img, name: decoded_json.name, rarity: 0 });
    }

    setWalletGears(walletGears);
  }

  async function walletGearClicked(item) {
    console.log("walletGearClicked ", item);
    let equippedFound = equipped.find(loot => loot.id == item.id);
    if (equippedFound) {
      console.log("equippedFound");
      let selEquippedSlotIdx = equipped.findIndex(loot => loot.id === item.id);
      //   console.log("selEquippedSlotIdx");
      let newState = [...equipped];
      newState[selEquippedSlotIdx].id = -1;
      newState[selEquippedSlotIdx].name = "Select from wallet";
      newState[selEquippedSlotIdx].image = null;
      setEquipped(newState);
    } else {
      let newState = [...equipped];
      let walletLootFound = walletGears.find(loot => loot.id == item.id);
      let emptySlotIdx = equipped.findIndex(loot => loot.id === -1);
      console.log({ emptySlotIdx });
      if (walletLootFound) {
        newState[emptySlotIdx].id = walletLootFound.id;
        newState[emptySlotIdx].name = walletLootFound.name;
        newState[emptySlotIdx].image = walletLootFound.image;
        newState[emptySlotIdx].rarity = walletLootFound.rarity;
        setEquipped(newState);
      }
    }
  }

  function getWalletItemBgColor(idx) {
    let equippedFound = equipped.find(loot => loot.id == idx);
    if (equippedFound) {
      return { backgroundColor: "lightgreen" };
    }
    return { backgroundColor: "black" };
  }

  async function changeToUncommon(e, idx) {
    e.stopPropagation();
    const result = await readContracts.Gears.randomTokenURI(idx, 1);
    const base64_data = result.split("base64,")[1];
    const decoded_str = svgUtils.atob(base64_data);
    const decoded_json = JSON.parse(decoded_str);
    const svg_img = decoded_json.image;
    let walletGearIdx = walletGears.findIndex(loot => loot.id == idx);
    console.log({ walletGearIdx });
    let updatedGear = walletGears[walletGearIdx];
    updatedGear.imgSrc = svg_img;
    updatedGear.rarity = 1;
    setWalletGears([...walletGears.slice(0, walletGearIdx), updatedGear, ...walletGears.slice(walletGearIdx + 1)]);
  }
  async function changeToRare(e, idx) {
    e.stopPropagation();
    const result = await readContracts.Gears.randomTokenURI(idx, 2);
    const base64_data = result.split("base64,")[1];
    const decoded_str = svgUtils.atob(base64_data);
    const decoded_json = JSON.parse(decoded_str);
    const svg_img = decoded_json.image;
    let walletGearIdx = walletGears.findIndex(loot => loot.id == idx);
    console.log({ walletGearIdx });
    let updatedGear = walletGears[walletGearIdx];
    updatedGear.imgSrc = svg_img;
    updatedGear.rarity = 2;
    setWalletGears([...walletGears.slice(0, walletGearIdx), updatedGear, ...walletGears.slice(walletGearIdx + 1)]);
  }

  return (
    <div style={{ maxWidth: 1024, margin: "auto", paddingBottom: 56 }}>
      <Space direction="horizontal">
        <Card title="Wallet" style={{ width: 350 }}>
          <List
            grid={{ gutter: 16, column: 1 }}
            dataSource={walletGears}
            style={{ overflowY: "auto", overflowX: "hidden", height: "400px" }}
            renderItem={item => (
              <List.Item>
                <Card
                  title={item.name}
                  hoverable
                  onClick={() => walletGearClicked(item)}
                  style={getWalletItemBgColor(item.id)}
                  extra={
                    <Space direction="vertical">
                      <Button onClick={e => changeToUncommon(e, item.id)} type="dashed">
                        Uncommon
                      </Button>
                      <Button onClick={e => changeToRare(e, item.id)} type="dashed">
                        Rare
                      </Button>
                    </Space>
                  }
                >
                  <img src={item.imgSrc} style={{ width: 250 }}></img>
                  <div>{item.rarity}</div>
                </Card>
              </List.Item>
            )}
          />
        </Card>
        <Space direction="vertical">
          <Card title="Alien" style={{ width: 650 }}>
            {/* <Button onClick={showAlien} style={{ marginBottom: "5px" }}>
              Show Random Alien Card
            </Button>
            <Divider /> */}
            <Space direction="horizontal">
              <Space direction="vertical" style={{ width: 450 }}>
                <img src={imgSrc} style={{ width: 250 }}></img>
                <Button onClick={fightAlien} style={{ marginBottom: "5px" }}>
                  Fight Alien
                </Button>
                <Title level={5}>{gameActionMsg}</Title>
              </Space>
              <Space direction="vertical" style={{ width: 250 }}>
                <Row>
                  <Col span={12}>
                    <Title level={5}>Base Prob: {baseProb}</Title>
                    <Slider min={1} max={99} onChange={setBaseProb} value={baseProb} />
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <Button onClick={updateAlien} style={{ marginBottom: "5px" }}>
                      Update Alien
                    </Button>
                  </Col>
                </Row>
              </Space>
            </Space>
          </Card>
          <Card title="Equip" style={{ width: 650 }}>
            <List
              grid={{ gutter: 16, column: 3 }}
              dataSource={equipped}
              renderItem={(item, idx) => (
                <List.Item>
                  <div onClick={() => console.log("equipped")}>
                    <Card hoverable bordered title={item.name}>
                      <img style={{ width: 100 }} src={item.image} />
                    </Card>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Space>
      </Space>
    </div>
  );
}
