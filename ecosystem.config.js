module.exports = {
  apps: [{
    name: 'metalvector',
    script: 'npm',
    args: 'start',
    cwd: '/home/ubuntu/company-analyzer',
    env: {
      NODE_ENV: 'production',
      GOOGLE_CLOUD_PROJECT: 'gen-lang-client-0523149055',
      GOOGLE_APPLICATION_CREDENTIALS: '/home/ubuntu/company-analyzer/gen-lang-client-0523149055-26537c6d784b.json'
    }
  }]
};
