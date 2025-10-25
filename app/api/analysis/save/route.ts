// File: app/api/analysis/save/route.ts

import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import prisma from '@/app/lib/prisma';
import { verifyAuth } from '@/app/lib/auth';

// Handler для POST-запроса (сохранение нового анализа)
export async function POST(req: NextRequest) {
    const authPayload = verifyAuth(req);

    if (!authPayload) {
        return NextResponse.json({ error: 'Unauthorized: Invalid token.' }, { status: 401 });
    }
    const userId = authPayload.userId;

    try {
        const { companyName, companyInn, reportText } = await req.json();

        // Простая валидация
        if (!companyName || !companyInn || !reportText) {
            return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
        }

        // 1. Создание новой записи в таблице Analysis
        const newAnalysis = await prisma.analysis.create({
            data: {
                userId: userId,
                companyName: companyName,
                companyInn: companyInn,
                reportText: reportText,
                isDeleted: false, // По умолчанию не в корзине
            },
        });

        return NextResponse.json({ 
            message: 'Analysis successfully saved.', 
            analysisId: newAnalysis.id 
        }, { status: 201 });

    } catch (error) {
        console.error('Save analysis error:', error);
        return NextResponse.json({ error: 'An unexpected server error occurred during save.' }, { status: 500 });
    }
}