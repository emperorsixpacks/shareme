import hre from "hardhat";
const { ethers, networkHelpers } = await hre.network.connect();


async function main() {
  const [sender] = await ethers.getSigners();
  const recipient = "0x597be907a4a3cb7b745a7ffcbe76c38f3caf18a3"; // TODO: replace with the recipient's address
  const amount = ethers.parseEther("3"); // TODO: replace with the amount of AVAX to send

  console.log(`Sending ${ethers.formatEther(amount)} AVAX from ${sender.address} to ${recipient}...`);

  const tx = await sender.sendTransaction({
    to: recipient,
    value: amount,
  });

  console.log(`Transaction sent! Hash: ${tx.hash}`);

  await tx.wait();

  console.log("Transaction confirmed!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
