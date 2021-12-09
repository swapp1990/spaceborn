import {
  Space,
  Typography,
  Modal,
} from "antd";

import React, { useEffect, useState, useContext, useReducer, useMemo } from "react";
import "./main.css";
import "./mvpui.css";
import { default as CreatePlayer } from "./game/CreatePlayer";
import { default as Dashboard } from "./game/Dashboard";
import { default as GameScreen } from "./game/GameScreen";
import { default as PlayerWindow } from "./game/PlayerWindow";
import { default as WalletWindow } from "./game/WalletWindow";
import { default as LogsScreen } from "./game/LogsScreen";
import { Wallet } from "./figma/Wallet";

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
  // const { state, dispatch } = useContext(context);

  const [playerNft, setPlayerNft] = useState(null);

  useEffect(async () => {
    // console.log("init", state.name);
  }, []);
  useEffect(async () => {
    if (contracts && contracts.Player) {
      init();
    }
  }, [contracts, address]);


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
      // console.log(eventName, eventBlockNum, provider._lastBlockNumber);
      if (eventBlockNum >= provider._lastBlockNumber - 1) {
        let msg = args.pop().args;
        callback(msg);
      }
    });
  };

  function onPlayerCreated(msg) {
    console.log("onPlayerCreated", msg);
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

  const oldUi = (
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
  )

  const uiBody = (
    <div className="body">
      <div className="side">
        <div className="player">
          <PlayerWindow address={address} tx={tx} contracts={contracts} />
        </div>
        <hr style={{ "width": "100px" }} />
        <div className="wallet">
          <WalletWindow address={address} tx={tx} contracts={contracts} provider={provider} />
        </div>
      </div>
      <div className="game">
        {/* <GameScreen address={address} tx={tx} contracts={contracts} /> */}
        <Dashboard address={address} tx={tx} contracts={contracts} />
      </div>
    </div >
  )

  return (
    <>
      {!playerNft && (
        <CreatePlayer address={address} tx={tx} contracts={contracts} />
      )}
      {playerNft && uiBody}</>
  )
}
