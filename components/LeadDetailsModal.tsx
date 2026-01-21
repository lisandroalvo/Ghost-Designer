import React from 'react';
import { Lead } from '../types';

interface LeadDetailsModalProps {
  lead: Lead;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onConvert: () => void;
}

const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({
  lead,
  onClose,
  onEdit,
  onDelete,
  onConvert,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Converted':
        return 'bg-green-500/20 text-green-300';
      case 'Trial Booked':
        return 'bg-blue-500/20 text-blue-300';
      case 'Contacted':
        return 'bg-yellow-500/20 text-yellow-300';
      default:
        return 'bg-white/10 text-white/70';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'Instagram':
        return '📸';
      case 'Facebook':
        return '👍';
      case 'Walk-in':
        return '🚶';
      default:
        return '🌐';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="glass-card-tinted max-w-2xl w-full p-8 space-y-6">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full glass-dist border-2 border-white/20 flex items-center justify-center font-bold text-2xl">
              <span className="relative z-10">{lead.name.charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white">{lead.name}</h2>
              <p className="text-white/60 text-sm">Lead since {new Date(lead.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Lead Information */}
        <div className="relative z-10 space-y-6">
          {/* Contact Information */}
          <div className="glass-card p-6 rounded-xl border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/60">Email</span>
                <span className="text-white font-semibold">{lead.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Source</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getSourceIcon(lead.source)}</span>
                  <span className="text-white font-semibold">{lead.source}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status & Progress */}
          <div className="glass-card p-6 rounded-xl border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Status & Progress</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/60">Current Status</span>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(lead.status)}`}>
                  {lead.status}
                </span>
              </div>

              {/* Progress Steps */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  {['New', 'Contacted', 'Trial Booked', 'Converted'].map((step, idx) => {
                    const statusOrder = ['New', 'Contacted', 'Trial Booked', 'Converted'];
                    const currentIndex = statusOrder.indexOf(lead.status);
                    const isCompleted = idx <= currentIndex;

                    return (
                      <React.Fragment key={step}>
                        <div className="flex flex-col items-center gap-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition ${
                            isCompleted ? 'glass-dist text-white' : 'bg-white/10 text-white/40'
                          }`}>
                            <span className="relative z-10">{idx + 1}</span>
                          </div>
                          <span className={`text-xs font-semibold ${isCompleted ? 'text-white' : 'text-white/40'}`}>
                            {step}
                          </span>
                        </div>
                        {idx < 3 && (
                          <div className={`flex-1 h-1 mx-2 rounded-full ${isCompleted ? 'bg-white/40' : 'bg-white/10'}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 relative z-10">
          <button
            onClick={onDelete}
            className="px-6 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-xl font-semibold transition"
          >
            Delete Lead
          </button>
          {lead.status !== 'Converted' && (
            <button
              onClick={onConvert}
              className="px-6 py-3 bg-green-600/20 hover:bg-green-600/30 text-green-300 rounded-xl font-semibold transition"
            >
              Convert to Student
            </button>
          )}
          <div className="flex-1"></div>
          <button
            onClick={onClose}
            className="px-6 py-3 glass-card border border-white/20 rounded-xl font-semibold text-white hover:bg-white/5 transition"
          >
            <span className="relative z-10">Close</span>
          </button>
          <button
            onClick={onEdit}
            className="px-6 py-3 glass-dist text-white rounded-xl font-semibold transition"
          >
            <span className="relative z-10">Edit Lead</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailsModal;
