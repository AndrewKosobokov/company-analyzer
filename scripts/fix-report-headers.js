const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixHeaders() {
  console.log('🔍 Searching for reports with old headers...');
  
  const analyses = await prisma.analysis.findMany({
    where: { 
      isDeleted: false,
      reportText: {
        not: null
      }
    }
  });

  console.log(`📊 Found ${analyses.length} reports to check`);

  let updated = 0;

  for (const analysis of analyses) {
    let reportText = analysis.reportText;
    let hasChanges = false;
    
    // Fix headers - remove parenthetical text
    const oldText1 = 'Выявление Высокомаржинальных и Редких Позиций (Ключевой Пункт)';
    const newText1 = 'Выявление Высокомаржинальных и Редких Позиций';
    if (reportText.includes(oldText1)) {
      reportText = reportText.replace(new RegExp(oldText1.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newText1);
      hasChanges = true;
    }
    
    const oldText2 = 'Анализ Закупочной Деятельности (Профиль Снабжения)';
    const newText2 = 'Анализ Закупочной Деятельности';
    if (reportText.includes(oldText2)) {
      reportText = reportText.replace(new RegExp(oldText2.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newText2);
      hasChanges = true;
    }
    
    const oldText3 = 'Инсайты и Стратегия Взаимодействия (Для Менеджера по Продажам)';
    const newText3 = 'Инсайты и Стратегия Взаимодействия';
    if (reportText.includes(oldText3)) {
      reportText = reportText.replace(new RegExp(oldText3.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newText3);
      hasChanges = true;
    }
    
    // Fix "Закуп" to "Закупки" in TOC or navigation
    // Only replace standalone "Закуп" not "Закупочной" or "Закупок"
    if (reportText.includes('Закуп') && !reportText.includes('Закупочной') && !reportText.includes('Закупок')) {
      reportText = reportText.replace(/\bЗакуп\b/g, 'Закупки');
      hasChanges = true;
    }
    
    if (hasChanges) {
      await prisma.analysis.update({
        where: { id: analysis.id },
        data: { reportText }
      });
      
      console.log(`✅ Updated report: ${analysis.companyName} (ID: ${analysis.id})`);
      updated++;
    }
  }

  console.log(`\n📈 Results:`);
  console.log(`✅ Updated: ${updated} reports`);
  console.log(`📊 Total checked: ${analyses.length} reports`);
  
  if (updated === 0) {
    console.log('🎉 No reports needed updating - all headers are already clean!');
  }

  await prisma.$disconnect();
}

fixHeaders().catch(console.error);



































