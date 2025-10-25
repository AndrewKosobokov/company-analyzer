import { NextResponse } from 'next/server'
import { verifyAuth } from '@/app/lib/auth'
import prisma from '@/app/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const authPayload = verifyAuth(req)
    
    if (!authPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = authPayload.userId

    // Fetch all reports for the authenticated user
    const reports = await prisma.analysis.findMany({
      where: {
        userId: userId,
        isDeleted: false // Only show non-deleted reports
      },
      select: {
        id: true,
        companyName: true,
        companyInn: true,
        createdAt: true,
        isDeleted: true,
      },
      orderBy: {
        createdAt: 'desc' // Most recent first
      }
    })

    // Transform data for frontend consumption
    const archiveData = reports.map((report: any) => ({
      reportId: report.id,
      companyName: report.companyName,
      companyInn: report.companyInn,
      creationDate: report.createdAt,
      isDeleted: report.isDeleted
    }))

    return NextResponse.json({
      reports: archiveData,
      totalCount: archiveData.length
    }, { status: 200 })

  } catch (error) {
    console.error('Archive fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch archive data' },
      { status: 500 }
    )
  }
}
