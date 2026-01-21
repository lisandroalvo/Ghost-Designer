import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types for TypeScript
export type Database = {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string;
          name: string;
          owner_id: string;
          branding: any;
          ai_config: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner_id: string;
          branding?: any;
          ai_config?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          owner_id?: string;
          branding?: any;
          ai_config?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          business_id: string;
          email: string;
          full_name: string;
          role: 'OWNER' | 'INSTRUCTOR' | 'STUDENT';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          business_id: string;
          email: string;
          full_name: string;
          role: 'OWNER' | 'INSTRUCTOR' | 'STUDENT';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          email?: string;
          full_name?: string;
          role?: 'OWNER' | 'INSTRUCTOR' | 'STUDENT';
          created_at?: string;
          updated_at?: string;
        };
      };
      classes: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          instructor_id: string;
          time: string;
          capacity: number;
          type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          instructor_id: string;
          time: string;
          capacity: number;
          type: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          instructor_id?: string;
          time?: string;
          capacity?: number;
          type?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      enrollments: {
        Row: {
          id: string;
          business_id: string;
          student_id: string;
          class_id: string;
          status: 'Active' | 'Paused' | 'Expired';
          enrollment_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          student_id: string;
          class_id: string;
          status?: 'Active' | 'Paused' | 'Expired';
          enrollment_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          student_id?: string;
          class_id?: string;
          status?: 'Active' | 'Paused' | 'Expired';
          enrollment_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      leads: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          email: string;
          source: 'Instagram' | 'Website' | 'Walk-in' | 'Facebook';
          status: 'New' | 'Contacted' | 'Trial Booked' | 'Converted';
          date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          email: string;
          source: 'Instagram' | 'Website' | 'Walk-in' | 'Facebook';
          status?: 'New' | 'Contacted' | 'Trial Booked' | 'Converted';
          date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          email?: string;
          source?: 'Instagram' | 'Website' | 'Walk-in' | 'Facebook';
          status?: 'New' | 'Contacted' | 'Trial Booked' | 'Converted';
          date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      knowledge_sources: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          type: 'PDF' | 'DOC' | 'URL';
          content: string;
          status: 'Indexed' | 'Processing';
          upload_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          type: 'PDF' | 'DOC' | 'URL';
          content?: string;
          status?: 'Indexed' | 'Processing';
          upload_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          type?: 'PDF' | 'DOC' | 'URL';
          content?: string;
          status?: 'Indexed' | 'Processing';
          upload_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          business_id: string;
          student_id: string;
          amount: number;
          date: string;
          status: 'Succeeded' | 'Pending' | 'Failed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          student_id: string;
          amount: number;
          date?: string;
          status?: 'Succeeded' | 'Pending' | 'Failed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          student_id?: string;
          amount?: number;
          date?: string;
          status?: 'Succeeded' | 'Pending' | 'Failed';
          created_at?: string;
          updated_at?: string;
        };
      };
      automations: {
        Row: {
          id: string;
          business_id: string;
          label: string;
          description: string;
          enabled: boolean;
          type: 'WhatsApp' | 'Push' | 'Email';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          label: string;
          description: string;
          enabled?: boolean;
          type: 'WhatsApp' | 'Push' | 'Email';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          label?: string;
          description?: string;
          enabled?: boolean;
          type?: 'WhatsApp' | 'Push' | 'Email';
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_threads: {
        Row: {
          id: string;
          business_id: string;
          student_id: string;
          messages: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          student_id: string;
          messages?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          student_id?: string;
          messages?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
