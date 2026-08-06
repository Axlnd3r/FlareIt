/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      "@base-org/account": false,
      "@coinbase/wallet-sdk": false,
      "@metamask/connect-evm": false,
      "@safe-global/safe-apps-sdk": false,
      "@safe-global/safe-apps-provider": false,
      "@walletconnect/ethereum-provider": false,
      accounts: false,
    };

    config.externals.push({
      "@base-org/account": "commonjs @base-org/account",
      "@coinbase/wallet-sdk": "commonjs @coinbase/wallet-sdk",
      "@metamask/connect-evm": "commonjs @metamask/connect-evm",
      "@safe-global/safe-apps-sdk": "commonjs @safe-global/safe-apps-sdk",
      "@safe-global/safe-apps-provider": "commonjs @safe-global/safe-apps-provider",
      "@walletconnect/ethereum-provider": "commonjs @walletconnect/ethereum-provider",
      accounts: "commonjs accounts",
    });

    return config;
  },
};

export default nextConfig;
