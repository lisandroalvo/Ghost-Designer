import React from 'react';
import { MeetingIcon } from './MeetingIcon';
import { InterviewIcon } from './InterviewIcon';
import { SalesIcon } from './SalesIcon';
import { CoachingIcon } from './CoachingIcon';
import { LectureIcon } from './LectureIcon';
import { CasualIcon } from './CasualIcon';

export const IconShowcase = () => {
  const icons = [
    { name: 'Meeting', component: MeetingIcon, description: 'Concentric circles - centered focus, alignment' },
    { name: 'Interview', component: InterviewIcon, description: 'Balanced duality - two perspectives, dialogue' },
    { name: 'Sales', component: SalesIcon, description: 'Gentle growth curve - progress, momentum' },
    { name: 'Coaching', component: CoachingIcon, description: 'Breath waves - expansion, transformation' },
    { name: 'Lecture', component: LectureIcon, description: 'Knowledge flow - sharing, learning' },
    { name: 'Casual', component: CasualIcon, description: 'Flowing conversation - organic, natural' },
  ];

  return (
    <div style={{ 
      padding: '48px', 
      background: '#0a0a0a',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ 
        color: '#f5f5f5', 
        fontSize: '24px', 
        fontWeight: '300',
        marginBottom: '48px',
        letterSpacing: '0.5px'
      }}>
        TalkNotes Intent Icons
      </h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        maxWidth: '1200px'
      }}>
        {icons.map(({ name, component: Icon, description }) => (
          <div 
            key={name}
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '16px',
              padding: '32px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              transition: 'all 0.3s ease',
            }}
          >
            <div style={{ 
              color: 'rgba(255, 255, 255, 0.6)',
              filter: 'drop-shadow(0 0 8px rgba(134, 239, 172, 0.15))'
            }}>
              <Icon />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ 
                color: '#f5f5f5', 
                fontSize: '16px',
                fontWeight: '400',
                marginBottom: '8px',
                letterSpacing: '0.3px'
              }}>
                {name}
              </h3>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: '13px',
                fontWeight: '300',
                lineHeight: '1.6',
                letterSpacing: '0.2px'
              }}>
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ 
        marginTop: '64px',
        padding: '24px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '12px',
      }}>
        <h2 style={{ 
          color: '#f5f5f5', 
          fontSize: '14px', 
          fontWeight: '400',
          marginBottom: '12px',
          letterSpacing: '0.3px'
        }}>
          Design Principles
        </h2>
        <ul style={{ 
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '13px',
          lineHeight: '1.8',
          listStyle: 'none',
          padding: 0,
          fontWeight: '300'
        }}>
          <li>• 1.5px stroke weight - soft and non-intrusive</li>
          <li>• Rounded caps and joins - gentle, flowing aesthetic</li>
          <li>• Layered opacity - depth without visual weight</li>
          <li>• Abstract metaphors - breath, balance, growth, flow</li>
          <li>• Monochrome with currentColor - adapts to context</li>
          <li>• Optional subtle glow - soft green accent</li>
        </ul>
      </div>
    </div>
  );
};
