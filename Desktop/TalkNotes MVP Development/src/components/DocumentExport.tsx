import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface DocumentExportProps {
  transcript: string;
  summary: string;
  language: string;
  onClose: () => void;
}

export default function DocumentExport({ transcript, summary, language, onClose }: DocumentExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const documentRef = useRef<HTMLDivElement>(null);

  const extractKeyPoints = (summaryText: string): string[] => {
    const lines = summaryText.split('\n').filter(line => line.trim());
    const keyPoints: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/^[-•*]\s/)) {
        keyPoints.push(trimmed.replace(/^[-•*]\s/, ''));
      } else if (trimmed.match(/^\d+\.\s/)) {
        keyPoints.push(trimmed.replace(/^\d+\.\s/, ''));
      } else if (trimmed.length > 10 && trimmed.length < 150) {
        keyPoints.push(trimmed);
      }
    }
    
    if (keyPoints.length === 0) {
      const sentences = summaryText.split(/[.!?]+/).filter(s => s.trim().length > 20);
      return sentences.slice(0, 5).map(s => s.trim());
    }
    
    return keyPoints.slice(0, 5);
  };

  const keyPoints = extractKeyPoints(summary);
  const wordCount = transcript.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / 200);

  // Analyze conversation for pain points and lapses
  const analyzePainPoints = (text: string): string[] => {
    const painKeywords = ['problem', 'issue', 'difficult', 'challenge', 'struggle', 'concern', 'worry', 'frustrat', 'confus', 'unclear', 'hard', 'complicate'];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 15);
    return sentences
      .filter(s => painKeywords.some(keyword => s.toLowerCase().includes(keyword)))
      .slice(0, 4)
      .map(s => s.trim());
  };

  const analyzeLapses = (text: string): number => {
    const shortSentences = text.split(/[.!?]+/).filter(s => s.trim().split(/\s+/).length < 3);
    return Math.min(Math.floor(shortSentences.length / 3), 5);
  };

  const calculateComprehension = (): number => {
    const avgWordLength = transcript.split(/\s+/).reduce((acc, word) => acc + word.length, 0) / wordCount;
    const sentenceCount = transcript.split(/[.!?]+/).filter(s => s.trim()).length;
    const avgSentenceLength = wordCount / sentenceCount;
    
    let score = 85;
    if (avgWordLength > 6) score -= 10;
    if (avgSentenceLength > 25) score -= 10;
    if (keyPoints.length < 3) score -= 5;
    
    return Math.max(60, Math.min(100, score));
  };

  const painPoints = analyzePainPoints(transcript + ' ' + summary);
  const conversationLapses = analyzeLapses(transcript);
  const comprehensionScore = calculateComprehension();

  const exportToPDF = async () => {
    if (!documentRef.current) return;
    setIsExporting(true);

    try {
      const canvas = await html2canvas(documentRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF',
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`TalkNotes-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToJPG = async () => {
    if (!documentRef.current) return;
    setIsExporting(true);

    try {
      const canvas = await html2canvas(documentRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF',
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `TalkNotes-${new Date().toISOString().split('T')[0]}.jpg`;
          link.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/jpeg', 0.95);
    } catch (error) {
      console.error('JPG export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#111418] rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col border border-[#3F4448]/50 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-[#3F4448]/50 flex items-center justify-between bg-gradient-to-r from-[#0B0D10] to-[#111418]">
          <div>
            <h2 className="text-2xl font-bold text-[#F2F3F2]">Document & Analysis</h2>
            <p className="text-sm text-[#9BA3A0] mt-1">Review insights, charts, and export your notes</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#9BA3A0] hover:text-[#F2F3F2] transition-colors p-2 hover:bg-[#3F4448]/30 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Document Preview */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', backgroundColor: '#0B0D10' }}>
          <div 
            ref={documentRef}
            style={{ 
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '48px',
              maxWidth: '800px',
              margin: '0 auto',
              minHeight: '600px'
            }}
          >
            {/* Header */}
            <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '2px solid #E5E7EB' }}>
              <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
                TalkNotes
              </h1>
              <p style={{ fontSize: '14px', color: '#6B7280' }}>
                {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              {language && language !== 'Original' && (
                <div style={{ 
                  display: 'inline-block', 
                  marginTop: '16px',
                  padding: '8px 16px', 
                  backgroundColor: '#10B981', 
                  color: 'white', 
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  {language}
                </div>
              )}
            </div>

            {/* Stats */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '16px',
              marginBottom: '32px',
              padding: '16px',
              backgroundColor: '#F9FAFB',
              borderRadius: '8px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10B981' }}>{wordCount}</div>
                <div style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase' }}>Words</div>
              </div>
              <div style={{ textAlign: 'center', borderLeft: '1px solid #E5E7EB', borderRight: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3B82F6' }}>{readTime}</div>
                <div style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase' }}>Min Read</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8B5CF6' }}>{keyPoints.length}</div>
                <div style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase' }}>Key Points</div>
              </div>
            </div>

            {/* Conversation Analysis */}
            <div style={{ marginBottom: '32px', padding: '24px', backgroundColor: '#FAFAFA', borderRadius: '12px', border: '2px solid #E5E7EB' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>📊</span> Conversation Analysis
              </h2>

              {/* Comprehension Score Chart */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Comprehension Score</span>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: comprehensionScore >= 80 ? '#10B981' : comprehensionScore >= 60 ? '#F59E0B' : '#EF4444' }}>
                    {comprehensionScore}%
                  </span>
                </div>
                <div style={{ width: '100%', height: '24px', backgroundColor: '#E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${comprehensionScore}%`, 
                    height: '100%', 
                    background: comprehensionScore >= 80 ? 'linear-gradient(90deg, #10B981, #059669)' : comprehensionScore >= 60 ? 'linear-gradient(90deg, #F59E0B, #D97706)' : 'linear-gradient(90deg, #EF4444, #DC2626)',
                    borderRadius: '12px',
                    transition: 'width 0.3s'
                  }}></div>
                </div>
                <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                  {comprehensionScore >= 80 ? 'Excellent clarity and structure' : comprehensionScore >= 60 ? 'Good clarity with minor complexity' : 'Complex structure may need simplification'}
                </p>
              </div>

              {/* Conversation Lapses */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Conversation Lapses</span>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#3B82F6' }}>{conversationLapses}</span>
                </div>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {[...Array(5)].map((_, i) => (
                    <div key={i} style={{ 
                      flex: 1, 
                      height: '32px', 
                      backgroundColor: i < conversationLapses ? '#3B82F6' : '#E5E7EB',
                      borderRadius: '4px'
                    }}></div>
                  ))}
                </div>
                <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                  Brief pauses or incomplete thoughts detected
                </p>
              </div>

              {/* Pain Points */}
              {painPoints.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>⚠️</span> Identified Pain Points
                  </h3>
                  {painPoints.map((point, idx) => (
                    <div key={idx} style={{ 
                      padding: '12px',
                      marginBottom: '8px',
                      backgroundColor: '#FEF3C7',
                      borderLeft: '4px solid #F59E0B',
                      borderRadius: '4px'
                    }}>
                      <p style={{ fontSize: '13px', color: '#78350F', lineHeight: '1.5' }}>{point}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Key Takeaways - Only green checkmarks */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
                Key Takeaways
              </h2>
              
              {/* Key Points */}
              {keyPoints.map((point, idx) => (
                <div key={idx} style={{ 
                  display: 'flex',
                  gap: '12px',
                  padding: '12px',
                  marginBottom: '8px',
                  backgroundColor: '#ECFDF5',
                  borderLeft: '4px solid #10B981',
                  borderRadius: '4px'
                }}>
                  <span style={{ color: '#10B981', fontWeight: 'bold', fontSize: '18px' }}>✓</span>
                  <p style={{ color: '#374151', lineHeight: '1.6', flex: 1 }}>{point}</p>
                </div>
              ))}
            </div>

            {/* Transcript */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
                Full Transcript
              </h2>
              <div style={{ 
                backgroundColor: '#EFF6FF',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #DBEAFE'
              }}>
                <p style={{ color: '#374151', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                  {transcript}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div style={{ 
              marginTop: '48px',
              paddingTop: '24px',
              borderTop: '2px solid #E5E7EB',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '12px', color: '#6B7280' }}>
                Generated by TalkNotes • {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-[#3F4448]/50 flex gap-2 justify-end bg-gradient-to-r from-[#0B0D10] to-[#111418]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-[#9BA3A0] hover:text-[#F2F3F2] hover:bg-[#3F4448]/30 transition-all"
            disabled={isExporting}
          >
            Cancel
          </button>
          <button
            onClick={exportToJPG}
            disabled={isExporting}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#3F4448] text-[#F2F3F2] hover:bg-[#4F5458] transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {isExporting ? 'Exporting...' : 'Export JPG'}
          </button>
          <button
            onClick={exportToPDF}
            disabled={isExporting}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#87F1C6] to-[#4CC9A0] text-[#0B0D10] hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
