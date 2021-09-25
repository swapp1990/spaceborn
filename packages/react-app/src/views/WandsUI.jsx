import {
  Button,
  Card,
  DatePicker,
  Divider,
  Input,
  List,
  Progress,
  Slider,
  Spin,
  Switch,
  Row,
  Col,
  Space,
  Typography,
  Modal,
} from "antd";
import React, { useEffect, useState } from "react";
import { ReactComponent as CardUnknown } from "../card_unknown.svg";
import { fromWei, toWei, toBN, numberToHex } from "web3-utils";

const { Search } = Input;
const { Text, Link } = Typography;

export default function WandsUI({
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
}) {
  const [walletLoot, setWalletLoot] = useState([]);
  const [imgSrc, setImgSrc] = useState(null);
  const [token, setToken] = useState();
  const [isAvailable, setIsAvailable] = useState(false);
  const [isOwnCastle, setIsOwnCastle] = useState(false);
  const [castleNftId, setCastleNftId] = useState(false);
  const castlesContract = "0x71f5C328241fC3e03A8c79eDCD510037802D369c";

  useEffect(async () => {
    if (readContracts && readContracts.Wands) {
      init();
    }
  }, [readContracts, address]);

  async function init() {
    addEventListener("Wands", "WandMinted", onWandMinted);
    update();

    const balance = await readContracts.Wands.balanceOfPartner(castlesContract, address);
    console.log(balance.toNumber());
    if (balance > 0) {
      setIsOwnCastle(true);
    }
  }

  const addEventListener = async (contractName, eventName, callback) => {
    await readContracts[contractName].removeListener(eventName);
    readContracts[contractName].on(eventName, (...args) => {
      let eventBlockNum = args[args.length - 1].blockNumber;
      console.log(eventName, eventBlockNum, localProvider._lastBlockNumber);
      let msg = args.pop().args;
      callback(msg);
      if (eventBlockNum >= localProvider._lastBlockNumber - 1) {
      }
    });
  };

  function onWandMinted(msg) {
    console.log("onWandMinted ", msg);

    update();
  }

  async function searchIdx(token_idx) {
    if (!token_idx) {
      setIsAvailable(false);
      setToken(null);
      return;
    }
    let tokenOwner = await readContracts.Wands.getTokenOwner(token_idx);
    console.log(tokenOwner);
    if (tokenOwner == "0x0000000000000000000000000000000000000000") {
      setIsAvailable(true);
      setToken({ id: token_idx });
    } else {
      console.log(tokenOwner);
      let tokenObj = await getTokenObj(token_idx);
      let ownerFmt = tokenOwner.substring(0, 6);
      setToken({ id: token_idx, ownerFmt: ownerFmt, ...tokenObj });
      setImgSrc(tokenObj.image);
      setIsAvailable(false);
    }
  }

  async function update() {
    const balanceLoot = await readContracts.Wands.balanceOf(address);
    // console.log(balanceLoot.toNumber());
    if (balanceLoot.toNumber() == walletLoot.length) {
      console.log("wallet is updated!");
      return;
    }
    setIsAvailable(false);
    if (token) {
      searchIdx(token.id);
    }

    const walletLootUpdate = [];
    for (let idx = 0; idx < balanceLoot; idx++) {
      const token_idx = await readContracts.Wands.tokenOfOwnerByIndex(address, idx);
      //   console.log({ token_idx });
      let tokenObj = await getTokenObj(token_idx);
      walletLootUpdate.push({ id: token_idx, ...tokenObj });
    }
    setWalletLoot(walletLootUpdate.reverse());
  }

  async function getTokenObj(token_idx) {
    const result = await readContracts.Wands.getTokenURI(token_idx);
    const base64_data = result.split("base64,")[1];
    const decoded_str = atob(base64_data);
    const decoded_json = JSON.parse(decoded_str);
    // console.log(decoded_json);
    return decoded_json;
  }

  async function mintToken() {
    const value = toWei("0.05");
    const result = await tx(
      writeContracts.Wands.mint(token.id, {
        value: value,
      }),
    );
    console.log({ result });
  }

  async function mintWithCastle() {
    if (!castleNftId) return;
    const value = toWei("0.01");
    // const isConnected = await readContracts.Wands.hasConnector(castlesContract);
    console.log({ castleNftId });

    const result = await tx(
      writeContracts.Wands.mintAsPartner(castlesContract, castleNftId, token.id, {
        value: value,
      }),
    );
    console.log({ result });
  }

  //Modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState();

  const showModal = () => {
    setIsModalVisible(true);
  };
  const handleOk = () => {
    setIsModalVisible(false);
  };
  const handleCancel = () => {
    setIsModalVisible(false);
  };
  function viewItem(imgSrc) {
    showModal();
    setModalImageSrc(imgSrc);
  }

  const lootItemModal = (
    <Modal title="Basic Modal" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
      <img style={{ width: 300 }} src={modalImageSrc} />
    </Modal>
  );

  const walletComp = (
    <Card
      title="Wallet"
      style={{ marginLeft: 30, marginRight: 30 }}
      //   extra={
      //     // <Button type="dashed" disabled>
      //     //   Claim a free loot
      //     // </Button>
      //   }
    >
      <List
        grid={{ gutter: 16, column: 2 }}
        dataSource={walletLoot}
        style={{ overflowY: "auto", overflowX: "hidden", height: "400px" }}
        renderItem={item => (
          <List.Item>
            <div onClick={() => console.log("wallet")}>
              <Card title={item.name} hoverable style={{ width: 180 }}>
                <img style={{ width: 120 }} src={item.image} />
                {/* <a
                  href={
                    "https://opensea.io/assets/" +
                    (readContracts && readContracts.ScifiLoot && readContracts.ScifiLoot.address) +
                    "/" +
                    item.id
                  }
                  target="_blank"
                >
                  View on OpenSea
                </a> */}
              </Card>
            </div>
            <Button type="primary" onClick={() => viewItem(item.image)}>
              View Item
            </Button>
          </List.Item>
        )}
      ></List>
    </Card>
  );
  const gameComp = (
    <Card
      title="Game Screen"
      style={{ marginLeft: 30, marginRight: 30 }}
      //   extra={
      //     <Button type="dashed" disabled>
      //       Claim a free loot
      //     </Button>
      //   }
    >
      <div style={{ margin: "auto", paddingTop: 5 }}>
        <div>
          <Search
            placeholder="search index 0-10000"
            size="large"
            style={{ width: 400 }}
            onChange={e => searchIdx(e.target.value)}
          />
        </div>
        {token && (
          <div style={{ paddingTop: 10 }}>
            {!isAvailable && <img src={imgSrc}></img>}
            {isAvailable && <CardUnknown style={{ width: 400 }} />}
          </div>
        )}
        {token && !isAvailable && (
          <div style={{ paddingTop: 10 }}>
            <Text type="success" style={{ fontSize: "20px" }}>
              Owned by: {token.ownerFmt}
            </Text>
          </div>
        )}
        {isAvailable && (
          <>
            <div style={{ paddingTop: 10 }}>
              <Button type="primary" onClick={mintToken} style={{ marginRight: 20 }}>
                Mint (0.05 ETH)
              </Button>
            </div>
            <div style={{ marginTop: 10 }}>
              <Search
                placeholder="Castledao NFT ID"
                enterButton="Mint with Castle (0.01 ETH)"
                size="large"
                onChange={e => {
                  console.log(e.target.value);
                  setCastleNftId(e.target.value);
                }}
                onSearch={mintWithCastle}
                style={{ width: 400 }}
                disabled={!isOwnCastle}
              />
            </div>
            <div>{!isOwnCastle && <Text>You don't own any Castles NFT</Text>}</div>
            <Divider />
            <Text>
              Mint your own castle at{" "}
              <a href="https://www.castledao.com" target="_blank">
                castledao!
              </a>
            </Text>
          </>
        )}
      </div>
    </Card>
  );
  return (
    <>
      {lootItemModal}
      <div style={{ width: "100%", paddingBottom: 256 }}>
        <Row style={{ marginTop: 30 }}>
          <Col span={18} push={6}>
            {gameComp}
          </Col>
          <Col span={6} pull={18}>
            {walletComp}
          </Col>
        </Row>
      </div>
    </>
  );
}
