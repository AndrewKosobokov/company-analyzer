import crypto from 'crypto';

const YUKASSA_SHOP_ID = process.env.YUKASSA_SHOP_ID!;
const YUKASSA_SECRET_KEY = process.env.YUKASSA_SECRET_KEY!;
const YUKASSA_API_URL = 'https://api.yookassa.ru/v3';

export interface CreatePaymentParams {
  amount: number;
  description: string;
  metadata: {
    userId: string;
    planName: string;
    analysesCount: number;
    userEmail?: string;
  };
  returnUrl: string;
}

export interface PaymentResponse {
  id: string;
  status: string;
  confirmation?: {
    type: string;
    confirmation_url: string;
  };
  metadata?: any;
  paid?: boolean;
}

// Создание платежа
export async function createPayment(params: CreatePaymentParams): Promise<PaymentResponse> {
  const idempotenceKey = crypto.randomUUID();
  
  const response = await fetch(`${YUKASSA_API_URL}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotence-Key': idempotenceKey,
      'Authorization': `Basic ${Buffer.from(`${YUKASSA_SHOP_ID}:${YUKASSA_SECRET_KEY}`).toString('base64')}`,
    },
    body: JSON.stringify({
      amount: {
        value: params.amount.toFixed(2),
        currency: 'RUB',
      },
      capture: true,
      confirmation: {
        type: 'redirect',
        return_url: params.returnUrl,
      },
      description: params.description,
      metadata: params.metadata,
      payment_orders: [],
      receipt: {
        customer: {
          email: params.metadata.userEmail || 'customer@metalvector.ru'
        },
        items: [{
          description: params.description,
          quantity: '1',
          amount: {
            value: params.amount.toFixed(2),
            currency: 'RUB'
          },
          vat_code: 1,
          payment_mode: 'full_prepayment',
          payment_subject: 'service'
        }]
      }
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`YooKassa API error: ${JSON.stringify(error)}`);
  }

  return await response.json();
}

// Проверка статуса платежа
export async function getPayment(paymentId: string): Promise<PaymentResponse> {
  const response = await fetch(`${YUKASSA_API_URL}/payments/${paymentId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${YUKASSA_SHOP_ID}:${YUKASSA_SECRET_KEY}`).toString('base64')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get payment status');
  }

  return await response.json();
}

// Проверка подписи webhook
export function verifyWebhookSignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac('sha256', YUKASSA_SECRET_KEY)
    .update(body)
    .digest('hex');
  
  return hash === signature;
}


