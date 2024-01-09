/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = nextConfig

module.exports = {
    env: {
      APP_VERSION: require('./package.json').version,
    },
  };
  