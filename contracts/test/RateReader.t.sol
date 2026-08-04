// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {RateReader} from "../src/RateReader.sol";

/// @title RateReader Tests — Fork Coston2 to validate live FTSO v2 feed
/// @dev Run with:
///   forge test --match-contract RateReaderTest --fork-url https://coston2-api.flare.network/ext/C/rpc -v
///
/// FtsoV2 address on Coston2 (resolved via ContractRegistry):
///   0xC4e9c78EA53db782E28f28Fdf80BaF59336B304d
///
/// Verified via:
///   cast call 0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019 \
///     "getContractAddressByName(string)(address)" "FtsoV2" \
///     --rpc-url https://coston2-api.flare.network/ext/C/rpc
///   => 0xC4e9c78EA53db782E28f28Fdf80BaF59336B304d
contract RateReaderTest is Test {
    RateReader public rateReader;

    // Known FtsoV2 address on Coston2 (verified via ContractRegistry call)
    address constant FTSO_V2_COSTON2 = 0xC4e9c78EA53db782E28f28Fdf80BaF59336B304d;

    function setUp() public {
        rateReader = new RateReader();
    }

    // ─── Registry Resolution ──────────────────────────────────────────────────

    /// @notice Test that ContractRegistry resolves FtsoV2 to the known address
    function test_getFtsoV2Address_matchesKnownAddress() public {
        address resolved = rateReader.getFtsoV2Address();
        console.log("Resolved FtsoV2 address:", resolved);
        assertEq(resolved, FTSO_V2_COSTON2, "FtsoV2 address should match known Coston2 address");
    }

    // ─── XRP/USD Feed Tests ───────────────────────────────────────────────────

    /// @notice Test that XRP/USD price is non-zero and reasonable
    function test_getXrpUsdRate_returnsNonZeroPrice() public {
        (uint256 price, int8 decimals, uint64 timestamp) = rateReader.getXrpUsdRate();

        console.log("XRP/USD raw price:", price);
        console.log("Decimals:", vm.toString(uint256(uint8(decimals))));
        console.log("Timestamp:", timestamp);
        console.log("Block timestamp:", block.timestamp);

        // Price must be non-zero
        assertGt(price, 0, "XRP/USD price should be non-zero");

        // Timestamp should be recent
        assertGt(timestamp, 0, "Timestamp should be non-zero");

        // Feed should be fresh (within 10 minutes at time of test)
        uint64 age = timestamp < uint64(block.timestamp)
            ? uint64(block.timestamp) - timestamp
            : 0;
        console.log("Feed age (seconds):", age);
        assertLt(age, 600, "Feed should be updated within 10 minutes");

        // XRP price sanity check with decimals=6: price/1e6 should be $0.01 - $1000
        if (decimals == 6) {
            assertGt(price, 10000, "XRP price < $0.01 seems too low");        // > $0.01
            assertLt(price, 1000_000_000, "XRP price > $1000 seems too high"); // < $1000
        }
    }

    /// @notice Test wei-format rate function
    function test_getXrpUsdRateWei_returnsValidWeiPrice() public {
        (uint256 priceWei, uint64 timestamp) = rateReader.getXrpUsdRateWei();

        console.log("XRP/USD priceWei:", priceWei);
        console.log("Timestamp:", timestamp);

        assertGt(priceWei, 0, "XRP/USD priceWei should be non-zero");

        // priceWei in 18-decimal format: XRP should be $0.01 - $1000
        assertGt(priceWei, 1e16, "XRP price too low (< $0.01)");   // 0.01 * 1e18
        assertLt(priceWei, 1000e18, "XRP price too high (> $1000)");
    }

    /// @notice Test that the feed is currently fresh
    function test_isFeedFresh_returnsTrue() public {
        (bool isFresh, uint64 feedTimestamp) = rateReader.isFeedFresh();

        console.log("Feed is fresh:", isFresh ? "YES" : "NO");
        console.log("Feed timestamp:", feedTimestamp);

        assertTrue(isFresh, "XRP/USD feed should be fresh on a live Coston2 fork");
    }

    /// @notice Test feed constants are correct
    function test_xrpUsdFeedId_isCorrect() public view {
        bytes21 expectedFeedId = bytes21(0x015852502f55534400000000000000000000000000);
        assertEq(
            rateReader.XRP_USD_FEED_ID(),
            expectedFeedId,
            "XRP/USD feed ID mismatch"
        );
    }

    /// @notice Test max staleness constant
    function test_maxStaleness_is5Minutes() public view {
        assertEq(rateReader.MAX_STALENESS_SECONDS(), 300, "Max staleness should be 300s");
    }

    /// @notice Test staleness check: verify MAX_STALENESS_SECONDS is correctly set
    /// @dev Note: In a live fork, FTSO continues to update so vm.warp alone cannot
    ///      simulate a stale feed. We test the constant and logic separately.
    ///      The actual staleness revert is tested in unit tests with a mock FTSO.
    function test_stalenessBoundary_constantIsCorrect() public view {
        // Verify the threshold is set to 5 minutes (300 seconds)
        assertEq(rateReader.MAX_STALENESS_SECONDS(), 300, "Staleness threshold should be 5 minutes");

        // Verify the feed is currently fresh (age < 300 seconds)
        (, , uint64 feedTimestamp) = rateReader.getXrpUsdRate();
        uint64 age = feedTimestamp < uint64(block.timestamp)
            ? uint64(block.timestamp) - feedTimestamp
            : 0;
        assertLt(age, 300, "Live feed age should be within staleness window");
        console.log("Current feed age:", age, "seconds (< 300 is fresh)");
    }


    /// @notice Test getFtsoV2Address returns non-zero address
    function test_getFtsoV2Address_nonZero() public {
        address ftsoAddr = rateReader.getFtsoV2Address();
        console.log("FtsoV2 address:", ftsoAddr);
        assertTrue(ftsoAddr != address(0), "FtsoV2 address should not be zero");
    }
}
