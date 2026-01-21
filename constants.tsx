
import { TrainingClass, Student, BrandingConfig, PaymentRecord, Automation, Lead, KnowledgeSource } from './types';

export const DEFAULT_BRANDING: BrandingConfig = {
  primaryColor: '#4f46e5', // Indigo 600
  secondaryColor: '#ec4899', // Pink 500
  logoUrl: 'https://picsum.photos/id/45/200/200',
  businessName: 'Elite Martial Arts',
  heroImage: 'https://picsum.photos/id/22/800/400',
  borderRadius: '0.5rem',
};

export const MOCK_CLASSES: TrainingClass[] = [
  { id: '1', name: 'Morning Muay Thai', instructor: 'Coach Kru', time: '07:30 AM', capacity: 20, booked: 12, type: 'Martial Arts' },
  { id: '2', name: 'Brazilian Jiu-Jitsu', instructor: 'Professor Silva', time: '05:30 PM', capacity: 16, booked: 16, type: 'Combat' },
  { id: '3', name: 'Yoga for Fighters', instructor: 'Sarah J.', time: '09:00 AM', capacity: 25, booked: 5, type: 'Wellness' },
];

export const MOCK_STUDENTS: Student[] = [
  { id: 's1', name: 'Alex Rivera', email: 'alex@example.com', membershipStatus: 'Active', joinDate: '2023-11-12' },
  { id: 's2', name: 'Jordan Smith', email: 'jordan@example.com', membershipStatus: 'Active', joinDate: '2024-01-05' },
  { id: 's3', name: 'Taylor Wong', email: 'taylor@example.com', membershipStatus: 'Expired', joinDate: '2022-06-15' },
];

export const MOCK_LEADS: Lead[] = [
  { id: 'l1', name: 'Casey Montgomery', email: 'casey@web.com', source: 'Instagram', status: 'New', date: '2024-03-08' },
  { id: 'l2', name: 'Marcus Bell', email: 'marcus@gmail.com', source: 'Website', status: 'Trial Booked', date: '2024-03-07' },
  { id: 'l3', name: 'Elena Rossi', email: 'erossi@outlook.com', source: 'Facebook', status: 'Contacted', date: '2024-03-06' },
];

export const MOCK_SOURCES: KnowledgeSource[] = [
  { id: 'k1', name: 'Studio_Rules_v2.pdf', type: 'PDF', uploadDate: '2024-01-10', status: 'Indexed' },
  { id: 'k2', name: 'Pricing_Tier_Sheet.doc', type: 'DOC', uploadDate: '2024-02-15', status: 'Indexed' },
];

export const MOCK_PAYMENTS: PaymentRecord[] = [
  { id: 'p1', studentName: 'Alex Rivera', amount: 150, date: '2024-03-01', status: 'Succeeded' },
  { id: 'p2', studentName: 'Jordan Smith', amount: 150, date: '2024-03-02', status: 'Pending' },
  { id: 'p3', studentName: 'Taylor Wong', amount: 85, date: '2024-02-28', status: 'Succeeded' },
];

export const MOCK_AUTOMATIONS: Automation[] = [
  { id: 'a1', label: 'Booking Confirmation', description: 'Send instant WhatsApp message after session booking.', enabled: true, type: 'WhatsApp' },
  { id: 'a2', label: 'Class Reminder', description: '2-hour push notification before class starts.', enabled: false, type: 'Push' },
  { id: 'a3', label: 'Inactivity Re-engagement', description: 'Email students who haven\'t attended in 14 days.', enabled: true, type: 'Email' },
];
