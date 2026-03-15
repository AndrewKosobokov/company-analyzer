import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import prisma from '@/app/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  let browser;
  
  try {
    // Проверяем авторизацию
    const accessToken = request.cookies.get('access_token')?.value;
    const authHeader = request.headers.get('Authorization');
    
    let token = accessToken;
    if (!token && authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    // Декодируем токен
    const decoded = jwt.decode(token) as { userId: string } | null;
    if (!decoded || !decoded.userId) {
      return new NextResponse('Invalid token', { status: 401 });
    }
    
    // Получаем ID анализа
    const { searchParams } = new URL(request.url);
    const analysisId = searchParams.get('id');
    
    if (!analysisId) {
      return new NextResponse('Missing analysis ID', { status: 400 });
    }
    
    // Получаем анализ
    const analysis = await prisma.analysis.findUnique({
      where: { id: analysisId }
    });
    
    if (!analysis) {
      return new NextResponse('Analysis not found', { status: 404 });
    }
    
    // Проверяем что это анализ пользователя
    if (analysis.userId !== decoded.userId) {
      return new NextResponse('Forbidden', { status: 403 });
    }
    
    console.log('📄 Generating PDF for analysis:', analysisId);
    
    // Запускаем Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // Формируем полный URL страницы отчета
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const reportUrl = `${baseUrl}/report/${analysisId}`;
    
    console.log('🌐 Opening page:', reportUrl);
    
    // Устанавливаем cookie для авторизации
    await page.setCookie({
      name: 'access_token',
      value: token,
      domain: new URL(baseUrl).hostname,
      path: '/'
    });
    
    // Ждем только загрузки DOM (без networkidle0!)
    await page.goto(reportUrl, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    console.log('🌐 Page loaded, waiting for content rendering...');
    
    // Ждем пока клиентский JS отрендерит markdown
    await page.waitForSelector('#report-ready-marker', { 
      timeout: 10000 
    });
    
    console.log('✅ Content ready, generating PDF...');
    
    // Генерируем PDF с настройками печати
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '2cm',
        right: '1.5cm',
        bottom: '2cm',
        left: '1.5cm'
      },
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false
    });
    
    await browser.close();
    
    console.log('✅ PDF generated successfully');
    
    // Формируем имя файла
    const fileName = `${analysis.companyName || 'Отчет'}_${analysis.companyInn || ''}_${new Date().toISOString().split('T')[0]}.pdf`;
    const sanitizedFileName = fileName.replace(/[^a-zA-Zа-яА-ЯёЁ0-9_\-\.]/g, '_');
    
    // Возвращаем PDF
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(sanitizedFileName)}"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    });
    
  } catch (error) {
    console.error('❌ PDF generation error:', error);
    
    if (browser) {
      await browser.close();
    }
    
    return new NextResponse(
      JSON.stringify({ error: 'PDF generation failed', details: (error as Error).message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
