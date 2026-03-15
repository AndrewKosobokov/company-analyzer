import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const accessToken = request.cookies.get('access_token')?.value;
    const authHeader = request.headers.get('Authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const token = accessToken || headerToken;

    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Decode token
    const decoded = jwt.decode(token) as { userId: string };
    if (!decoded || !decoded.userId) {
      return new NextResponse('Invalid token', { status: 401 });
    }
    
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
    
    // Проверяем что пользователь владеет этим анализом или является админом
    if (analysis.userId !== decoded.userId) {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });
      
      if (!user || user.role !== 'admin') {
        return new NextResponse('Forbidden', { status: 403 });
      }
    }
    
    // Извлекаем правильное название компании из текста отчета
    function extractCompanyName(reportText: string): string {
      // Вариант 1: Ищем "**Компания:** Название"
      const companyMatch = reportText.match(/\*\*Компания:\*\*\s*([^\n*]+)/);
      if (companyMatch) {
        let name = companyMatch[1].trim();
        // Убираем markdown символы
        name = name.replace(/[\*_]/g, '').trim();
        // Убираем URL если есть (всё после http)
        name = name.replace(/\s*https?:\/\/[^\s]+/g, '').trim();
        if (name && name.length > 3) {
          return name;
        }
      }
      
      // Вариант 2: Ищем первый заголовок # в markdown
      const h1Match = reportText.match(/^#\s+([^\n]+)/m);
      if (h1Match) {
        let name = h1Match[1].trim();
        name = name.replace(/[\*_]/g, '').trim();
        if (name && name.length > 3) {
          return name;
        }
      }
      
      // Fallback: используем analysis.companyName
      return analysis.companyName || 'Компания';
    }
    
    const displayName = extractCompanyName(analysis.reportText);
    
    // Конвертируем Markdown в HTML
    const { marked } = await import('marked');
    let reportHtml = marked(analysis.reportText);
    
    // Оборачиваем желтый блок в таблицу для лучшей поддержки в Word
    // КРИТИЧНО: Используем HTML-атрибуты (cellpadding) для Word, CSS не работает!
    reportHtml = reportHtml.replace(
      /<div class="call-info-section">(.*?)<\/div>/gs,
      `<table width="100%" cellpadding="25" cellspacing="0" 
             style="background-color: #FFF9E6; border-collapse: collapse; margin: 30px 0;">
        <tr>
          <td style="background-color: #FFF9E6; border-left: 8px solid #FF9500; padding: 25px;">
            $1
          </td>
        </tr>
      </table>`
    );
    
    // Создаём полный HTML документ с стилями
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #1D1D1F;
          }
          
          h1 {
            font-size: 24pt;
            font-weight: 700;
            margin-bottom: 20pt;
          }
          
          h2 {
            font-size: 18pt;
            font-weight: 700;
            margin-top: 25pt;
            margin-bottom: 12pt;
          }
          
          h3 {
            font-size: 14pt;
            font-weight: 600;
            margin-top: 18pt;
            margin-bottom: 10pt;
          }
          
          /* Желтый блок - улучшенные стили для Word */
          .call-info-section {
            background-color: #FFF9E6;
            border: 3pt solid #FF9500;
            border-left: 8pt solid #FF9500;
            padding: 20pt;
            margin: 20pt 0;
          }
          
          p {
            margin: 10pt 0;
          }
          
          ul, ol {
            margin: 10pt 0;
            padding-left: 25pt;
          }
          
          li {
            margin: 5pt 0;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15pt 0;
          }
          
          th, td {
            padding: 8pt;
            border: 1pt solid #E5E5EA;
          }
          
          th {
            background-color: #F5F5F7;
            font-weight: 600;
          }
          
          strong {
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <!-- Обложка -->
        <div style="text-align: center; padding-top: 100pt;">
          <h1 style="font-size: 32pt; font-weight: 700; margin-bottom: 80pt; color: #1D1D1F;">
            АНАЛИТИЧЕСКИЙ ОТЧЁТ
          </h1>
          
          <p style="font-size: 24pt; font-weight: 600; margin-bottom: 40pt; color: #1D1D1F;">
            ${displayName}
          </p>
          
          ${analysis.companyInn ? `
            <p style="font-size: 14pt; color: #666; margin-bottom: 20pt;">
              ИНН: ${analysis.companyInn}
            </p>
          ` : ''}
          
          <p style="font-size: 12pt; color: #999; margin-bottom: 0;">
            ${new Date(analysis.createdAt).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>
        
        <!-- КРИТИЧНО: Специальный разрыв для Word -->
        <br clear="all" style="page-break-before: always;" />
        
        <!-- Основной контент -->
        ${reportHtml}
        
        <!-- Футер -->
        <div style="margin-top: 40pt; padding-top: 20pt; border-top: 1pt solid #E5E5EA; text-align: center; font-size: 9pt; color: #999;">
          Сгенерировано MetalVector.ru
        </div>
      </body>
      </html>
    `;
    
    // Конвертируем HTML в DOCX
    const HTMLtoDOCX = (await import('html-to-docx')).default;
    const docxBuffer = await HTMLtoDOCX(fullHtml, null, {
      table: { row: { cantSplit: true } },
      footer: true,
      pageNumber: true
    });
    
    // Возвращаем файл
    const sanitizedName = displayName.replace(/[^a-zA-Zа-яА-ЯёЁ0-9\s]/g, '').substring(0, 50);
    const fileName = `${sanitizedName}_${analysis.companyInn || 'report'}_${new Date().toISOString().split('T')[0]}.docx`;
    
    return new NextResponse(new Uint8Array(docxBuffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`
      }
    });
    
  } catch (error) {
    console.error('Word export error:', error);
    return new NextResponse('Export failed', { status: 500 });
  }
}
