'use client';

import html2pdf from 'html2pdf.js';
import { asBlob } from 'html-docx-js-typescript';
import { saveAs } from 'file-saver';

// Convert Markdown to plain text for PDF/Word/TXT
function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.+?)\*/g, '$1') // Remove italic
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
    .replace(/`(.+?)`/g, '$1') // Remove code
    .replace(/^\s*[-*+]\s+/gm, '• ') // Convert lists to bullets
    .trim();
}

// Export to PDF with Cyrillic support
export async function exportToPDF(companyName: string, inn: string, reportText: string) {
  try {
    const element = document.createElement('div');
    const htmlContent = reportText
      .replace(/## (.+)/g, '<h2 style="font-size: 16pt; font-weight: bold; margin-top: 20px; margin-bottom: 10px; color: #1a1a1a;">$1</h2>')
      .replace(/### (.+)/g, '<h3 style="font-size: 13pt; font-weight: bold; margin-top: 15px; margin-bottom: 8px; color: #333;">$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^\s*[-*+]\s+(.+)$/gm, '<li style="margin-left: 20px; margin-bottom: 5px;">$1</li>')
      .replace(/\n\n/g, '</p><p style="margin: 8px 0; line-height: 1.5;">')
      .replace(/\n/g, '<br/>');
    
    element.innerHTML = `
      <div style="font-family: 'DejaVu Sans', Arial, sans-serif; padding: 20px; color: #1a1a1a; line-height: 1.6;">
        <h1 style="font-size: 20pt; font-weight: bold; margin-bottom: 20px; text-align: center; color: #000;">АНАЛИТИЧЕСКИЙ ОТЧЕТ</h1>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <p style="margin: 5px 0;"><strong>Компания:</strong> ${companyName}</p>
          <p style="margin: 5px 0;"><strong>ИНН:</strong> ${inn}</p>
          <p style="margin: 5px 0;"><strong>Дата:</strong> ${new Date().toLocaleDateString('ru-RU')}</p>
        </div>
        <hr style="border: none; border-top: 2px solid #ddd; margin: 20px 0;" />
        <div style="font-size: 10pt; line-height: 1.6;">
          <p style="margin: 8px 0; line-height: 1.5;">${htmlContent}</p>
        </div>
      </div>
    `;
    
    const opt = {
      margin: [10, 15, 10, 15] as [number, number, number, number],
      filename: `${companyName.substring(0, 30).replace(/[^a-zA-Zа-яА-Я0-9\s]/g, '_')}_отчет.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'mm' as const, 
        format: 'a4' as const, 
        orientation: 'portrait' as const,
        compress: true
      }
    };
    
    await html2pdf().set(opt).from(element).save();
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw new Error('Ошибка экспорта в PDF');
  }
}

// Export to Word
export async function exportToWord(companyName: string, inn: string, reportText: string) {
  try {
    const header = `
      <h1>АНАЛИТИЧЕСКИЙ ОТЧЕТ</h1>
      <p><strong>Компания:</strong> ${companyName}</p>
      <p><strong>ИНН:</strong> ${inn}</p>
      <p><strong>Дата:</strong> ${new Date().toLocaleDateString('ru-RU')}</p>
      <hr />
    `;
    
    const htmlContent = reportText
      .replace(/## (.+)/g, '<h2>$1</h2>')
      .replace(/### (.+)/g, '<h3>$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^\s*[-*+]\s+(.+)$/gm, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br/>');
    
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.6; }
            h1 { font-size: 18pt; font-weight: bold; }
            h2 { font-size: 14pt; font-weight: bold; margin-top: 20px; }
            h3 { font-size: 12pt; font-weight: bold; margin-top: 15px; }
            p { margin: 10px 0; }
            li { margin-left: 20px; }
          </style>
        </head>
        <body>
          ${header}
          <div>${htmlContent}</div>
        </body>
      </html>
    `;
    
    const result = await asBlob(fullHtml);
    const blob = result instanceof Blob 
      ? result 
      : new Blob([new Uint8Array(result as any)], { 
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
        });
    saveAs(blob, `${companyName.substring(0, 30)}_отчет.docx`);
  } catch (error) {
    console.error('Error exporting Word:', error);
    throw new Error('Ошибка экспорта в Word');
  }
}

// Share to Telegram
export function shareToTelegram(companyName: string, inn: string, reportText: string) {
  const plainText = markdownToPlainText(reportText);
  const message = `📊 АНАЛИТИЧЕСКИЙ ОТЧЕТ\n\n🏢 Компания: ${companyName}\n🔢 ИНН: ${inn}\n📅 Дата: ${new Date().toLocaleDateString('ru-RU')}\n\n${plainText.substring(0, 500)}...\n\n👉 Полный отчёт: ${window.location.href}`;
  const webUrl = `https://telegram.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(message)}`;
  const telegramApp = `tg://msg?text=${encodeURIComponent(message + '\n' + window.location.href)}`;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    window.location.href = telegramApp;
    setTimeout(() => {
      window.open(webUrl, '_blank');
    }, 1000);
  } else {
    window.open(webUrl, '_blank');
  }
}

// Share to WhatsApp
export function shareToWhatsApp(companyName: string, inn: string, reportText: string) {
  const plainText = markdownToPlainText(reportText);
  const message = `*АНАЛИТИЧЕСКИЙ ОТЧЕТ*\n\nКомпания: ${companyName}\nИНН: ${inn}\n\n${plainText.substring(0, 1500)}...\n\nПолный отчёт: ${window.location.href}`;
  const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

// Copy report text to clipboard
export async function copyToClipboard(reportText: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(reportText);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
}

// Export report as TXT file
export function exportToTXT(companyName: string, inn: string, reportText: string) {
  try {
    const header = `АНАЛИТИЧЕСКИЙ ОТЧЕТ\n\nКомпания: ${companyName}\nИНН: ${inn}\nДата: ${new Date().toLocaleDateString('ru-RU')}\n\n${'='.repeat(80)}\n\n`;
    const plainText = markdownToPlainText(reportText);
    const fullText = header + plainText;
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const filename = `${companyName.substring(0, 30).replace(/[^a-zA-Zа-яА-Я0-9]/g, '_')}_otchet.txt`;
    saveAs(blob, filename);
  } catch (error) {
    console.error('Error exporting TXT:', error);
    throw new Error('Ошибка экспорта в TXT');
  }
}

// Export Target Proposal to PDF
export async function exportTargetProposalToPDF(companyName: string, inn: string, proposalText: string) {
  try {
    const element = document.createElement('div');
    const htmlContent = proposalText
      .replace(/## (.+)/g, '<h2 style="font-size: 16pt; font-weight: bold; margin-top: 20px; margin-bottom: 10px; color: #1a1a1a;">$1</h2>')
      .replace(/### (.+)/g, '<h3 style="font-size: 13pt; font-weight: bold; margin-top: 15px; margin-bottom: 8px; color: #333;">$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^\s*[-*+]\s+(.+)$/gm, '<li style="margin-left: 20px; margin-bottom: 5px;">$1</li>')
      .replace(/\n\n/g, '</p><p style="margin: 8px 0; line-height: 1.5;">')
      .replace(/\n/g, '<br/>');
    
    element.innerHTML = `
      <div style="font-family: 'DejaVu Sans', Arial, sans-serif; padding: 20px; color: #1a1a1a; line-height: 1.6;">
        <h1 style="font-size: 20pt; font-weight: bold; margin-bottom: 20px; text-align: center; color: #000;">ЦЕЛЕВОЕ ПРЕДЛОЖЕНИЕ</h1>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <p style="margin: 5px 0;"><strong>Компания:</strong> ${companyName}</p>
          <p style="margin: 5px 0;"><strong>ИНН:</strong> ${inn}</p>
          <p style="margin: 5px 0;"><strong>Дата:</strong> ${new Date().toLocaleDateString('ru-RU')}</p>
        </div>
        <hr style="border: none; border-top: 2px solid #ddd; margin: 20px 0;" />
        <div style="font-size: 10pt; line-height: 1.6;">
          <p style="margin: 8px 0; line-height: 1.5;">${htmlContent}</p>
        </div>
      </div>
    `;
    
    const opt = {
      margin: [10, 15, 10, 15] as [number, number, number, number],
      filename: `целевое-предложение-${companyName.substring(0, 30).replace(/[^a-zA-Zа-яА-Я0-9\s]/g, '_')}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'mm' as const, 
        format: 'a4' as const, 
        orientation: 'portrait' as const,
        compress: true
      }
    };
    
    await html2pdf().set(opt).from(element).save();
  } catch (error) {
    console.error('Error exporting target proposal PDF:', error);
    throw new Error('Ошибка экспорта в PDF');
  }
}

// Export Target Proposal to Word
export async function exportTargetProposalToWord(companyName: string, inn: string, proposalText: string) {
  try {
    const header = `
      <h1>ЦЕЛЕВОЕ ПРЕДЛОЖЕНИЕ</h1>
      <p><strong>Компания:</strong> ${companyName}</p>
      <p><strong>ИНН:</strong> ${inn}</p>
      <p><strong>Дата:</strong> ${new Date().toLocaleDateString('ru-RU')}</p>
      <hr />
    `;
    
    const htmlContent = proposalText
      .replace(/## (.+)/g, '<h2>$1</h2>')
      .replace(/### (.+)/g, '<h3>$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^\s*[-*+]\s+(.+)$/gm, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br/>');
    
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.6; }
            h1 { font-size: 18pt; font-weight: bold; }
            h2 { font-size: 14pt; font-weight: bold; margin-top: 20px; }
            h3 { font-size: 12pt; font-weight: bold; margin-top: 15px; }
            p { margin: 8px 0; }
            li { margin: 4px 0; }
            hr { border: none; border-top: 1px solid #ccc; margin: 20px 0; }
          </style>
        </head>
        <body>
          ${header}
          <div>${htmlContent}</div>
        </body>
      </html>
    `;
    
    const blob = await asBlob(fullHtml, {
      orientation: 'portrait',
      margins: { top: 720, right: 720, bottom: 720, left: 720 }
    });
    
    saveAs(blob as Blob, `целевое-предложение-${companyName.replace(/[^a-zA-Zа-яА-Я0-9\s]/g, '_')}.docx`);
  } catch (error) {
    console.error('Error exporting target proposal Word:', error);
    throw new Error('Ошибка экспорта в Word');
  }
}


