
const hre = require("hardhat");

async function main() {
  const accounts = await hre.ethers.getSigners();
  const admin = accounts[0];
  console.log("admin",admin.address);

  if (false){
    await upgrade()
    return
  }

  // develop local
  // const usdcAddress = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
  // const pairAddress = "0x0CADB198a6aa31f9C4A5ABA1a148E1051D5C9a53";
  // const routerAddress = "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e";
  const liqProvider = await hre.ethers.getContractFactory("OnenessLiquidityProvider");

  const usdcAddress = "0x9BF054279893C80C84cd8C74C3be299BaB9C8a29";
  const pairAddress = "0x1bB36FD31bF42b9444f374FE621a2949b4c5e75b";
  const routerAddress = "0xb128A49f1382c942A5Ca3BDa7227cC464D2B08E0";
  const app = await upgrades.deployProxy(liqProvider,[usdcAddress,pairAddress,routerAddress]);
  
  console.log("OnenessLiquidityProvider address:", app.address);
  

}

async function upgrade(){
  const accounts = await hre.ethers.getSigners();
  const owner = accounts[0];
  console.log("owner", owner.address);

  const proxy_address = ""
  const lpProxy = await hre.ethers.getContractFactory("OnenessLiquidityProvider");
  let p = await upgrades.upgradeProxy(proxy_address, lpProxy)
  console.log("OnenessLiquidityProvider ", p.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
