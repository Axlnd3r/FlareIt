/** @type {import('next').NextConfig} */
const backendHostPort = process.env.BACKEND_HOSTPORT?.replace(/^https?:\/\//, "").replace(/\/$/, "");
const backendOrigin = process.env.BACKEND_ORIGIN || (backendHostPort ? `http://${backendHostPort}` : "http://127.0.0.1:3001");

const nextConfig = {
  // Allow CI/release builds to run without colliding with a local dev server.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  experimental: {
    // viem and wagmi expose large module barrels. Import only the modules used
    // by the app so production builds do not compile every optional chain.
    optimizePackageImports: ["viem", "wagmi"],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
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
