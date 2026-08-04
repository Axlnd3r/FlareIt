// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IFAssetsFXRP — Minimal ERC-20 interface for FXRP token
/// @dev FXRP is an ERC-20 token on Flare. This interface covers methods used by SendContract.
interface IFAssetsFXRP {
    /// @notice Returns the FXRP balance of an account
    function balanceOf(address account) external view returns (uint256);

    /// @notice Transfer FXRP from caller to recipient
    function transfer(address to, uint256 amount) external returns (bool);

    /// @notice Returns the amount of FXRP the spender is allowed to spend on behalf of owner
    function allowance(address owner, address spender) external view returns (uint256);

    /// @notice Approve spender to spend amount of FXRP on behalf of caller
    function approve(address spender, uint256 amount) external returns (bool);

    /// @notice Transfer FXRP from a specified address to another (requires approval)
    function transferFrom(address from, address to, uint256 amount) external returns (bool);

    /// @notice Returns token decimals (FXRP has 6 decimals, matching XRP)
    function decimals() external view returns (uint8);

    /// @notice Returns token name
    function name() external view returns (string memory);

    /// @notice Returns token symbol
    function symbol() external view returns (string memory);

    /// @notice Returns total supply
    function totalSupply() external view returns (uint256);
}
