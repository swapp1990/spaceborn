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
export default function GameScreen({ address, tx, contracts, provider, context }) {
  //Global use context
  const { state, dispatch } = useContext(context);

  const [canMint, setCanMint] = useState(null);
  const [roundId, setRoundId] = useState();
  const [disableHuntMore, setDisableHuntMore] = useState(false);

  const [playerState, setPlayerState] = useState();
  const [gameScreenUpdating, setGameScreenUpdating] = useState(false);

  const [aliens, setAliens] = useState([]);
  const [deadAliens, setdeadAliens] = useState([]);

  const [aliensDefeated, setAliensDefeated] = useState(0);
  const [alienSelected, setAlienSelected] = useState(null);
  const [alienWon, setAlienWon] = useState(false);
  const [playerLostLoot, setPlayerLostLoot] = useState(false);

  // const [equipped, setEquipped] = useState([]);

  const [gameActionMsg, setgameActionMsg] = useState("");

  useEffect(() => {
    if (contracts && contracts.Alien) {
      console.log("init");
      init();
    }
    if (contracts && contracts.GameManager) {
      addEventListener("GameManager", "PlayerWon", onPlayerWon);
      addEventListener("GameManager", "AlienWon", onAlienWon);
    }
    if (contracts && contracts.Gears) {
      addEventListener("Gears", "GearDropped", onGearDropped);
    }
  }, [contracts, address]);

  useEffect(() => {
    // console.log({ state });
  }, [state])

  useEffect(() => {
    updateGameScreen();
  }, [playerState])


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

  const init = async () => {
    initEmptyEquip();
    updatePlayerState();
  };

  async function onPlayerWon(msg) {
    // console.log({ onPlayerWon: msg });
    // setgameActionMsg("Player Won");
    // updateGameScreen();
  }

  async function onAlienWon(msg) {
    // console.log({ onAlienWon: msg });
    // setgameActionMsg("Alein Won");
  }

  async function onGearDropped(msg) {
    // console.log({ onGearDropped: msg });
  }

  async function updatePlayerState() {
    const tokenId = await contracts.Player.getTokenId(address);
    if (tokenId.toNumber() == 0) {
      console.log("tokenId is not set");
      return;
    }
    console.log({ tokenId: tokenId.toNumber() });
    const player = await contracts.Player.getPlayer(tokenId);
    // console.log(player);
    setPlayerState({ ...player });
  }

  async function getSvgImg(tokenId) {
    let tokenUri = await contracts.Alien.tokenURI(tokenId);
    const base64_data = tokenUri.split("base64,")[1];
    const decoded_str = svgUtils.atob(base64_data);
    const decoded_json = JSON.parse(decoded_str);
    // console.log(decoded_json);
    return decoded_json.image;
  }

  async function updateGameScreen() {
    const aliensMinted = await contracts.Alien.lastTokenId();
    console.log({ aliensMinted });
    // console.log({ playerState });
    if (!playerState) return;
    if (playerState.joined == false) {
      setAliens([]);
      setdeadAliens([]);
      return;
    }
    let joinedRoundId = playerState.joinedRoundId.toNumber();
    const aliensUpdate = [];
    const deadaliensUpdate = [];
    for (let tokenId = 1; tokenId <= aliensMinted; tokenId++) {
      const alien = await contracts.Alien.aliens(tokenId);
      if (alien.roundId == joinedRoundId) {
        if (!alien.isDead) {
          let svgImg = await getSvgImg(tokenId);
          aliensUpdate.push({ id: tokenId, name: alien.name, base: alien.baseProb, image: svgImg });
        } else {
          deadaliensUpdate.push({ id: tokenId, name: alien.name, base: alien.baseProb });
        }
      }
    }
    setAliens(aliensUpdate);
    setdeadAliens(deadaliensUpdate);
  }

  //contract action
  async function joinGame(roundId) {
    const result = await tx(contracts.Player.joinGame(roundId), update => {
      if (update && (update.status === "confirmed" || update.status === 1)) {
        console.log("Player joined game");
        updatePlayerState();
      }
    });
  }

  async function leaveGame(roundId) {
    const result = await tx(contracts.Player.leaveGame(), update => {
      if (update && (update.status === "confirmed" || update.status === 1)) {
        console.log("Player left game");
        updatePlayerState();
      }
    });
  }

  async function huntMore() {
    // const result = await tx(contracts.Alien.hunt());
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
    const result = await tx(contracts.Alien.mintMultipleAliens(pickedNames, randomBaseProbs));
  }

  function alienChosen(idx) {
    console.log("alienChosen ", idx);
    setgameActionMsg("");
    let foundAlien = aliens.find(a => a.id == idx);
    if (foundAlien) {
      setAlienSelected(foundAlien);
      setAlienWon(false);
      setPlayerLostLoot(false);
    }
  }

  function getAlienBgColor(idx) {
    if (alienSelected && alienSelected.id == idx) {
      return { backgroundColor: "pink" };
    }
    return { backgroundColor: "black" };
  }

  async function fightAlien() {
    setgameActionMsg("");
    const clientRandom = Math.floor(Math.random() * 100);
    const foundGears = state.equippedGears.filter(e => e.id != -1).map(i => i.usedGear);
    console.log({ foundGears });
    const result = await tx(contracts.GameManager.fightAlien(alienSelected.id, clientRandom, foundGears), update => {
      if (update) {
        if (update.status === "confirmed" || update.status === 1) {
          console.log("fightAlien success");
        }
        if (update.events) {
          console.log({ "event": update.events[0] });
          let eventInfo = update.events[0];
          if (eventInfo.event == "AlienWon") {
            const txt = "Alien won with final prob of " + eventInfo.args.finalProbs.toNumber();
            setgameActionMsg(txt);
          } else if (eventInfo.event == "PlayerWon") {
            const txt = "Player won with final prob of alien to be " + eventInfo.args.finalProbs.toNumber();
            setgameActionMsg(txt);
          }
        }
      }
    });
  }

  function initEmptyEquip() {
    let emptyEquipped = [];
    emptyEquipped.push({ id: -1, name: "Select from wallet" });
    emptyEquipped.push({ id: -1, name: "Select from wallet" });
    emptyEquipped.push({ id: -1, name: "Select from wallet" });
    // setEquipped(emptyEquipped);
    dispatch({ type: "setEquippedGears", payload: emptyEquipped, fieldName: "equippedGears" })
  }

  async function mintLoot() {
    if (!alienSelected) {
      console.log("No alien selected!");
      return;
    }
    const result = await tx(contracts.ScifiLoot.mintLoot(alienSelected.id));
    console.log(result);
  }

  /////////////////////////////////////// Render ////////////////////////////////////////
  const aliensToFight = (
    <>
      {alienSelected && <Title level={4}>Chosen Alien: {alienSelected.name}</Title>}
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={aliens}
        loading={gameScreenUpdating}
        style={{ overflowY: "auto", overflowX: "hidden", height: "200px" }}
        renderItem={(item, idx) => (
          <List.Item>
            <div onClick={() => alienChosen(item.id)}>
              <Card
                hoverable
                bordered
                title={item.name + " (base: " + item.base + ")"}
                style={getAlienBgColor(item.id)}
              >
                <img style={{ width: 150 }} src={item.image} />
              </Card>
            </div>
          </List.Item>
        )}
      />
    </>
  );

  const deadAlienView = (
    <>
      <Title level={5}>Aliens Dead</Title>
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={deadAliens}
        loading={gameScreenUpdating}
        style={{ overflowY: "auto", overflowX: "hidden", height: "200px" }}
        renderItem={(item, idx) => (
          <List.Item>
            <div>
              <Card
                hoverable
                bordered
                title={item.name + " (base: " + item.base + ")"}
                style={getAlienBgColor(item.id)}
              >
                <img style={{ width: 150 }} src={item.image} />
              </Card>
            </div>
          </List.Item>
        )}
      />
    </>
  );

  const equippedWindow = (
    <>
      <div>Fill Slots</div>
      <div style={{ marginBottom: 10 }}>
        <Text mark>
          Note: If you lose the fight, there is a chance your NFT is lost and transferred to the Alien.
        </Text>
      </div>
      <List
        grid={{ gutter: 16, column: 3 }}
        dataSource={state.equippedGears}
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
    </>
  )

  const combatWindow = (
    <>
      <Button type={"primary"} onClick={() => leaveGame()}>
        Leave Game
      </Button>
      {!canMint && (
        <Card
          title="Which alien do you choose to fight?"
        //   extra={
        //     <Button onClick={huntMore} type="dashed" disabled={disableHuntMore}>
        //       Hunt for more aliens
        //     </Button>
        //   }
        >
          <div>
            <Title level={3}>Aliens Defeated: {aliensDefeated}</Title>
            <Title level={5}>{gameActionMsg}</Title>
          </div>
          <Divider />
          {aliensToFight}
          <Divider />
          <div style={{ marginTop: 16 }}>
            {alienSelected && (
              <>{equippedWindow}
                <div>
                  {!alienWon && (
                    <Button type={"primary"} onClick={() => fightAlien()}>
                      Fight Alien
                    </Button>
                  )}
                </div>
              </>
            )}
            {alienWon && (
              <Text mark>
                Alien won the fight! It has become stronger. Final Probability of alien was {fightFinalProb}
              </Text>
            )}
            <div>{playerLostLoot && <Text mark>Sorry you lost your NFT loot to the alien!</Text>}</div>
          </div>
          <Divider />
          {deadAlienView}
        </Card>
      )}
    </>
  );

  const gameScreen = (
    <Card style={{ width: 800 }} title="Game Screen">
      <div style={{ maxWidth: 820, margin: "auto", paddingBottom: 32 }}>
        {playerState && playerState.joined && combatWindow}
        {playerState && !playerState.joined && (
          <Space>
            <Button type={"primary"} onClick={() => joinGame(1)}>
              Join Game: ROUND 1
            </Button>
            <Button type={"primary"} onClick={() => joinGame(2)}>
              Join Game: ROUND 2
            </Button>
            <Button type={"primary"} onClick={() => joinGame(3)}>
              Join Game: ROUND 3
            </Button>
          </Space>
        )}
      </div>
    </Card>
  );
  return (
    <>
      <div>{gameScreen}</div>
    </>
  );
}
