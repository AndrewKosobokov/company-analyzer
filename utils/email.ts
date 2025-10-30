import nodemailer from 'nodemailer';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Retry mechanism for email sending
async function sendEmailWithRetry(
  transporter: any,
  mailOptions: any,
  maxRetries: number = 3
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`\n📤 Email sending attempt ${attempt}/${maxRetries}...`);
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Success on attempt ${attempt}`);
      return { success: true, info };
    } catch (error: any) {
      console.error(`❌ Attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        console.error('🚫 All retry attempts exhausted');
        throw error;
      }
      
      // Ждём перед следующей попыткой (экспоненциальная задержка)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`⏳ Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  console.log('\n=== 📧 EMAIL VERIFICATION SENDING ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Recipient email:', to);
  console.log('Subject:', subject);
  console.log('HTML length:', html?.length || 0);
  console.log('Text length:', text?.length || 0);
  console.log('\nSMTP Configuration:');
  console.log('  Host:', process.env.SMTP_HOST);
  console.log('  Port:', process.env.SMTP_PORT);
  console.log('  User:', process.env.SMTP_USER);
  console.log('  From:', process.env.SMTP_FROM);
  console.log('  Password set:', process.env.SMTP_PASSWORD ? 'Yes ✓' : 'No ✗');
  console.log('  Password length:', process.env.SMTP_PASSWORD?.length || 0);
  console.log('  Secure:', process.env.SMTP_SECURE);

  try {
    console.log('\n📤 Attempting to send email...');
    const startTime = Date.now();
    
    const mailOptions = {
      from: process.env.SMTP_FROM || '"МеталлВектор" <noreply.vectorpro@gmail.com>',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };
    
    const result = await sendEmailWithRetry(transporter, mailOptions, 3);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('\n✅ EMAIL SENT SUCCESSFULLY!');
    console.log('Duration:', duration + 'ms');
    console.log('Message ID:', result?.info?.messageId);
    console.log('Response:', result?.info?.response);
    console.log('Accepted:', result?.info?.accepted);
    console.log('Rejected:', result?.info?.rejected);
    console.log('Pending:', result?.info?.pending);
    console.log('=== END EMAIL LOG ===\n');
    
    return { success: true, messageId: result?.info?.messageId };
    
  } catch (error: any) {
    console.error('\n❌ EMAIL SENDING FAILED!');
    console.error('Error Type:', error.constructor.name);
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    console.error('Command:', error.command);
    console.error('Response:', error.response);
    console.error('Response Code:', error.responseCode);
    console.error('Stack:', error.stack);
    console.error('=== END EMAIL LOG ===\n');
    
    return { success: false, error };
  }
}

// Template for password reset email
export function getPasswordResetEmailTemplate(resetUrl: string, email: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.6;
          color: #1d1d1f;
          background: #ffffff;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background: #ffffff;
          border: 1px solid #d2d2d7;
          border-radius: 12px;
          padding: 40px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .title {
          font-size: 28px;
          font-weight: 600;
          color: #1d1d1f;
          margin: 0 0 10px 0;
        }
        .subtitle {
          font-size: 16px;
          color: #6e6e73;
          margin: 0;
        }
        .content {
          margin: 30px 0;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background: #ffffff;
          color: #000000;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 500;
          margin: 20px 0;
          border: 2px solid #000000;
        }
        .button:hover {
          background: #000000;
          color: #ffffff;
        }
        .link {
          word-break: break-all;
          color: #6e6e73;
          font-size: 14px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #d2d2d7;
          font-size: 14px;
          color: #6e6e73;
          text-align: center;
        }
        .warning {
          background: #f5f5f7;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          font-size: 14px;
          color: #1d1d1f;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="title">Восстановление пароля</h1>
          <p class="subtitle">Металл Вектор</p>
        </div>
        
        <div class="content">
          <p>Здравствуйте,</p>
          <p>Вы запросили восстановление пароля для аккаунта <strong>${email}</strong></p>
          <p>Нажмите на кнопку ниже, чтобы создать новый пароль:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Восстановить пароль</a>
          </div>
          
          <p>Или скопируйте эту ссылку в браузер:</p>
          <p class="link">${resetUrl}</p>
          
          <div class="warning">
            <strong>⏱ Важно:</strong> Ссылка действительна в течение 1 часа.
          </div>
          
          <p>Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.</p>
        </div>
        
        <div class="footer">
          <p>С уважением,<br>Команда Металл Вектор</p>
          <p style="font-size: 12px; margin-top: 20px;">
            Это автоматическое письмо, пожалуйста, не отвечайте на него.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Восстановление пароля - Металл Вектор

Здравствуйте,

Вы запросили восстановление пароля для аккаунта ${email}

Перейдите по ссылке для создания нового пароля:
${resetUrl}

Ссылка действительна в течение 1 часа.

Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.

С уважением,
Команда Металл Вектор
  `.trim();

  return { html, text };
}

// Email verification template
export function getEmailVerificationTemplate(verificationUrl: string, email: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.6;
          color: #1d1d1f;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background: #ffffff;
          border: 1px solid #d2d2d7;
          border-radius: 12px;
          padding: 40px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .title {
          font-size: 28px;
          font-weight: 600;
          color: #1d1d1f;
          margin: 0 0 10px 0;
        }
        .subtitle {
          font-size: 16px;
          color: #6e6e73;
          margin: 0;
        }
        .content {
          margin: 30px 0;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background: #000000;
          color: #ffffff;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 500;
          margin: 20px 0;
        }
        .button:hover {
          background: #1d1d1f;
        }
        .link {
          word-break: break-all;
          color: #6e6e73;
          font-size: 14px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #d2d2d7;
          font-size: 14px;
          color: #6e6e73;
          text-align: center;
        }
        .warning {
          background: #f5f5f7;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          font-size: 14px;
          color: #1d1d1f;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="title">Подтверждение email</h1>
          <p class="subtitle">Металл Вектор</p>
        </div>
        
        <div class="content">
          <p>Добро пожаловать в Металл Вектор!</p>
          <p>Вы зарегистрировались с email: <strong>${email}</strong></p>
          <p>Для завершения регистрации подтвердите ваш email:</p>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Подтвердить email</a>
          </div>
          
          <p>Или скопируйте эту ссылку в браузер:</p>
          <p class="link">${verificationUrl}</p>
          
          <div class="warning">
            <strong>⏱ Важно:</strong> Ссылка действительна в течение 24 часов.
          </div>
          
          <p>Если вы не регистрировались на Металл Вектор, просто проигнорируйте это письмо.</p>
        </div>
        
        <div class="footer">
          <p>С уважением,<br>Команда Металл Вектор</p>
          <p style="font-size: 12px; margin-top: 20px;">
            Это автоматическое письмо, пожалуйста, не отвечайте на него.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Подтверждение email - Металл Вектор

Добро пожаловать в Металл Вектор!

Вы зарегистрировались с email: ${email}

Для завершения регистрации подтвердите ваш email:
${verificationUrl}

Ссылка действительна в течение 24 часов.

Если вы не регистрировались на Металл Вектор, просто проигнорируйте это письмо.

С уважением,
Команда Металл Вектор
  `.trim();

  return { html, text };
}
