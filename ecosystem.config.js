module.exports = {
  apps: [{
    name: 'metalvector',
    script: 'npm',
    args: 'start',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    max_memory_restart: '800M',
    restart_delay: 5000,
    max_restarts: 10,
    min_uptime: '30s',
    kill_timeout: 10000,
    listen_timeout: 10000,
    env: {
      NODE_ENV: 'production',
    },
  }],
};
