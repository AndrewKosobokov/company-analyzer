'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checking, setChecking] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const checkPayment = async () => {
      const paymentId = searchParams.get('paymentId');
      if (!paymentId) {
        router.push('/pricing');
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/payment/check/${paymentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        
        if (data.paid) {
          setSuccess(true);
        }
      } catch (error) {
        console.error('Payment check error:', error);
      } finally {
        setChecking(false);
      }
    };

    checkPayment();
  }, [searchParams, router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-700">Проверяем платёж...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {success ? (
          <>
            <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-semibold text-black mb-4">
              Оплата прошла успешно!
            </h1>
            <p className="text-gray-700 mb-8">
              Анализы зачислены на ваш счёт.
            </p>
            <button
              onClick={() => router.push('/analysis')}
              className="bg-black text-white py-3 px-8 rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              Перейти к анализу
            </button>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-semibold text-black mb-4">
              Что-то пошло не так
            </h1>
            <p className="text-gray-700 mb-8">
              Платёж не был завершён. Попробуйте ещё раз.
            </p>
            <button
              onClick={() => router.push('/pricing')}
              className="bg-black text-white py-3 px-8 rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              Вернуться к тарифам
            </button>
          </>
        )}
      </div>
    </div>
  );
}


