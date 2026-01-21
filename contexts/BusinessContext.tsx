import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { apiService } from '../services/api';
import {
  BrandingConfig,
  TrainingClass,
  Student,
  Lead,
  KnowledgeSource,
  PaymentRecord,
  Automation,
} from '../types';

interface BusinessContextType {
  branding: BrandingConfig | null;
  classes: TrainingClass[];
  students: Student[];
  leads: Lead[];
  knowledgeSources: KnowledgeSource[];
  payments: PaymentRecord[];
  automations: Automation[];
  analytics: {
    totalStudents: number;
    activeEnrollments: number;
    totalRevenue: number;
    newLeads: number;
  } | null;
  loading: boolean;
  updateBranding: (branding: BrandingConfig) => Promise<void>;
  refreshData: () => Promise<void>;
  toggleAutomation: (id: string) => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [branding, setBranding] = useState<BrandingConfig | null>(null);
  const [classes, setClasses] = useState<TrainingClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [analytics, setAnalytics] = useState<{
    totalStudents: number;
    activeEnrollments: number;
    totalRevenue: number;
    newLeads: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.businessId) {
      loadBusinessData();
    } else {
      // Reset state when user logs out
      setBranding(null);
      setClasses([]);
      setStudents([]);
      setLeads([]);
      setKnowledgeSources([]);
      setPayments([]);
      setAutomations([]);
      setAnalytics(null);
      setLoading(false);
    }
  }, [user?.businessId]);

  const loadBusinessData = async () => {
    if (!user?.businessId) return;

    setLoading(true);
    try {
      // Load all data in parallel
      const [
        businessData,
        classesData,
        studentsData,
        leadsData,
        knowledgeSourcesData,
        paymentsData,
        automationsData,
        analyticsData,
      ] = await Promise.all([
        apiService.getBusiness(user.businessId),
        apiService.getClasses(user.businessId),
        apiService.getStudents(user.businessId),
        apiService.getLeads(user.businessId),
        apiService.getKnowledgeSources(user.businessId),
        apiService.getPayments(user.businessId),
        apiService.getAutomations(user.businessId),
        apiService.getAnalytics(user.businessId),
      ]);

      setBranding(businessData.branding);
      setClasses(classesData);
      setStudents(studentsData);
      setLeads(leadsData);
      setKnowledgeSources(knowledgeSourcesData);
      setPayments(paymentsData);
      setAutomations(automationsData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading business data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBranding = async (newBranding: BrandingConfig) => {
    if (!user?.businessId) return;

    try {
      await apiService.updateBranding(user.businessId, newBranding);
      setBranding(newBranding);
    } catch (error) {
      console.error('Error updating branding:', error);
      throw error;
    }
  };

  const refreshData = async () => {
    await loadBusinessData();
  };

  const toggleAutomation = async (id: string) => {
    const automation = automations.find(a => a.id === id);
    if (!automation) return;

    try {
      await apiService.toggleAutomation(id, !automation.enabled);
      setAutomations(prev =>
        prev.map(a => (a.id === id ? { ...a, enabled: !a.enabled } : a))
      );
    } catch (error) {
      console.error('Error toggling automation:', error);
      throw error;
    }
  };

  return (
    <BusinessContext.Provider
      value={{
        branding,
        classes,
        students,
        leads,
        knowledgeSources,
        payments,
        automations,
        analytics,
        loading,
        updateBranding,
        refreshData,
        toggleAutomation,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};
