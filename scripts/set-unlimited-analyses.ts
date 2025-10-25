import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setUnlimitedAnalyses() {
  const userEmail = 'kosobokov90@yandex.ru';  // CORRECT EMAIL
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });
    
    if (!user) {
      console.log(`❌ User with email ${userEmail} not found`);
      return;
    }
    
    // Set to 999999 analyses (effectively unlimited)
    await prisma.user.update({
      where: { email: userEmail },
      data: { 
        analysesRemaining: 999999,
        plan: 'unlimited'
      }
    });
    
    console.log(`✅ User ${userEmail} now has unlimited analyses!`);
    console.log(`   Analyses remaining: 999999`);
    console.log(`   Plan: unlimited`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setUnlimitedAnalyses();


