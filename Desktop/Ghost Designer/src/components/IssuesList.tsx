import React from 'react';
import { Issue } from '../core/types';

interface IssuesListProps {
  issues: Issue[];
}

export const IssuesList: React.FC<IssuesListProps> = ({ issues }) => {
  if (issues.length === 0) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>
        <div style={{ fontSize: '18px', marginBottom: '8px' }}>🎉</div>
        <div>No issues found!</div>
      </div>
    );
  }

  return (
    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
      {issues.map((issue, i) => (
        <div key={i} style={{ 
          border: '1px solid #e5e7eb', 
          padding: '12px', 
          borderRadius: '6px', 
          marginBottom: '8px',
          backgroundColor: '#f9fafb'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '4px'
          }}>
            <div style={{ fontWeight: '500', color: '#374151' }}>
              {issue.description}
            </div>
            <span style={{
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: issue.severity === 'error' ? '#fef2f2' : 
                             issue.severity === 'warning' ? '#fffbeb' : '#f0f9ff',
              color: issue.severity === 'error' ? '#dc2626' : 
                     issue.severity === 'warning' ? '#d97706' : '#2563eb'
            }}>
              {issue.severity}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            {issue.rule} • Target: {issue.target_id}
          </div>
        </div>
      ))}
    </div>
  );
};
