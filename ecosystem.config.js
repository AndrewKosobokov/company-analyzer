module.exports = {
  apps: [
    {
      name: 'metalvector',
      script: 'npm',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',

        // Google Cloud Vertex AI
        GOOGLE_APPLICATION_CREDENTIALS: '/home/ubuntu/company-analyzer/gcp-service-account.json',
        GOOGLE_CLOUD_PROJECT: 'gen-lang-client-0523149055',
        VERTEX_AI_LOCATION: 'us-central1',

        // Database with connection pooling
        DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/company_analyzer?schema=public&connection_limit=5&pool_timeout=15&connect_timeout=10',

        // JWT Auth
        JWT_SECRET: 'oWGjukl2cP9I4OJEhpqDrt2AqnYKFWmH',

        // Application URLs
        NEXT_PUBLIC_APP_URL: 'https://metalvector.ru',
        NEXT_PUBLIC_URL: 'https://metalvector.ru',

        // ЮKassa (БОЕВЫЕ)
        YUKASSA_SHOP_ID: '1194930',
        YUKASSA_SECRET_KEY: 'live_EbHVPKVhREQ40yBV8gPNNMZlklVNy8NBIoSikbu_0K8',

        // VK WorkMail SMTP
        SMTP_HOST: 'smtp.mail.ru',
        SMTP_PORT: '465',
        SMTP_SECURE: 'true',
        SMTP_USER: 'noreply@metalvector.ru',
        SMTP_PASSWORD: 'SfQUnMj9MXacwyJ6BCT9',
        SMTP_FROM: '"МеталлВектор" <noreply@metalvector.ru>',
      }
    }
  ]
};
