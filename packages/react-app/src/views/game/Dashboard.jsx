import React, { useEffect, useState, useContext } from "react";
import GContext from "../../GContext";
import "./dashboard.scss";

export default function Dashboard({ address, tx, contracts, provider }) {
    //Global use context
    const { state, dispatch } = useContext(GContext);

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

    //contract action
    async function joinRound(roundId) {
        const result = await tx(contracts.Player.joinGame(roundId), update => {
            if (update) {
                if (update.status === "confirmed" || update.status === 1) {
                    console.log("Player joined game");
                }
                if (update.events) {
                    console.log({ "event": update.events.length });
                    updatePlayerState();
                }
            }
        });
    }

    const dashboard_body = (
        <div className="dash-main">
            <div className="rounds">
                <div className="title">
                    Choose Round
                </div>
                <div className="roundsObj">
                    <div className="roundBox" onClick={() => joinRound(1)}>
                        Round 1
                    </div>
                    <div className="roundBox" onClick={() => joinRound(2)}>
                        Round 2
                    </div>
                    <div className="roundBox disabled">
                        Round 3
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {dashboard_body}
        </>
    )
}