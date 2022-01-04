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
  Tooltip,
  Typography,
  Modal,
} from "antd";
import * as svgUtils from "../../helpers/svgUtils";
import GContext from "../../helpers/GContext";
import "./wallet.scss";
import IMAGES from "../../helpers/imageImporter";

import { default as PopupWindow } from "../../components/PopupWindow";

const { Text, Link, Title } = Typography;

const GEAR_CATS = ["Weapon",
  "Apparel",
  "Vehicle",
  "Pill",
  "Gizmo"];

const ALIEN_CATS = ["Agility",
  "Powerful",
  "Mind Control",
  "Charm",
  "Replication",
  "Mimic",
  "Superintelligent",
  "NPC"];

const STRONG_AGAINST = {
  "Vehicle": [0, 4, 5],
  "Pill": [2, 7],
  "Gizmo": [4, 6],
  "Apparel": [3, 5, 6],
  "Weapon": [1, 4]
}

const GEARS = {
  "Weapon": ["Pistol",
    "Cannon",
    "Phaser",
    "Sniper",
    "Zapper"],
  "Apparel": ["Exosuit",
    "Power Armor",
    "Biosuit",
    "Gloves",
    "Nnaosuit",
    "Jacket"],
  "Vehicle": ["Hoverboard",
    "Superbike",
    "Air-ship",
    "Time Machine",
    "Auto-Car",
    "Hushicopter"],
  "Gizmo": ["Neutralizer",
    "Replicator",
    "Battery",
    "Fuel Canister",
    "Supercomputer"],
  "Pill": ["Soma",
    "Nootropic",
    "LSX",
    "Regeneration",
    "Food Replacement"]
}

