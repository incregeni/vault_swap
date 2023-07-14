import { HardhatUserConfig, task, types } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-gas-reporter";
import "hardhat-abi-exporter";
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
require("dotenv").config();

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      // forking: {
      //   url: "https://goerli.infura.io/v3/afee43fb439a4e1794d9acad3e4a95b8",
      // }
      blockGasLimit: 3000000000,
    },
    bnb: {
      url: "https://bsc-mainnet.public.blastapi.io/",
      accounts: [],
    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/your-project-id",
      accounts: [],
    },
    mainnet: {
      url: "https://mainnet.infura.io/v3/your-project-id",
      accounts: [],
    },
    goerli: {
      url: "https://goerli.infura.io/v3/afee43fb439a4e1794d9acad3e4a95b8",
      accounts: [process.env.PRV_KEY],
    },
    sepolia: {
      url: "https://sepolia.infura.io/v3/afee43fb439a4e1794d9acad3e4a95b8",
      accounts: [process.env.PRV_KEY],
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.1",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.2",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  typechain: {
    outDir: "types",
    target: "ethers-v5",
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    gasPrice: 500 * Math.pow(10, 9),
  },
  plugins: ["@nomiclabs/hardhat-ethers", "hardhat-gas-reporter"],
  etherscan: {
    apiKey: "XEAWRP777XXMIXWWNN5TC8ZJJDN6XEZ76Q",
  },
};

export default config;
