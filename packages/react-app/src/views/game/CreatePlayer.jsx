import React, { useEffect, useState, useContext } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  List,
  Spin,
} from "antd";
import GContext from "../../GContext";

export default function CreatePlayer({ address, tx, contracts }) {
  const { state, dispatch } = useContext(GContext);
  const [loading, setLoading] = useState(false);

  const [ownedNfts, setOwnedNfts] = useState([]);
  const [balanceTokens, setBalanceTokens] = useState(0);
  const [playerInfo, setplayerInfo] = useState();
  const [selectedPfp, setselectedPfp] = useState({ id: -1 });

  const [form] = Form.useForm();

  const onFinish = values => {
    console.log(values);
    setplayerInfo(values);
  };
  const onGenderChange = value => {
    switch (value) {
      case "male":
        return;
      case "female":
        return;
      case "other":
    }
  };

  function gePfpItemBgColor(idx) {
    if (selectedPfp.id == idx) {
      return { backgroundColor: "lightgreen", color: "black" };
    }
    return { backgroundColor: "black", color: "black" };
  }

  const getImgFromToken = token => {
    return fetch(token.image)
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

  const getMetadataFromTokenUri = tokenUri => {
    return fetch(tokenUri)
      .then(res => res.json())
      .then(
        result => {
          return result;
        },
        err => {
          console.log(err);
          return null;
        },
      );
  };

  async function updatePlayerState() {
    const tokenId = await contracts.Player.getTokenId(address);
    if (tokenId.toNumber() == 0) {
      console.log("player not found!");
      return;
    }
    const player = await contracts.Player.getPlayer(tokenId);
    const playerState = {
      id: tokenId,
      name: player.name,
      image: null,
      owner: address,
      joined: player.joined,
      roundId: player.joinedRoundId.toNumber()
    };
    dispatch({ type: "setPlayerState", payload: playerState, fieldName: "playerState" });
    console.log("updated player state ", player.name);
  }

  function clickPfpFromGallery(item) {
    // console.log(item);
    setselectedPfp(item);
  }

  async function confirmCreate() {
    // let playerInfoNew = { ...playerInfo, ...selectedPfp };
    let playerInfoNew = {};
    playerInfoNew.name = playerInfo.name;
    // playerInfoNew.pfp_name = selectedPfp.name;
    // playerInfoNew.pfp_url = selectedPfp.pfp_url;
    setLoading(true);
    await tx(contracts.Player.mint(playerInfoNew),
      update => {
        if (update) {
          if (update.code) {
            setLoading(false);
          }
          if (update.status === "confirmed" || update.status === 1) {
            console.log("player created");
          }
          if (update.events) {
            console.log({ "event": update.events });
            updatePlayerState();
            setLoading(false);
          }
        }
      });
  }

  const loadOwnedNFTs = async () => {
    const balance = await contracts.BadKidsAlley.balanceOf(address);
    console.log(balance.toNumber());
    setBalanceTokens(balance.toNumber());
    let nfts = [];
    for (let i = 0; i < balance; i++) {
      const tokenUri = await contracts.BadKidsAlley.tokenURI(i);
      let result = await getMetadataFromTokenUri(tokenUri);
      console.log(result);
      let imgSrc = await getImgFromToken(result);
      nfts.push({ id: i, name: result.name, imgSrc: imgSrc, pfp_url: result.image });
    }
    setOwnedNfts(nfts);
  };
  const pfpGallery = (
    <Card title="Wallet" style={{ overflowY: "auto", overflowX: "hidden", height: 400 }}>
      <List
        grid={{ gutter: 16, column: 4 }}
        dataSource={ownedNfts}
        style={{ overflowY: "hidden", overflowX: "auto" }}
        renderItem={item => (
          <List.Item>
            <div onClick={() => clickPfpFromGallery(item)}>
              <Card
                hoverable
                bordered
                title={item.name}
                style={gePfpItemBgColor(item.id)}
                headStyle={{ backgroundColor: "rgba(255, 255, 255, 0.4)", border: 0 }}
              >
                <img style={{ height: 100 }} src={item.imgSrc} />
              </Card>
            </div>
          </List.Item>
        )}
      ></List>
    </Card>
  );
  const createPlayerScreen = (
    <div className="create">
      <Card style={{ width: 800 }} title="Create Player">
        {playerInfo && (
          <>
            {/* <div>Choose a PFP NFT that you want to set your player to</div> */}
            {loading && <Spin size="large"></Spin>}
            <div>Confirm</div>
            {/* <div>
              <a onClick={() => loadOwnedNFTs()}>Bad Alley Kids</a>
            </div>
            <div>You own {balanceTokens} NFTs</div>
            <div>{pfpGallery}</div>
            <div>Selected PFP: {selectedPfp.name}</div> */}
            <div>
              <Button onClick={confirmCreate} disabled={loading}>Confirm Create Player</Button>
            </div>
          </>
        )}

        {!playerInfo && (
          <Form form={form} name="control-hooks" onFinish={onFinish}>
            <Form.Item name="name" label="Player Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            {/* <Form.Item name="gender" label="Player Gender" rules={[{ required: true }]}>
              <Select placeholder="Select a option and change input text above" onChange={onGenderChange} allowClear>
                <Option value="male">male</Option>
                <Option value="female">female</Option>
                <Option value="other">other</Option>
              </Select>
            </Form.Item> */}
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  );

  return <>{createPlayerScreen}</>;
}
