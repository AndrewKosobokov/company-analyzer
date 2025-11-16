/**
 * Admin Override Script - Grant Unlimited Access
 * Updates kosobokovnsk@gmail.com to have unlimited analysis access
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function grantUnlimitedAccess() {
  const targetEmail = 'kosobokovnsk@gmail.com'
  
  try {
    console.log(`🔍 Searching for user: ${targetEmail}`)
    
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: targetEmail }
    })
    
    if (!user) {
      console.error(`❌ User not found: ${targetEmail}`)
      return
    }
    
    console.log(`✅ User found: ${user.name} (${user.email})`)
    console.log(`📊 Current plan: ${user.plan}`)
    console.log(`📊 Current analyses remaining: ${user.analysesRemaining}`)
    
    // Update user to unlimited plan
    const updatedUser = await prisma.user.update({
      where: { email: targetEmail },
      data: {
        plan: 'unlimited',
        analysesRemaining: 99999,
        requestsLimit: 99999,
        updatedAt: new Date()
      }
    })
    
    console.log(`🎉 SUCCESS: User updated to unlimited access`)
    console.log(`📊 New plan: ${updatedUser.plan}`)
    console.log(`📊 New analyses remaining: ${updatedUser.analysesRemaining}`)
    console.log(`📊 New requests limit: ${updatedUser.requestsLimit}`)
    console.log(`⏰ Updated at: ${updatedUser.updatedAt}`)
    
    // Log for audit purposes
    console.log(`📝 AUDIT LOG: Admin override applied to ${targetEmail} at ${new Date().toISOString()}`)
    
  } catch (error) {
    console.error('❌ Error updating user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
grantUnlimitedAccess()











































































