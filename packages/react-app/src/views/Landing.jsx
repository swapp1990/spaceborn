import "./landing.scss";
export default function Landing() {
  const moveToSection = secName => {
    console.log(secName);
    const titleElement = document.getElementById(secName);
    // console.log(titleElement);
    titleElement.scrollIntoView({ behavior: "smooth" });
  };
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
  const Container = ({ children }) => {
    return (
      <div
        style={{
          position: "relative",
        }}
      >
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
          <button onClick={() => moveToSection("contact")}>Contact</button>
        </div>
      </div>
      <Container>
        <Box>
          <div className="header" id="home">
            <img src="/images/landing_bg.png"></img>
            <div className="titleWrapper">
              <div className="title">SPACEBORN</div>
              <div className="tagline">BUILD. PLAY. EARN</div>
              <div className="playBtn">
                <img src="/images/playGame.png"></img>
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
                Spaceborn is a collection of games developed by independant game developers using crypto-native game
                engine.
              </p>
              <p>Players earn token-generating interoperable NFTs which earn income for both players and developers.</p>
            </div>
          </div>
        </Box>
        <Box>
          <div className="gameFeats" id="about">
            <div className="points">
              <p>
                <b>Build:</b> Independant game developers and artists publish forkable games and royalty generating game
                assets using crypto-native game engine.
              </p>
              <p>
                <b>Play:</b> Players earn token-generating NFTs while playing published games which can be utilized as
                interoperable and composable in-game items. The NFTs have global health attached which decreases with
                more usage determined by the games, which reduces it's income generating capabilities.
              </p>
              <p>
                <b>Earn:</b> NFTs reward tokens to players who use it in different games which can accept them. Game
                developers also earn tokens based on the NFT usage they can create in their own games.
              </p>
              <p>
                <b>Competition:</b> Game developers are incentivized to create the most fun and unique experience for
                players holding various NFTs. Players indirectly curate the best games because of the usage of precious
                NFTs that they hold.
              </p>
            </div>
          </div>
        </Box>
        <Box>
          <div className="gameToken" id="token">
            <div className="tokenInfo">
              <div className="name">$MNGO</div>
              <div className="points">
                <p>Total Supply: 100 Million</p>
                <p>ERC-20 Token</p>
              </div>
            </div>
            <div className="tokenDist">
              <img src="/images/token_dist.png"></img>
            </div>
          </div>
        </Box>
        <Box>
          <div className="gameInfo">
            <div className="borderTitle">
              <div className="title">Game Engine</div>
              <img src="/images/borderLeft.svg"></img>
            </div>
            <div className="about">
              <div className="aboutSection">
                <div>
                  <p>
                    Crypto-native game engine that helps game developers not only easily create web3 ready game assets
                    which can be used anywhere, but use them to develop and publish games on our platform.
                  </p>
                  <p>
                    They can code rules to accept token-generating NFTs using this engine or develop their own special
                    NFTs which offer other tokens as well.
                  </p>
                  <p>
                    Web3 ready means they can follow certain standards decided by the community to make this game assets
                    interoperable and composable.
                  </p>
                </div>
              </div>
              <div className="aboutTitle">More Info</div>
            </div>
          </div>
        </Box>
        <Box height="80vh">
          <div className="gameSteps">
            <div className="titleBar">
              <div className="titleBg"></div>
              <div className="title">Genesis Event</div>
              <div className="titleBg flip"></div>
            </div>

            <div className="stepsWrapper">
              <div className="stepsMenu">
                <div className="stepId selected">01</div>
                <div className="stepId">01</div>
                <div className="stepId">01</div>
                <div className="stepId">01</div>
              </div>
              <div className="stepsContent">
                <div className="box">
                  <div className="imgCircle"></div>
                  <div className="boxText">
                    The first event launching soon on Polygon allows early players to earn the first 10000
                    token-generating NFTs which are Sci-fi Gears which will be interoperable and composable across the
                    subsequent games released on the platform.
                  </div>
                </div>
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
              <button>
                <img src="/images/twitter.png"></img>
              </button>
              <button>
                <img src="/images/telegram.png"></img>
              </button>
              <button>
                <img src="/images/discord.png"></img>
              </button>
            </div>
          </div>
        </Box>
      </Container>
    </div>
  );
}
