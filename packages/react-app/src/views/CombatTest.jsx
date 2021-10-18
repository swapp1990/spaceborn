import { Button, Card, DatePicker, Divider, Input, List, Progress, Slider, Spin, Switch, Row, Col } from "antd";
import React, { useEffect, useState } from "react";
import { ReactComponent as CardEx } from "../card_ex.svg";
import * as svgUtils from "../helpers/svgUtils";

export default function CombatTest({
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
}) {
  const [imgSrc, setImgSrc] = useState(null);
  const init = async () => {};
  useEffect(() => {
    if (readContracts && readContracts.Alien) {
      init();
    }
  }, [readContracts]);
  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
  const showAlien = async () => {
    const token_idx = getRandomInt(1000);
    const result = await readContracts.Alien.randomTokenURI(token_idx);
    const base64_data = result.split("base64,")[1];
    const decoded_str = svgUtils.atob(base64_data);
    const decoded_json = JSON.parse(decoded_str);
    console.log(decoded_json);
    const svg_img = decoded_json.image;
    setImgSrc(svg_img);
  };

  return (
    <div style={{ maxWidth: 1024, margin: "auto", paddingBottom: 56 }}>
      <Button onClick={showAlien} style={{ marginBottom: "5px", marginTop: "25px" }}>
        Show Random Alien Card
      </Button>
      <Divider />

      <img src={imgSrc}></img>
    </div>
  );
}
