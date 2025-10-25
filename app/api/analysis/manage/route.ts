// File: app/api/analysis/manage/route.ts

import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import prisma from '@/app/lib/prisma';
import { verifyAuth } from '@/app/lib/auth';

// ----------------------------------------------------------------
// 1. GET (Получение списка анализов: Архив или Корзина)
// ----------------------------------------------------------------
export async function GET(req: NextRequest) {
    const authPayload = verifyAuth(req);
    if (!authPayload) {
        return NextResponse.json({ error: 'Unauthorized: Invalid token.' }, { status: 401 });
    }
    const userId = authPayload.userId;

    try {
        // Читаем параметр 'isDeleted' из URL-запроса (true для Корзины, false для Архива)
        const url = new URL(req.url);
        const isDeletedParam = url.searchParams.get('isDeleted');
        
        // Преобразуем параметр в булево значение (по умолчанию: false, т.е. Архив)
        const isDeleted = isDeletedParam === 'true'; 

        const analyses = await prisma.analysis.findMany({
            where: {
                userId: userId,
                isDeleted: isDeleted,
            },
            // Сортировка по дате создания, чтобы новые были первыми
            orderBy: {
                createdAt: 'desc',
            },
            // Исключаем огромный reportText из списка, чтобы не перегружать сеть
            select: {
                id: true,
                companyName: true,
                companyInn: true,
                createdAt: true,
                isDeleted: true,
            }
        });

        return NextResponse.json(analyses, { status: 200 });

    } catch (error) {
        console.error('Fetch analysis error:', error);
        return NextResponse.json({ error: 'Failed to fetch analyses.' }, { status: 500 });
    }
}

// ----------------------------------------------------------------
// 2. PATCH (Перемещение в Корзину или Восстановление)
// ----------------------------------------------------------------
export async function PATCH(req: NextRequest) {
    const authPayload = verifyAuth(req);
    if (!authPayload) {
        return NextResponse.json({ error: 'Unauthorized: Invalid token.' }, { status: 401 });
    }
    const userId = authPayload.userId;

    try {
        const { analysisId, isDeleted } = await req.json();

        if (!analysisId || typeof isDeleted !== 'boolean') {
            return NextResponse.json({ error: 'Missing analysisId or isDeleted status.' }, { status: 400 });
        }

        const updatedAnalysis = await prisma.analysis.updateMany({
            where: {
                id: analysisId,
                userId: userId, // Обязательная проверка, что пользователь владеет записью
            },
            data: {
                isDeleted: isDeleted,
            },
        });

        if (updatedAnalysis.count === 0) {
            return NextResponse.json({ error: 'Analysis not found or access denied.' }, { status: 404 });
        }

        const action = isDeleted ? 'moved to trash' : 'restored';
        return NextResponse.json({ message: `Analysis successfully ${action}.` }, { status: 200 });

    } catch (error) {
        console.error('Update analysis error:', error);
        return NextResponse.json({ error: 'Failed to update analysis status.' }, { status: 500 });
    }
}