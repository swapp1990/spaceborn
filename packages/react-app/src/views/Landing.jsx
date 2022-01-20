import React, { useEffect, useRef, useState } from "react";
import "./landing.scss";
export default function Landing() {
  const [genStep, setGenStep] = useState(1);

  const moveToSection = secName => {
    console.log(secName);
    const titleElement = document.getElementById(secName);
    // console.log(titleElement);
    titleElement.scrollIntoView({ behavior: "smooth" });
  };
  function changeStep(stepId) {
    console.log("changeStep ", stepId);
    setGenStep(stepId);
  }

  const Box = ({ height = "100vh", children }) => {
    let boxHeight = height ? height : "100vh";
    return (
      <div
        className="box"
        style={{
          height: boxHeight,
        }}
      >
        {children}
      </div>
    );
  };
  const SnapParent = React.forwardRef(({ ...props }, ref) => (
    <div ref={ref} {...props} className="snap-parent-y-mandatory">
      {props.children}
    </div>
  ));
  const Container = ({ children }) => {
    const ref = useRef();
    return (
      <div
        style={{
          position: "relative",
        }}
      >
        {/* <SnapParent
          ref={ref}
          style={{
            position: "absolute",
          }}
        ></SnapParent> */}
        {children}
      </div>
    );
  };
  return (
    <div className="landing_main">
      <div className="navigation">
        <div className="navLeft">
          <div className="title">Spaceborn</div>
        </div>
        <div className="navRight">
          <button onClick={() => moveToSection("home")}>Home</button>
          <button onClick={() => moveToSection("about")}>About</button>
          <button onClick={() => moveToSection("features")}>Features</button>
          <button onClick={() => moveToSection("genesis")}>Genesis</button>
          <button onClick={() => moveToSection("contact")}>Contact</button>
        </div>
      </div>
      <Container>
        <Box>
          <div className="header" id="home">
            <img src="/images/landing_bg.png"></img>
            <div className="titleWrapper">
              <div className="title">SPACEBORN</div>
              <div className="tagline">
                <div>BUILD.</div> <div>PLAY.</div> <div>EARN</div>
              </div>
              <div className="playBtn">
                <img src="/images/playGame.png" height={"80px"}></img>
              </div>
              <div className="scroll">
                <img src="/images/ellipsis.png"></img>
              </div>
            </div>
          </div>
        </Box>
        <Box>
          <div className="gameInfo" id="about">
            {/* <div className="borderTitle">
              <div className="title"></div>
              <img src="/images/borderLeft.svg"></img>
            </div> */}
            <div className="gameText">
              <p>
                Spaceborn is a platform for sci-fi-based games developed by game developers using crypto-native game
                engine.
              </p>
              <p>Players win token-generating interoperable NFTs which earn income for both players and developers.</p>
            </div>
            <div className="gameConcept">
              <img src="/images/bg_alienworld3.png" height={"80%"}></img>
            </div>
          </div>
        </Box>
        <Box>
          <div className="gameFeats" id="about">
            <div className="points">
              <div className="bullet">
                <div className="title">Build</div>
                <div className="desc">
                  Independant game developers and artists publish forkable games and royalty generating game assets
                  using crypto-native game engine.
                </div>
              </div>
              <div className="bullet">
                <div className="title">Play</div>
                <div className="desc">
                  Players earn token-generating NFTs while playing published games which can be utilized as
                  interoperable and composable in-game items. The NFTs have global health attached which decreases with
                  more usage determined by the games, which reduces it's income generating capabilities.
                </div>
              </div>
              <div className="bullet">
                <div className="title">Earn</div>
                <div className="desc">
                  NFTs reward ERC20 tokens to players who use it in different games which can accept them. Game
                  developers also earn tokens based on the NFT usage they can create in their own games.
                </div>
              </div>
              <div className="bullet">
                <div className="title">Competition</div>
                <div className="desc">
                  Game developers are incentivized to create the most fun and unique experience for players holding
                  various NFTs. Players indirectly curate the best games because of the usage of precious NFTs that they
                  hold.
                </div>
              </div>
            </div>
            <div className="frame">
              <img src="/images/bg_alienworld2.png" width={"80%"}></img>
            </div>
          </div>
        </Box>
        <Box>
          <div className="gameToken" id="token">
            <div className="titleBar">
              <div className="titleBg"></div>
              <div className="title">Token</div>
              <div className="titleBg flip"></div>
            </div>
            <div className="tokenWrapper">
              <div className="tokenInfo">
                <div className="name">MANGO ($MNGO)</div>
                <div className="points">
                  <p>Total Supply: 100 Million</p>
                  <p>ERC-20 Governance Token</p>
                </div>
              </div>
              <div className="tokenDist">
                <img src="/images/token_dist.png"></img>
              </div>
            </div>
          </div>
        </Box>
        <Box>
          <div className="gameEngine">
            <div className="titleBar">
              <div className="titleBg"></div>
              <div className="title">Game Engine</div>
              <div className="titleBg flip"></div>
            </div>
            <div className="engineWrapper">
              <div className="engineImg">
                <img src="/images/part.png" height={"80%"}></img>
              </div>
              <div className="engineDesc">
                <div className="enginePoints">
                  <div>
                    <p>
                      We are developing a crypto-native web3-ready game engine, that lets game developers develop and
                      publish games which uses blockchain.
                    </p>
                    <ul>
                      <li>
                        <span className="pink">Interop:</span> Mint game assets and componennts as NFTs on blockchain,
                        so they can be operated and used by other game devs in their own games.
                      </li>
                      <li>
                        <span className="pink">Royalty:</span> Encode royalty for your creation and earn income from the
                        profits.
                      </li>
                      <li>
                        <span className="pink">Standards:</span> Use popular standards created by the industry or set
                        your own standards for easy interoperability and composability for your assets across the
                        metaverse.
                      </li>
                      <li>
                        <span className="pink">Discovery:</span> Easy discovery and integration of game assets into any
                        game you develop right inside the game engine.
                      </li>
                    </ul>
                  </div>
                  <div className="engineMore">
                    <button className="basicBtn">Learn More</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Box>
        <Box height="80vh">
          <div className="gameSteps" id="genesis">
            <div className="titleBar">
              <div className="titleBg"></div>
              <div className="title">Genesis Event</div>
              <div className="titleBg flip"></div>
            </div>
            <div className="stepsWrapper">
              <div className="stepsMenu">
                <div className={"stepId " + (genStep == 1 ? "selected" : "")} onClick={() => changeStep(1)}>
                  NFT
                </div>
                <div className={"stepId " + (genStep == 2 ? "selected" : "")} onClick={() => changeStep(2)}>
                  02
                </div>
                <div className={"stepId " + (genStep == 3 ? "selected" : "")} onClick={() => changeStep(3)}>
                  03
                </div>
                <div className={"stepId " + (genStep == 4 ? "selected" : "")} onClick={() => changeStep(4)}>
                  04
                </div>
              </div>
              <div className="stepsContent">
                {genStep == 1 && (
                  <div className="box">
                    <div className="imgCircle"></div>
                    <div className="boxText">
                      The first event launching soon on Polygon allows early players to earn the first 10000
                      token-generating NFTs which are Sci-fi Gears which will be interoperable and composable across the
                      subsequent games released on the platform.
                    </div>
                  </div>
                )}
                {genStep == 2 && (
                  <div className="box">
                    <div className="imgCircle"></div>
                    <div className="boxText">
                      5% of the reserved tokens from the token rewards program will be distributed for the players who
                      play this game and utilize the NFTs that they earn playing the game.
                    </div>
                  </div>
                )}
                {genStep == 3 && (
                  <div className="box">
                    <div className="imgCircle"></div>
                    <div className="boxText">
                      The game lets players fight different aliens (each dropping a unique Scifi Gear on defeat) by
                      equipping maximum of 3 gears during each combat.
                    </div>
                  </div>
                )}
                {genStep == 4 && (
                  <div className="box">
                    <div className="imgCircle"></div>
                    <div className="boxText">
                      But be careful which Gears you choose, because that not only determines whether you win or lose
                      the battle, but if you lose the battle, you may lose your equipped gear permanently to the alien.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Box>
        <Box height="50vh">
          <div className="contact" id="contact">
            <div className="titleBar">
              <div className="titleBg"></div>
              <div className="title">Contact</div>
              <div className="titleBg flip"></div>
            </div>
            <div className="contactWrapper">
              <div className="contactIcon">
                <img src="/images/twitter.png"></img>
              </div>
              <div className="contactIcon">
                <img src="/images/telegram.png"></img>
              </div>
              <div className="contactIcon">
                <img src="/images/discord.png"></img>
              </div>
            </div>
          </div>
        </Box>
      </Container>
    </div>
  );
}
