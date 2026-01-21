
export enum UserRole {
  OWNER = 'OWNER',
  INSTRUCTOR = 'INSTRUCTOR',
  STUDENT = 'STUDENT'
}

export interface BrandingConfig {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  businessName: string;
  heroImage: string;
  borderRadius: string;
}

export interface Business {
  id: string;
  name: string;
  branding: BrandingConfig;
  aiConfig: {
    systemPrompt: string;
    capabilities: string[];
  };
}

export interface TrainingClass {
  id: string;
  name: string;
  instructor: string;
  time: string;
  capacity: number;
  booked: number;
  type: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  membershipStatus: 'Active' | 'Paused' | 'Cancelled';
  membershipType?: string;
  notes?: string;
  joinDate: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  source: 'Instagram' | 'Website' | 'Walk-in' | 'Facebook';
  status: 'New' | 'Contacted' | 'Trial Booked' | 'Converted';
  date: string;
}

export interface KnowledgeSource {
  id: string;
  name: string;
  type: 'PDF' | 'DOC' | 'URL';
  uploadDate: string;
  status: 'Indexed' | 'Processing';
}

export interface PaymentRecord {
  id: string;
  studentName: string;
  amount: number;
  date: string;
  status: 'Succeeded' | 'Pending' | 'Failed';
}

export interface Automation {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  type: 'WhatsApp' | 'Push' | 'Email';
}
