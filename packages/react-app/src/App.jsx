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
import { WireframeUI, MVPUI, TreasureHuntUI, Hints, Subgraph, BadKidsTest, LootTest, CombatTest } from "./views";
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

const targetNetwork = NETWORKS.kovan;
const NETWORKCHECK = true;
let chainId = null;
const blockExplorer = targetNetwork.blockExplorer;

let localProvider = null;
async function setChainid() {
    const localProviderUrl = targetNetwork.rpcUrl;
    const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
    localProvider = new ethers.providers.StaticJsonRpcProvider(localProviderUrlFromEnv);
    await localProvider.getNetwork();
    chainId = localProvider && localProvider._network && localProvider._network.chainId;
}
console.log("NETWORK: ", targetNetwork.name)
if (targetNetwork.name == "localhost") {
    //Local provider
    setChainid();
}

const mainnetInfura = navigator.onLine
    ? new ethers.providers.StaticJsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_ID)
    : null;

function App(props) {
    const [route, setRoute] = useState();
    //Wallet provider
    const [injectedProvider, setInjectedProvider] = useState(null);
    const [provider, setProvider] = useState(localProvider);
    const [address, setAddress] = useState();
    const [faucetClicked, setFaucetClicked] = useState(false);
    const [networkSelected, setNetworkSelected] = useState();

    //Load contracts and signer
    const mainnetProvider = mainnetInfura;
    const userSigner = useUserSigner(injectedProvider, localProvider);
    const contracts = useContractLoader(userSigner, { chainId: chainId });
    // const contracts = useContractLoader(localProvider);
    const gasPrice = useGasPrice(targetNetwork, "fast");
    const price = useExchangePrice(targetNetwork, mainnetProvider);
    const tx = Transactor(userSigner, gasPrice);

    ///////////////////// Effects
    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        setRoute(window.location.pathname);
    }, [setRoute]);

    useEffect(() => {
        async function getNetwork() {
            if (userSigner) {
                if (targetNetwork.name != "localhost") {
                    const network = await userSigner.provider._networkPromise;
                    chainId = userSigner && userSigner.provider && userSigner.provider._network && userSigner.provider._network.chainId;
                    console.log(chainId);
                }
                const newAddress = await userSigner.getAddress();
                setAddress(newAddress);
                // console.log({ newAddress });
                setNetworkSelected(NETWORK(chainId));
            }
        }
        getNetwork();
    }, [userSigner]);

    useEffect(() => {
        if (injectedProvider) {
            // console.log(injectedProvider.network);
            setProvider(injectedProvider);
        }
    }, [injectedProvider])

    ///////////////////// Functions
    const loadWeb3Modal = useCallback(async () => {
        console.log("loadWeb3Modal")
        const provider = await web3Modal.connect();
        setInjectedProvider(new ethers.providers.Web3Provider(provider));
        provider.on("chainChanged", chainId => {
            console.log(`chain changed to ${chainId}! updating providers`);
            setInjectedProvider(new ethers.providers.Web3Provider(provider));
        });
    }, [setInjectedProvider]);

    function init() {
        if (targetNetwork.name != "localhost") {
            loadWeb3Modal();
        }
    }

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
    async function switchNetwork() {
        try {
            const ethereum = window.ethereum;
            let chainId = "0x" + targetNetwork.chainId.toString(16);
            await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: chainId }],
            });
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
                try {
                    await ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{ chainId: chainId, rpcUrl: 'https://...' }],
                    });
                } catch (addError) {
                    // handle "add" error
                }
            }
        }
    }

    ////////////////////////// Render
    let networkDisplay = "";
    // console.log({ chainId })
    if (chainId !== targetNetwork.chainId) {
        networkDisplay = (
            <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
                <Alert
                    message="⚠️ Wrong Network"
                    description={
                        <div>
                            You have <b>{networkSelected && networkSelected.name}</b> selected and you need to be on{" "}
                            <Button
                                onClick={() => switchNetwork()}>
                                <b>{targetNetwork && targetNetwork.name}</b>
                            </Button>
                        </div>
                    }
                    type="error"
                    closable={false}
                />
            </div>);
    } else {
        networkDisplay = (
            <div style={{ zIndex: 0, position: "absolute", right: 154, top: 28, padding: 16, color: targetNetwork.color }}>
                {targetNetwork.name}
            </div>
        );
    }

    let faucetHint = "";
    const faucetAvailable = localProvider && localProvider.connection && targetNetwork.name.indexOf("local") !== -1;
    if (faucetAvailable) {
        const faucetTx = Transactor(localProvider, gasPrice);
        faucetHint = (
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
    }

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
                        <Menu.Item key="/contract">
                            <Link
                                onClick={() => {
                                    setRoute("/contract");
                                }}
                                to="/contract"
                            >
                                Contract
                            </Link>
                        </Menu.Item>
                    </Menu>
                    <Switch>
                        <Route exact path="/app">
                            <WireframeUI />
                        </Route>
                        <Route path="/contract">
                            <Contract
                                name="Alien"
                                signer={userSigner}
                                provider={provider}
                                address={address}
                                blockExplorer={blockExplorer}
                            />
                        </Route>
                    </Switch>
                </BrowserRouter>
                <div style={{ position: "fixed", textAlign: "right", right: 0, top: 0, padding: 10 }}>
                    <Account
                        address={address}
                        provider={provider}
                        mainnetProvider={mainnetProvider}
                        blockExplorer={blockExplorer}
                        price={price}
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
