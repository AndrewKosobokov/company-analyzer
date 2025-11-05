'use client';

import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface UserDistribution {
  trial: number;
  start: number;
  optimal: number;
  profi: number;
}

interface Props {
  data: UserDistribution;
}

export function UserDistributionChart({ data }: Props) {
  const chartData = {
    labels: ['Trial', 'Start', 'Optimal', 'Profi'],
    datasets: [
      {
        data: [data.trial, data.start, data.optimal, data.profi],
        backgroundColor: [
          '#E8E8ED',
          '#D2D2D7',
          '#86868B',
          '#1D1D1F',
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: {
            family: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
            size: 13
          },
          color: '#1D1D1F',
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle' as const
        }
      },
      tooltip: {
        backgroundColor: '#1D1D1F',
        titleFont: {
          family: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
          size: 13
        },
        bodyFont: {
          family: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
          size: 15
        },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            const value = context.raw;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return `${context.label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div 
      className="card"
      style={{
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #D2D2D7',
        backgroundColor: '#FFFFFF'
      }}
    >
      <h3 style={{ 
        fontSize: '17px', 
        fontWeight: 600, 
        color: '#1D1D1F',
        marginBottom: '24px',
        margin: 0
      }}>
        Распределение пользователей
      </h3>
      <div style={{ height: '256px', position: 'relative' }}>
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
}

