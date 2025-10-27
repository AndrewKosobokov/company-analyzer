const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateTrialUsers() {
  try {
    console.log('🔍 Searching for trial users with less than 3 analyses...');
    
    // Find all users on trial plan with less than 3 analyses
    const trialUsers = await prisma.user.findMany({
      where: {
        plan: 'trial',
        analysesRemaining: {
          lt: 3
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
      console.log('✅ No trial users need updating - all already have 3+ analyses');
      return;
    }

    // Update each user to have 3 analyses
    let updated = 0;
    for (const user of trialUsers) {
      await prisma.user.update({
        where: { id: user.id },
        data: { analysesRemaining: 3 }
      });
      console.log(`✅ Updated ${user.email}: ${user.analysesRemaining} → 3`);
      updated++;
    }

    console.log(`\n🎉 Successfully updated ${updated} trial users to 3 analyses!`);

  } catch (error) {
    console.error('❌ Error updating trial users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateTrialUsers();





















