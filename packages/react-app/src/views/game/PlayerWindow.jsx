import React, { useEffect, useState } from "react";
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
const { Text, Link, Title } = Typography;
export default function PlayerWindow({ address, tx, contracts, playerNft }) {

  useEffect(async () => {
    if (contracts && contracts.Player) {
      init();
      // console.log("init");
    }
  }, [contracts, address]);

  const init = async () => {
    // updateProfile();
  };

  const getImgFromUrl = url => {
    return fetch(url)
      .then(res => res.blob())
      .then(
        resultImg => {
          return URL.createObjectURL(resultImg);
        },
        err => {
          console.log(err);
          return null;
        },
      );
  };

  const playerWindow = (
    <>
      {playerNft && (
        <Card
          style={{ width: 450 }}
          title={
            <div>
              <span style={{ fontSize: 18, marginRight: 8 }}>{playerNft.name}</span>
            </div>
          }
        >
          {/* <img style={{ width: 200 }} src={playerNft.image} />
          <div>
            <span>
              Level: {playerNft.level}, XP: {playerNft.xp}
            </span>
          </div> */}
        </Card>
      )}
      {!playerNft && (
        <Card
          style={{ width: 450 }}
          title={
            <div>
              <span style={{ fontSize: 18, marginRight: 8 }}>No Player NFT found</span>
            </div>
          }
        ></Card>
      )}
    </>
  );
  return (
    <>
      <div>{playerWindow}</div>
    </>
  );
}
