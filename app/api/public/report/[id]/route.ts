import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import prisma from '@/app/lib/prisma';

// Определяем интерфейс для параметров маршрута
interface RouteParams {
    params: {
        id: string;
    };
}

// Handler для GET-запроса (получение публичного отчета)
// PUBLIC ACCESS - No authentication required
export async function GET(req: NextRequest, { params }: RouteParams) {
    const { id } = params;

    try {
        const report = await prisma.analysis.findUnique({
            where: {
                id: id,
                isDeleted: false, // Только не удаленные отчеты
            },
            select: {
                id: true,
                companyName: true,
                companyInn: true,
                reportText: true,
                targetProposal: true,
                createdAt: true,
            }
        });

        if (!report) {
            return NextResponse.json({ error: 'Отчёт не найден' }, { status: 404 });
        }

        return NextResponse.json(report, { status: 200 });

    } catch (error) {
        console.error('Fetch public report error:', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}


