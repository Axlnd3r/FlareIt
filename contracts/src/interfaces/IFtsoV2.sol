// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IFtsoV2 — Minimal interface for FTSO v2 block-latency feeds
/// @dev Matches the interface used by ContractRegistry.getTestFtsoV2() on Coston2
interface IFtsoV2 {
    /// @notice Get the current feed value for a single feed ID
    /// @param _feedId 21-byte feed identifier (e.g. XRP/USD = 0x015852502f55534400000000000000000000000000)
    /// @return _value The feed value (scaled by 10^decimals)
    /// @return _decimals Number of decimal places for the value
    /// @return _timestamp Unix timestamp of when this feed was last updated
    function getFeedById(bytes21 _feedId)
        external
        view
        returns (uint256 _value, int8 _decimals, uint64 _timestamp);

    /// @notice Get the current feed value in wei (18 decimals) for a single feed ID
    /// @param _feedId 21-byte feed identifier
    /// @return _value Feed value scaled to 18 decimals (wei)
    /// @return _timestamp Unix timestamp of last update
    function getFeedByIdInWei(bytes21 _feedId)
        external
        view
        returns (uint256 _value, uint64 _timestamp);

    /// @notice Get multiple feed values in a single call
    /// @param _feedIds Array of 21-byte feed identifiers
    /// @return _values Array of feed values
    /// @return _decimals Array of decimals for each feed
    /// @return _timestamp Timestamp (same for all feeds in a batch)
    function getFeedsById(bytes21[] calldata _feedIds)
        external
        view
        returns (uint256[] memory _values, int8[] memory _decimals, uint64 _timestamp);
}
