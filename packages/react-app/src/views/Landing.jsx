import { src } from "gulp";
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
            <div className="borderTitle">
              <div className="title">About the Game</div>
              <img src="/images/borderLeft.svg"></img>
            </div>
            <div className="gameText">
              Spaceborn is a collection of games created by the community of devs which utilizes player owned composable
              and interoperable NFTs which the players have earned by exploring the world.
            </div>
          </div>
        </Box>
        <Box>
          <div className="gameInfo">
            <div className="borderTitle">
              <div className="title">About the Game</div>
              <img src="/images/borderLeft.svg"></img>
            </div>
            <div className="about">
              <div className="aboutSection">
                <div>
                  <p>In Mirandus, players have absolute freedom of choice - there are no maps, no quest givers. </p>
                  <p>
                    Players can set out into the wilderness alone to try their fortunes against the monsters of the deep
                    woods and dungeons, join with one of the monarchs to serve as a knight in their court, or set up
                    shop in one of the five great citadels of the realm.
                  </p>
                  <p>
                    Players take on the role of avatars in the world, and if desired, can purchase an exemplar avatar
                    with powers and abilities beyond those of others in Mirandus.
                  </p>
                </div>
                <div>
                  <p>In Mirandus, players have absolute freedom of choice - there are no maps, no quest givers. </p>
                  <p>
                    Players can set out into the wilderness alone to try their fortunes against the monsters of the deep
                    woods and dungeons, join with one of the monarchs to serve as a knight in their court, or set up
                    shop in one of the five great citadels of the realm.
                  </p>
                  <p>
                    Players take on the role of avatars in the world, and if desired, can purchase an exemplar avatar
                    with powers and abilities beyond those of others in Mirandus.
                  </p>
                </div>
              </div>
              <div className="aboutTitle">
                In Mirandus, you decide who you will be and choose your own quest in the epic fight against evil.
              </div>
            </div>
          </div>
        </Box>
        <Box>
          <div className="gameInfo" id="features">
            <div className="borderTitle">
              <div className="title">Game Features</div>
              <img src="/images/borderRight.svg" className="imgRight"></img>
            </div>
          </div>
        </Box>
        <Box height="80vh">
          <div className="gameSteps">
            <div className="titleBar">
              <div className="titleBg"></div>
              <div className="title">How to Play</div>
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
                    Spaceborn is the first game using open-source game engine being built to create open, forkable smart
                    contracts enabling rapid development and experimentation when it comes to crypto-based next-gen
                    games. The first game lets you create a Player NFT and claim randomized & unique "loot" inspired
                    single gears which are minted and stored on blockchain and will be used throughout the Moonshot
                    Sci-fi
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Box>
        <Box height="50vh">
          <div className="contact" id="contact" style={{ backgroundImage: "url(" + "/images/footer_bg.png" + ")" }}>
            <div className="titleBar">
              <div className="titleBg"></div>
              <div className="title">Contact</div>
              <div className="titleBg flip"></div>
            </div>
            <div className="contactWrapper"></div>
          </div>
        </Box>
      </Container>
    </div>
  );
}
