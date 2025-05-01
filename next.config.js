module.exports = {
    reactStrictMode: true,
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.node = {
          fs: 'empty', // Solve fs issues for client-side
        }
      }
  
      console.log("Webpack Config:", config);
      return config;
    },
  };
  