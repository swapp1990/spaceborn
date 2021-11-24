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
  provider,
  yourLocalBalance,
  price,
  tx,
  contracts,
  context
}) {
  //Global state
  const { state, dispatch } = useContext(context);

  // const balance = useContractReader(contracts, "Player", "balanceOf", [address]);
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
    if (contracts && contracts.Player) {
      init();
    }
  }, [contracts, address]);

  // useEffect(async () => {
  //   if (contracts && playerNft) {
  //     console.log("set player nft ");
  //   }
  //   if (contracts && contracts.Alien) {
  //     //   updateGameScreen();
  //     //   addEventListener("Alien", "PlayerWon", onPlayerWon);
  //     //   addEventListener("Alien", "AlienWon", onAlienWon);
  //     //   updatePrevLogs();
  //   }
  // }, [contracts, playerNft]);

  const init = async () => {
    updateProfile();
    // setPlayerNft({ "name": "swap" });
    // updateWallet();

    // addEventListener("ScifiLoot", "LootMinted", onLootMinted);
    // addEventListener("Player", "PlayerCreated", onPlayerCreated);
    // addEventListener("Alien", "PlayerLostLoot", onPlayerLostLoot);
    // addEventListener("Alien", "MintedAliens", onMintedAliens);
    // initEmptyEquip();
  };

  async function updateProfile() {
    const tokenId = await contracts.Player.getTokenId(address);
    if (tokenId.toNumber() == 0) {
      console.log("player not found!");
      return;
    }
    const player = await contracts.Player.getPlayer(tokenId);
    setPlayerNft({
      id: tokenId,
      name: player.name,
      image: null,
      owner: address,
    });
    console.log("found player nft ", player.name);
  }

  const addEventListener = async (contractName, eventName, callback) => {
    await contracts[contractName].removeListener(eventName);
    contracts[contractName].on(eventName, (...args) => {
      let eventBlockNum = args[args.length - 1].blockNumber;
      console.log(eventName, eventBlockNum, provider._lastBlockNumber);
      if (eventBlockNum >= provider._lastBlockNumber - 1) {
        let msg = args.pop().args;
        callback(msg);
      }
    });
  };

  function onPlayerCreated(msg) {
    // console.log("onPlayerCreated", msg);
    updateProfile();
  }

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

  return (
    <>
      {!playerNft && (
        <CreatePlayer address={address} tx={tx} contracts={contracts} />
      )}
      {playerNft && (
        <div style={{ width: "full", paddingBottom: 256, marginLeft: 64 }}>
          <Space align="start">
            <Space direction="vertical">
              <PlayerWindow address={address} tx={tx} contracts={contracts} playerNft={playerNft} />
              <WalletWindow
                address={address}
                tx={tx}
                contracts={contracts}
                provider={provider}
                context={context}
              />
            </Space>
            <Space>
              <GameScreen
                address={address}
                tx={tx}
                contracts={contracts}
                provider={provider}
                context={context}
              />
            </Space>

          </Space>
        </div>
      )}</>
  )
}
