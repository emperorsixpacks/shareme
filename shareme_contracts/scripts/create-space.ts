import hre from "hardhat";
const { ethers, networkHelpers } = await hre.network.connect();

async function main() {
  const [deployer] = await ethers.getSigners();
  const factoryAddress = "0x677577fE1b811D1B989F141fC0B9eb7c1e4a924d";
  const factory = await ethers.getContractAt(
    "SmartWalletFactory",
    factoryAddress
  );

  const spaceId = ethers.encodeBytes32String("ew-spc");

  console.log("Creating a new space...");
  const tx = await factory.createWallet(spaceId);
  const receipt = await tx.wait();
  const walletAddress = receipt.logs[0].args[1];

  console.log(`Space created!`);
  console.log(`  Wallet address: ${walletAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
