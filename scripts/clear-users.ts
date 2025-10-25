import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearUsers() {
  try {
    // Delete all analyses first (foreign key constraint)
    const deletedAnalyses = await prisma.analysis.deleteMany({});
    console.log(`Deleted ${deletedAnalyses.count} analyses`);
    
    // Delete all users
    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`Deleted ${deletedUsers.count} users`);
    
    console.log('✅ Database cleared successfully!');
  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearUsers();

