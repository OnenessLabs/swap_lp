const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { utils,strings,Wallet } = require("ethers");
// const { utils:web3utils } = require("web3");
// const { Personal,eth } = require("web3");
const { ethers } = require("hardhat");

const bn = ethers.BigNumber.from;

describe("oneness", function () {
  let proxy;
  let owner;
  let addrArray;

  const usdcAddress = "0x9BF054279893C80C84cd8C74C3be299BaB9C8a29";
  const pairAddress = "0x1bB36FD31bF42b9444f374FE621a2949b4c5e75b";
  const routerAddress = "0xb128A49f1382c942A5Ca3BDa7227cC464D2B08E0";

let proxyAddress = "0x1e0185888A29Dea2a8e34Cd073b2B6Bd25b45e95";
let usdcToken;

let pairContract;


  before(async function(){
    addrArray = await ethers.getSigners();
    // console.log(addrArray.length)
    owner = addrArray[0];

    
    console.log("owner", owner.address)

    
  })



  beforeEach(async function(){

    if(proxyAddress!=""){

      proxy = await ethers.getContractAt("OnenessLiquidityProvider",proxyAddress);
   
    }else{
    
      const oneness = await ethers.getContractFactory("OnenessLiquidityProvider")
      proxy = await upgrades.deployProxy(oneness,[usdcAddress,pairAddress,routerAddress]);
      proxy = await ethers.getContractAt("OnenessLiquidityProvider",proxy.address); 
      console.log("deploy proxy address:",proxy.address)
    }

    usdcToken = await ethers.getContractAt("contracts/interfaces/IERC20.sol:IERC20",usdcAddress)

    b = await usdcToken.balanceOf(owner.address)
    console.info("balance:",b);

    pairContract = await ethers.getContractAt("IPancakePair",pairAddress);
 
  })

  
  it("addLiquidity",async function(){
   
    usdcAmount = ethers.utils.parseEther("100").toBigInt();
    console.log(usdcAmount)

    const tx=await usdcToken.approve(proxy.address,ethers.utils.parseEther("1000000000000000"))
    await tx.wait();
    allowanceVal = await usdcToken.allowance(owner.address,proxy.address)
    console.info("allowance val:",allowanceVal);
    await expect(proxy.addLiquidity(usdcAmount))
    .to.be.emit(proxy,"Approve")
    .to.be.emit(proxy,"AddLiquidity");


    ret = await pairContract.getReserves();
    console.info("pool:",ret)

    

  
  });


 
});