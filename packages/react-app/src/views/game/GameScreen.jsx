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
export default function GameScreen({ address, tx, readContracts, writeContracts, localProvider }) {
  const [canMint, setCanMint] = useState(null);
  const [disableHuntMore, setDisableHuntMore] = useState(false);

  const [playerState, setPlayerState] = useState();
  const [gameScreenUpdating, setGameScreenUpdating] = useState(false);

  const [aliens, setAliens] = useState([]);
  const [deadAliens, setdeadAliens] = useState([]);

  const [aliensDefeated, setAliensDefeated] = useState(0);
  const [alienSelected, setAlienSelected] = useState(null);
  const [alienWon, setAlienWon] = useState(false);
  const [playerLostLoot, setPlayerLostLoot] = useState(false);

  const [equipped, setEquipped] = useState([]);

  const [gameActionMsg, setgameActionMsg] = useState("");

  useEffect(() => {
    if (readContracts && readContracts.Alien) {
      console.log("init");
      init();
    }
    if (readContracts && readContracts.GameManager) {
      addEventListener("GameManager", "PlayerWon", onPlayerWon);
      addEventListener("GameManager", "AlienWon", onAlienWon);
    }
    if (readContracts && readContracts.Gears) {
      addEventListener("Gears", "GearDropped", onGearDropped);
    }
  }, [readContracts, address]);

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

  const init = async () => {
    updatePlayerState();
    updateGameScreen();
  };

  async function onPlayerWon(msg) {
    console.log({ onPlayerWon: msg });
    setgameActionMsg("Player Won");
    updateGameScreen();
  }

  async function onAlienWon(msg) {
    console.log({ onAlienWon: msg });
    setgameActionMsg("Alein Won");
  }

  async function onGearDropped(msg) {
    console.log({ onGearDropped: msg });
  }

  async function updatePlayerState() {
    const tokenId = await readContracts.Player.getTokenId(address);
    if (tokenId.toNumber() == 0) {
      console.log("tokenId is not set");
      return;
    }
    console.log({ tokenId: tokenId.toNumber() });
    const player = await readContracts.Player.getPlayer(tokenId);
    console.log(player);
    setPlayerState({ ...player });
  }

  async function getSvgImg(tokenId) {
    let tokenUri = await readContracts.Alien.tokenURI(tokenId);
    const base64_data = tokenUri.split("base64,")[1];
    const decoded_str = svgUtils.atob(base64_data);
    const decoded_json = JSON.parse(decoded_str);
    // console.log(decoded_json);
    return decoded_json.image;
  }

  async function updateGameScreen() {
    const aliensMinted = await readContracts.Alien.lastTokenId();
    console.log({ aliensMinted });
    const aliensUpdate = [];
    const deadaliensUpdate = [];
    for (let tokenId = 1; tokenId <= aliensMinted; tokenId++) {
      const alien = await readContracts.Alien.aliens(tokenId);
      if (!alien.isDead) {
        let svgImg = await getSvgImg(tokenId);
        aliensUpdate.push({ id: tokenId, name: alien.name, base: alien.baseProb, image: svgImg });
      } else {
        deadaliensUpdate.push({ id: tokenId, name: alien.name, base: alien.baseProb });
      }
    }
    setAliens(aliensUpdate);
    setdeadAliens(deadaliensUpdate);
  }

  //contract action
  async function joinGame() {
    const result = await tx(writeContracts.Player.joinGame(), update => {
      if (update && (update.status === "confirmed" || update.status === 1)) {
        console.log("Player joined game");
        updatePlayerState();
      }
    });
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
    console.log({ equipped });
    const foundGears = equipped.filter(e => e.id != -1).map(i => i.usedGear);
    console.log({ foundGears });
    const result = await tx(writeContracts.GameManager.fightAlien(alienSelected.id, clientRandom, foundGears), update => {
      if (update && (update.status === "confirmed" || update.status === 1)) {
        console.log("fightAlien success");
      }
    });
    // initEmptyEquip();
  }

  async function mintLoot() {
    if (!alienSelected) {
      console.log("No alien selected!");
      return;
    }
    const result = await tx(writeContracts.ScifiLoot.mintLoot(alienSelected.id));
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

  const combatWindow = (
    <>
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
          {deadAlienView}
          <Divider />
          <div style={{ marginTop: 16 }}>
            {alienSelected && (
              <div>
                {/* <div>Fill Slots</div>
			<div style={{ marginBottom: 10 }}>
			  <Text mark>
				Note: If you lose the fight, there is a chance your NFT is lost and transferred to the Alien.
			  </Text>
			</div> */}
                {/* <List
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
			/> */}
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
    </>
  );

  const gameScreen = (
    <Card style={{ width: 800 }} title="Game Screen">
      <div style={{ maxWidth: 820, margin: "auto", paddingBottom: 32 }}>
        {playerState && playerState.joined && combatWindow}
        {playerState && !playerState.joined && (
          <Button type={"primary"} onClick={() => joinGame()}>
            Join Game
          </Button>
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
