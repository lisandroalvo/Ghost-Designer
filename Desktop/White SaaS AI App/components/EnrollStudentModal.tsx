import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBusiness } from '../contexts/BusinessContext';
import { apiService } from '../services/api';

interface EnrollStudentModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const EnrollStudentModal: React.FC<EnrollStudentModalProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const { students, classes } = useBusiness();
  const [formData, setFormData] = useState({
    studentId: '',
    classId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
      await apiService.enrollStudent(user.businessId, formData.studentId, formData.classId);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to enroll student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="glass-card-tinted max-w-lg w-full p-8 space-y-6">
        <div className="flex items-center justify-between relative z-10">
          <h2 className="text-2xl font-extrabold text-white">Enroll Student in Class</h2>
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
              Select Student *
            </label>
            <select
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none"
            >
              <option value="">Choose a student...</option>
              {students
                .filter(s => s.membershipStatus === 'Active')
                .map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} - {student.membershipType || 'No membership'}
                </option>
              ))}
            </select>
            <p className="text-xs text-white/50 mt-1">Only active students are shown</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">
              Select Class *
            </label>
            <select
              name="classId"
              value={formData.classId}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none"
            >
              <option value="">Choose a class...</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} - {cls.time} ({cls.booked}/{cls.capacity} enrolled)
                </option>
              ))}
            </select>
          </div>

          {formData.classId && formData.studentId && (
            <div className="relative z-10 glass-card p-4 rounded-xl border border-white/10">
              <p className="text-sm text-white/80">
                <span className="font-semibold">
                  {students.find(s => s.id === formData.studentId)?.name}
                </span>
                {' '}will be enrolled in{' '}
                <span className="font-semibold">
                  {classes.find(c => c.id === formData.classId)?.name}
                </span>
              </p>
            </div>
          )}

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
              <span className="relative z-10">{loading ? 'Enrolling...' : 'Enroll Student'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnrollStudentModal;
