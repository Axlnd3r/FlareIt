// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {QrisSettlement} from "../src/QrisSettlement.sol";

/// @title DeployQris — Deploy QrisSettlement add-on contract
/// @dev Run ONLY after Fase 3 MVP Core is fully working
///      forge script script/DeployQris.s.sol --rpc-url coston2 --broadcast
contract DeployQris is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);

        console.log("Deploying QrisSettlement...");
        console.log("Deployer:", deployer);

        vm.startBroadcast(deployerKey);
        QrisSettlement qris = new QrisSettlement();
        vm.stopBroadcast();

        console.log("QrisSettlement deployed at:", address(qris));
    }
}
