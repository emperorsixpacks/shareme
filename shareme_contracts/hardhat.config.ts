import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import hardhatTypechain from "@nomicfoundation/hardhat-typechain";
import hardhatMocha from "@nomicfoundation/hardhat-mocha";
import hardhatEthersChaiMatchers from "@nomicfoundation/hardhat-ethers-chai-matchers";
import hardhatNetworkHelpers from "@nomicfoundation/hardhat-network-helpers";

import dotenv from "dotenv";

import { configVariable, defineConfig } from "hardhat/config";

dotenv.config();

export default defineConfig({
  plugins: [
    hardhatToolboxMochaEthers,
    hardhatEthers,
    hardhatTypechain,
    hardhatMocha,
    hardhatEthersChaiMatchers,
    hardhatNetworkHelpers,
  ],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    fuji: {
      url: process.env.RPC_URL || "",
      type: "http",
      chainId: 43113,
      accounts: process.env.AVALANCHE_PRIVATE_KEY
        ? [process.env.AVALANCHE_PRIVATE_KEY]
        : [],
    },
    avalanche: {
      url: process.env.RPC_URL || "",
      type: "http",
      chainId: 43114,
      accounts: process.env.AVALANCHE_PRIVATE_KEY
        ? [process.env.AVALANCHE_PRIVATE_KEY]
        : [],
    },
  },
});
