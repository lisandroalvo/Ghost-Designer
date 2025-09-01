import React from 'react';

interface HealthMeterProps {
  value: number;
}

export const HealthMeter: React.FC<HealthMeterProps> = ({ value }) => {
  const percentage = Math.max(0, Math.min(100, value));
  const color = percentage >= 80 ? '#10b981' : percentage >= 60 ? '#f59e0b' : '#ef4444';
  
  return (
    <div style={{ padding: '16px', textAlign: 'center' }}>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color, marginBottom: '8px' }}>
        {percentage}%
      </div>
      <div style={{ 
        width: '100%', 
        height: '8px', 
        backgroundColor: '#e5e7eb', 
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: color,
          transition: 'width 0.3s ease'
        }} />
      </div>
      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
        Design Health Score
      </div>
    </div>
  );
};
