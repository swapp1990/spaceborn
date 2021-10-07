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
export default function PlayerWindow({ address, tx, readContracts, writeContracts }) {
  const [playerNft, setPlayerNft] = useState(null);

  useEffect(async () => {
    if (readContracts && readContracts.Player) {
      init();
    }
  }, [readContracts, address]);

  const init = async () => {
    updateProfile();
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

  async function updateProfile() {
    const tokenId = await readContracts.Player.getTokenId(address);
    if (tokenId.toNumber() == 0) {
      console.log("tokenId is not set");
      return;
    }
    console.log({ tokenId: tokenId.toNumber() });
    const player = await readContracts.Player.getPlayer(tokenId);
    console.log(player);
    let imgSrc = await getImgFromUrl(player.pfp_url);
    setPlayerNft({
      id: tokenId,
      name: player.name,
      image: imgSrc,
      owner: address,
      level: player.level,
      xp: player.xp.toNumber(),
    });
  }

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
          <img style={{ width: 200 }} src={playerNft.image} />
          <div>
            <span>
              Level: {playerNft.level}, XP: {playerNft.xp}
            </span>
          </div>
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
