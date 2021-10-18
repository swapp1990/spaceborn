import "./Home.css";
import React, { useEffect, useState } from "react";
import { Button } from "antd";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";
import { ReactComponent as Gear1 } from "./assets/loot1.svg";
import { ReactComponent as Gear2 } from "./assets/loot2.svg";
import { ReactComponent as Gear3 } from "./assets/loot3.svg";

export default function Home() {
  const [route, setRoute] = useState();
  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);
  return (
    <>
      <div className="menu">
        <div className="menuLeft">
          <a href="/">Home</a>
        </div>
        <div className="menuRight">
          <ul>
            <li>
              <a href="/faq">FAQ</a>
            </li>
            <li>
              <a href="/resources">Metaverse</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="home">
        <div className="symbols">
          <span style={{ fontSize: 50, color: "green" }}>ↈ</span>
          <span style={{ fontSize: 50, color: "red" }}>◈</span>
          <span style={{ fontSize: 50, color: "blue" }}>⚟</span>
        </div>
        <h1>Spaceborn</h1>
        <div>
          <Button type={"primary"}>
            <Link
              onClick={() => {
                setRoute("/app");
              }}
              to="/app"
            >
              ENTER GAME
            </Link>
          </Button>
        </div>
        <div>(Note: Currently the game is WIP and runs on Rinkeby testnet)</div>
        <div className="description">
          <p>
            <b>Spaceborn</b> is the first game using open-source game engine being built to create open, forkable smart
            contracts enabling rapid development and experimentation when it comes to crypto-based next-gen games. The
            first game lets you create a Player NFT and claim randomized & unique "loot" inspired single gears which are
            minted and stored on blockchain and will be used throughout the Moonshot Sci-fi Metaverse games created by
            devs from the open-source community.
          </p>
          <p className="warning">
            Moonshot Gears are not easy to mint. You need to play the game and win them. Careful! You might even lose
            your loot during your adventures if you don't take good care of them.
          </p>
        </div>
        <div className="subHeader">
          <a>
            <a href="https://opensea.io" target="_blank" rel="noopener noreferrer">
              Marketplace
            </a>
          </a>
          <a>
            <a href="https://t.me/joinchat/1jxXX8Fj6hwwZDgx" target="_blank" rel="noopener noreferrer">
              Telegram
            </a>
          </a>
          <a>
            Contract
            {/* <a
              href="https://arbiscan.io/address/0x991866c101521355153dec646a767246784c87af#code"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contract
            </a> */}
          </a>
        </div>
        <div className="examplesTitle">
          <span>Example Moonshot Gears</span>
        </div>
      </div>
      <div className="examples">
        <Gear1 />
        <Gear2 />
        <Gear3 />
      </div>
      <div className="firstGame">
        <div className="gameTitle">
          <span>Game #1</span>
        </div>
        <div className="gameDesc">
          <p>
            Playing the first game is the only way to get hold of this NFTs. The game is a combat game where you create
            a player NFT. You can only mint 1 player NFT per wallet. Each player you can attach a pfp collectible to the
            NFT. There will be 5 rounds of the game upon launch. Each round will unleash a set of aliens. You as a
            player will be fighting this aliens. If you kill the alien, the alien contract mints a random NFT out of
            10000 predetermined rarity levels and transfers it to your wallet. This NFT is then owned by you, and you
            can sell it on secondary market.
          </p>
          <p>
            Each round defeating aliens becomes harder, and they also drop more rarer gears. We have a game-master
            contract that controls the logic behind defeating aliens, which will change based on each round. Next round
            only begins once every alien in the previous round has been killed.
          </p>
          <p>
            What's unique about this game is that, you can equip the loot item you own in your wallet during combat.
            Depending on the loot item, the round you are playing and the kind of alien you decide to fight againts, the
            probability of the player winning the fight changes. And as each round progresses, the strategy to play the
            game becomes more complex and interesting.
          </p>
          <p>
            What happens to the Player NFT after the game is over? Player earns EXP points for playing the game,
            defeating aliens and earning loot. All this exp will be used by other games being developed and probably in
            games outside the metaverse too. You can also sell your player NFT in the market, build lore around it and
            create stories and narratives for your player character. All of this will be enabled by the contract from
            the very beginning, so expanding on the player character by the owner while they are exploring the metaverse
            becomes possible.
          </p>
          <p>
            What happens to the Gears NFT after the game is over? Gears NFT will also be used by other games. In some
            games, the gears NFT will be non-fungible, and will only enhance the game experience. In other games, the
            game might incentivize you to stake your NFT, which might permanently alter your in-game gear or even lose
            it to other players and enemies (like in a battle royale game).
          </p>
          <p>
            What happens to the Aliens after the game is over? All the dead aliens in the game maybe auctioned off in
            secondary sales to raise funds for the project. Maybe the community decides to revive them for another
            battle, if they possess some Gears which were obtained back from players during combat as a way for the
            players to earn them back.
          </p>
        </div>
      </div>
    </>
  );
}
