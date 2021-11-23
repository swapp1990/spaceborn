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

import React, { useEffect, useState, useContext, useReducer, useMemo } from "react";
import { ReactComponent as CardEx } from "../card_ex.svg";
import { useContractReader } from "../hooks";
import namesJson from "../randomNames.json";
import "./main.css";
import { default as CreatePlayer } from "./game/CreatePlayer";
import { default as GameScreen } from "./game/GameScreen";
import { default as PlayerWindow } from "./game/PlayerWindow";
import { default as WalletWindow } from "./game/WalletWindow";
import { default as LogsScreen } from "./game/LogsScreen";

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
  context
}) {
  //Global state
  const { state, dispatch } = useContext(context);

  // const balance = useContractReader(readContracts, "Player", "balanceOf", [address]);
  // const [canMint, setCanMint] = useState(null);
  // const [walletLoot, setWalletLoot] = useState([]);
  // const [gameScreenUpdating, setGameScreenUpdating] = useState(false);
  // const [equipped, setEquipped] = useState([]);
  const [playerNft, setPlayerNft] = useState(null);
  // const [aliensDefeated, setAliensDefeated] = useState(0);
  // const [fightFinalProb, setFightFinalProb] = useState(0);
  // const [disableHuntMore, setDisableHuntMore] = useState(false);
  // const [aliens, setAliens] = useState([]);
  // const [logs, setLogs] = useState([]);

  // const [randRes, setRandRes] = useState([0, 0, 0]);

  useEffect(async () => {
    console.log("init", state.name);

  }, []);
  useEffect(async () => {
    if (readContracts && readContracts.Player) {
      init();
    }
  }, [readContracts, address]);

  // useEffect(async () => {
  //   if (readContracts && playerNft) {
  //     console.log("set player nft ");
  //   }
  //   if (readContracts && readContracts.Alien) {
  //     //   updateGameScreen();
  //     //   addEventListener("Alien", "PlayerWon", onPlayerWon);
  //     //   addEventListener("Alien", "AlienWon", onAlienWon);
  //     //   updatePrevLogs();
  //   }
  // }, [readContracts, playerNft]);

  const init = async () => {
    updateProfile();
    // setPlayerNft({ "name": "swap" });
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
      console.log("player not found!");
      return;
    }
    const player = await readContracts.Player.getPlayer(tokenId);
    setPlayerNft({
      id: tokenId,
      name: player.name,
      image: null,
      owner: address,
    });
    console.log("found player nft ", player.name);
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

  function onPlayerCreated(msg) {
    // console.log("onPlayerCreated", msg);
    updateProfile();
  }

  // async function onPlayerWon(msg) {
  //   // console.log("onPlayerWon", msg.startProbs.toNumber(), msg.finalProbs.toNumber(), msg.sender);
  //   if (msg.sender == address) {
  //   } else {
  //   }
  //   updateGameScreen();
  //   setFightFinalProb(msg.finalProbs.toNumber());
  //   const alien = await readContracts.Alien.aliens(msg.tokenId.toNumber());
  //   const txt =
  //     msg.sender.substring(0, 6) + " killed alien named " + alien.name + "! Prob:" + msg.finalProbs.toNumber();
  //   updateLogs(txt);
  // }

  // async function onAlienWon(msg) {
  //   // console.log("onAlienWon", msg.startProbs.toNumber(), msg.finalProbs.toNumber(), msg.sender);
  //   if (msg.sender == address) {
  //     setAlienWon(true);
  //     setAlienSelected(null);
  //   } else {
  //   }
  //   updateGameScreen();
  //   setFightFinalProb(msg.finalProbs.toNumber());
  //   const alien = await readContracts.Alien.aliens(msg.tokenId.toNumber());
  //   // const ens = useLookupAddress(props.ensProvider, address);
  //   const txt =
  //     "Alien named " + alien.name + " defeated " + msg.sender.substring(0, 6) + "! Prob:" + msg.finalProbs.toNumber();

  //   updateLogs(txt);
  // }

  // const [isModalVisible, setIsModalVisible] = useState(false);
  // const [modalImageSrc, setModalImageSrc] = useState();


  // const showModal = () => {
  //   setIsModalVisible(true);
  // };
  // const handleOk = () => {
  //   setIsModalVisible(false);
  // };
  // const handleCancel = () => {
  //   setIsModalVisible(false);
  // };
  // function viewItem(imgSrc) {
  //   showModal();
  //   setModalImageSrc(imgSrc);
  // }
  // function changeGlobalState() {
  //   dispatch({ type: "setName", payload: "Swapp", fieldName: "name" })
  // }

  // function updateLogs(txt) {
  //   let prevLogs = logs;
  //   if (!prevLogs.includes(txt)) {
  //     prevLogs.push(txt);
  //   }
  //   setLogs(prevLogs.reverse());
  // }

  // const lootItemModal = (
  //   <Modal title="Basic Modal" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
  //     <img style={{ width: 300 }} src={modalImageSrc} />
  //   </Modal>
  // );

  // const logsScreen = (
  //   <Card style={{ width: 400 }} title="Logs">
  //     <List
  //       grid={{ gutter: 16, column: 1 }}
  //       dataSource={logs}
  //       style={{ overflowY: "auto", overflowX: "hidden", height: "600px" }}
  //       renderItem={item => (
  //         <List.Item>
  //           <div onClick={() => console.log(item)}>
  //             <Card>{item}</Card>
  //           </div>
  //         </List.Item>
  //       )}
  //     />
  //   </Card>
  // );

  // return (
  //   <><div>Hello {state.name}!</div>
  //     <Button onClick={changeGlobalState}>Change</Button>
  //   </>
  // )

  return (
    <>
      {!playerNft && (
        <CreatePlayer address={address} tx={tx} writeContracts={writeContracts} readContracts={readContracts} />
      )}
      {playerNft && (
        <div style={{ width: "full", paddingBottom: 256, marginLeft: 64 }}>
          <Space align="start">
            <Space direction="vertical">
              <PlayerWindow address={address} tx={tx} writeContracts={writeContracts} readContracts={readContracts} playerNft={playerNft} />
              <WalletWindow
                address={address}
                tx={tx}
                writeContracts={writeContracts}
                readContracts={readContracts}
                localProvider={localProvider}
              />
            </Space>
          </Space>
        </div>
      )}</>
  )

  // return (
  //   <>

  //     {playerNft && (
  //       <div style={{ width: "full", paddingBottom: 256, marginLeft: 64 }}>
  //         {/* */}
  //         <Space align="start">
  //           <Space direction="vertical">
  //             

  //           </Space>
  //           <Space>
  //             {/* <GameScreen
  //                 address={address}
  //                 tx={tx}
  //                 writeContracts={writeContracts}
  //                 readContracts={readContracts}
  //                 localProvider={localProvider}
  //                 context={GContext}
  //               /> */}
  //           </Space>
  //           <Space align="baseline">
  //             {/* <LogsScreen
  //                 address={address}
  //                 tx={tx}
  //                 writeContracts={writeContracts}
  //                 readContracts={readContracts}
  //                 localProvider={localProvider}
  //               /> */}
  //           </Space>
  //         </Space>
  //         {/* </DispatchContext.Provider> */}
  //       </div>
  //     )}
  //   </>
  // );
}
