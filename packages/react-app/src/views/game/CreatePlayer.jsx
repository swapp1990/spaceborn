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

export default function CreatePlayer({ address, tx, readContracts, writeContracts }) {
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

  function clickPfpFromGallery(item) {
    console.log(item);
    setselectedPfp(item);
  }

  async function confirmCreate() {
    let playerInfoNew = { ...playerInfo, ...selectedPfp };
    playerInfoNew.name = playerInfo.name;
    playerInfoNew.pfp_name = selectedPfp.name;
    playerInfoNew.pfp_url = selectedPfp.pfp_url;
    const result = await tx(writeContracts.Player.mint(playerInfoNew));
  }

  const loadOwnedNFTs = async () => {
    const balance = await readContracts.BadKidsAlley.balanceOf(address);
    console.log(balance.toNumber());
    setBalanceTokens(balance.toNumber());
    let nfts = [];
    for (let i = 0; i < balance; i++) {
      const tokenUri = await readContracts.BadKidsAlley.tokenURI(i);
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
            <div>Choose a PFP NFT that you want to set your player to</div>
            <div>
              <a onClick={() => loadOwnedNFTs()}>Bad Alley Kids</a>
            </div>
            <div>You own {balanceTokens} NFTs</div>
            <div>{pfpGallery}</div>
            <div>Selected PFP: {selectedPfp.name}</div>
            <div>
              <Button onClick={confirmCreate} disabled={!selectedPfp.name}>
                Confirm Create Player
              </Button>
            </div>
          </>
        )}

        {!playerInfo && (
          <Form form={form} name="control-hooks" onFinish={onFinish}>
            <Form.Item name="name" label="Player Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="gender" label="Player Gender" rules={[{ required: true }]}>
              <Select placeholder="Select a option and change input text above" onChange={onGenderChange} allowClear>
                <Option value="male">male</Option>
                <Option value="female">female</Option>
                <Option value="other">other</Option>
              </Select>
            </Form.Item>
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
