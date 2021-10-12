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
import { configConsumerProps } from "antd/lib/config-provider";

import React, { useEffect, useState } from "react";
import { ReactComponent as CardEx } from "../card_ex.svg";
import { useContractReader } from "../hooks";
import namesJson from "../randomNames.json";
import "./main.css";
import { default as CreatePlayer } from "./game/CreatePlayer";
import { default as GameScreen } from "./game/GameScreen";
import { default as PlayerWindow } from "./game/PlayerWindow";

const { Text, Link, Title } = Typography;

export default function MVPUI({
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
}) {
  const balance = useContractReader(readContracts, "Player", "balanceOf", [address]);
  const [imgSrc, setImgSrc] = useState(null);
  const [tokenIdx, setTokenIdx] = useState(0);
  const [canMint, setCanMint] = useState(null);
  const [walletLoot, setWalletLoot] = useState([]);
  const [gameScreenUpdating, setGameScreenUpdating] = useState(false);
  const [equipped, setEquipped] = useState([]);
  const [playerNft, setPlayerNft] = useState(null);
  const [aliensDefeated, setAliensDefeated] = useState(0);
  const [fightFinalProb, setFightFinalProb] = useState(0);
  const [disableHuntMore, setDisableHuntMore] = useState(false);
  const [aliens, setAliens] = useState([]);
  const [logs, setLogs] = useState([]);

  const [randRes, setRandRes] = useState([0, 0, 0]);

  useEffect(async () => {
    if (readContracts && readContracts.Player) {
      init();
    }
  }, [readContracts, address]);

  useEffect(async () => {
    if (readContracts && playerNft) {
      console.log("set player nft ");
    }
    if (readContracts && readContracts.Alien) {
      //   updateGameScreen();
      //   addEventListener("Alien", "PlayerWon", onPlayerWon);
      //   addEventListener("Alien", "AlienWon", onAlienWon);
      //   updatePrevLogs();
    }
  }, [readContracts, playerNft]);

  function initEmptyEquip() {
    let emptyEquipped = [];
    emptyEquipped.push({ id: 0, name: "Select from wallet" });
    emptyEquipped.push({ id: 0, name: "Select from wallet" });
    emptyEquipped.push({ id: 0, name: "Select from wallet" });
    setEquipped(emptyEquipped);
  }

  const init = async () => {
    updateProfile();
    // updateWallet();

    // addEventListener("ScifiLoot", "LootMinted", onLootMinted);
    addEventListener("Player", "PlayerCreated", onPlayerCreated);
    // addEventListener("Alien", "PlayerLostLoot", onPlayerLostLoot);
    // addEventListener("Alien", "MintedAliens", onMintedAliens);
    // initEmptyEquip();
  };

  async function updateProfile() {
    const tokenId = await readContracts.Player.getTokenId(address);
    if (tokenId.toNumber() == 0) {
      console.log("tokenId is not set");
      return;
    }
    const player = await readContracts.Player.getPlayer(tokenId);
    setPlayerNft(player);
    console.log("found player nft ", player.name);
  }

  function updatePrevLogs() {
    let contractName = "Alien";
    let eventName = "PlayerWon";
    readContracts[contractName].on(eventName, (...args) => {
      let eventBlockNum = args[args.length - 1].blockNumber;
      console.log(eventName, eventBlockNum, localProvider._lastBlockNumber);
      if (eventBlockNum != localProvider._lastBlockNumber) {
        let msg = args.pop().args;
        onPlayerWon(msg);
      }
    });
    eventName = "AlienWon";
    readContracts[contractName].on(eventName, (...args) => {
      let eventBlockNum = args[args.length - 1].blockNumber;
      console.log(eventName, eventBlockNum, localProvider._lastBlockNumber);
      if (eventBlockNum != localProvider._lastBlockNumber) {
        let msg = args.pop().args;
        onAlienWon(msg);
      }
    });
  }

  //Testing random probs of contract
  //   async function getRandom() {
  //     const clientRandom = Math.floor(Math.random() * 100);
  //     const res = await readContracts.Alien.getRandomWin(clientRandom, 90);
  //     console.log("RANDOM ", res);
  //     let newState = [...randRes];
  //     if (res == "Won") {
  //       newState[0] = newState[0] + 1;
  //     } else if (res == "Loss") {
  //       newState[1] = newState[1] + 1;
  //     }
  //     newState[2] = newState[2] + 1;
  //     setRandRes(newState);
  //   }

  async function getBuffTest() {
    const res = await readContracts.Alien.getBuffValue(5, 25);
    console.log("buff ", res.toNumber());
  }

  async function testConditionalMint() {
    const result = await tx(writeContracts.ScifiLoot.mintLoot(2, "testing"));
    console.log(result);
  }

  async function updateWallet() {
    // console.log({ address });
    const balanceLoot = await readContracts.ScifiLoot.balanceOf(address);
    if (balanceLoot.toNumber() == walletLoot.length) {
      console.log("wallet is updated!");
      return;
    }
    const walletLootUpdate = [];
    for (let tokenIndex = 0; tokenIndex < balanceLoot; tokenIndex++) {
      try {
        // console.log("GEtting token index", tokenIndex);
        const tokenId = await readContracts.ScifiLoot.tokenOfOwnerByIndex(address, tokenIndex);
        const tokenURI = await readContracts.ScifiLoot.tokenURI(tokenId);
        const jsonManifestString = atob(tokenURI.substring(29));
        try {
          const jsonManifest = JSON.parse(jsonManifestString);
          //   console.log("jsonManifest", jsonManifest);
          walletLootUpdate.push({ id: tokenId, uri: tokenURI, owner: address, ...jsonManifest });
        } catch (e) {
          console.log(e);
        }
      } catch (e) {
        console.log(e);
      }
    }
    setWalletLoot(walletLootUpdate.reverse());
  }

  async function updateGameScreen() {
    setGameScreenUpdating(true);
    const aliensMinted = await readContracts.Alien.lastTokenId();
    let killedAliens = await readContracts.Alien.getKilledAliens(address);
    // console.log({ deadAliens });
    killedAliens = killedAliens.map(d => d.toNumber());
    // console.log({ killedAliens });
    setCanMint(false);
    killedAliens.forEach(async id => {
      const isLootMinted = await readContracts.ScifiLoot.deadAliens(id);
      if (!isLootMinted) {
        setCanMint(true);
        const tokenURI = await readContracts["Alien"].tokenURI(id);
        const jsonManifestString = atob(tokenURI.substring(29));
        try {
          const jsonManifest = JSON.parse(jsonManifestString);
          //   console.log("jsonManifest", jsonManifest);
          setAlienSelected({ id: id, uri: tokenURI, owner: address, ...jsonManifest });
        } catch (e) {
          console.log(e);
          setGameScreenUpdating(false);
        }
      }
    });
    const aliensUpdate = [];
    setDisableHuntMore(false);
    for (let tokenId = 1; tokenId <= aliensMinted; tokenId++) {
      try {
        if (!killedAliens.includes(tokenId)) {
          //   console.log("alien tokenId", tokenId);
          const alien = await readContracts.Alien.aliens(tokenId);
          if (alien.wonCount == 0) {
            setDisableHuntMore(true);
          }
          //   console.log({ alien });
          if (alien.isDead) continue;
          const tokenURI = await readContracts["Alien"].tokenURI(tokenId);
          const jsonManifestString = atob(tokenURI.substring(29));
          try {
            const jsonManifest = JSON.parse(jsonManifestString);
            //   console.log("jsonManifest", jsonManifest);
            aliensUpdate.push({ id: tokenId, uri: tokenURI, owner: address, ...jsonManifest });
          } catch (e) {
            console.log(e);
            setGameScreenUpdating(false);
          }
        }
      } catch (e) {
        console.log(e);
        setGameScreenUpdating(false);
      }
    }
    // console.log(aliensUpdate);
    setAliens(aliensUpdate);

    const player_wins = (await readContracts.Alien.player2wins(address)).toNumber();
    // console.log({ player_wins });
    setAliensDefeated(player_wins);
    setGameScreenUpdating(false);
  }

  const addEventListener = async (contractName, eventName, callback) => {
    await readContracts[contractName].removeListener(eventName);
    readContracts[contractName].on(eventName, (...args) => {
      let eventBlockNum = args[args.length - 1].blockNumber;
      console.log(eventName, eventBlockNum, localProvider._lastBlockNumber);
      if (eventBlockNum >= localProvider._lastBlockNumber - 1) {
        let msg = args.pop().args;
        callback(msg);
      }
    });
  };

  function onMintedAliens(msg) {
    updateGameScreen();
  }

  function onLootMinted(msg) {
    // console.log("onLootMinted ");
    updateGameScreen();
    updateWallet();
    setAlienSelected(null);
  }

  function onPlayerCreated(msg) {
    console.log("onPlayerCreated", msg);
    updateProfile();
  }

  async function onPlayerWon(msg) {
    // console.log("onPlayerWon", msg.startProbs.toNumber(), msg.finalProbs.toNumber(), msg.sender);
    if (msg.sender == address) {
    } else {
    }
    updateGameScreen();
    setFightFinalProb(msg.finalProbs.toNumber());
    const alien = await readContracts.Alien.aliens(msg.tokenId.toNumber());
    const txt =
      msg.sender.substring(0, 6) + " killed alien named " + alien.name + "! Prob:" + msg.finalProbs.toNumber();
    updateLogs(txt);
  }

  async function onAlienWon(msg) {
    // console.log("onAlienWon", msg.startProbs.toNumber(), msg.finalProbs.toNumber(), msg.sender);
    if (msg.sender == address) {
      setAlienWon(true);
      setAlienSelected(null);
    } else {
    }
    updateGameScreen();
    setFightFinalProb(msg.finalProbs.toNumber());
    const alien = await readContracts.Alien.aliens(msg.tokenId.toNumber());
    // const ens = useLookupAddress(props.ensProvider, address);
    const txt =
      "Alien named " + alien.name + " defeated " + msg.sender.substring(0, 6) + "! Prob:" + msg.finalProbs.toNumber();

    updateLogs(txt);
  }

  function updateLogs(txt) {
    let prevLogs = logs;
    if (!prevLogs.includes(txt)) {
      prevLogs.push(txt);
    }
    setLogs(prevLogs.reverse());
  }

  async function onPlayerLostLoot(msg) {
    console.log("onPlayerLostLoot", msg.lostLootId.toNumber(), msg.sender);
    if (msg.sender == address) {
      setPlayerLostLoot(true);
      updateWallet();
    }
  }

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  const atob = input => {
    let str = input.replace(/=+$/, "");
    let output = "";

    if (str.length % 4 == 1) {
      throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
    }
    for (
      let bc = 0, bs = 0, buffer, i = 0;
      (buffer = str.charAt(i++));
      ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
        ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
        : 0
    ) {
      buffer = chars.indexOf(buffer);
    }

    return output;
  };

  function getSelectedAlienName() {
    return alienSelected.name;
  }

  function getWalletItemBgColor(idx) {
    let equippedFound = equipped.find(loot => loot.id == idx);
    if (equippedFound) {
      return { backgroundColor: "lightgreen" };
    }
    return { backgroundColor: "white" };
  }

  function toggleToFight(idx) {
    if (!alienSelected) return;
    let equippedFound = equipped.find(loot => loot.id == idx);
    if (equippedFound) {
      console.log("equippedFound");
      let selEquippedSlotIdx = equipped.findIndex(loot => loot.id === idx);
      //   console.log("selEquippedSlotIdx");
      let newState = [...equipped];
      newState[selEquippedSlotIdx].id = 0;
      newState[selEquippedSlotIdx].name = "Select from wallet";
      newState[selEquippedSlotIdx].image = null;
      setEquipped(newState);
    } else {
      let newState = [...equipped];
      let walletLootFound = walletLoot.find(loot => loot.id == idx);
      let emptySlotIdx = equipped.findIndex(loot => loot.id === 0);
      console.log({ emptySlotIdx });
      if (walletLootFound) {
        newState[emptySlotIdx].id = walletLootFound.id;
        newState[emptySlotIdx].name = walletLootFound.name;
        newState[emptySlotIdx].image = walletLootFound.image;
        setEquipped(newState);
      }
    }
  }

  async function claimFree() {
    const result = await tx(writeContracts.ScifiLoot.mintFreeLoot());
  }

  const walletComp = (
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
            <div onClick={() => toggleToFight(item.id)}>
              <Card title={item.name} style={getWalletItemBgColor(item.id)} hoverable>
                <img style={{ width: 150 }} src={item.image} />
                <a
                  href={
                    "https://opensea.io/assets/" +
                    (readContracts && readContracts.ScifiLoot && readContracts.ScifiLoot.address) +
                    "/" +
                    item.id
                  }
                  target="_blank"
                >
                  View on OpenSea
                </a>
              </Card>
            </div>
            <Button type="primary" onClick={() => viewItem(item.image)}>
              View Item
            </Button>
          </List.Item>
        )}
      />
    </Card>
  );

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState();

  const showModal = () => {
    setIsModalVisible(true);
  };
  const handleOk = () => {
    setIsModalVisible(false);
  };
  const handleCancel = () => {
    setIsModalVisible(false);
  };
  function viewItem(imgSrc) {
    showModal();
    setModalImageSrc(imgSrc);
  }

  const lootItemModal = (
    <Modal title="Basic Modal" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
      <img style={{ width: 300 }} src={modalImageSrc} />
    </Modal>
  );

  const logsScreen = (
    <Card style={{ width: 400 }} title="Logs">
      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={logs}
        style={{ overflowY: "auto", overflowX: "hidden", height: "600px" }}
        renderItem={item => (
          <List.Item>
            <div onClick={() => console.log(item)}>
              <Card>{item}</Card>
            </div>
          </List.Item>
        )}
      />
    </Card>
  );

  return (
    <>
      {!playerNft && (
        <CreatePlayer address={address} tx={tx} writeContracts={writeContracts} readContracts={readContracts} />
      )}
      {playerNft && (
        <div style={{ width: 820, paddingBottom: 256, marginLeft: 64 }}>
          <>
            <Space align="start">
              <Space direction="vertical">
                <PlayerWindow address={address} tx={tx} writeContracts={writeContracts} readContracts={readContracts} />
                {/* {walletComp} */}
              </Space>
              <Space>
                <GameScreen
                  address={address}
                  tx={tx}
                  writeContracts={writeContracts}
                  readContracts={readContracts}
                  localProvider={localProvider}
                />
              </Space>
              {/* <Space align="baseline">{logsScreen}</Space> */}
            </Space>
          </>
        </div>
      )}
    </>
  );
}
