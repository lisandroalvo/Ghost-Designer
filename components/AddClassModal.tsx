import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

interface AddClassModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddClassModal: React.FC<AddClassModalProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    time: '',
    capacity: 20,
    type: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.businessId) return;

    setError('');
    setLoading(true);

    try {
      // For now, use the current user as instructor
      // TODO: Add instructor selection
      await apiService.createClass(user.businessId, formData, user.id);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="glass-card-tinted max-w-lg w-full p-8 space-y-6">
        <div className="flex items-center justify-between relative z-10">
          <h2 className="text-2xl font-extrabold text-white">Add New Class</h2>
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
              Class Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Brazilian Jiu-Jitsu Fundamentals"
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">
              Class Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none"
            >
              <option value="">Select type...</option>
              <option value="BJJ">Brazilian Jiu-Jitsu</option>
              <option value="Muay Thai">Muay Thai</option>
              <option value="Boxing">Boxing</option>
              <option value="MMA">MMA</option>
              <option value="Kickboxing">Kickboxing</option>
              <option value="Wrestling">Wrestling</option>
              <option value="Judo">Judo</option>
              <option value="Karate">Karate</option>
              <option value="Taekwondo">Taekwondo</option>
              <option value="Yoga">Yoga</option>
              <option value="Fitness">Fitness</option>
              <option value="Kids">Kids Class</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">
              Schedule Time *
            </label>
            <input
              type="text"
              name="time"
              value={formData.time}
              onChange={handleChange}
              placeholder="e.g., Mon/Wed/Fri 6:00 PM"
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none"
            />
            <p className="text-xs text-white/50 mt-1">
              Enter the schedule in any format (e.g., "Mon/Wed 6PM" or "Daily 7:00 AM")
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">
              Class Capacity *
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              min="1"
              max="100"
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none"
            />
            <p className="text-xs text-white/50 mt-1">
              Maximum number of students per class
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
              <span className="relative z-10">{loading ? 'Creating...' : 'Create Class'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClassModal;
