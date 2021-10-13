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
export default function WalletWindow({ address, tx, readContracts, writeContracts, localProvider }) {
  const [walletLoot, setWalletLoot] = useState([]);

  useEffect(async () => {
    if (readContracts && readContracts.Gears) {
      init();
    }
  }, [readContracts, address]);

  const init = async () => {
    updateWallet();
    if (readContracts && readContracts.Gears) {
      addEventListener("Gears", "GearDropped", onGearDropped);
    }
  };

  const addEventListener = async (contractName, eventName, callback) => {
    await readContracts[contractName].removeListener(eventName);
    readContracts[contractName].on(eventName, (...args) => {
      let eventBlockNum = args[args.length - 1].blockNumber;
      console.log(eventName, eventBlockNum, localProvider._lastBlockNumber);
      if (eventBlockNum >= localProvider._lastBlockNumber - 1) {
        let msg = args.pop().args;
        callback(msg);
      }
    });
  };
  async function onGearDropped(msg) {
    console.log({ onGearDropped: msg });
    updateWallet();
  }

  const claimFree = () => {};

  async function updateWallet() {
    const balanceLoot = await readContracts.Gears.balanceOf(address);
    console.log({ balanceLoot: balanceLoot.toNumber() });
    if (balanceLoot.toNumber() == walletLoot.length) {
      console.log("wallet is updated!");
      return;
    }
    const walletLootUpdate = [];
    for (let tokenIndex = 0; tokenIndex < balanceLoot; tokenIndex++) {
      try {
        const tokenId = await readContracts.Gears.tokenOfOwnerByIndex(address, tokenIndex);
        const gearObj = await readContracts.Gears.gears(tokenId);
        console.log({ gearObj });
        walletLootUpdate.push({ ...gearObj });
      } catch (e) {
        console.log(e);
      }
    }
    setWalletLoot(walletLootUpdate.reverse());
  }

  const walletWindow = (
    <>
      <Card
        title="Wallet"
        extra={
          <Button onClick={claimFree} type="dashed" disabled={walletLoot.length != 0}>
            Claim a free loot
          </Button>
        }
      >
        <List
          grid={{ gutter: 16, column: 2 }}
          dataSource={walletLoot}
          style={{ overflowY: "auto", overflowX: "hidden", height: "400px" }}
          renderItem={item => (
            <List.Item>
              <Card title={item.name} hoverable>
                <div>{item.rarity}</div>
                <a href={"https://opensea.io/assets/"} target="_blank">
                  View on OpenSea
                </a>
              </Card>
            </List.Item>
          )}
        />
      </Card>
    </>
  );

  return (
    <>
      <div>{walletWindow}</div>
    </>
  );
}
