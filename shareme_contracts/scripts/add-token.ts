import hre from "hardhat";
const { ethers, networkHelpers } = await hre.network.connect();



async function main() {
    const walletAddress = "0xa9A5ccb6cd45451189A61F7c15ACb96a03e87D99";
    const tokenAddress = "0x5425890298aed601595a70ab815c96711a31bc65";

    const smartWallet = await ethers.getContractAt("SmartWalletFactory", walletAddress);

    console.log(`Adding token ${tokenAddress} to allowed assets for wallet ${walletAddress}...`);

    const tx = await smartWallet.addAllowedAsset(tokenAddress);
    await tx.wait();

    console.log("Token added successfully!");
    console.log(`Transaction hash: ${tx.hash}`);

    const isAllowed = await smartWallet.isAllowedAsset(tokenAddress);
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