export default function WalletWindow({ address, tx, contracts, provider }) {
  //Global state
  const { state, dispatch } = useContext(GContext);

  const [walletGears, setWalletGears] = useState([]);
  const [approveGears, setApproveGears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [popupWindowMsg, setpopupWindowMsg] = useState({ show: false });

  useEffect(async () => {
    if (contracts && contracts.Gears) {
      init();
    }
  }, [contracts, address]);

  const init = async () => {
    // console.log("init");
    updateWallet();
    if (contracts && contracts.Gears) {
      addEventListener("Gears", "GearDropped", onGearDropped);
      addEventListener("Gears", "GearDropped", onGearDropped);
    }
    if (contracts && contracts.Spaceborn) {
      addEventListener("Spaceborn", "PlayerLostGear", onPlayerLostGear);
    }

  };

  const addEventListener = async (contractName, eventName, callback) => {
    await contracts[contractName].removeListener(eventName);
    contracts[contractName].on(eventName, (...args) => {
      let eventBlockNum = args[args.length - 1].blockNumber;
      // console.log(eventName, eventBlockNum, provider._lastBlockNumber);
      if (eventBlockNum >= provider._lastBlockNumber - 10) {
        let msg = args.pop().args;
        callback(msg);
      }
    });
  };
  async function onGearDropped(msg) {
    console.log({ onGearDropped: msg });
    setTimeout(() => {
      updateWallet();
    }, 2000)
  }

  async function onPlayerLostGear(msg) {
    setTimeout(() => {
      updateWallet();
    }, 2000)
  }

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
      newState[findSlotIdx].rarityIdx = -1;
      newState[findSlotIdx].catIdx = -1;
      newState[findSlotIdx].gearIdx = -1;
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

  async function approve(gear) {
    let gameAddr = await contracts.Spaceborn.address;
    setLoading(true);
    await tx(contracts.Gears.approveGear(gameAddr, gear.tokenIdx), update => {
      if (update.status === "confirmed" || update.status === 1) {
        console.log("approved gear");
        updateWallet();
      }
      if (update.events) {
        updateWallet();
        setLoading(false);
      }
    });
  }

  async function equip(gear) {
    console.log(gear);
    let slotFound = state.gearSlots.find(g => g.slotId == gear.tokenIdx);
    // console.log({ slotFound })
    if (slotFound) {

    } else {
      let newState = [...state.gearSlots];
      let emptySlotIdx = state.gearSlots.findIndex(g => g.slotId === -1);
      if (emptySlotIdx == -1) {
        console.log("No empty slot found")
        return;
      }
      newState[emptySlotIdx].slotId = gear.tokenIdx;
      newState[emptySlotIdx].rarityIdx = gear.rarityIdx;
      newState[emptySlotIdx].catIdx = gear.catIdx;
      newState[emptySlotIdx].gearIdx = gear.gearIdx;
      newState[emptySlotIdx].health = gear.health;
      newState[emptySlotIdx].category = gear.category;
      newState[emptySlotIdx].name = gear.gearJson.item;
      newState[emptySlotIdx].icon = gear.icon;
      newState[emptySlotIdx].probsReduce = gear.probsReduce;
      newState[emptySlotIdx].type = "set";
      newState[emptySlotIdx].usedGear = {
        catIdx: gear.catIdx,
        gearIdx: gear.gearIdx,
        rarityIdx: gear.rarityIdx
      }
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

  function getIconGear(cat) {
    return IMAGES[cat.toUpperCase()];
  }

  function getIconAlien(type) {
    return IMAGES[type.toUpperCase()];
  }

  function getStrongIcons(cat) {
    let alienTypeIdxs = STRONG_AGAINST[cat];
    let icons = [];
    alienTypeIdxs.forEach(id => {
      icons.push({ "icon": getIconAlien(ALIEN_CATS[id]), "alienType": ALIEN_CATS[id] });
    })
    // console.log({ icons });
    return icons;
  }

  function getRarityType(id) {
    switch (id) {
      case 0:
        return "Common"
      case 1:
        return "Uncommon"
      case 2:
        return "Rare"
      case 4:
        return "Ultra"
      default:
        return ""
    }
  }

  /////////// Contract functions
  async function updateWallet() {
    const balanceLoot = await contracts.Gears.balanceOf(address);
    console.log({ "balanceLoot": balanceLoot.toNumber() });
    dispatch({ type: "setWalletGearsCount", payload: balanceLoot.toNumber(), fieldName: "walletGearsCount" });
    // if (balanceLoot.toNumber() == walletGears.length) {
    //   console.log("wallet is updated!");
    //   return;
    // }
    setLoading(true);
    const walletGearsUpdate = [];
    for (let tokenIndex = 0; tokenIndex < balanceLoot; tokenIndex++) {
      try {
        const tokenId = await contracts.Gears.tokenOfOwnerByIndex(address, tokenIndex);
        const gearObj = await contracts.Gears.gears(tokenId);
        // console.log({ gearObj });
        if (gearObj.playerWonAddr == address) {
          let gearJsObj = {};
          gearJsObj.note = gearObj.name;
          gearJsObj.rarityIdx = gearObj.rarity.toNumber();
          gearJsObj.rarity = getRarityType(gearJsObj.rarityIdx);
          gearJsObj.catIdx = gearObj.catIdx.toNumber();
          gearJsObj.gearIdx = gearObj.tokenId.toNumber();
          gearJsObj.tokenIdx = gearObj.tokenId.toNumber();
          gearJsObj.health = gearObj.health.toNumber();
          let svgJson = await getSvgJson(gearJsObj.tokenIdx);
          // gearJsObj.image = svgJson.image;
          gearJsObj.gearJson = svgJson;
          gearJsObj.category = svgJson.category;
          gearJsObj.name = svgJson.name;
          gearJsObj.itemName = svgJson.item;
          gearJsObj.icon = getIconGear(gearJsObj.category);
          gearJsObj.strongIcons = getStrongIcons(gearJsObj.category);
          let gameAddr = await contracts.Spaceborn.address;
          gearJsObj.approved = await contracts.Gears.isApproved(tokenId, gameAddr);
          // console.log(svgImg);
          walletGearsUpdate.push(gearJsObj);
        }

      } catch (e) {
        console.log(e);
      }
    }
    let needsApproved = walletGearsUpdate.filter(w => w.approved == false);
    // console.log(needsApproved);
    setApproveGears(needsApproved);
    // console.log(walletGearsUpdate);
    let approvedGears = walletGearsUpdate.filter(w => w.approved == true);
    setWalletGears(approvedGears.reverse());
    setLoading(false);
  }

  const claimFree = async () => {
    const result = await tx(contracts.Spaceborn.claimRandomGear(), update => {
      if (update) {
        if (update.status === "confirmed" || update.status === 1) {
          console.log("claimed gear");
        }
        if (update.events) {
          console.log({ "event": update.events });
          updateWallet();
        }
      }
    });
  };

  async function getSvgJson(tokenId) {
    let tokenUri = await contracts.Gears.tokenURI(tokenId);
    const base64_data = tokenUri.split("base64,")[1];
    const decoded_str = svgUtils.atob(base64_data);
    const decoded_json = JSON.parse(decoded_str);
    // console.log(decoded_json);
    return decoded_json;
  }

  /////////// UI events
  // function getWalletItemBgColor(idx) {
  //   // let equippedFound = state.equippedGears.find(loot => loot.id == idx);
  //   // // console.log({ "gears": state.equippedGears }, idx);
  //   // if (equippedFound) {
  //   //   return { backgroundColor: "lightgreen" };
  //   // }
  //   return { backgroundColor: "black" };
  // }

  /////////////////////// Render
  function approveGearBox(gear, idx) {
    return (
      <div className="apprGearBox" key={idx}>
        <div className="gearImg">
          <img src={gear.icon} width="50" height="50" />
        </div>
        {!gear.approved && <button className="gearBtn" onClick={() => approve(gear)}>Approve</button>}
      </div>
    )
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
            {gear.strongIcons.map((iconObj, idx) =>
              <div className="gIcon" key={idx}>
                <Tooltip title={'Strong against Alien: ' + iconObj.alienType}>
                  <img src={iconObj.icon} width="23" height="23" />
                </Tooltip>
              </div>)}
          </div>

          {/* <Gear1 className="gearSvg" /> */}
          <div>{gear.itemName} ({gear.rarity})</div>
          <div>Health: {gear.health}</div>
        </div>
        <div className="gearSide">
          {/* {!gear.approved && <button className="gearBtn" onClick={() => approve(gear)}>Approve</button>} */}
          {gear.approved && state.playerState && state.playerState.joined && !gear.equip && <button className="gearBtn" onClick={() => equip(gear)}>Equip</button>}
          {gear.approved && gear.equip && <button className="gearBtn" onClick={() => unequip(gear)}>Unequip</button>}
          <button className="gearBtn" onClick={() => viewNft(gear)}>View NFT</button>
        </div>
      </div>
    )
  }

  function handlePopup(msg) {
    // console.log(msg);
    setpopupWindowMsg({ ...msg, show: false })
  }
  function viewNft(gear) {
    // console.log({ gear })
    let msg = {
      show: true,
      title: gear.itemName,
      imgSrc: gear.gearJson.image
    }
    setpopupWindowMsg(msg)
  }

  const walletWindow = (
    <>
      <div className="apprObj">
        <div className="panelTitle">
          <div className="title">
            Approve Gears
            <Tooltip title="Approving gears makes it available for use in the game. This is a one time transaction for each new gear.">
              <img src={IMAGES["HELP"]} width="20px" height="20px"></img>
            </Tooltip>
          </div>
          <div className="count">{approveGears.length}</div>
        </div>
        <hr style={{ "width": "200px" }} />
        {/* <div className="panelSubTitle">*Approving gears makes it available for use in the game. This is a one time transaction.</div> */}
        <div className="appColl">
          {approveGears.length == 0 && <span>No gears in your wallet needs approval</span>}
          {approveGears.map((gear, idx) => approveGearBox(gear, idx))}
        </div>
      </div>
      {/* <hr /> */}
      <div className="inventoryObj">
        <div className="invTitle panelTitle">
          <div className="title">
            Gears Approved
            <Tooltip title="This gears are available for use in the game. Warning: In this game, you agree with the risk that there's a chance you will lose a gear used during combat to the game enemy!">
              <img src={IMAGES["HELP"]} width="20px" height="20px"></img>
            </Tooltip>
          </div>
          <div className="count">{walletGears.length}</div>
        </div>
        <hr style={{ "width": "200px" }} />
        <div className="invColl">
          {loading && <Spin size="large"></Spin>}
          <div className="gearWrapper">
            {walletGears.length == 0 && <span>No approved gears found</span>}
            {walletGears.map((gear, idx) => gearBox(gear, idx))}
          </div>
        </div>
      </div>

      {popupWindowMsg && popupWindowMsg.show && <PopupWindow onCloseCallback={handlePopup} popupMsg={popupWindowMsg}></PopupWindow>}
    </>
  )
  return (
    <>
      <div>{walletWindow}</div>
    </>
  );
}
