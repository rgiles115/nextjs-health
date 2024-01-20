/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
      APP_VERSION: require('./package.json').version,
  },

  // ... any other configurations
};

module.exports = nextConfig;
