import React from 'react';
import { useApp } from '../store/state';

export const DemoCanvas: React.FC = () => {
  const { digest, issues } = useApp();

  if (!digest) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        color: '#64748b',
        border: '2px dashed #cbd5e1',
        borderRadius: '8px',
        minHeight: '200px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📐</div>
          <div>Select a frame in Figma to see preview</div>
        </div>
      </div>
    );
  }

  // Group issues by layer
  const issuesByLayer = issues.reduce((acc, issue) => {
    if (!acc[issue.target_id]) acc[issue.target_id] = [];
    acc[issue.target_id].push(issue);
    return acc;
  }, {} as Record<string, typeof issues>);

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      backgroundColor: '#ffffff',
      minHeight: '300px'
    }}>
      <div style={{ 
        fontSize: '14px', 
        fontWeight: '600', 
        marginBottom: '12px',
        color: '#374151'
      }}>
        {digest.frameName}
      </div>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '8px' 
      }}>
        {digest.layers.map((layer) => {
          const layerIssues = issuesByLayer[layer.id] || [];
          const hasIssues = layerIssues.length > 0;
          
          return (
            <div
              key={layer.id}
              style={{
                padding: '8px 12px',
                border: hasIssues ? '1px solid #fca5a5' : '1px solid #e5e7eb',
                borderRadius: '6px',
                backgroundColor: hasIssues ? '#fef2f2' : '#f9fafb',
                position: 'relative'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
              }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '500' }}>
                    {layer.role} {layer.text && `• "${layer.text.slice(0, 20)}${layer.text.length > 20 ? '...' : ''}"`}
                  </div>
                  <div style={{ fontSize: '10px', color: '#6b7280' }}>
                    {layer.width}×{layer.height}
                  </div>
                </div>
                {hasIssues && (
                  <div style={{
                    backgroundColor: '#dc2626',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}>
                    {layerIssues.length}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
