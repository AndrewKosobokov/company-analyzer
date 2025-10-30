import { getEmailVerificationTemplate } from '@/utils/email';

export async function GET() {
  const testUrl = 'http://localhost:3000/verify-email?token=test123';
  const testEmail = 'test@example.com';
  
  const template = getEmailVerificationTemplate(testUrl, testEmail);
  
  return Response.json({
    success: true,
    template: {
      html: template.html,
      text: template.text
    }
  });
}


































