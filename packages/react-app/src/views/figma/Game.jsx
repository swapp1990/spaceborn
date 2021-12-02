import React, { useEffect, useState } from "react";
import { Row, Col } from 'antd';
import "./game.css";
import { ReactComponent as Gear1 } from "../../assets/loot1.svg"
export default function Game() {
    const [stepIdx, setStepIdx] = useState(2);
    const beginFight = () => {
        console.log("begin")
        setStepIdx(3);
    }
    const onNewFight = () => {
        setStepIdx(1);
    }

    const onAlienSel = () => {
        setStepIdx(2);
    }

    const step1 = (
        <>
            <div className="main-title">Choose your alien</div>
            <div className="alien-cards">
                <div className="cardObj" onClick={onAlienSel}></div>
                <div className="cardObj" onClick={onAlienSel}></div>
                <div className="cardObj" onClick={onAlienSel}></div>
                <div className="cardObj" onClick={onAlienSel}></div>
                <div className="cardObj" onClick={onAlienSel}></div>
            </div>
        </>
    )
    const step2 = (
        <>
            <div className="chosen-alien">
                <div className="alien-obj">
                    <div>ALIEN DAVE</div>
                    <div className="alien-card"></div>
                </div>
                <div className="alien-stats">
                    <div>Stats</div>
                    <div className="stats-card"></div>
                </div>
            </div>
            <div className="chosen-gears">
                <div className="gear-title">
                    Pick 3 gears from you wallet and prepare for battle
                </div>
                <div className="gear-cards">
                    <div className="gear-cardObj">
                        <div className="gear-card"></div>
                        <div className="gear-stats">
                            <div>Gear Name</div>
                            <div>Stat1</div>
                        </div>
                    </div>
                    <div className="gear-cardObj">
                        <div className="gear-card"></div>
                        <div className="gear-stats">
                            <div>Gear Name</div>
                            <div>Stat1</div>
                        </div>
                    </div>
                    <div className="gear-cardObj">
                        <div className="gear-card"></div>
                        <div className="gear-stats">
                            <div>Drag from Wallet</div>
                            <div></div>
                        </div>
                    </div>
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
    const gearBox = (
        <div className="gearBox">
            <div className="gearImg"></div>
            <div className="gearIcons">
                <div className="gIcon"></div>
                <div className="gIcon"></div>
                <div className="gIcon"></div>
            </div>
            {/* <Gear1 className="gearSvg" /> */}
            <div>Gear 1 </div>
        </div>
    )
    return (
        <div className="body">
            <div className="side">
                <div className="topMenu"></div>
                <div className="profileObj2">
                    <div className="profileImg">
                        <img src="./img_avatar.png" alt="Avatar"></img>
                    </div>
                    <div className="profileInfo">
                        <div>username</div>
                        <div>description</div>
                    </div>
                </div>
                <hr />
                <div className="inventoryObj">
                    <div className="invTitle">Gear Collected</div>
                    <div className="invColl">
                        <div class="gearWrapper">
                            {gearBox}
                            {gearBox}
                            {gearBox}
                            {gearBox}
                        </div>
                    </div>
                </div>
            </div>
            <div className="game-main">
                <div className="main-top">
                    <div className="main-btn">Back</div>
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