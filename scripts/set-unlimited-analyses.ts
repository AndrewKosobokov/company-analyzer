import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env file
config({ path: resolve(process.cwd(), '.env') });

// If DATABASE_URL is not set and using SQLite, set default
if (!process.env.DATABASE_URL) {
  const fs = require('fs');
  const dbPath1 = resolve(process.cwd(), 'prisma', 'dev.db');
  const dbPath2 = resolve(process.cwd(), 'dev.db');
  
  if (fs.existsSync(dbPath1)) {
    process.env.DATABASE_URL = `file:${dbPath1}`;
  } else if (fs.existsSync(dbPath2)) {
    process.env.DATABASE_URL = `file:${dbPath2}`;
  } else {
    process.env.DATABASE_URL = `file:${dbPath1}`; // Default to prisma/dev.db
  }
  console.log(`📁 Using database: ${process.env.DATABASE_URL}`);
}

const prisma = new PrismaClient();

async function setUnlimitedAnalyses() {
  const userEmail = 'kosobokov90@yandex.ru';
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });
    
    if (!user) {
      console.log(`❌ User with email ${userEmail} not found`);
      return;
    }
    
    console.log(`📊 Current analyses remaining: ${user.analysesRemaining}`);
    
    // Set to 999 analyses
    await prisma.user.update({
      where: { email: userEmail },
      data: { 
        analysesRemaining: 999
      }
    });
    
    console.log(`✅ User ${userEmail} now has 999 analyses!`);
    console.log(`   Analyses remaining: 999`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setUnlimitedAnalyses();


