import { sendEmail } from '@/utils/email';

export async function GET() {
  const result = await sendEmail({
    to: 'kosobokov90@yandex.ru', // Your admin email
    subject: 'Test Email',
    html: '<p>This is a test email from МеталлВектор</p>',
  });
  
  return Response.json(result);
}





