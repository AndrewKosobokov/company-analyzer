// File: app/api/analysis/report/[analysisId]/route.ts

import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import prisma from '@/app/lib/prisma';

// Определяем интерфейс для параметров маршрута
interface RouteParams {
    params: {
        analysisId: string;
    };
}

// Handler для GET-запроса (получение полного текста отчета)
// PUBLIC ACCESS - No authentication required for shareable links
export async function GET(req: NextRequest, { params }: RouteParams) {
    const { analysisId } = params;

    try {
        const report = await prisma.analysis.findUnique({
            where: {
                id: analysisId,
            },
            select: {
                id: true,
                companyName: true,
                companyInn: true,
                reportText: true, // Включаем полный текст
                firstContactExample: true, // Включаем кэшированный пример первого контакта
                createdAt: true,
                isDeleted: true,
                analysisType: true,
            }
        });

        if (!report) {
            return NextResponse.json({ error: 'Отчёт не найден' }, { status: 404 });
        }

        // 🔍 DEBUG: Log if firstContactExample is cached
        console.log('📄 [Report API] Fetching report:', analysisId);
        console.log('📄 [Report API] First contact example cached:', report.firstContactExample ? `YES (${report.firstContactExample.length} chars)` : 'NO');

        return NextResponse.json(report, { status: 200 });

    } catch (error) {
        console.error('Fetch single report error:', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}