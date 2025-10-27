const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateTrialUsers() {
  try {
    console.log('🔍 Searching for trial users with less than 5 analyses...');
    
    // Find all users on trial plan with less than 5 analyses
    const trialUsers = await prisma.user.findMany({
      where: {
        plan: 'trial',
        analysesRemaining: {
          lt: 5
        }
      },
      select: {
        id: true,
        email: true,
        analysesRemaining: true
      }
    });

    console.log(`📊 Found ${trialUsers.length} trial users to update`);

    if (trialUsers.length === 0) {
      console.log('✅ No trial users need updating - all already have 5+ analyses');
      return;
    }

    // Update each user to have 5 analyses
    let updated = 0;
    for (const user of trialUsers) {
      await prisma.user.update({
        where: { id: user.id },
        data: { analysesRemaining: 5 }
      });
      console.log(`✅ Updated ${user.email}: ${user.analysesRemaining} → 5`);
      updated++;
    }

    console.log(`\n🎉 Successfully updated ${updated} trial users to 5 analyses!`);

  } catch (error) {
    console.error('❌ Error updating trial users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateTrialUsers();



















