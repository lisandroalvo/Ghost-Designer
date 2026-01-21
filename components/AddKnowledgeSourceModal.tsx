import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

interface AddKnowledgeSourceModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddKnowledgeSourceModal: React.FC<AddKnowledgeSourceModalProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    type: 'URL' as 'PDF' | 'DOC' | 'URL',
    content: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.businessId) return;

    setError('');
    setLoading(true);

    try {
      await apiService.createKnowledgeSource(user.businessId, formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add knowledge source');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="glass-card-tinted max-w-lg w-full p-8 space-y-6">
        <div className="flex items-center justify-between relative z-10">
          <h2 className="text-2xl font-extrabold text-white">Add Knowledge Source</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="relative z-10 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">
              Source Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Class Schedule FAQ, Pricing Information"
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">
              Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none"
            >
              <option value="URL">URL / Website</option>
              <option value="PDF">PDF Document</option>
              <option value="DOC">Text Document</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">
              {formData.type === 'URL' ? 'URL *' : 'Content *'}
            </label>
            {formData.type === 'URL' ? (
              <input
                type="url"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="https://example.com/faq"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none"
              />
            ) : (
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Paste your content here..."
                rows={6}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none resize-none"
              />
            )}
            <p className="text-xs text-white/50 mt-1">
              {formData.type === 'URL'
                ? 'The AI will crawl and index this URL'
                : 'This content will be indexed for AI responses'}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 glass-card border border-white/20 rounded-xl font-semibold text-white hover:bg-white/5 transition"
            >
              <span className="relative z-10">Cancel</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 glass-dist text-white rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">{loading ? 'Adding...' : 'Add Source'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddKnowledgeSourceModal;
