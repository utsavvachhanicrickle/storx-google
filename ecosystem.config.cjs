/** PM2 process file — run: pm2 start ecosystem.config.cjs */
module.exports = {
  apps: [
    {
      name: "cyberls-google",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
