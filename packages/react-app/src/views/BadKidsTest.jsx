import { Button, Card, DatePicker, Divider, Input, List, Progress, Slider, Spin, Switch, Row, Col } from "antd";
import React, { useEffect, useState } from "react";
import { ReactComponent as CardEx } from "../card_ex.svg";

export default function BadKidsTest({
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

  const update = async () => {};
  useEffect(() => {
    if (readContracts && readContracts.BadKidsAlley) {
      init();
    }
  }, [readContracts]);

  const init = async () => {
    const balance = await readContracts.BadKidsAlley.balanceOf(address);
    console.log(balance.toNumber());
    // for (let i = 0; i < balance; i++) {
    //   const tokenUri = await readContracts.BadKidsAlley.tokenURI(i);
    //   //   console.log({ tokenUri });
    //   getImgFromTokenUri(tokenUri);
    // }
  };

  const getImgFromTokenUri = tokenUri => {
    fetch(tokenUri)
      .then(res => res.json())
      .then(
        result => {
          //   console.log(result.image);
          fetch(result.image)
            .then(res => res.blob())
            .then(
              resultImg => {
                // console.log({ resultImg });
                setImgSrc(URL.createObjectURL(resultImg));
              },
              err => {
                console.log(err);
              },
            );
        },
        err => {
          console.log(err);
        },
      );
  };

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
  const mintRandom = async () => {
    const result = await tx(writeContracts.BadKidsAlley.mint(address, 1));
    console.log(result);
    const balance = await readContracts.BadKidsAlley.balanceOf(address);
    console.log(balance.toNumber());
    const tokenUri = await readContracts.BadKidsAlley.tokenURI(balance.toNumber() - 1);
    console.log({ tokenUri });
    getImgFromTokenUri(tokenUri);
  };

  return (
    <div style={{ maxWidth: 1024, margin: "auto", paddingBottom: 56 }}>
      <Button onClick={mintRandom} style={{ marginBottom: "5px", marginTop: "25px" }}>
        Mint Random NFT
      </Button>
      <Divider />

      <img src={imgSrc} style={{ height: 400 }}></img>
      {/* <CardEx /> */}
    </div>
  );
}
