/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
      APP_VERSION: require('./package.json').version,
  },
  rewrites() {
      return [
          {
              source: '/api/chatgpt-analysis',
              destination: '/edge-functions/chatgpt-analysis',
          },
      ];
  },
  // ... any other configurations
};

module.exports = nextConfig;
