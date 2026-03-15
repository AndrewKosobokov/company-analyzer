/**
 * Оборачивает раздел "ИНФОРМАЦИЯ ДЛЯ ЗВОНКА" в HTML-блок для стилизации
 */
export function wrapCallInfoSection(markdown: string): string {
  if (!markdown) return '';

  // Регулярное выражение: 
  // 1. Ищет "## ИНФОРМАЦИЯ ДЛЯ ЗВОНКА" (нечувствительно к регистру)
  // 2. Захватывает всё ([\s\S]*?) до следующего заголовка 2-го уровня или конца документа
  const regex = /(##\s+ИНФОРМАЦИЯ ДЛЯ ЗВОНКА[\s\S]*?)(?=\n##\s|$)/i;

  return markdown.replace(regex, (match) => {
    // ВАЖНО: Пустые строки (\n\n) внутри div обязательны! 
    // Без них парсер react-markdown может не распознать markdown внутри HTML-тега.
    return `<div class="call-info-section">\n\n${match.trim()}\n\n</div>\n\n`;
  });
}
