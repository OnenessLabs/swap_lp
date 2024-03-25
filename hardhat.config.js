require ( "dotenv/config" )
//require("hardhat-deploy");
require("@nomicfoundation/hardhat-verify");
const { task } = require("hardhat/config");

require("@nomiclabs/hardhat-waffle");
require('@openzeppelin/hardhat-upgrades');
const { EVM_VERSION, SOLIDITY_VERSION } = require("@ericxstone/hardhat-blockscout-verify");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more


function accounts(){
  privatekey = process.env.PrivateKey
  return privatekey?[privatekey]:{
    mnemonic: 'test test test test test test test test test test test junk',
  }
}

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: true,
          },
        },
      },
      {
        version: "0.5.0",
        settings: {
          optimizer: {
            enabled: true,
          },
        },
      }
    ],
  },
  
  defaultNetwork: "hardhat",
  
  networks: {
    hardhat: {
    },
    localhost:{
      url: "http://127.0.0.1:8545",
      // accounts: accounts()
    },
    testnet: {
      url: "https://rpc.devnet.onenesslabs.io",
      gasPrice:0,
      accounts: accounts()
    },
    

  },
  etherscan: {
    apiKey:{testnet:"NA"},
    customChains: [
      {
        network: "testnet",
        chainId: 123666,
        urls: {
          apiURL: "https://scan.devnet.onenesslabs.io/api",
          browserURL: "https://scan.devnet.onenesslabs.io/",
        }
      }
    ]
  },
  blockscoutVerify: {
    blockscoutURL: "https://scan.devnet.onenesslabs.io/",
    contracts: {
      "OnenessLiquidityProvider": {
        compilerVersion: SOLIDITY_VERSION.SOLIDITY_V_8_4, // checkout enum SOLIDITY_VERSION
        optimization: true,
        evmVersion: EVM_VERSION.EVM_ISTANBUL, // checkout enum SOLIDITY_VERSION
        optimizationRuns: 200,
      }
      
    },
  },
};
