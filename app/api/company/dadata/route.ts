import { NextRequest, NextResponse } from 'next/server';

type CompanyDetailsResponse = {
  name: string | null;
  ogrn: string | null;
  inn: string | null;
  kpp: string | null;
  capital: string | null;
  activity: string | null;
  address: string | null;
  director: string | null;
};

const emptyResponse: CompanyDetailsResponse = {
  name: null,
  ogrn: null,
  inn: null,
  kpp: null,
  capital: null,
  activity: null,
  address: null,
  director: null
};

export async function GET(req: NextRequest) {
  const inn = req.nextUrl.searchParams.get('inn');

  if (!inn) {
    return NextResponse.json(emptyResponse, { status: 200 });
  }

  try {
    const response = await fetch('https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Token ${process.env.DADATA_API_KEY || ''}`
      },
      body: JSON.stringify({ query: inn })
    });

    if (!response.ok) {
      return NextResponse.json(emptyResponse, { status: 200 });
    }

    const result = await response.json();
    const data = result?.suggestions?.[0]?.data;

    if (!data) {
      return NextResponse.json(emptyResponse, { status: 200 });
    }

    const payload: CompanyDetailsResponse = {
      name: data.name?.short_with_opf ?? data.name?.full_with_opf ?? null,
      ogrn: data.ogrn ?? null,
      inn: data.inn ?? null,
      kpp: data.kpp ?? null,
      capital: data.finance?.ustavcap ? `${data.finance.ustavcap.toLocaleString('ru-RU')} ₽` : null,
      activity: data.okved ?? null,
      address: data.address?.value ?? null,
      director: data.management?.name ? `${data.management.name} (${data.management.post})` : null
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    return NextResponse.json(emptyResponse, { status: 200 });
  }
}
