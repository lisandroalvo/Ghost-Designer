import React, { useState } from 'react';
import { apiService } from '../services/api';
import { Student } from '../types';

interface EditStudentModalProps {
  student: Student;
  onClose: () => void;
  onSuccess: () => void;
}

const EditStudentModal: React.FC<EditStudentModalProps> = ({ student, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: student.name,
    email: student.email,
    phone: student.phone || '',
    membershipStatus: student.membershipStatus,
    membershipType: student.membershipType || '',
    notes: student.notes || '',
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

    setError('');
    setLoading(true);

    try {
      await apiService.updateStudent(student.id, formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="glass-card-tinted max-w-lg w-full p-8 space-y-6">
        <div className="flex items-center justify-between relative z-10">
          <h2 className="text-2xl font-extrabold text-white">Edit Student</h2>
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
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., John Doe"
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="student@example.com"
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Membership Status *
              </label>
              <select
                name="membershipStatus"
                value={formData.membershipStatus}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none"
              >
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Membership Type *
              </label>
              <select
                name="membershipType"
                value={formData.membershipType}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none"
              >
                <option value="">Select type...</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annual">Annual</option>
                <option value="Drop-in">Drop-in</option>
                <option value="Trial">Trial</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional notes about the student..."
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none resize-none"
            />
            <p className="text-xs text-white/50 mt-1">
              Optional notes, medical conditions, or special requirements
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
              <span className="relative z-10">{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudentModal;
