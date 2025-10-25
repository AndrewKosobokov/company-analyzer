// File: app/api/trash/permanent-delete/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { verifyAuth } from '@/app/lib/auth';

export async function DELETE(req: NextRequest) {
  const authPayload = verifyAuth(req);
  if (!authPayload) {
    return NextResponse.json({ error: 'Unauthorized: Invalid token.' }, { status: 401 });
  }
  const userId = authPayload.userId;

  try {
    const { analysisId } = await req.json();
    if (!analysisId) {
      return NextResponse.json({ error: 'Missing analysisId.' }, { status: 400 });
    }

    // Only allow hard delete of items currently in trash (isDeleted = true)
    const deleted = await prisma.analysis.deleteMany({
      where: {
        id: analysisId,
        userId: userId,
        isDeleted: true,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: 'Analysis not found, not in trash, or access denied.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Analysis permanently deleted.' }, { status: 200 });
  } catch (error) {
    console.error('Permanent delete error:', error);
    return NextResponse.json({ error: 'Failed to permanently delete analysis.' }, { status: 500 });
  }
}



