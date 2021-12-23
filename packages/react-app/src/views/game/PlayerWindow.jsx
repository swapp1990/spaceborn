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
  Typography,
  Modal,
} from "antd";
import "./player.css";
import GContext from "../../helpers/GContext";

const { Text, Link, Title } = Typography;
export default function PlayerWindow({ address, tx, contracts, playerNft }) {
  //Global use context
  const { state, dispatch } = useContext(GContext);

  useEffect(async () => {
    if (contracts && contracts.Player) {
      init();
      // console.log("init");
    }
  }, [contracts, address]);

  useEffect(() => {
    // console.log(state.playerState);
  }, [state.playerState]);

  const init = async () => {
    // updateProfile();
    // console.log(state.playerState);
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

  const playerWrapper = (
    <div className="profile">
      <div className="profileImg">
        {state.playerState.pfpUrl != "" && <img src={state.playerState.pfpUrl} alt="Avatar"></img>}
        {state.playerState.pfpUrl == "" && <img src="./images/img_avatar.png" alt="Avatar"></img>}
      </div>
      <div className="profileInfo">
        <div className="profileName">{state.playerState.name}</div>
        {/* <div>Faction: Warrior</div> */}
      </div>
    </div>
  )

  const playerWindow = (
    <>
      {playerWrapper}
      {/* {playerNft && playerWrapper}
      {!playerNft && (
        <Card
          style={{ width: 450 }}
          title={
            <div>
              <span style={{ fontSize: 18, marginRight: 8 }}>No Player NFT found</span>
            </div>
          }
        ></Card>
      )} */}
    </>
  );
  return (
    <>
      <div>{playerWindow}</div>
    </>
  );
}
