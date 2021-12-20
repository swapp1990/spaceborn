import React, { useEffect, useState, useContext } from "react";
import { Spin } from "antd";
import GContext from "../../helpers/GContext";
import "./dashboard.scss";

export default function Dashboard({ address, tx, contracts, provider }) {
    //Global use context
    const { state, dispatch } = useContext(GContext);

    const [loading, setLoading] = useState(false);
    const [rounds, setRounds] = useState([
        {
            id: 1, probOfGearsLost: 0, disabled: false
        },
        {
            id: 2, probOfGearsLost: 0, disabled: false
        },
        {
            id: 3, probOfGearsLost: 0, disabled: true
        }
    ]);
    const [showWelcome, setShowWelcome] = useState(false);

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        if (state.walletGearsCount) {
            console.log({ "wallet ": state.walletGearsCount });
            updateShowWelcome();
        }
    }, [state.walletGearsCount])

    function init() {
        let updatedRounds = rounds;
        rounds.forEach(async (r, i) => {
            const roundProb = await contracts.GameManager.getRoundLostProb(r.id);
            // console.log({ roundProb: roundProb.toNumber() });
            updatedRounds[i].probOfGearsLost = roundProb.toNumber();
        });
        setRounds(updatedRounds);
        // console.log("init");
        updateShowWelcome();
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

    function updateShowWelcome() {
        if (state.walletGearsCount == 0) {
            setShowWelcome(true);
        } else {
            setShowWelcome(false);
        }
    }

    //contract action
    async function joinRound(roundId) {
        setLoading(true);
        await tx(contracts.Player.joinGame(roundId), update => {
            if (update) {
                if (update.code) {
                    setLoading(false);
                }
                if (update.status === "confirmed" || update.status === 1) {
                    console.log("Player joined game");
                }
                if (update.events) {
                    console.log({ "event": update.events.length });
                    updatePlayerState();
                    setLoading(false);
                }
            }
        });
    }

    async function claimGear() {
        setLoading(true);
        await tx(contracts.GameManager.claimRandomGear(), update => {
            if (update) {
                // console.log({ update });
                if (update.code) {
                    setLoading(false);
                }
                if (update.status === "confirmed" || update.status === 1) {
                    console.log("Claimed free gear");
                    updateShowWelcome();
                }
                if (update.events) {
                    setLoading(false);
                    updateShowWelcome();
                }
            }
        });
    }

    const dashboard_body = (
        <>
            <div className="dash-main" style={{ backgroundImage: "url('/images/bg_alienworld3.png')" }}>
                {loading && <div className="loading-main">
                    <Spin size="large"></Spin></div>}
                {showWelcome && <div className="welcome">
                    <div className="title">Welcome!</div>
                    <div>
                        <button className="mint commonBtn" onClick={claimGear}>Claim free Gear NFT!</button>
                        <div className="note">98/100 available.</div>
                    </div>
                </div>}
                {!showWelcome && <div className="rounds">
                    <div className="title">
                        Choose Round
                    </div>
                    <div className="roundsObj">
                        {rounds.map((r, id) => (<div key={id} className={'roundBox ' + (r.disabled ? 'disabled' : '')} onClick={() => joinRound(r.id)}>
                            <div className="roundTitle">Round {r.id}</div>
                            <div className="roundDesc">Chance of losing gears: {r.probOfGearsLost}%</div>
                        </div>))}
                    </div>
                </div>}
            </div>
        </>
    );

    return (
        <>
            {dashboard_body}
        </>
    )
}