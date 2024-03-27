// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.4;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

import {IPancakePair} from "./interfaces/IPancakePair.sol";
import {IPancakeRouter02} from "./interfaces/IPancakeRouter02.sol";
import {Babylonian} from "./libraries/Babylonian.sol";
import "hardhat/console.sol";

contract OnenessStorage{

    address public usdcAddress;
    address public pairAddress;
    address public routerAddress;

    IPancakeRouter02 public pancakeRouter;

    uint256 public constant MINIMUM_AMOUNT = 1000;

    mapping(address => uint256) public userBalance;
    

}

contract OnenessLiquidityProvider is OwnableUpgradeable,OnenessStorage {

     uint256 public constant MAX_INT = 2**256 - 1;

    event AddLiquidity(uint256 lpReceived);

     function initialize (address _usdc,address _pair,address _router) public initializer {
        usdcAddress = _usdc;
        pairAddress = _pair;
        routerAddress = _router;

        pancakeRouter = IPancakeRouter02(routerAddress);

        // MINIMUM_AMOUNT
        __Ownable_init();
    }

    /*
     * @notice Calculate the swap amount to get the price at 50/50 split
     * @param _token0AmountIn: amount of token 0
     * @param _reserve0: amount in reserve for token0
     * @param _reserve1: amount in reserve for token1
     * @return amountToSwap: swapped amount (in token0)
     */
    function _calculateAmountToSwap(
        uint256 _token0AmountIn,
        uint256 _reserve0
    ) private view returns (uint256 amountToSwap) {
        amountToSwap =
            Math.sqrt(_reserve0*(_reserve0 + _token0AmountIn)) - _reserve0;
        console.log("amountToSwap",amountToSwap);
        return amountToSwap;
    }


    

   


    function addLiquidity( uint256 _usdcAmountIn) external returns (uint256 lpTokenReceived){
        
        address token0 = IPancakePair(pairAddress).token0();
        address token1 = IPancakePair(pairAddress).token1();

        require(usdcAddress == token0 || usdcAddress == token1, "Wrong tokens");
        address[] memory path = new address[](2);
        path[0] = usdcAddress;

        // Initiates an estimation to swap
        uint256 swapAmountIn;
        
        uint256 userTotalAmountIn = _usdcAmountIn + userBalance[msg.sender];

        console.log("user balance:",userBalance[msg.sender]," _amountIn:",_usdcAmountIn);
        console.log("total:",userTotalAmountIn);

        {
            // Convert to uint256 (from uint112)
            (uint256 reserveA, uint256 reserveB, ) = IPancakePair(pairAddress).getReserves();

            require((reserveA >= MINIMUM_AMOUNT) && (reserveB >= MINIMUM_AMOUNT), "Reserves too low");

            if (token0 == usdcAddress) {
                swapAmountIn = _calculateAmountToSwap(userTotalAmountIn, reserveA);
                path[1] = token1;
            } else {
                swapAmountIn = _calculateAmountToSwap(userTotalAmountIn, reserveB);
                path[1] = token0;
            }
        }
        _approveTokenIfNeeded(usdcAddress);
        
        IERC20(usdcAddress).transferFrom(address(msg.sender), address(this), _usdcAmountIn);
        console.log("transfrom usdc to",address(this)," usdcAmountIn:",_usdcAmountIn);
         // Approve token to zap if necessary
        
        uint256[] memory swapedAmounts = pancakeRouter.swapExactTokensForTokens(
            swapAmountIn,
            1,
            path,
            address(this),
            block.timestamp
        );
        console.log("swap usdc:",swapedAmounts[0],"token:",swapedAmounts[1]);
        // Approve other token if necessary
        if (token0 == usdcAddress) {
            _approveTokenIfNeeded(token1);
        } else {
            _approveTokenIfNeeded(token0);
        }

        // Add liquidity and retrieve the amount of LP received by the sender
        (uint256 amountA, uint256 amountB,uint256 lpTokenReceived ) = pancakeRouter.addLiquidity(
            path[0],
            path[1],
            userTotalAmountIn - swapedAmounts[0],
            swapedAmounts[1],
            1,
            1,
            address(msg.sender),
            block.timestamp
        );

        console.log("addLiquidity usdc:",(_usdcAmountIn - swapedAmounts[0])," token:",swapedAmounts[1]);
        console.log("lpReceived:",lpTokenReceived);

        uint256 remainUsdc = (userTotalAmountIn - swapedAmounts[0] - amountA);
        if(remainUsdc >0){
            userBalance[msg.sender] = remainUsdc;
        }
        
        emit AddLiquidity(lpTokenReceived);
        return lpTokenReceived;

    }

   
    /*
     * @notice Allows to zap a token in (e.g. token/other token)
     * @param _token: token address
     */
    function _approveTokenIfNeeded(address _token) private {
        if (IERC20(_token).allowance(address(this), routerAddress) < 1e18) {
            // Re-approve
            IERC20(_token).approve(routerAddress, MAX_INT);
        }
    }

    
}

