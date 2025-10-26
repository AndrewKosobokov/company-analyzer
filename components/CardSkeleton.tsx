import Skeleton from './Skeleton';

export default function CardSkeleton() {
  return (
    <div style={{
      border: '1px solid #d2d2d7',
      borderRadius: '12px',
      padding: '20px',
      background: '#ffffff',
    }}>
      <Skeleton height="24px" width="60%" borderRadius="6px" />
      <div style={{ marginTop: '12px' }}>
        <Skeleton height="16px" width="40%" borderRadius="4px" />
      </div>
      <div style={{ marginTop: '16px' }}>
        <Skeleton height="14px" width="100%" borderRadius="4px" />
        <div style={{ marginTop: '6px' }}>
          <Skeleton height="14px" width="90%" borderRadius="4px" />
        </div>
      </div>
      <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
        <Skeleton height="32px" width="80px" borderRadius="6px" />
        <Skeleton height="32px" width="80px" borderRadius="6px" />
      </div>
    </div>
  );
}













