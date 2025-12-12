import hre from "hardhat";
import fs from "fs";
import path from "path";

const { ethers, networkHelpers } = await hre.network.connect();

async function main() {
  const tokenAddress = "0x5425890298aed601595a70ab815c96711a31bc65";

  if (!ethers.isAddress(tokenAddress)) {
    console.error("Invalid token address provided.");
    process.exit(1);
  }
  const [controller] = await ethers.getSigners();
  console.log(`Using controller account: ${controller.address}`);

  const factory = await ethers.getContractAt(
    "SmartWalletFactory",
    "0xa9A5ccb6cd45451189A61F7c15ACb96a03e87D99",
    controller
  );

  console.log(`Adding token ${tokenAddress} to allowed assets...`);

  const tx = await factory.addAllowedAsset(tokenAddress);
  await tx.wait();

  console.log("Token added successfully!");
  console.log(`Transaction hash: ${tx.hash}`);

  const isAllowed = await factory.isAllowedAsset(tokenAddress);
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
