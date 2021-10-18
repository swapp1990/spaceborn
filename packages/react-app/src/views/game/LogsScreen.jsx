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
export default function LogsScreen({ address, tx, readContracts, writeContracts, localProvider }) {
  const [logs, setLogs] = useState([]);

  useEffect(async () => {
    if (readContracts && readContracts.Gears) {
      init();
    }
  }, [readContracts, address]);

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

  const init = async () => {
    if (readContracts && readContracts.GameManager) {
      addEventListener("GameManager", "PlayerWon", onPlayerWon);
      addEventListener("GameManager", "AlienWon", onAlienWon);
    }
    updateLogs();
    if (readContracts && readContracts.Gears) {
    }
  };

  async function onPlayerWon(msg) {
    console.log({ onPlayerWon: msg });
  }

  async function onAlienWon(msg) {
    console.log({ onAlienWon: msg });
  }

  async function updateLogs() {
    const logsUpdate = [];
  }

  const logsScreen = (
    <>
      <Card title="Logs/Stats">
        <List
          grid={{ gutter: 16, column: 2 }}
          dataSource={logs}
          style={{ overflowY: "auto", overflowX: "hidden", height: "400px" }}
          renderItem={item => <List.Item></List.Item>}
        />
      </Card>
    </>
  );

  return (
    <>
      <div>{logsScreen}</div>
    </>
  );
}
