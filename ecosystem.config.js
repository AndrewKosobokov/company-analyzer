module.exports = {
  apps: [
    {
      name: 'metalvector',
      script: 'node_modules/.bin/next',
args: 'start',
      env_production: {
        NODE_ENV: 'production',
        
        // Google Cloud Vertex AI
        GOOGLE_APPLICATION_CREDENTIALS: '/home/ubuntu/company-analyzer/gcp-service-account.json',
        GOOGLE_CLOUD_PROJECT: 'gen-lang-client-0523149055',
        VERTEX_AI_LOCATION: 'us-central1',
        
        // Database
        DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/company_analyzer?schema=public',
        
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
