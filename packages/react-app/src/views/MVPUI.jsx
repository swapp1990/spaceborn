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
  Modal,
} from "antd";

import React, { useEffect, useState } from "react";
import { ReactComponent as CardEx } from "../card_ex.svg";
import { useContractReader } from "../hooks";
import namesJson from "../randomNames.json";

const { Text, Link } = Typography;

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
  const [playerName, setPlayerName] = useState("");
  const [playerNft, setPlayerNft] = useState(null);
  const [walletLoot, setWalletLoot] = useState([]);
  const [aliens, setAliens] = useState([]);
  const [alienSelected, setAlienSelected] = useState(null);
  const [canMint, setCanMint] = useState(null);
  const [aliensDefeated, setAliensDefeated] = useState(0);
  const [equipped, setEquipped] = useState([]);
  const [alienWon, setAlienWon] = useState(false);
  const [fightFinalProb, setFightFinalProb] = useState(0);
  const [playerLostLoot, setPlayerLostLoot] = useState(false);
  const [logs, setLogs] = useState([]);

  const [randRes, setRandRes] = useState([0, 0, 0]);

  function initEmptyEquip() {
    let emptyEquipped = [];
    emptyEquipped.push({ id: 0, name: "Select from wallet" });
    emptyEquipped.push({ id: 0, name: "Select from wallet" });
    emptyEquipped.push({ id: 0, name: "Select from wallet" });
    setEquipped(emptyEquipped);
  }

  const init = async () => {
    updateProfile();
    updateWallet();
    updateGameScreen();

    addEventListener("ScifiLoot", "LootMinted", onLootMinted);
    addEventListener("Player", "PlayerCreated", onPlayerCreated);
    addEventListener("Alien", "PlayerWon", onPlayerWon);
    addEventListener("Alien", "AlienWon", onAlienWon);
    addEventListener("Alien", "PlayerLostLoot", onPlayerLostLoot);
    addEventListener("Alien", "MintedAliens", onMintedAliens);
    initEmptyEquip();
  };

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

  async function updateProfile() {
    const tokenId = await readContracts.Player.getTokenId(address);
    if (tokenId.toNumber() == 0) {
      console.log("tokenId is not set");
      return;
    }
    const tokenURI = await readContracts.Player.tokenURI(tokenId);
    const jsonManifestString = atob(tokenURI.substring(29));
    // console.log({ jsonManifestString });
    try {
      const jsonManifest = JSON.parse(jsonManifestString);
      //   console.log("jsonManifest", jsonManifest);
      setPlayerNft({ id: tokenId, uri: tokenURI, owner: address, ...jsonManifest });
    } catch (e) {
      console.log(e);
    }
  }

  async function updateWallet() {
    // console.log({ address });
    const balanceLoot = await readContracts.ScifiLoot.balanceOf(address);
    const walletLootUpdate = [];
    for (let tokenIndex = 0; tokenIndex < balanceLoot; tokenIndex++) {
      try {
        console.log("GEtting token index", tokenIndex);
        const tokenId = await readContracts.ScifiLoot.tokenOfOwnerByIndex(address, tokenIndex);
        // console.log("tokenId", tokenId);
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
        }
      }
    });
    const aliensUpdate = [];
    for (let tokenId = 1; tokenId <= aliensMinted; tokenId++) {
      try {
        if (!killedAliens.includes(tokenId)) {
          //   console.log("alien tokenId", tokenId);
          const alien = await readContracts.Alien.aliens(tokenId);
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
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
    // console.log(aliensUpdate);
    setAliens(aliensUpdate);

    const player_wins = (await readContracts.Alien.player2wins(address)).toNumber();
    // console.log({ player_wins });
    setAliensDefeated(player_wins);
  }

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

  function onMintedAliens(msg) {
    updateGameScreen();
  }

  function onLootMinted(msg) {
    console.log("onLootMinted ");
    updateGameScreen();
    updateWallet();
    setAlienSelected(null);
  }

  function onPlayerCreated(msg) {
    console.log("onPlayerCreated", msg);
  }

  async function onPlayerWon(msg) {
    console.log("onPlayerWon", msg.startProbs.toNumber(), msg.finalProbs.toNumber(), msg.sender);
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
    console.log("onAlienWon", msg.startProbs.toNumber(), msg.finalProbs.toNumber(), msg.sender);
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
    prevLogs.push({ txt: txt });
    prevLogs = prevLogs.filter((value, index, self) => {
      return self.indexOf(value) === index;
    });
    setLogs(prevLogs);
  }

  async function onPlayerLostLoot(msg) {
    console.log("onPlayerLostLoot", msg.lostLootId.toNumber(), msg.sender);
    if (msg.sender == address) {
      setPlayerLostLoot(true);
      updateWallet();
    }
  }

  useEffect(async () => {
    if (readContracts && readContracts.Player) {
      init();
    }
  }, [readContracts, address]);

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

  const createPlayer = async () => {
    console.log({ playerName });
    if (playerName == "") return;
    const result = await tx(writeContracts.Player.mintYourPlayer(playerName));
    updateProfile();
  };

  function alienChosen(idx) {
    console.log("alienChosen ", idx);
    let foundAlien = aliens.find(a => a.id == idx);
    if (foundAlien) {
      setAlienSelected(foundAlien);
      setAlienWon(false);
      setPlayerLostLoot(false);
    }
  }

  function getSelectedAlienName() {
    return alienSelected.name;
  }

  async function fightAlien() {
    const clientRandom = Math.floor(Math.random() * 100);
    // console.log({ equipped });
    let lootsSelected = equipped.filter(e => e.id != 0).map(e => e.id.toNumber());
    // console.log({ lootsSelected });
    const result = await tx(writeContracts.Alien.fightAlien(alienSelected.id, clientRandom, lootsSelected));
    initEmptyEquip();
  }

  async function mintLoot() {
    if (!alienSelected) {
      console.log("No alien selected!");
      return;
    }
    const result = await tx(writeContracts.ScifiLoot.mintLoot(alienSelected.id));
    console.log(result);
  }

  function getBgColor(idx) {
    let equippedFound = equipped.find(loot => loot.id == idx);
    if (equippedFound) {
      return { backgroundColor: "pink" };
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

  async function huntMore() {
    // const result = await tx(writeContracts.Alien.hunt());
    // console.log(namesJson);
    var randomNamesIdxList = [];
    var maxNum = 5;
    while (randomNamesIdxList.length < maxNum) {
      var r = Math.floor(Math.random() * namesJson.data.length) + 1;
      if (randomNamesIdxList.indexOf(r) === -1) randomNamesIdxList.push(r);
    }
    let pickedNames = namesJson.data.filter((name, idx) => {
      if (randomNamesIdxList.includes(idx)) {
        return name;
      }
    });
    // console.log(randomNamesIdxList);
    let randomBaseProbs = randomNamesIdxList.map(i => {
      return Math.floor((i / namesJson.data.length) * 100);
    });
    // console.log(randomBaseProbs);
    const result = await tx(writeContracts.Alien.mintMultipleAliens(pickedNames, randomBaseProbs));
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
              <Card title={item.name} style={getBgColor(item.id)} hoverable>
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

  const gameScreen = (
    <Card style={{ width: 800 }} title="Game Screen">
      <div style={{ maxWidth: 820, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
        <>
          {!canMint && (
            <Card
              title="Which alien do you choose to fight?"
              extra={
                <Button onClick={huntMore} type="dashed" disabled={aliens.length > 1}>
                  Hunt for more aliens
                </Button>
              }
            >
              <div>Aliens Defeated: {aliensDefeated}</div>
              {alienSelected && <span>Chosen Alien: {alienSelected.alienName}</span>}
              <List
                grid={{ gutter: 16, column: 3 }}
                dataSource={aliens}
                style={{ overflow: "auto", height: "400px" }}
                renderItem={(item, idx) => (
                  <List.Item>
                    <div onClick={() => alienChosen(item.id)}>
                      <Card hoverable bordered title={item.name}>
                        <img style={{ width: 150 }} src={item.image} />
                      </Card>
                    </div>
                  </List.Item>
                )}
              />
              <div style={{ marginTop: 16 }}>
                {alienSelected && (
                  <div>
                    <div>Fill Slots</div>
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
                    {!alienWon && (
                      <Button type={"primary"} onClick={() => fightAlien()}>
                        Fight Alien
                      </Button>
                    )}
                  </div>
                )}
                {alienWon && (
                  <Text mark>
                    Alien won the fight! It has become stronger. Final Probability of alien was {fightFinalProb}
                  </Text>
                )}
                <div>{playerLostLoot && <Text mark>Sorry you lost your NFT loot to the alien!</Text>}</div>
              </div>
            </Card>
          )}
          {canMint && (
            <Card title="You won the fight! Grab your loot!">
              <Button type={"primary"} onClick={() => mintLoot()}>
                Mint Loot
              </Button>
            </Card>
          )}
        </>
      </div>
    </Card>
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
              <Card>{item.txt}</Card>
            </div>
          </List.Item>
        )}
      />
    </Card>
  );

  return (
    <>
      {!playerNft && (
        <div style={{ maxWidth: 820, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
          <>
            <Space>
              <Input
                placeholder="Player Name"
                onChange={e => {
                  e.target.value ? setPlayerName(e.target.value) : null;
                }}
              />
              <Button
                type={"primary"}
                onClick={() => {
                  createPlayer();
                }}
              >
                CREATE PLAYER
              </Button>

              {/* <Button
                type={"primary"}
                onClick={() => {
                  getRandom();
                }}
              >
                Random
              </Button>
              <span> Won: {randRes[0]}</span>
              <span> Loss: {randRes[1]}</span>
              <span> Total: {randRes[2]}</span> */}
              {/* <Button
                type={"primary"}
                onClick={() => {
                  testConditionalMint();
                }}
              >
                MINT
              </Button> */}
            </Space>
          </>
        </div>
      )}
      {lootItemModal}
      {playerNft && (
        <div style={{ width: 820, paddingBottom: 256, marginLeft: 64 }}>
          <>
            <Space align="start">
              <Space direction="vertical">
                <Card
                  style={{ width: 450 }}
                  title={
                    <div>
                      <span style={{ fontSize: 18, marginRight: 8 }}>{playerNft.name}</span>
                    </div>
                  }
                >
                  {/* <a href={"https://opensea.io/assets/"+(readContracts && readContracts.YourCollectible && readContracts.YourCollectible.address)+"/"+item.id} target="_blank">
                        	
                        </a> */}
                  <img src={playerNft.image} />
                  {/* <div>{item.description}</div> */}
                </Card>
                {walletComp}
              </Space>
              <Space>{gameScreen}</Space>
              <Space align="baseline">{logsScreen}</Space>
            </Space>
          </>
        </div>
      )}
    </>
  );
}
