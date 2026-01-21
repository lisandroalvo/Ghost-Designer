import React, { useEffect, useState } from 'react';
import { Student, TrainingClass } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

interface StudentDetailsModalProps {
  student: Student;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({
  student,
  onClose,
  onEdit,
  onDelete,
}) => {
  const { user } = useAuth();
  const [enrolledClasses, setEnrolledClasses] = useState<TrainingClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrolledClasses = async () => {
      if (!user?.businessId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const enrollments = await apiService.getEnrollments(user.businessId);
        const classes = await apiService.getClasses(user.businessId);

        // Filter enrollments for this student and map to classes
        const studentEnrollments = enrollments.filter(e => e.studentId === student.id);
        const studentClasses = classes.filter(c =>
          studentEnrollments.some(e => e.classId === c.id)
        );

        setEnrolledClasses(studentClasses);
      } catch (error) {
        console.error('Failed to fetch enrolled classes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledClasses();
  }, [user?.businessId, student.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="glass-card-tinted max-w-2xl w-full p-8 space-y-6">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full glass-dist border-2 border-white/20 flex items-center justify-center font-bold text-2xl">
              <span className="relative z-10">{student.name.charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white">{student.name}</h2>
              <p className="text-white/60 text-sm">Member since {new Date(student.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Student Information */}
        <div className="relative z-10 space-y-6">
          {/* Contact Information */}
          <div className="glass-card p-6 rounded-xl border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/60">Email</span>
                <span className="text-white font-semibold">{student.email}</span>
              </div>
              {student.phone && (
                <div className="flex justify-between">
                  <span className="text-white/60">Phone</span>
                  <span className="text-white font-semibold">{student.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Membership Details */}
          <div className="glass-card p-6 rounded-xl border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Membership Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/60">Status</span>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                  student.membershipStatus === 'Active' ? 'bg-green-500/20 text-green-300' :
                  student.membershipStatus === 'Paused' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-red-500/20 text-red-300'
                }`}>
                  {student.membershipStatus}
                </span>
              </div>
              {student.membershipType && (
                <div className="flex justify-between">
                  <span className="text-white/60">Plan</span>
                  <span className="text-white font-semibold">{student.membershipType}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-white/60">Join Date</span>
                <span className="text-white font-semibold">{new Date(student.joinDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {student.notes && (
            <div className="glass-card p-6 rounded-xl border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">Notes</h3>
              <p className="text-white/80 text-sm whitespace-pre-wrap">{student.notes}</p>
            </div>
          )}

          {/* Enrolled Classes */}
          <div className="glass-card p-6 rounded-xl border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Enrolled Classes</h3>
            {loading ? (
              <p className="text-white/60 text-sm">Loading classes...</p>
            ) : enrolledClasses.length > 0 ? (
              <div className="space-y-3">
                {enrolledClasses.map((cls) => (
                  <div key={cls.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <div>
                      <p className="text-white font-semibold">{cls.name}</p>
                      <p className="text-white/60 text-sm">{cls.time} • {cls.instructor}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300">
                        Active
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/60 text-sm">Not enrolled in any classes yet</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 relative z-10">
          <button
            onClick={onDelete}
            className="px-6 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-xl font-semibold transition"
          >
            Delete Student
          </button>
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
            <span className="relative z-10">Edit Student</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsModal;
