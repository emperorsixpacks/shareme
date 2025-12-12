import Onboard from "@web3-onboard/core";
import injectedWallets from "@web3-onboard/injected-wallets";
import walletConnectModule from "@web3-onboard/walletconnect";
import { writable } from "svelte/store";
import { ethers } from "ethers";
import shareme_logo from "$lib/assets/shareme_logo.svg";
import type { WalletState } from "@web3-onboard/core";

const injected = injectedWallets();
const walletConnect = walletConnectModule({
  projectId: "a9ff2e98b528494891ea5f4a15d04888",
});

const onboard = Onboard({
  wallets: [injected, walletConnect],
  chains: [
    {
      id: "0xa869",
      token: "AVAX",
      label: "Avalanche fuji",
      rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
    },
  ],
  appMetadata: {
    name: "ShareMe",
    icon: shareme_logo,
    logo: shareme_logo,
    description: "Share anything with anyone.",
  },
});

export const wallet = writable<WalletState | null>(null);
export const provider = writable<ethers.BrowserProvider | null>(null);
export const signer = writable<ethers.Signer | null>(null);

onboard.state.select("wallets").subscribe(async (wallets) => {
  if (wallets[0]) {
    if (wallets[0].chains[0].id !== "0xa869") {
      await onboard.setChain({ chainId: "0xa869" });
    }
    wallet.set(wallets[0]);
    const ethersProvider = new ethers.BrowserProvider(wallets[0].provider, {
      name: "Avalanche fuji",
      chainId: 43113,
    });
    provider.set(ethersProvider);
    ethersProvider.getSigner().then(signer.set);
  } else {
    wallet.set(null);
    provider.set(null);
    signer.set(null);
  }
});

export const connect = async () => {
  const wallets = await onboard.connectWallet();
  if (wallets[0]) {
    if (wallets[0].chains[0].id !== "0xa869") {
      await onboard.setChain({ chainId: "0xa869" });
    }
    wallet.set(wallets[0]);
    console.log(wallets);
    const ethersProvider = new ethers.BrowserProvider(wallets[0].provider, {
      name: "Avalanche fuji",
      chainId: 43113,
    });
    console.log(ethersProvider);
    provider.set(ethersProvider);
    signer.set(await ethersProvider.getSigner());
  }
};

export const disconnect = async () => {
  const [primaryWallet] = onboard.state.get().wallets;
  if (primaryWallet) {
    await onboard.disconnectWallet({ label: primaryWallet.label });
    wallet.set(null);
    provider.set(null);
    signer.set(null);
  }
};
