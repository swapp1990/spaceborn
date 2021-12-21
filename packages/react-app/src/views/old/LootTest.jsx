import { Button, Card, DatePicker, Divider, Input, List, Progress, Slider, Spin, Switch, Row, Col } from "antd";
import React, { useEffect, useState } from "react";
import * as svgUtils from "../../helpers/svgUtils";

// Gear {
//   uint256 tokenId;
//   uint256 catIdx;
//   uint256 titleIdx;
//   string name;
//   uint256 rarity;
//   address playerWonAddr;
//   bool exists;
// }

export default function LootTest({
  address,
  mainnetProvider,
  provider,
  yourLocalBalance,
  price,
  tx,
  contracts
}) {
  const [imgSrc, setImgSrc] = useState(null);
  const [tokenIdx, setTokenIdx] = useState(0);
  const init = async () => { };

  const update = async () => { };
  useEffect(() => {
    if (contracts && contracts.Gears) {
      init();
    }
  }, [contracts]);

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
  const mintLoot = async () => {
    const token_idx = getRandomInt(1000);
    const titleIdx = getRandomInt(5);
    const catIdx = getRandomInt(4);
    const gearCustom = {
      tokenId: token_idx,
      catIdx: catIdx,
      titleIdx: titleIdx,
      name: "Gear Eg",
      rarity: 0,
      playerWonAddr: address,
      exists: true
    };
    const result = await contracts.Gears.randomTokenURI(token_idx, gearCustom);
    setTokenIdx(token_idx);

    const base64_data = result.split("base64,")[1];
    const decoded_str = svgUtils.atob(base64_data);
    const decoded_json = JSON.parse(decoded_str);
    console.log(decoded_json);
    const svg_img = decoded_json.image;
    setImgSrc(svg_img);
  };

  return (
    <div style={{ maxWidth: 1024, margin: "auto", paddingBottom: 56 }}>
      <Button onClick={mintLoot} style={{ marginBottom: "5px", marginTop: "25px" }}>
        Show Random Loot Item Card
      </Button>
      <Divider />

      <img src={imgSrc}></img>
    </div>
  );
}
