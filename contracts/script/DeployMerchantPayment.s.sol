// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Script, console } from "forge-std/Script.sol";
import { MerchantPayment } from "../src/MerchantPayment.sol";

/// @title DeployMerchantPayment — Deploy the FXRP merchant payment contract
///      forge script script/DeployMerchantPayment.s.sol --rpc-url coston2 --broadcast
contract DeployMerchantPayment is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address fxrpAddress = vm.envAddress("FXRP_ADDRESS");
        address deployer = vm.addr(deployerKey);

        console.log("Deploying MerchantPayment...");
        console.log("Deployer:", deployer);

        vm.startBroadcast(deployerKey);
        MerchantPayment merchantPayment = new MerchantPayment(fxrpAddress);
        vm.stopBroadcast();

        console.log("MerchantPayment deployed at:", address(merchantPayment));
    }
}
