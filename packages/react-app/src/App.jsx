import WalletConnectProvider from "@walletconnect/web3-provider";
//import Torus from "@toruslabs/torus-embed"
import WalletLink from "walletlink";
import { Alert, Button, Col, Menu, Row } from "antd";
import "antd/dist/antd.css";
import React, { useCallback, useEffect, useState, useReducer, useMemo } from "react";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
import Web3Modal from "web3modal";
import "./App.css";
import { Account, Contract, Faucet, GasGauge, Header, Ramp, ThemeSwitch } from "./components";
import { INFURA_ID, NETWORK, NETWORKS } from "./constants";
import { Transactor } from "./helpers";
import {
    useBalance,
    useContractLoader,
    useContractReader,
    useEventListener,
    useExchangePrice,
    useGasPrice,
    useOnBlock,
    useUserSigner,
} from "./hooks";
// import Hints from "./Hints";
import { MVPUI, TreasureHuntUI, Hints, Subgraph, BadKidsTest, LootTest, CombatTest } from "./views";
import Portis from "@portis/web3";
import Fortmatic from "fortmatic";
import Authereum from "authereum";

const { ethers } = require("ethers");

const GContext = React.createContext();

// Coinbase walletLink init
const walletLink = new WalletLink({
    appName: "coinbase",
});

// WalletLink provider
const walletLinkProvider = walletLink.makeWeb3Provider(`https://mainnet.infura.io/v3/${INFURA_ID}`, 1);

// Portis ID: 6255fb2b-58c8-433b-a2c9-62098c05ddc9
/*
  Web3 modal helps us "connect" external wallets:
*/
const web3Modal = new Web3Modal({
    network: "mainnet", // Optional. If using WalletConnect on xDai, change network to "xdai" and add RPC info below for xDai chain.
    cacheProvider: true, // optional
    theme: "light", // optional. Change to "dark" for a dark theme.
    providerOptions: {
        walletconnect: {
            package: WalletConnectProvider, // required
            options: {
                bridge: "https://polygon.bridge.walletconnect.org",
                infuraId: INFURA_ID,
                rpc: {
                    1: `https://mainnet.infura.io/v3/${INFURA_ID}`, // mainnet // For more WalletConnect providers: https://docs.walletconnect.org/quick-start/dapps/web3-provider#required
                    42: `https://kovan.infura.io/v3/${INFURA_ID}`,
                    100: "https://dai.poa.network", // xDai
                },
            },
        },
        portis: {
            display: {
                logo: "https://user-images.githubusercontent.com/9419140/128913641-d025bc0c-e059-42de-a57b-422f196867ce.png",
                name: "Portis",
                description: "Connect to Portis App",
            },
            package: Portis,
            options: {
                id: "6255fb2b-58c8-433b-a2c9-62098c05ddc9",
            },
        },
        fortmatic: {
            package: Fortmatic, // required
            options: {
                key: "pk_live_5A7C91B2FC585A17", // required
            },
        },
        // torus: {
        //   package: Torus,
        //   options: {
        //     networkParams: {
        //       host: "https://localhost:8545", // optional
        //       chainId: 1337, // optional
        //       networkId: 1337 // optional
        //     },
        //     config: {
        //       buildEnv: "development" // optional
        //     },
        //   },
        // },
        "custom-walletlink": {
            display: {
                logo: "https://play-lh.googleusercontent.com/PjoJoG27miSglVBXoXrxBSLveV6e3EeBPpNY55aiUUBM9Q1RCETKCOqdOkX2ZydqVf0",
                name: "Coinbase",
                description: "Connect to Coinbase Wallet (not Coinbase App)",
            },
            package: walletLinkProvider,
            connector: async (provider, options) => {
                await provider.enable();
                return provider;
            },
        },
        authereum: {
            package: Authereum, // required
        },
    },
});

const targetNetwork = NETWORKS.localhost;
const NETWORKCHECK = true;

let localProvider = null;
if (targetNetwork.name == "localhost") {
    //Local provider
    const localProviderUrl = targetNetwork.rpcUrl;
    const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
    localProvider = new ethers.providers.StaticJsonRpcProvider(localProviderUrlFromEnv);
}
const blockExplorer = targetNetwork.blockExplorer;
const localChainId = localProvider && localProvider._network && localProvider._network.chainId;

