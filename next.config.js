const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Server Actions configuration
  experimental: {
    serverActions: {
      // Add any server actions configuration here
    }
  },
  webpack: (config, { isTurbopack }) => {
    if (!isTurbopack) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        dns: false,
        timers: require.resolve('timers-browserify'),
        'timers/promises': require.resolve('timers-browserify'),
        kerberos: false,
        '@mongodb-js/zstd': false,
        '@aws-sdk/credential-providers': false,
        'gcp-metadata': false,
        'snappy': false,
        'socks': false,
        'aws4': false,
        'mongodb-client-encryption': false
      };

      // Ignore MongoDB OIDC authentication code
      config.module.rules.push({
        test: /mongodb_oidc/,
        use: 'ignore-loader'
      });

      // Add CSS file resolution
      config.resolve.modules = [
        ...config.resolve.modules,
        path.resolve(__dirname, 'node_modules')
      ];
    }

    return config;
  }
};

module.exports = nextConfig;