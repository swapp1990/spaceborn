import { Button, Card, DatePicker, Divider, Input, List, Progress, Slider, Spin, Switch, Row, Col } from "antd";
import React, { useEffect, useState } from "react";
import { ReactComponent as CardEx } from "../card_ex.svg";

export default function WandMintTest({
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
  const [tokenIdx, setTokenIdx] = useState(0);
  const init = async () => {};

  const update = async () => {};
  useEffect(() => {
    if (readContracts && readContracts.Wands) {
      init();
    }
  }, [readContracts]);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  const atob = input => {
    let str = input.replace(/=+$/, "");
    let output = "";

    if (str.length % 4 == 1) {
      throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
    }
    for (
      let bc = 0, bs = 0, buffer, i = 0;
      (buffer = str.charAt(i++));
      ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
        ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
        : 0
    ) {
      buffer = chars.indexOf(buffer);
    }

    return output;
  };
  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
  const mintWand = async () => {
    const token_idx = getRandomInt(1000);
    const result = await readContracts.Wands.randomTokenURI(token_idx, "Test");
    setTokenIdx(token_idx);

    const base64_data = result.split("base64,")[1];
    const decoded_str = atob(base64_data);
    const decoded_json = JSON.parse(decoded_str);
    console.log(decoded_json);
    const svg_img = decoded_json.image;
    setImgSrc(svg_img);
  };

  const claimLoot = async () => {
    const result1 = tx(writeContracts.Loot.claim(tokenIdx), update => {
      console.log("📡 Transaction Update:");
      //   if (update && (update.status === "confirmed" || update.status === 1)) {
      //     // console.log(" 🍾 Transaction " + update.hash + " finished!");
      //   } else {
      //     console.log("update error ", update.status, update);
      //   }
    });
    console.log(await result1);
  };
  return (
    <div style={{ maxWidth: 1024, margin: "auto", paddingBottom: 56 }}>
      <Button onClick={mintWand} style={{ marginBottom: "5px", marginTop: "25px" }}>
        Show Random Wand Item Card
      </Button>
      <Divider />
      {/* <Button onClick={claimLoot} style={{ marginBottom: "25px" }}>
        Claim Loot
      </Button> */}

      <img src={imgSrc}></img>
      {/* <CardEx style={{ width: 700 }} /> */}
    </div>
  );
}
