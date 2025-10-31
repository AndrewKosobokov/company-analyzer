'use client';

import { useRouter } from 'next/navigation';

interface NoAnalysesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NoAnalysesModal({ isOpen, onClose }: NoAnalysesModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleGoToPricing = () => {
    onClose();
    router.push('/pricing');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full px-10 py-8 shadow-2xl">
        <h2 className="text-2xl font-semibold text-black mb-4">Анализы закончились</h2>
        <p className="text-[#1d1d1f] mb-8 leading-relaxed">
          У вас осталось <strong>0 анализов</strong>.<br />Выберите тариф для продолжения работы.
        </p>
        <div className="flex gap-4">
          <button onClick={handleGoToPricing} className="flex-1 bg-black text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors">Перейти к тарифам</button>
          <button onClick={onClose} className="flex-1 bg-gray-100 text-black py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors">Отмена</button>
        </div>
      </div>
    </div>
  );
}


