import {
  Space,
  Typography,
  Modal,
} from "antd";

import React, { useEffect, useState, useContext, useReducer, useMemo } from "react";
import "./mvpui.css";
import { default as CreatePlayer } from "./game/CreatePlayer";
import { default as Dashboard } from "./game/Dashboard";
import { default as GameScreen } from "./game/GameScreen";
import { default as PlayerWindow } from "./game/PlayerWindow";
import { default as WalletWindow } from "./game/WalletWindow";
import { default as LogsScreen } from "./game/LogsScreen";

import GContext from "../helpers/GContext";

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
  const { state, dispatch } = useContext(GContext);

  const [playerNft, setPlayerNft] = useState(null);

  useEffect(async () => {
    // console.log("init", state.name);
  }, []);
  useEffect(async () => {
    if (contracts && contracts.Player) {
      init();
    }
  }, [contracts, address]);
  useEffect(() => {
    console.log({ player: state.playerState });
  }, [state.playerState])


  const init = async () => {
    updatePlayerState();
    // addEventListener("ScifiLoot", "LootMinted", onLootMinted);
    // addEventListener("Player", "PlayerCreated", onPlayerCreated);
    // addEventListener("Alien", "PlayerLostLoot", onPlayerLostLoot);
    // addEventListener("Alien", "MintedAliens", onMintedAliens);
  };

  //contract Events
  // const addEventListener = async (contractName, eventName, callback) => {
  //   await contracts[contractName].removeListener(eventName);
  //   contracts[contractName].on(eventName, (...args) => {
  //     let eventBlockNum = args[args.length - 1].blockNumber;
  //     // console.log(eventName, eventBlockNum, provider._lastBlockNumber);
  //     if (eventBlockNum >= provider._lastBlockNumber - 1) {
  //       let msg = args.pop().args;
  //       callback(msg);
  //     }
  //   });
  // };

  // function onPlayerCreated(msg) {
  //   console.log("onPlayerCreated", msg);
  //   updateProfile();
  // }

  async function updatePlayerState() {
    const tokenId = await contracts.Player.getTokenId(address);
    if (tokenId.toNumber() == 0) {
      console.log("player not found!");
      return;
    }
    const player = await contracts.Player.getPlayer(tokenId);
    const playerState = {
      id: tokenId,
      name: player.name,
      image: null,
      owner: address,
      joined: player.joined,
      roundId: player.joinedRoundId.toNumber()
    };
    dispatch({ type: "setPlayerState", payload: playerState, fieldName: "playerState" });
    console.log("updated player state ", player.name);
  }

  function isPlayerState() {
    return !state.playerState || Object.keys(state.playerState).length === 0;
  }

  // Logs Functions
  // function updateLogs(txt) {
  //   let prevLogs = logs;
  //   if (!prevLogs.includes(txt)) {
  //     prevLogs.push(txt);
  //   }
  //   setLogs(prevLogs.reverse());
  // }

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
      {state.playerState && <div className="game">
        {state.playerState.joined && <GameScreen address={address} tx={tx} contracts={contracts} />}
        {!state.playerState.joined && <Dashboard address={address} tx={tx} contracts={contracts} />}
      </div>}
    </div >
  )

  return (
    <>
      {isPlayerState() && (
        <CreatePlayer address={address} tx={tx} contracts={contracts} />
      )}
      {!isPlayerState() && uiBody}</>
  )
}
