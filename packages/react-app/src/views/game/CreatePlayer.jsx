import React, { useEffect, useState, useContext } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  List,
  Spin,
} from "antd";
import { useMoralisWeb3Api } from "react-moralis"
import GContext from "../../helpers/GContext";
import "./create.scss";

export default function CreatePlayer({ address, tx, contracts }) {
  const { state, dispatch } = useContext(GContext);
  const [loading, setLoading] = useState(false);

  const [ownedNfts, setOwnedNfts] = useState([]);
  const [balanceTokens, setBalanceTokens] = useState(0);
  const [playerInfo, setplayerInfo] = useState();
  const [selectedPfp, setselectedPfp] = useState(null);
  const [pfpList, setPfpList] = useState({ "MSB": [], "ARC": [] })

  const [form] = Form.useForm();
  const Web3Api = useMoralisWeb3Api();

  useEffect(async () => {

  }, []);

  const onFinish = values => {
    console.log(values);
    setplayerInfo(values);
    getAllNfts();
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

  async function getAllNfts() {
    const options = {
      chain: 'eth', address: '0x99066C5fa8F44EEF3FCDee1811fcD90C2D45ddf5'
    }
    const res = await Web3Api.account.getNFTs(options)
    // console.log(res.result)
    const moonshotBotsContract = "0x8b13e88ead7ef8075b58c94a7eb18a89fd729b18";
    const nfts_msb = res.result.filter(r => r.token_address === moonshotBotsContract);
    // console.log(nfts_msb);
    let pfp_msb = [];
    nfts_msb.forEach(async e => {
      let metaJson = await getMetadataFromTokenUri(e.token_uri);
      let currPfpList = pfpList["MSB"];
      currPfpList.push(
        {
          "name": "MSB",
          "img": metaJson.image,
          "token_id": Number(e.token_id)
        }
      );
      setPfpList({ ...pfpList, ["MSB"]: currPfpList });
    });

    const arcadiansContract = "0xc3c8a1e1ce5386258176400541922c414e1b35fd";
    const nfts_arc = res.result.filter(r => r.token_address === arcadiansContract);

    nfts_arc.forEach(async e => {
      let metaJson = await getMetadataFromTokenUri(e.token_uri);
      let currPfpList = pfpList["ARC"];
      currPfpList.push(
        {
          "name": "ARC",
          "img": metaJson.image,
          "token_id": Number(e.token_id)
        }
      );
      setPfpList({ ...pfpList, ["ARC"]: currPfpList });
    });
  }

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
      pfpUrl: player.pfpUrl,
      image: null,
      owner: address,
      joined: player.joined,
      roundId: player.joinedRoundId.toNumber()
    };
    dispatch({ type: "setPlayerState", payload: playerState, fieldName: "playerState" });
    console.log("updated player state ", player.name);
  }

  function isSelected(pfpObj) {
    if (pfpObj == selectedPfp) {
      return true;
    }
    return false;
  }

  function handleChange(pfpObj) {
    console.log({ pfpObj })
    setselectedPfp(pfpObj);
  }

  async function confirmCreate() {
    // let playerInfoNew = { ...playerInfo, ...selectedPfp };
    let playerInfoNew = {};
    playerInfoNew.name = playerInfo.name;
    if (selectedPfp) {
      playerInfoNew.pfpName = selectedPfp.name;
      playerInfoNew.pfpUrl = selectedPfp.img;
      playerInfoNew.pfpTokenId = selectedPfp.token_id;
    }
    setLoading(true);
    console.log({ playerInfoNew })
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

  // const loadOwnedNFTs = async () => {
  //   const balance = await contracts.BadKidsAlley.balanceOf(address);
  //   console.log(balance.toNumber());
  //   setBalanceTokens(balance.toNumber());
  //   let nfts = [];
  //   for (let i = 0; i < balance; i++) {
  //     const tokenUri = await contracts.BadKidsAlley.tokenURI(i);
  //     let result = await getMetadataFromTokenUri(tokenUri);
  //     console.log(result);
  //     let imgSrc = await getImgFromToken(result);
  //     nfts.push({ id: i, name: result.name, imgSrc: imgSrc, pfp_url: result.image });
  //   }
  //   setOwnedNfts(nfts);
  // };
  // const pfpGallery = (
  //   <Card title="Wallet" style={{ overflowY: "auto", overflowX: "hidden", height: 400 }}>
  //     <List
  //       grid={{ gutter: 16, column: 4 }}
  //       dataSource={ownedNfts}
  //       style={{ overflowY: "hidden", overflowX: "auto" }}
  //       renderItem={item => (
  //         <List.Item>
  //           <div onClick={() => clickPfpFromGallery(item)}>
  //             <Card
  //               hoverable
  //               bordered
  //               title={item.name}
  //               style={gePfpItemBgColor(item.id)}
  //               headStyle={{ backgroundColor: "rgba(255, 255, 255, 0.4)", border: 0 }}
  //             >
  //               <img style={{ height: 100 }} src={item.imgSrc} />
  //             </Card>
  //           </div>
  //         </List.Item>
  //       )}
  //     ></List>
  //   </Card>
  // );

  const createPlayerScreen = (
    <div className="createBody" style={{ backgroundImage: "url('/images/bg_alienworld2.png')" }}>
      <div className="create">
        <Card style={{ width: 800 }} title="Create Player">
          {playerInfo && (
            <>
              <div>Choose a PFP NFT that you want to set your player to</div>
              {loading && <Spin size="large"></Spin>}
              <div className="choosePfp">
                <div className="projWrapper">
                  <div className="projTitle">Moonshot Bots</div>
                  <div className="projSel">
                    {pfpList["MSB"].map((e, key) => <div key={key} className="pfpEntry">
                      <input type="checkbox" id={key} checked={isSelected(e)} onChange={() => handleChange(e)} />
                      <label for={key}><img src={e.img} /></label>
                    </div>)}
                  </div>
                </div>
                <div className="projWrapper">
                  <div className="projTitle">Arcadians</div>
                  <div className="projSel">
                    {pfpList["ARC"].map((e, key) => <div key={key} className="pfpEntry">
                      <input type="checkbox" id={'S' + key} checked={isSelected(e)} onChange={() => handleChange(e)} />
                      <label for={'S' + key}><img src={e.img} /></label>
                    </div>)}
                  </div>

                </div>
              </div>

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
                <Input autoComplete="off" />
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
    </div>

  );

  return <>{createPlayerScreen}</>;
}
