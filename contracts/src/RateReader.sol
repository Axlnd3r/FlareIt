// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IFtsoV2 } from "./interfaces/IFtsoV2.sol";

/// @title RateReader — Reads live XRP/USD price from FTSO v2 on Flare Coston2
/// @notice Provides real-time XRP/USD rate for FlareIt remittance application
/// @dev Uses ContractRegistry.getContractAddressByName("FtsoV2") to resolve
///      the FTSO v2 address dynamically. This pattern works on both testnet and mainnet.
///
///      IMPORTANT: USD/IDR is NOT available on FTSO v2. IDR conversion is handled
///      off-chain in the backend (CoinGecko API) and clearly labeled as such in the UI.
///      See docs/ARCHITECTURE.md for details on the hybrid rate strategy.
contract RateReader {
    // ─── Constants ────────────────────────────────────────────────────────────

    /// @notice FTSO v2 Feed ID for XRP/USD
    /// @dev Feed IDs: https://dev.flare.network/ftso/feeds
    ///      Format: 0x01 + hex("XRP/USD") padded to 21 bytes
    bytes21 public constant XRP_USD_FEED_ID = bytes21(0x015852502f55534400000000000000000000000000);

    /// @notice Staleness threshold — reject feeds older than 5 minutes
    uint64 public constant MAX_STALENESS_SECONDS = 300;

    /// @notice ContractRegistry address on Coston2 (official, from dev.flare.network)
    /// @dev Same address on Flare mainnet and all testnets
    address public constant CONTRACT_REGISTRY = 0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019;

    // ─── State ────────────────────────────────────────────────────────────────

    address public immutable owner;

    // ─── Errors ───────────────────────────────────────────────────────────────

    error StaleFeed(uint64 feedTimestamp, uint64 currentTime, uint64 maxStaleness);
    error InvalidPrice(uint256 price);
    error FtsoResolutionFailed();

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor() {
        owner = msg.sender;
    }

    // ─── Internal Helpers ─────────────────────────────────────────────────────

    /// @dev Resolve FtsoV2 address via ContractRegistry.getContractAddressByName("FtsoV2")
    ///      This is the correct pattern as documented at dev.flare.network
    function _getFtsoV2() internal view returns (IFtsoV2) {
        (bool success, bytes memory data) = CONTRACT_REGISTRY.staticcall(
            abi.encodeWithSignature("getContractAddressByName(string)", "FtsoV2")
        );
        if (!success || data.length == 0) revert FtsoResolutionFailed();
        address ftsoV2Address = abi.decode(data, (address));
        if (ftsoV2Address == address(0)) revert FtsoResolutionFailed();
        return IFtsoV2(ftsoV2Address);
    }

    // ─── Public View Functions ────────────────────────────────────────────────

    /// @notice Get the live XRP/USD price from FTSO v2
    /// @return price Raw price value
    /// @return decimals Number of decimal places (price / 10^decimals = USD value)
    /// @return timestamp Unix timestamp of this price update
    function getXrpUsdRate()
        external
        view
        returns (uint256 price, int8 decimals, uint64 timestamp)
    {
        IFtsoV2 ftso = _getFtsoV2();
        (price, decimals, timestamp) = ftso.getFeedById(XRP_USD_FEED_ID);

        if (price == 0) revert InvalidPrice(price);

        // forge-lint: disable-next-line(unsafe-typecast)
        uint64 currentTime = uint64(block.timestamp);
        if (timestamp < currentTime && currentTime - timestamp > MAX_STALENESS_SECONDS) {
            revert StaleFeed(timestamp, currentTime, MAX_STALENESS_SECONDS);
        }
    }

    /// @notice Get the live XRP/USD price scaled to 18 decimals (wei format)
    /// @return priceWei Price scaled to 18 decimals
    /// @return timestamp Unix timestamp of this price update
    function getXrpUsdRateWei() external view returns (uint256 priceWei, uint64 timestamp) {
        IFtsoV2 ftso = _getFtsoV2();
        (priceWei, timestamp) = ftso.getFeedByIdInWei(XRP_USD_FEED_ID);

        if (priceWei == 0) revert InvalidPrice(priceWei);

        // forge-lint: disable-next-line(unsafe-typecast)
        uint64 currentTime = uint64(block.timestamp);
        if (timestamp < currentTime && currentTime - timestamp > MAX_STALENESS_SECONDS) {
            revert StaleFeed(timestamp, currentTime, MAX_STALENESS_SECONDS);
        }
    }

    /// @notice Check if the XRP/USD feed is currently fresh
    /// @return isFresh True if feed is within MAX_STALENESS_SECONDS
    /// @return feedTimestamp The timestamp of the last feed update
    function isFeedFresh() external view returns (bool isFresh, uint64 feedTimestamp) {
        IFtsoV2 ftso = _getFtsoV2();
        // forge-lint: disable-next-line(unused-return)
        (,, feedTimestamp) = ftso.getFeedById(XRP_USD_FEED_ID);
        // forge-lint: disable-next-line(unsafe-typecast)
        uint64 currentTime = uint64(block.timestamp);
        isFresh =
        !(feedTimestamp < currentTime && currentTime - feedTimestamp > MAX_STALENESS_SECONDS);
    }

    /// @notice Returns the resolved FtsoV2 contract address (for transparency)
    function getFtsoV2Address() external view returns (address) {
        return address(_getFtsoV2());
    }
}
