// eslint-disable-next-line no-undef
module.exports = {
  apps: [
    {
      name: 'mongo-prod',
      script: './run-mongodb-prod',
      interpreter: '/bin/bash',
    },
    {
      name: 'node-aggregator',
      time: true,
      script: './dist/main.js',
      env: {
        DEBUG: 'poi:*',
        DEBUG_COLORS: true,
      },
    },
  ],
};
