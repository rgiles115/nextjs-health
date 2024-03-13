/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
      APP_VERSION: require('./package.json').version,
  },

  // ... any other configurations
};

module.exports = nextConfig;
