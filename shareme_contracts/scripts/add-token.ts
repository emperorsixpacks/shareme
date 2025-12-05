import hre from "hardhat";
const { ethers, networkHelpers } = await hre.network.connect();



async function main() {
    const walletAddress = "0xd21771BeC484aE4b104311fF236220925245B421";
    if (!walletAddress) {
        console.error("Please set SMART_WALLET_ADDRESS in your .env file");
        process.exit(1);
    }

    const tokenAddress = "0x5425890298aed601595a70ab815c96711a31bc65";
    if (!tokenAddress) {
        console.error("Please provide the token address as an argument.");
        process.exit(1);
    }

    if (!ethers.isAddress(tokenAddress)) {
        console.error("Invalid token address provided.");
        process.exit(1);
    }

    const smartWallet = await ethers.getContractAt("SmartWallet", walletAddress);

    console.log(`Adding token ${tokenAddress} to allowed assets for wallet ${walletAddress}...`);

    const tx = await smartWallet.addAllowedAsset(tokenAddress);
    await tx.wait();

    console.log("Token added successfully!");
    console.log(`Transaction hash: ${tx.hash}`);

    const isAllowed = await smartWallet.allowedAssets(tokenAddress);
    if (isAllowed) {
        console.log(`Token ${tokenAddress} is now an allowed asset.`);
    } else {
        console.error(`Failed to add token ${tokenAddress} as an allowed asset.`);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
