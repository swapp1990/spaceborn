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
const { Text, Link, Title } = Typography;
export default function GameScreen({ address, tx, readContracts, writeContracts, localProvider }) {
  const [canMint, setCanMint] = useState(null);
  const [disableHuntMore, setDisableHuntMore] = useState(false);

  const [gameScreenUpdating, setGameScreenUpdating] = useState(false);

  const [aliens, setAliens] = useState([]);
  const [deadAliens, setdeadAliens] = useState([]);

  const [aliensDefeated, setAliensDefeated] = useState(0);
  const [alienSelected, setAlienSelected] = useState(null);
  const [alienWon, setAlienWon] = useState(false);
  const [playerLostLoot, setPlayerLostLoot] = useState(false);

  useEffect(() => {
    if (readContracts && readContracts.Alien) {
      console.log("init");
      init();
    }
    if (readContracts && readContracts.GameManager) {
      addEventListener("GameManager", "PlayerWon", onPlayerWon);
      addEventListener("GameManager", "AlienWon", onAlienWon);
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
    updateGameScreen();
  };

  async function onPlayerWon(msg) {
    console.log({ onPlayerWon: msg });
    updateGameScreen();
  }

  async function onAlienWon(msg) {
    console.log({ onAlienWon: msg });
  }

  async function updateGameScreen() {
    const aliensMinted = await readContracts.Alien.lastTokenId();
    console.log({ aliensMinted });
    const aliensUpdate = [];
    const deadaliensUpdate = [];
    for (let tokenId = 1; tokenId <= aliensMinted; tokenId++) {
      const alien = await readContracts.Alien.aliens(tokenId);
      if (!alien.isDead) {
        aliensUpdate.push({ id: tokenId, name: alien.name, base: alien.baseProb });
      } else {
        deadaliensUpdate.push({ id: tokenId, name: alien.name, base: alien.baseProb });
      }
    }
    setAliens(aliensUpdate);
    setdeadAliens(deadaliensUpdate);
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
    const clientRandom = Math.floor(Math.random() * 100);
    // console.log({ equipped });
    // let lootsSelected = equipped.filter(e => e.id != 0).map(e => e.id.toNumber());
    // console.log({ lootsSelected });
    const result = await tx(writeContracts.Player.takeAction(alienSelected.id, clientRandom));
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

  const gameScreen = (
    <Card style={{ width: 800 }} title="Game Screen">
      <div style={{ maxWidth: 820, margin: "auto", paddingBottom: 32 }}>
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
              </div>
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
              <Divider />
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
  return (
    <>
      <div>{gameScreen}</div>
    </>
  );
}
