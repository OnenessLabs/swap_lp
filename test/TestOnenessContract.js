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

  const token1Address = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
  const usdcAddress = "0x9BF054279893C80C84cd8C74C3be299BaB9C8a29";
  const pairAddress = "0x1bB36FD31bF42b9444f374FE621a2949b4c5e75b";
  const routerAddress = "0xb128A49f1382c942A5Ca3BDa7227cC464D2B08E0";

let proxyAddress = "0x154603a9e6Eadbc21cb20d621cf1d84A395A2eff";
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
    token1 =  await ethers.getContractAt("contracts/interfaces/IERC20.sol:IERC20",token1Address)

    b = await usdcToken.balanceOf(owner.address)
    console.info("balance:",b);

    pairContract = await ethers.getContractAt("IPancakePair",pairAddress);
 
  })


  it("addLiquidity",async function(){
   
    usdcAmount = ethers.utils.parseEther("10").toBigInt();
    console.log(usdcAmount)

    const tx=await usdcToken.approve(proxy.address,ethers.utils.parseEther("1000000000000000"))
    await tx.wait();
    allowanceVal = await usdcToken.allowance(owner.address,proxy.address)
    console.info("allowance val:",allowanceVal);


    ret = await pairContract.getReserves();
    console.info("price before:",ret[0]/ret[1])

    console.info("proxy token1 balance before addlp:",await token1.balanceOf(proxy.address));
    console.info("proxy usdc balance before addlp:",await usdcToken.balanceOf(proxy.address));

    await expect(proxy.addLiquidity(usdcAmount))
    .to.be.emit(proxy,"Approve")
    .to.be.emit(proxy,"AddLiquidity");

    console.info("proxy usdc balance after addlp:",(await usdcToken.balanceOf(proxy.address)).div(ethers.utils.parseEther("1").toBigInt()),"\t",await usdcToken.balanceOf(proxy.address));
    console.info("proxy token1 balance after addlp:",(await token1.balanceOf(proxy.address)).div(ethers.utils.parseEther("1").toBigInt()));

    ret = await pairContract.getReserves();
    console.info("price after:",ret[0]/ret[1])

    

  
  });


 
});