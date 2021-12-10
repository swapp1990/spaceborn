import React, { useEffect, useState, useContext } from "react";
// import "./wallet_figma.css";
import GContext from "../../GContext";
import speed from "../../assets/speed.png";
import power from "../../assets/power.png";
import replication from "../../assets/replication.png";
import pill from "../../assets/Pill.png";
import apparel from "../../assets/Apparel.png";
import vehicle from "../../assets/Vehicle.png";

export function Wallet() {
    const [walletGears, setWalletGears] = useState([]);
    //Global use context
    const { state, dispatch } = useContext(GContext);

    useEffect(() => {
        const gears = [];
        gears.push({ tokenIdx: 0, category: "Pill", icon: pill, name: "Potion of Health", probsReduce: 12 });
        gears.push({ tokenIdx: 1, category: "Apparel", icon: apparel, name: "Invisibility Cloak", probsReduce: 56 });
        gears.push({ tokenIdx: 2, category: "Vehicle", icon: vehicle, name: "Supercopter", probsReduce: 35 });
        gears.push({ tokenIdx: 3, category: "Weapon", name: "StunGun", probsReduce: 4 });
        gears.push({ tokenIdx: 4, category: "Gizmo", name: "Pager", probsReduce: 29 });
        gears.push({ tokenIdx: 5, category: "Vehicle", name: "SilentCar", probsReduce: 49 });
        setWalletGears(gears);
    }, [])

    function unequip(gear) {
        let slotFound = state.gearSlots.find(g => g.slotId == gear.tokenIdx);
        if (slotFound) {
            let newState = [...state.gearSlots];
            let findSlotIdx = state.gearSlots.findIndex(g => g.slotId === gear.tokenIdx);
            if (findSlotIdx == -1) {
                return;
            }
            newState[findSlotIdx].slotId = -1;
            newState[findSlotIdx].category = "";
            newState[findSlotIdx].name = "";
            newState[findSlotIdx].icon = null;
            newState[findSlotIdx].type = "empty";
            newState[findSlotIdx].probsReduce = 0;

            dispatch({ type: "setGearSlots", payload: newState, fieldName: "gearSlots" });
        }
        let gearsCopy = [...walletGears];
        let findIdx = walletGears.find(g => g.tokenIdx == gear.tokenIdx);
        if (findIdx) {
            gear.equip = false;
            gearsCopy[findIdx] = gear;
            setWalletGears(gearsCopy);
        }
    }

    function equip(gear) {
        // console.log(gear);
        let slotFound = state.gearSlots.find(g => g.slotId == gear.tokenIdx);
        // console.log({ slotFound })
        if (slotFound) {

        } else {
            let newState = [...state.gearSlots];
            let emptySlotIdx = state.gearSlots.findIndex(g => g.slotId === -1);
            if (emptySlotIdx == -1) {
                return;
            }
            newState[emptySlotIdx].slotId = gear.tokenIdx;
            newState[emptySlotIdx].category = gear.category;
            newState[emptySlotIdx].name = gear.name;
            newState[emptySlotIdx].icon = gear.icon;
            newState[emptySlotIdx].probsReduce = gear.probsReduce;
            newState[emptySlotIdx].type = "set";
            dispatch({ type: "setGearSlots", payload: newState, fieldName: "gearSlots" });

            let gearsCopy = [...walletGears];
            let findIdx = walletGears.find(g => g.tokenIdx == gear.tokenIdx);
            if (findIdx) {
                gear.equip = true;
                gearsCopy[findIdx] = gear;
                setWalletGears(gearsCopy);
            }
        }
    }

    function gearBox(gear, idx) {
        // console.log(gear);
        return (
            <div className="gearBox" key={idx}>
                <div className="gearMain">
                    <div className="gearImg">
                        <img src={gear.icon} width="50" height="50" />
                    </div>
                    <div className="gearIcons">
                        <div className="gIcon">
                            <img src={speed} width="15" height="15" />
                        </div>
                        <div className="gIcon">
                            <img src={power} width="15" height="15" />
                        </div>
                        <div className="gIcon">
                            <img src={replication} width="15" height="15" />
                        </div>
                    </div>
                    {/* <Gear1 className="gearSvg" /> */}
                    <div>{gear.name} </div>
                </div>
                <div className="gearSide">
                    {!gear.equip && <button className="gearBtn" onClick={() => equip(gear)}>Equip</button>}
                    {gear.equip && <button className="gearBtn" onClick={() => unequip(gear)}>Unequip</button>}
                    <button className="gearBtn">View NFT</button>
                </div>
            </div>
        )
    }

    const walletWindow = (
        <>
            <div className="topMenu"></div>
            <div className="profileObj2">
                <div className="profileImg">
                    <img src="./img_avatar.png" alt="Avatar"></img>
                </div>
                <div className="profileInfo">
                    <div>swap</div>
                    <div>Faction: Warrior</div>
                </div>
            </div>
            <hr />
            <div className="inventoryObj">
                <div className="invTitle">Gear Collected</div>
                <div className="invColl">
                    <div className="gearWrapper">
                        {walletGears.map((gear, idx) => gearBox(gear, idx))}
                    </div>
                </div>
            </div>
        </>
    )
    return (
        <>{walletWindow}</>
    )
}