async function main() {
    console.log("main")
    const MyContract = await ethers.getContractFactory("Alien");
    const alienContract = await MyContract.attach(
        "0x579f9528BEaF1e508E38D6bcccF71f2b0025a596" // The deployed contract address
    );
    let lastTokenId = await alienContract.lastTokenId();
    console.log({ lastTokenId: lastTokenId.toNumber() });
    let names = ["Allen", "Bernard", "Lucy", "Karen", "Chad", "Kevin", "Bob", "Camden", "Roger", "Sheryl"];
    let baseProbs = [10, 35, 95, 67, 89, 45, 22, 49, 76, 17];
    let dropGearRarity = [0, 0, 2, 0, 0, 0, 1, 1, 0, 0];
    await MyContract.mintMultipleAliens(names, baseProbs, dropGearRarity, 1);
    lastTokenId = await alienContract.lastTokenId();
    console.log({ lastTokenId: lastTokenId.toNumber() });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });