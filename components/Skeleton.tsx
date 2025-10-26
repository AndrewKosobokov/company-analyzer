'use client';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
}

export default function Skeleton({ 
  width = '100%', 
  height = '20px',
  borderRadius = '4px'
}: SkeletonProps) {
  return (
    <div style={{
      width,
      height,
      background: 'linear-gradient(90deg, #f5f5f7 25%, #e5e5ea 50%, #f5f5f7 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s ease-in-out infinite',
      borderRadius,
    }}>
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}


















