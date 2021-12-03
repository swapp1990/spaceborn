import React, { useEffect, useState, useContext } from "react";
import { Row, Col, Progress } from 'antd';
import { Wallet } from "./Wallet";

import "./game.css";
import { ReactComponent as Gear1 } from "../../assets/loot1.svg";

import alien from "../../assets/alien.png";
import GContext from "../../GContext";
import speed from "../../assets/speed.png";
import power from "../../assets/power.png";
import replication from "../../assets/replication.png";

// "Weapon",
// "Apparel",
// "Vehicle",
// "Pill",
// "Gizmo"
export default function Game() {
    //Global use context
    const { state, dispatch } = useContext(GContext);

    const [stepIdx, setStepIdx] = useState(1);
    const [randomAliens, setRandomAliens] = useState([]);
    const [chosenAlien, setChosenAlien] = useState({});
    const [totalProbsReduce, setTotalProbsReduce] = useState(0);
    // const [gearSlots, setGearSlots] = useState([]);

    useEffect(() => {
        const aliens = [];
        aliens.push({
            name: "Dave",
            category: "Superintelligent",
            probs: 35,
            icon: alien,
            icon2: speed
        });
        aliens.push({
            name: "Alex",
            category: "Mind Control",
            probs: 75,
            icon: alien,
            icon2: replication
        });
        aliens.push({
            name: "Shiela",
            category: "Charm",
            probs: 45,
            icon: alien,
            icon2: power
        });
        aliens.push({
            name: "Bob",
            category: "Mimic",
            probs: 47,
            icon: alien,
            icon2: replication
        });
        aliens.push({
            name: "Rancho",
            category: "NPC",
            probs: 98,
            icon: alien,
            icon2: power
        });
        setRandomAliens(aliens);
    }, [])

    useEffect(() => {
        const slots = [];
        slots.push({ slotId: -1, type: "empty" });
        slots.push({ slotId: -1, type: "empty" });
        slots.push({ slotId: -1, type: "empty" });
        dispatch({ type: "setGearSlots", payload: slots, fieldName: "gearSlots" });
    }, [])

    useEffect(() => {
        // console.log(state.gearSlots);
        let totalProbsReduce = 0;
        chosenAlien.probs = chosenAlien.initProbs;
        state.gearSlots
            .forEach(g => {
                if (g.probsReduce) {
                    totalProbsReduce += g.probsReduce;
                }
            });
        // console.log(totalProbsReduce);
        setTotalProbsReduce(totalProbsReduce);
        chosenAlien.probs = chosenAlien.probs - totalProbsReduce;
        if (chosenAlien.probs < 0) {
            chosenAlien.probs = 0;
        }
    }, [state.gearSlots]);

    const beginFight = () => {
        // console.log("begin")
        setStepIdx(3);
    }
    const onNewFight = () => {
        setStepIdx(1);
    }

    const onAlienSel = (alien) => {
        alien.initProbs = alien.probs;
        setChosenAlien(alien);
        setStepIdx(2);
    }

    const onBack = () => {
        setStepIdx(stepIdx - 1);
    }

    const whichGearSlot = (gear) => {
        if (gear.type == "empty") {
            return emptyGear;
        } else if (gear.type == "set") {
            return setGear(gear);
        }
    }

    const emptyGear = (
        <div className="gear-cardObj">
            <div className="gear-card"></div>
            <div className="gear-stats">
                <div>Pick from Wallet</div>
            </div>
        </div>
    )

    const setGear = (gear) => {
        return (
            < div className="gear-cardObj" >
                <div className="gear-card">
                    <img src={gear.icon} width="50" height="50" />
                </div>
                <div className="gear-stats">
                    <div>{gear.name}</div>
                </div>
            </div >
        )
    };

    const alienCard = (alien) => {
        return (<div className="cardObj" onClick={() => onAlienSel(alien)}>
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
            <div className="main-title">Choose your alien</div>
            <div className="alien-cards">
                {randomAliens.map(alien => alienCard(alien))}
            </div>
        </>
    )
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
                                {totalProbsReduce > 0 && <span className="reduceTxt"> (-{totalProbsReduce}%)</span>}
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
                    {state.gearSlots.map(slot => whichGearSlot(slot))}
                </div>
            </div>
        </>
    )
    const resultScreen = (
        <>
            <div className="screen">
                <div className="result-title">You Won</div>
                <div className="win-gear">
                    <div className="gearTitle">Gears Earned</div>
                    <div className="gearCard"></div>
                </div>
                <div className="next-btn" onClick={onNewFight}>
                    Start a new fight
                </div>
            </div>
        </>
    )

    return (
        <div className="body">
            <div className="side">
                <Wallet />
            </div>
            <div className="game-main">
                <div className="main-top">
                    {stepIdx > 1 && <div className="main-btn" onClick={onBack}>Back</div>}
                    <div className="main-btn">Round 1</div>
                </div>
                <div className="main-body">
                    {stepIdx == 1 && step1}
                    {stepIdx == 2 && step2}
                    {stepIdx == 3 && resultScreen}
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
        </div>
    )
}