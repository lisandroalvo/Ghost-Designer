import { supabase } from '../lib/supabase';
import {
  BrandingConfig,
  TrainingClass,
  Student,
  Lead,
  KnowledgeSource,
  PaymentRecord,
  Automation,
} from '../types';

/**
 * API Service for all data operations
 * All queries automatically filter by business_id through RLS policies
 */
class ApiService {
  // ==================== BUSINESS ====================

  async getBusiness(businessId: string) {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateBranding(businessId: string, branding: BrandingConfig) {
    const { data, error } = await supabase
      .from('businesses')
      .update({ branding })
      .eq('id', businessId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateAIConfig(businessId: string, aiConfig: any) {
    const { data, error } = await supabase
      .from('businesses')
      .update({ ai_config: aiConfig })
      .eq('id', businessId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ==================== CLASSES ====================

  async getClasses(businessId: string): Promise<TrainingClass[]> {
    const { data, error } = await supabase
      .from('classes')
      .select(`
        *,
        instructor:profiles!classes_instructor_id_fkey(full_name),
        enrollments(count)
      `)
      .eq('business_id', businessId)
      .order('time', { ascending: true });

    if (error) throw error;

    return (data || []).map(cls => ({
      id: cls.id,
      name: cls.name,
      instructor: cls.instructor?.full_name || 'Unassigned',
      time: cls.time,
      capacity: cls.capacity,
      booked: cls.enrollments?.[0]?.count || 0,
      type: cls.type,
    }));
  }

  async createClass(businessId: string, classData: Partial<TrainingClass>, instructorId: string) {
    const { data, error } = await supabase
      .from('classes')
      .insert({
        business_id: businessId,
        name: classData.name!,
        instructor_id: instructorId,
        time: classData.time!,
        capacity: classData.capacity || 20,
        type: classData.type || 'General',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateClass(classId: string, updates: Partial<TrainingClass>) {
    const { data, error } = await supabase
      .from('classes')
      .update({
        name: updates.name,
        time: updates.time,
        capacity: updates.capacity,
        type: updates.type,
      })
      .eq('id', classId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteClass(classId: string) {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', classId);

    if (error) throw error;
  }

  // ==================== STUDENTS ====================

  async getStudents(businessId: string): Promise<Student[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        enrollments(
          id,
          status,
          enrollment_date
        )
      `)
      .eq('business_id', businessId)
      .eq('role', 'STUDENT')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(student => ({
      id: student.id,
      name: student.full_name,
      email: student.email,
      phone: student.phone,
      membershipStatus: student.membership_status || (student.enrollments?.[0]?.status || 'Cancelled'),
      membershipType: student.membership_type,
      notes: student.notes,
      joinDate: student.enrollments?.[0]?.enrollment_date || student.created_at,
    }));
  }

  async createStudent(businessId: string, studentData: Partial<Student> & { name: string; email: string; joinDate: string }) {
    // Note: In production, you'd want to send an invitation email
    // For now, we'll create a profile without auth credentials
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        business_id: businessId,
        email: studentData.email,
        full_name: studentData.name,
        phone: studentData.phone,
        role: 'STUDENT',
        membership_status: studentData.membershipStatus || 'Active',
        membership_type: studentData.membershipType,
        notes: studentData.notes,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateStudent(studentId: string, updates: Partial<Student>) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: updates.name,
        email: updates.email,
        phone: updates.phone,
        membership_status: updates.membershipStatus,
        membership_type: updates.membershipType,
        notes: updates.notes,
      })
      .eq('id', studentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteStudent(studentId: string) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', studentId);

    if (error) throw error;
  }

  // ==================== ENROLLMENTS ====================

  async enrollStudent(businessId: string, studentId: string, classId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .insert({
        business_id: businessId,
        student_id: studentId,
        class_id: classId,
        status: 'Active',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateEnrollmentStatus(enrollmentId: string, status: 'Active' | 'Paused' | 'Expired') {
    const { data, error } = await supabase
      .from('enrollments')
      .update({ status })
      .eq('id', enrollmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getEnrollments(businessId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .select('*')
      .eq('business_id', businessId);

    if (error) throw error;

    return (data || []).map(enrollment => ({
      id: enrollment.id,
      studentId: enrollment.student_id,
      classId: enrollment.class_id,
      status: enrollment.status,
      enrollmentDate: enrollment.enrollment_date,
    }));
  }

  // ==================== LEADS ====================

  async getLeads(businessId: string): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('business_id', businessId)
      .order('date', { ascending: false });

    if (error) throw error;

    return (data || []).map(lead => ({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      source: lead.source,
      status: lead.status,
      date: lead.date,
    }));
  }

  async createLead(businessId: string, leadData: Partial<Lead>) {
    const { data, error } = await supabase
      .from('leads')
      .insert({
        business_id: businessId,
        name: leadData.name!,
        email: leadData.email!,
        source: leadData.source || 'Website',
        status: leadData.status || 'New',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateLead(leadId: string, updates: Partial<Lead>) {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', leadId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteLead(leadId: string) {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', leadId);

    if (error) throw error;
  }

  // ==================== KNOWLEDGE SOURCES ====================

  async getKnowledgeSources(businessId: string): Promise<KnowledgeSource[]> {
    const { data, error } = await supabase
      .from('knowledge_sources')
      .select('*')
      .eq('business_id', businessId)
      .order('upload_date', { ascending: false });

    if (error) throw error;

    return (data || []).map(source => ({
      id: source.id,
      name: source.name,
      type: source.type,
      uploadDate: source.upload_date,
      status: source.status,
    }));
  }

  async createKnowledgeSource(businessId: string, sourceData: { name: string; type: 'PDF' | 'DOC' | 'URL'; content: string }) {
    const { data, error } = await supabase
      .from('knowledge_sources')
      .insert({
        business_id: businessId,
        name: sourceData.name,
        type: sourceData.type,
        content: sourceData.content,
        status: 'Processing',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateKnowledgeSource(sourceId: string, updates: { status?: 'Indexed' | 'Processing'; content?: string }) {
    const { data, error } = await supabase
      .from('knowledge_sources')
      .update(updates)
      .eq('id', sourceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteKnowledgeSource(sourceId: string) {
    const { error } = await supabase
      .from('knowledge_sources')
      .delete()
      .eq('id', sourceId);

    if (error) throw error;
  }

  // ==================== PAYMENTS ====================

  async getPayments(businessId: string): Promise<PaymentRecord[]> {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        student:profiles!payments_student_id_fkey(full_name)
      `)
      .eq('business_id', businessId)
      .order('date', { ascending: false });

    if (error) throw error;

    return (data || []).map(payment => ({
      id: payment.id,
      studentName: payment.student?.full_name || 'Unknown',
      amount: payment.amount,
      date: payment.date,
      status: payment.status,
    }));
  }

  async createPayment(businessId: string, paymentData: { studentId: string; amount: number; status?: 'Succeeded' | 'Pending' | 'Failed' }) {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        business_id: businessId,
        student_id: paymentData.studentId,
        amount: paymentData.amount,
        status: paymentData.status || 'Pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ==================== AUTOMATIONS ====================

  async getAutomations(businessId: string): Promise<Automation[]> {
    const { data, error } = await supabase
      .from('automations')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map(automation => ({
      id: automation.id,
      label: automation.label,
      description: automation.description,
      enabled: automation.enabled,
      type: automation.type,
    }));
  }

  async toggleAutomation(automationId: string, enabled: boolean) {
    const { data, error } = await supabase
      .from('automations')
      .update({ enabled })
      .eq('id', automationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ==================== AI THREADS ====================

  async getAIThread(businessId: string, studentId: string) {
    const { data, error } = await supabase
      .from('ai_threads')
      .select('*')
      .eq('business_id', businessId)
      .eq('student_id', studentId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data;
  }

  async createOrUpdateAIThread(businessId: string, studentId: string, messages: any[]) {
    // Try to get existing thread
    const existing = await this.getAIThread(businessId, studentId);

    if (existing) {
      const { data, error } = await supabase
        .from('ai_threads')
        .update({ messages })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('ai_threads')
        .insert({
          business_id: businessId,
          student_id: studentId,
          messages,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  // ==================== ANALYTICS ====================

  async getAnalytics(businessId: string) {
    // Get total students
    const { count: totalStudents } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('role', 'STUDENT');

    // Get active enrollments
    const { count: activeEnrollments } = await supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('status', 'Active');

    // Get total revenue
    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .eq('business_id', businessId)
      .eq('status', 'Succeeded');

    const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    // Get new leads this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: newLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .gte('date', startOfMonth.toISOString());

    return {
      totalStudents: totalStudents || 0,
      activeEnrollments: activeEnrollments || 0,
      totalRevenue,
      newLeads: newLeads || 0,
    };
  }
}

export const apiService = new ApiService();
