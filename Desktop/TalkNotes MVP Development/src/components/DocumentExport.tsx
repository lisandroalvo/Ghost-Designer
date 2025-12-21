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

  const exportToPDF = async () => {
    if (!documentRef.current) return;
    setIsExporting(true);

    try {
      const canvas = await html2canvas(documentRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0B0D10',
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
        backgroundColor: '#0B0D10',
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
            <h2 className="text-2xl font-bold text-[#F2F3F2]">Export Document</h2>
            <p className="text-sm text-[#9BA3A0] mt-1">Preview and download your notes</p>
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
        <div className="flex-1 overflow-y-auto p-6 bg-[#0B0D10]">
          <div 
            ref={documentRef}
            className="bg-white rounded-xl shadow-2xl mx-auto p-12 max-w-4xl"
            style={{ 
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          >
            {/* Header Section */}
            <div className="mb-12 pb-8 border-b-2 border-gray-200">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-black text-gray-900 mb-2">TalkNotes</h1>
                  <p className="text-lg text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                {language && language !== 'Original' && (
                  <div className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg text-sm font-semibold shadow-lg">
                    {language}
                  </div>
                )}
              </div>
              
              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-4 mt-6 bg-gray-50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">{wordCount}</div>
                  <div className="text-xs text-gray-600 uppercase tracking-wider">Words</div>
                </div>
                <div className="text-center border-x border-gray-200">
                  <div className="text-3xl font-bold text-blue-600">{readTime}</div>
                  <div className="text-xs text-gray-600 uppercase tracking-wider">Min Read</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{keyPoints.length}</div>
                  <div className="text-xs text-gray-600 uppercase tracking-wider">Key Points</div>
                </div>
              </div>
            </div>

            {/* Key Takeaways Section */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl flex items-center justify-center text-lg font-black shadow-lg">
                  1
                </span>
                Key Takeaways
              </h2>
              
              {/* Summary Text */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 mb-6 border border-gray-200">
                <p className="text-gray-800 leading-relaxed text-lg whitespace-pre-wrap">
                  {summary}
                </p>
              </div>

              {/* Key Points List */}
              <div className="space-y-3">
                {keyPoints.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded">
                    <span className="text-emerald-600 font-bold text-lg">✓</span>
                    <p className="text-gray-700 leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Full Transcript Section */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center text-lg font-black shadow-lg">
                  2
                </span>
                Full Transcript
              </h2>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
                <p className="text-gray-800 leading-relaxed text-base whitespace-pre-wrap">
                  {transcript}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t-2 border-gray-200 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-gray-700">TalkNotes</span>
              </div>
              <p className="text-xs text-gray-500">
                AI-Powered Translation & Transcription • {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t border-[#3F4448]/50 flex gap-3 justify-end bg-gradient-to-r from-[#0B0D10] to-[#111418]">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl text-sm font-medium text-[#9BA3A0] hover:text-[#F2F3F2] hover:bg-[#3F4448]/30 transition-all"
            disabled={isExporting}
          >
            Cancel
          </button>
          <button
            onClick={exportToJPG}
            disabled={isExporting}
            className="px-6 py-3 rounded-xl text-sm font-semibold bg-[#3F4448] text-[#F2F3F2] hover:bg-[#4F5458] transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {isExporting ? 'Exporting...' : 'Export JPG'}
          </button>
          <button
            onClick={exportToPDF}
            disabled={isExporting}
            className="px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#87F1C6] to-[#4CC9A0] text-[#0B0D10] hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
