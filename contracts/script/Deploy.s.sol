// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Script, console } from "forge-std/Script.sol";
import { RateReader } from "../src/RateReader.sol";
import { SendContract } from "../src/SendContract.sol";
import { MerchantPayment } from "../src/MerchantPayment.sol";

/// @title Deploy — Deploy RateReader and SendContract to Flare Coston2
/// @dev Run with:
///   forge script script/Deploy.s.sol --rpc-url coston2 --broadcast --verify
///
/// Required env vars:
///   PRIVATE_KEY     — Deployer private key (without 0x prefix)
///   FXRP_ADDRESS    — FXRP ERC-20 token address on Coston2 (from faucet/docs)
///
/// Example:
///   $env:PRIVATE_KEY="your_private_key_here"
///   $env:FXRP_ADDRESS="0x..."
///   forge script script/Deploy.s.sol --rpc-url coston2 --broadcast -vvv
contract Deploy is Script {
    function run() external {
        // Load env vars
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address fxrpAddress = vm.envAddress("FXRP_ADDRESS");

        address deployer = vm.addr(deployerKey);

        console.log("==============================");
        console.log("FlareIt - Deploy Script");
        console.log("==============================");
        console.log("Network:   Flare Coston2 Testnet (Chain ID 114)");
        console.log("Deployer: ", deployer);
        console.log("FXRP addr:", fxrpAddress);
        console.log("------------------------------");

        vm.startBroadcast(deployerKey);

        // 1. Deploy RateReader
        RateReader rateReader = new RateReader();
        console.log("RateReader deployed at:", address(rateReader));

        // 2. Deploy SendContract (requires FXRP address)
        SendContract sendContract = new SendContract(fxrpAddress);
        console.log("SendContract deployed at:", address(sendContract));

        // 3. Deploy the on-chain FXRP merchant payment rail
        MerchantPayment merchantPayment = new MerchantPayment(fxrpAddress);
        console.log("MerchantPayment deployed at:", address(merchantPayment));

        vm.stopBroadcast();

        // 3. Print summary for ARCHITECTURE.md
        console.log("==============================");
        console.log("COPY THESE TO docs/ARCHITECTURE.md:");
        console.log("RateReader:   ", address(rateReader));
        console.log("SendContract: ", address(sendContract));
        console.log("MerchantPayment:", address(merchantPayment));
        console.log("FXRP Token:   ", fxrpAddress);
        console.log("Explorer:     https://coston2-explorer.flare.network");
        console.log("==============================");
    }
}
