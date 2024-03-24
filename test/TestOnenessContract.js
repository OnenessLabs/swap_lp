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

  const usdcAddress = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
  const pairAddress = "0x0CADB198a6aa31f9C4A5ABA1a148E1051D5C9a53";
  const routerAddress = "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e";

let proxyAddress = "";
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

    await usdcToken.approve(proxy.address,ethers.utils.parseEther("1000000000000000"))
    allowanceVal = await usdcToken.allowance(owner.address,proxy.address)
    console.info("allowance val:",allowanceVal);
    await expect(proxy.addLiquidity(usdcAmount))
    .to.be.emit(proxy,"Approve")
    .to.be.emit(proxy,"AddLiquidity");


    ret = await pairContract.getReserves();
    console.info("pool:",ret)

    

  
  });


 
});