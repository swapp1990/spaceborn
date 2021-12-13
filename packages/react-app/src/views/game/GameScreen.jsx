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
import "./game.css"
import * as svgUtils from "../../helpers/svgUtils";
import GContext from "../../GContext";
import alienIcon from "../../assets/alien.png";
import speed from "../../assets/speed.png";
import power from "../../assets/power.png";
import replication from "../../assets/replication.png";
import charm from "../../assets/charm.png";
import mimic from "../../assets/mimic.png";
import mind from "../../assets/mind-control.png";
import brain from "../../assets/brain.png";
import npc from "../../assets/npc.png";

const { Text, Link, Title } = Typography;
const categories = [
  "Agility",
  "Powerful",
  "Mind Control",
  "Charm",
  "Replication",
  "Mimic",
  "Superintelligent",
  "NPC"
];

export default function GameScreen({ address, tx, contracts, provider }) {
  //Global use context
  const { state, dispatch } = useContext(GContext);

  const [stepIdx, setStepIdx] = useState(1);
  const [alienWon, setAlienWon] = useState(null);
  const [gearWonImg, setGearWonImg] = useState(null);
  const [gearLostImg, setGearLostImg] = useState(null);

  const [canMint, setCanMint] = useState(null);
  const [roundId, setRoundId] = useState();
  const [disableHuntMore, setDisableHuntMore] = useState(false);

  const [loading, setLoading] = useState(false);
  const [gameScreenUpdating, setGameScreenUpdating] = useState(false);

  const [randomAliens, setRandomAliens] = useState([]);
  const [chosenAlien, setChosenAlien] = useState({});
  const [totalBuffApplied, setTotalBuffApplied] = useState(0);
  const [deadAliens, setdeadAliens] = useState([]);
  const [totalAliens, setTotalAliens] = useState(0);

  const [aliensDefeated, setAliensDefeated] = useState(0);
  const [playerLostLoot, setPlayerLostLoot] = useState(false);

  // const [equipped, setEquipped] = useState([]);

  const [gameActionMsg, setgameActionMsg] = useState("");

  useEffect(() => {
    if (contracts && contracts.Alien) {
      console.log("init");
      resetGearSlots();
    }
  }, [contracts, address]);

  useEffect(() => {
    // console.log({ state });
  }, [state])

  useEffect(() => {
    updateGameScreen();
  }, [state.playerState])

  useEffect(() => {
    updateProbsReduce();
  }, [state.gearSlots]);

  useEffect(() => {
    if (alienWon != null) {
      refreshGears();
      setTimeout(() => {
        console.log("timeout");
        setStepIdx(4);
      }, 2000);
    }
  }, [alienWon])

  useEffect(async () => {
    if (stepIdx == 1) {
      updateGameScreen();
    }
  }, [stepIdx])

  const init = async () => {
    initEmptyEquip();
  };

  const onBack = () => {
    setStepIdx(stepIdx - 1);
  }

  const onAlienSel = (alien) => {
    alien.initProbs = alien.probs;
    // console.log({ alien });
    dispatch({ type: "setAlienIdx", payload: alien.tokenId, fieldName: "alienIdx" });
    setChosenAlien(alien);
    setStepIdx(2);
  }

  const onNewFight = () => {
    setStepIdx(1);
  }

  async function refreshGears() {
    const balanceLoot = await contracts.Gears.balanceOf(address);
    const tokenId = await contracts.Gears.tokenOfOwnerByIndex(address, balanceLoot - 1);
    const gearObj = await contracts.Gears.gears(tokenId);
    console.log({ gearObj });
    let svgImg = await getSvgImgGear(gearObj.tokenId);
    console.log({ svgImg });
    setGearWonImg(svgImg);
    resetGearSlots();
  }

  async function updateProbsReduce() {
    let usedGears = [];
    state.gearSlots.forEach(g => {
      // console.log(g);
      if (g.type != "empty") {
        usedGears.push({ gearIdx: g.gearIdx, catIdx: g.catIdx, rarityIdx: g.rarityIdx });
      }
    })
    // console.log(usedGears, state.alienIdx)
    if (state.alienIdx != -1) {
      chosenAlien.probs = chosenAlien.initProbs;
      let totalBuff = await contracts.GameManager.getTotalBuff(chosenAlien.initProbs, usedGears, state.alienIdx);
      console.log({ totalBuff: totalBuff.toNumber() })
      totalBuff = totalBuff.toNumber();
      setTotalBuffApplied(totalBuff);

    }
  }

  // async function updatePlayerState() {
  //   const tokenId = await contracts.Player.getTokenId(address);
  //   console.log("updatePlayerState")
  //   if (tokenId.toNumber() == 0) {
  //     console.log("tokenId is not set");
  //     return;
  //   }
  //   // console.log({ tokenId: tokenId.toNumber() });
  //   const player = await contracts.Player.getPlayer(tokenId);
  //   // // console.log(player);
  //   setPlayerState({ ...player });
  // }

  async function getSvgJson(tokenId) {
    let tokenUri = await contracts.Alien.tokenURI(tokenId);
    const base64_data = tokenUri.split("base64,")[1];
    const decoded_str = svgUtils.atob(base64_data);
    const decoded_json = JSON.parse(decoded_str);
    // console.log(decoded_json);
    return decoded_json;
  }
  async function getSvgImgGear(tokenId) {
    let tokenUri = await contracts.Gears.tokenURI(tokenId);
    const base64_data = tokenUri.split("base64,")[1];
    const decoded_str = svgUtils.atob(base64_data);
    const decoded_json = JSON.parse(decoded_str);
    // console.log(decoded_json);
    return decoded_json.image;
  }

  function getIcon2(cat) {
    switch (cat) {
      case "Agility":
        return speed;
      case "Powerful":
        return power;
      case "Charm":
        return charm;
      case "Mind Control":
        return mind;
      case "Replication":
        return replication;
      case "Mimic":
        return mimic;
      case "Superintelligent":
        return brain;
      case "NPC":
        return npc;
      default:
        return;
    }
  }

  const chooseRandom = (arr, num = 1) => {
    const res = [];
    for (let i = 0; i < num;) {
      const random = Math.floor(Math.random() * arr.length);
      if (res.indexOf(arr[random]) !== -1) {
        continue;
      };
      res.push(arr[random]);
      i++;
    };
    return res;
  };

  async function updateGameScreen() {
    if (!state.playerState || !state.playerState.roundId) {
      console.log("No roundId found")
      return;
    }
    const aliensMinted = await contracts.Alien.lastTokenId();
    console.log({ aliensMinted: aliensMinted.toNumber() });
    setTotalAliens(aliensMinted.toNumber() + 1);
    const aliensUpdate = [];
    const deadaliensUpdate = [];
    setLoading(true);
    setRandomAliens([]);
    for (let tokenId = 1; tokenId <= aliensMinted; tokenId++) {
      try {
        const alien = await contracts.Alien.aliens(tokenId);
        if (alien.roundId == state.playerState.roundId) {
          if (!alien.isDead) {
            let svgJson = await getSvgJson(tokenId);
            // console.log({ svgJson });
            const alienObj = {};
            alienObj.tokenId = tokenId;
            alienObj.name = alien.name;
            alienObj.category = svgJson.category;
            alienObj.probs = alien.baseProb.toNumber();
            alienObj.icon = alienIcon;
            alienObj.icon2 = getIcon2(alienObj.category);
            aliensUpdate.push(alienObj);
          } else {
            deadaliensUpdate.push({ id: tokenId, name: alien.name, base: alien.baseProb });
          }
        }
      } catch (e) {
        console.log(e);
      }
    }

    // console.log(aliensUpdate);
    const maxToShow = aliensUpdate.length > 5 ? 5 : aliensUpdate.length;
    // console.log({ maxToShow })
    setLoading(false);
    const randAliens = chooseRandom(aliensUpdate, maxToShow);
    // console.log({ "randAliens": randAliens.length })
    setRandomAliens(randAliens);
    setdeadAliens(deadaliensUpdate);
  }

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

  async function leaveRound() {
    setLoading(true);
    const result = await tx(contracts.Player.leaveGame(), update => {
      if (update) {
        if (update.status === "confirmed" || update.status === 1) {
          console.log("Player left game");
        }
        if (update.events) {
          console.log({ "event": update.events.length });
          resetGearSlots();
          updatePlayerState();
          setLoading(false);
        }
      }
    });
  }

  // async function huntMore() {
  //   // const result = await tx(contracts.Alien.hunt());
  //   // console.log(namesJson);
  //   var randomNamesIdxList = [];
  //   var maxNum = 5;
  //   while (randomNamesIdxList.length < maxNum) {
  //     var r = Math.floor(Math.random() * namesJson.data.length) + 1;
  //     if (randomNamesIdxList.indexOf(r) === -1) randomNamesIdxList.push(r);
  //   }
  //   let pickedNames = namesJson.data.filter((name, idx) => {
  //     if (randomNamesIdxList.includes(idx)) {
  //       return name;
  //     }
  //   });
  //   // console.log(randomNamesIdxList);
  //   let randomBaseProbs = randomNamesIdxList.map(i => {
  //     return Math.floor((i / namesJson.data.length) * 100);
  //   });
  //   // console.log(randomBaseProbs);
  //   const result = await tx(contracts.Alien.mintMultipleAliens(pickedNames, randomBaseProbs));
  // }

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

  async function beginFight() {
    setgameActionMsg("");
    const clientRandom = Math.floor(Math.random() * 100);
    const foundGears = state.gearSlots.filter(e => e.slotId != -1).map(i => i.usedGear);
    // console.log({ foundGears });
    setStepIdx(3);
    await tx(contracts.GameManager.fightAlien(state.playerState.roundId, state.alienIdx, clientRandom, foundGears), update => {
      if (update) {
        // console.log({ update });
        if (update.code) {
          setLoading(false);
        }
        if (update.status === "confirmed" || update.status === 1) {
          console.log("fightAlien success");
        }
        if (update.events) {
          // console.log({ "events": update.events });
          let event = update.events.find(e => e.event != null && (e.event == "AlienWon" || e.event == "PlayerWon"));
          if (event) {
            console.log({ event })
            let eventInfo = event;
            if (eventInfo.event == "AlienWon") {
              const txt = "Alien won with final prob of " + eventInfo.args.finalProbs.toNumber();
              setgameActionMsg(txt);
              setAlienWon(true);
              let lostGearEvent = update.events.find(e => e.event != null && e.event == "PlayerLostGear");
              if (lostGearEvent) {
                updateLostGear(lostGearEvent);
              }
            } else if (eventInfo.event == "PlayerWon") {
              const txt = "Player won with final prob of alien to be " + eventInfo.args.finalProbs.toNumber();
              setgameActionMsg(txt);
              setAlienWon(false);
            }
          }
        }
      }
    });
  }

  async function updateLostGear(event) {
    console.log({ "lostEvent": event });
    const lostGearIdx = event.args.lostGearId.toNumber();
    console.log({ lostGearIdx });
    let svgImg = await getSvgImgGear(lostGearIdx);
    // console.log({ svgImg });
    setGearLostImg(svgImg);
  }

  function resetGearSlots() {
    const slots = [];
    slots.push({ slotId: -1, type: "empty" });
    slots.push({ slotId: -1, type: "empty" });
    slots.push({ slotId: -1, type: "empty" });
    dispatch({ type: "setGearSlots", payload: slots, fieldName: "gearSlots" });
  }

  async function mintLoot() {
    if (!alienSelected) {
      console.log("No alien selected!");
      return;
    }
    const result = await tx(contracts.ScifiLoot.mintLoot(alienSelected.id));
    console.log(result);
  }

  function onRefreshAliens() {
    updateGameScreen();
  }

  //////////// Render 
  const combatScreen = (
    <>
      <div className="screen">
        <Spin size="large" />
        <div className="gearTitle">Fighting Alien with your Gears ...</div>
      </div>
    </>
  )
  const resultWonScreen = (
    <>
      <div className="screen">
        <div className="result-title won-txt">You Won</div>
        <div className="results-info">Alien had only { }% chance of winning!</div>
        <div className="win-gear">
          <div className="gearTitle">Gear Earned</div>
          <div className="gearCard">
            <img src={gearWonImg} width="250px" height="250px"></img>
          </div>
        </div>
        <div className="next-btn" onClick={onNewFight}>
          Start a new fight
        </div>
      </div>
    </>
  )
  const resultLostScreen = (
    <>
      <div className="screen">
        <div className="result-title lost-txt">You Lost</div>
        <div className="win-gear">
          <div className="gearTitle">Gears Lost</div>
          <div className="gearCard">
            <img src={gearLostImg} width="250px" height="250px"></img>
          </div>
        </div>
        <div className="next-btn" onClick={onNewFight}>
          Start a new fight
        </div>
      </div>
    </>
  )
  const alienCard = (alien, i) => {
    return (<div className="cardObj" key={i} onClick={() => onAlienSel(alien)}>
      <div className="cardBox">
        <img src={alien.icon} width="80" height="80" />
        <div className="icon2">
          <img src={alien.icon2} width="30" height="30" />
        </div>
      </div>
      <div className="cardTitle">{alien.name}</div>
    </div>)
  };
  const step1 = (
    <>
      <div className="main-title">Choose alien to fight</div>
      <div className="refresh"><button onClick={onRefreshAliens}>Refresh</button></div>
      <div className="alien-cards">
        {randomAliens.map((alien, i) => alienCard(alien, i))}
        {randomAliens.length == 0 && !loading && <span className="won-txt">No aliens found for this round! Come back later!</span>}
      </div>
      <div className="alien-info">Dead Aliens so far: {deadAliens.length}/{totalAliens}</div>
    </>
  )

  const setGear = (gear, i) => {
    return (
      < div className="gear-cardObj" key={i}>
        <div className="gear-card">
          <img src={gear.icon} width="50" height="50" />
        </div>
        <div className="gear-stats">
          <div>{gear.name}</div>
        </div>
      </div >
    )
  };
  const emptyGear = (gear, i) => {
    return (
      <div className="gear-cardObj" key={i}>
        <div className="gear-card"></div>
        <div className="gear-stats">
          <div>Pick from Wallet</div>
        </div>
      </div>
    )
  };

  const whichGearSlot = (gear, i) => {
    if (gear.type == "empty") {
      return emptyGear(gear, i);
    } else if (gear.type == "set") {
      return setGear(gear, i);
    }
  }
  const step2 = (
    <>
      <div className="chosen-alien">
        <div className="alien-obj">
          <div>ALIEN {chosenAlien.name}</div>
          <div className="alien-card">
            <img src={chosenAlien.icon} width="220" height="220" />
          </div>
        </div>
        <div className="alien-stats">
          <div className="stats-title">Stats</div>
          <div className="stats-card">
            <div>Category: {chosenAlien.category}</div>
            <div>Chance of winning:
              <div>
                <Progress type="line" percent={chosenAlien.probs} width={80} trailColor="red" showInfo={true} />
                <span>{chosenAlien.probs} %</span>
                {totalBuffApplied > 0 && <span className="reduceTxt"> (-{totalBuffApplied}%)</span>}
              </div>

            </div>
          </div>
        </div>
      </div>
      <div className="chosen-gears">
        <div className="gear-title">
          Pick 3 gears from you wallet and prepare for battle
        </div>
        <div className="gear-cards">
          {state.gearSlots.map((slot, i) => whichGearSlot(slot, i))}
        </div>
      </div>
    </>
  )

  const gameScreen = (<>
    <div className="game-main">
      {loading && <div className="loading-main">
        <Spin size="large"></Spin>
      </div>}
      <div className="main-top">
        {stepIdx == 2 && <div className="main-btn" onClick={onBack}>Back</div>}
        <div className="main-btn">Round {state.playerState.roundId}</div>
        <button className="leave-btn" onClick={leaveRound}>Leave Round</button>
      </div>
      <div className="main-body">
        {stepIdx == 1 && step1}
        {stepIdx == 2 && step2}
        {stepIdx == 3 && combatScreen}
        {stepIdx == 4 && alienWon && resultLostScreen}
        {stepIdx == 4 && !alienWon && resultWonScreen}
      </div>
      <div className="main-footer">
        {stepIdx == 1 && (<div className="logmsg">Beginning Battle ...</div>)}
        {stepIdx == 2 && (
          <><div className="logmsg">
            Preparing To Fight ...
          </div>
            <button className="footerBtn" onClick={() => beginFight()}>Begin Fight</button></>)}
      </div>
    </div>
  </>);



  return (
    <>
      {state.playerState && state.playerState.roundId != 0 && gameScreen}
    </>
  );
}
