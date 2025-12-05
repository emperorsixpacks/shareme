import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SmartWalletModule = buildModule("SmartWalletModule", (m) => {
  const platformWallet = m.getAccount(0);

  const smartWalletFactory = m.contract("SmartWalletFactory", [platformWallet]);

  return { smartWalletFactory };
});

export default SmartWalletModule;