const mainnetInfura = navigator.onLine
    ? new ethers.providers.StaticJsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_ID)
    : null;

function App(props) {
    const [route, setRoute] = useState();
    //Wallet provider
    const [injectedProvider, setInjectedProvider] = useState(null);
    const [address, setAddress] = useState();
    const [faucetClicked, setFaucetClicked] = useState(false);

    //Load contracts and signer
    const mainnetProvider = mainnetInfura;
    const userSigner = useUserSigner(injectedProvider, localProvider);
    const readContracts = useContractLoader(localProvider);
    const writeContracts = useContractLoader(userSigner, { chainId: localChainId });
    const gasPrice = useGasPrice(targetNetwork, "fast");
    const price = useExchangePrice(targetNetwork, mainnetProvider);
    const tx = Transactor(userSigner, gasPrice);
    const faucetTx = Transactor(localProvider, gasPrice);

    ///////////////////// Effects
    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        setRoute(window.location.pathname);
    }, [setRoute]);

    useEffect(() => {
        async function getAddress() {
            if (userSigner) {
                const newAddress = await userSigner.getAddress();
                setAddress(newAddress);
                console.log({ newAddress })
            }
        }
        getAddress();
    }, [userSigner]);

    ///////////////////// Functions
    const loadWeb3Modal = useCallback(async () => {
        console.log("loadWeb3Modal")
        // const provider = await web3Modal.connect();
    }, [setInjectedProvider]);

    function init() {
        loadWeb3Modal();
    }
    // const loadWeb3Modal = useCallback(async () => {
    //     console.log("loadWeb3Modal");
    // }, [setInjectedProvider]);

    //////////////////// Global context
    const initialState = {
        name: "Test",
        equippedGears: []
    }
    function globalReducer(state, action) {
        switch (action.type) {
            case 'setName': {
                return {
                    ...state,
                    [action.fieldName]: action.payload
                }
            }
            case 'setEquippedGears': {
                return {
                    ...state,
                    [action.fieldName]: action.payload
                }
            }
            default:
                break;
        }
    }
    const [state, dispatch] = useReducer(globalReducer, initialState);
    const contextValue = useMemo(() => {
        return { state, dispatch };
    }, [state, dispatch]);

    ////////////////////////// Methods
    function getDisplay() {

    }

    ////////////////////////// Render
    let networkDisplay = (
        <div style={{ zIndex: 0, position: "absolute", right: 154, top: 28, padding: 16, color: targetNetwork.color }}>
            {targetNetwork.name}
        </div>
    );

    let faucetHint = (
        <div style={{ padding: 16 }}>
            <Button
                type="primary"
                onClick={() => {
                    faucetTx({
                        to: address,
                        value: ethers.utils.parseEther("1"),
                    });
                    setFaucetClicked(true);
                }}
            >
                💰 Grab funds from the faucet ⛽️
            </Button>
        </div>
    );

    return (
        <GContext.Provider value={contextValue}>
            <div className="App">
                <Header />
                {networkDisplay}
                <BrowserRouter>
                    <Menu style={{ textAlign: "center" }} selectedKeys={[route]} mode="horizontal">
                        <Menu.Item key="/app">
                            <Link
                                onClick={() => {
                                    setRoute("/app");
                                }}
                                to="/app"
                            >
                                Game
                            </Link>
                        </Menu.Item>
                    </Menu>
                    <Switch>
                        <Route exact path="/app">
                            <MVPUI address={address} localProvider={localProvider} tx={tx} writeContracts={writeContracts} readContracts={readContracts} price={price} context={GContext} />
                        </Route>
                    </Switch>
                </BrowserRouter>
                <div style={{ position: "fixed", textAlign: "right", right: 0, top: 0, padding: 10 }}>
                    <Account
                        address={address}
                        localProvider={localProvider}
                        mainnetProvider={mainnetProvider}
                        blockExplorer={blockExplorer}
                    />
                    {faucetHint}
                </div>
                <div style={{ position: "fixed", textAlign: "left", left: 0, bottom: 20, padding: 10 }}>
                    <Row align="middle" gutter={[4, 4]}>
                        <Col span={24}>

                        </Col>
                    </Row>
                </div>
            </div>
        </GContext.Provider>
    )
}
export default App;
