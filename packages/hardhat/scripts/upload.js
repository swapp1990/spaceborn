const fs = require("fs");

const ipfsAPI = require("ipfs-http-client");
const ipfs = ipfsAPI({
  host: "ipfs.infura.io",
  port: "5001",
  protocol: "https",
});

const main = async () => {
  let allAssets = {};
  console.log("\n\n Loading artwork.json...\n");
  const artwork = JSON.parse(fs.readFileSync("../../artwork.json").toString());
  for (let a in artwork) {
    console.log("  Uploading " + artwork[a].name + "...");
    const stringJSON = JSON.stringify(artwork[a]);
    const uploaded = await ipfs.add(stringJSON);
    allAssets[uploaded.path] = artwork[a];
  }
  const finalAssetFile = "export default" + JSON.stringify(allAssets) + "";
  fs.writeFileSync("../react-app/src/assets.js", finalAssetFile);
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
