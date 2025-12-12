
import hre from "hardhat";
const { ethers } = hre;

async function main() {
  // --- CONFIGURATION ---
  const factoryAddress = "0x...";
  const walletAddress = "0xC19f768a7f77D93148d91a915c40980444D66339";
  const tokenAddress = "0x5425890298aed601595a70ab815c96711a31bc65";
  const amount = ethers.parseUnits("0.01", 6); 
  // --- END CONFIGURATION ---

  if (factoryAddress === "0x...") {
    console.error("Please replace '0x...' with the actual SmartWalletFactory contract address in the script.");
    process.exit(1);
  }

  console.log(`Attempting to call executeForwardTransfer on SmartWalletFactory at ${factoryAddress}`);
  console.log(`Target Wallet: ${walletAddress}`);
  console.log(`Token: ${tokenAddress}`);
  console.log(`Amount: ${ethers.formatUnits(amount, 18)}`);

  const [signer] = await ethers.getSigners();
  console.log(`Using signer (must be controller): ${signer.address}`);

  const SmartWalletFactory = await ethers.getContractFactory("SmartWalletFactory");
  const factory = SmartWalletFactory.attach(factoryAddress);

  try {
    const tx = await factory.executeForwardTransfer(walletAddress, tokenAddress, amount);
    console.log(`Transaction sent! Hash: ${tx.hash}`);
    await tx.wait();
    console.log("Transaction confirmed!");
  } catch (error) {
    console.error("Error calling executeForwardTransfer:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
