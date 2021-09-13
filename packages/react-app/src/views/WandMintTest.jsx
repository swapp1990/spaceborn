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
  const init = async () => {
    // let imgSrc =
    //   "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaW5ZTWluIG1lZXQiIHZpZXdCb3g9IjAgMCAzNTAgMzUwIj48c3R5bGU+LmJhc2UgeyBmaWxsOiB3aGl0ZTsgZm9udC1mYW1pbHk6IHNlcmlmOyBmb250LXNpemU6IDE0cHg7IH08L3N0eWxlPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9ImJsYWNrIiAvPjx0ZXh0IHg9IjEwIiB5PSIyMCIgY2xhc3M9ImJhc2UiPiJHcmltIFNob3V0IiBHcmF2ZSBXYW5kIG9mIFNraWxsICsxPC90ZXh0Pjx0ZXh0IHg9IjEwIiB5PSI0MCIgY2xhc3M9ImJhc2UiPkhhcmQgTGVhdGhlciBBcm1vcjwvdGV4dD48dGV4dCB4PSIxMCIgeT0iNjAiIGNsYXNzPSJiYXNlIj5EaXZpbmUgSG9vZDwvdGV4dD48dGV4dCB4PSIxMCIgeT0iODAiIGNsYXNzPSJiYXNlIj5IYXJkIExlYXRoZXIgQmVsdDwvdGV4dD48dGV4dCB4PSIxMCIgeT0iMTAwIiBjbGFzcz0iYmFzZSI+IkRlYXRoIFJvb3QiIE9ybmF0ZSBHcmVhdmVzIG9mIFNraWxsPC90ZXh0Pjx0ZXh0IHg9IjEwIiB5PSIxMjAiIGNsYXNzPSJiYXNlIj5TdHVkZGVkIExlYXRoZXIgR2xvdmVzPC90ZXh0Pjx0ZXh0IHg9IjEwIiB5PSIxNDAiIGNsYXNzPSJiYXNlIj5OZWNrbGFjZSBvZiBFbmxpZ2h0ZW5tZW50PC90ZXh0Pjx0ZXh0IHg9IjEwIiB5PSIxNjAiIGNsYXNzPSJiYXNlIj5Hb2xkIFJpbmc8L3RleHQ+PC9zdmc+";
    // setImgSrc(imgSrc);
  };

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
