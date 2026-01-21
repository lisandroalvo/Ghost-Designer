import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useBusiness } from './contexts/BusinessContext';
import AuthForm from './components/AuthForm';
import MobilePreview from './components/MobilePreview';
import ImageUpload from './components/ImageUpload';
import AddClassModal from './components/AddClassModal';
import AddStudentModal from './components/AddStudentModal';
import EditStudentModal from './components/EditStudentModal';
import StudentDetailsModal from './components/StudentDetailsModal';
import AddLeadModal from './components/AddLeadModal';
import EditLeadModal from './components/EditLeadModal';
import LeadDetailsModal from './components/LeadDetailsModal';
import AddKnowledgeSourceModal from './components/AddKnowledgeSourceModal';
import AddPaymentModal from './components/AddPaymentModal';
import EnrollStudentModal from './components/EnrollStudentModal';
import AnalyticsCharts from './components/AnalyticsCharts';
import { academyAIService } from './services/gemini';
import { storageService } from './services/storage';
import { apiService } from './services/api';
import { BrandingConfig, Student, Lead } from './types';

const App: React.FC = () => {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const {
    branding,
    classes,
    students,
    leads,
    knowledgeSources,
    payments,
    automations,
    analytics,
    loading: businessLoading,
    updateBranding,
    toggleAutomation,
    refreshData,
  } = useBusiness();

  const [activeTab, setActiveTab] = useState<'branding' | 'classes' | 'students' | 'leads' | 'ai' | 'analytics' | 'payments' | 'automations'>('branding');
  const [localBranding, setLocalBranding] = useState<BrandingConfig | null>(branding);

  const [aiOutput, setAiOutput] = useState<string>('');
  const [marketingImg, setMarketingImg] = useState<string | null>(null);
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [feedbackOutput, setFeedbackOutput] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [showAddClassModal, setShowAddClassModal] = useState(false);

  // Student modal states
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Lead modal states
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showEditLeadModal, setShowEditLeadModal] = useState(false);
  const [showLeadDetails, setShowLeadDetails] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Knowledge source modal state
  const [showAddKnowledgeModal, setShowAddKnowledgeModal] = useState(false);

  // Payment modal state
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);

  // Enrollment modal state
  const [showEnrollStudentModal, setShowEnrollStudentModal] = useState(false);

  // Sync branding from context when it changes
  React.useEffect(() => {
    if (branding) {
      setLocalBranding(branding);
    }
  }, [branding]);

  // Show loading screen
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="glass-dist w-16 h-16 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto animate-pulse">
            <span className="relative z-10">A</span>
          </div>
          <p className="text-white font-semibold">Loading AcademyOS...</p>
        </div>
      </div>
    );
  }

  // Show auth form if not logged in
  if (!user) {
    return <AuthForm onSignIn={signIn} onSignUp={signUp} />;
  }

  const handleBrandingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!localBranding) return;
    const { name, value } = e.target;
    setLocalBranding(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSaveBranding = async () => {
    if (!localBranding) return;
    try {
      await updateBranding(localBranding);
      alert('Branding updated successfully!');
    } catch (error) {
      alert('Failed to update branding. Please try again.');
    }
  };

  const handleAiMarketing = async () => {
    if (!localBranding || classes.length === 0) return;
    setLoading(true);
    setMarketingImg(null);
    try {
      const copy = await academyAIService.generateMarketingCopy(localBranding.businessName, classes[0].name);
      setAiOutput(copy || 'No response from AI');

      setImageLoading(true);
      const img = await academyAIService.generateMarketingImage(`${localBranding.businessName} ${classes[0].name} class training`);
      setMarketingImg(img);
    } catch (err) {
      console.error(err);
      setAiOutput('Error generating content. Please check API Key.');
    } finally {
      setLoading(false);
      setImageLoading(false);
    }
  };

  const handleSummarizeFeedback = async () => {
    if (!feedbackInput.trim()) return;
    setLoading(true);
    try {
      const summary = await academyAIService.summarizeCoachFeedback(feedbackInput);
      setFeedbackOutput(summary || 'Could not summarize.');
    } catch (err) {
      setFeedbackOutput('Error summarizing feedback.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestChat = async () => {
    if (!chatMessage.trim() || !localBranding) return;
    const userMsg = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const scheduleText = classes.map(c => `${c.name} at ${c.time} with ${c.instructor}`).join(', ');
      const knowledgeContext = knowledgeSources.map(s => s.name).join(', ');
      const response = await academyAIService.chatWithStudent(userMsg, localBranding.businessName, scheduleText, knowledgeContext);
      setChatHistory(prev => [...prev, { role: 'ai', text: response || 'No response' }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'ai', text: 'Error connecting to Gemini. Check API Key.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!localBranding) {
    return <div>Loading branding...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Onboarding Overlay */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="glass-card-tinted max-w-lg w-full p-8 space-y-6">
            <div className="flex justify-center relative z-10">
              <div className="glass-dist w-16 h-16 text-white rounded-2xl flex items-center justify-center text-3xl font-bold">
                <span className="relative z-10">A</span>
              </div>
            </div>
            <div className="text-center space-y-2 relative z-10">
              <h2 className="text-3xl font-extrabold tracking-tight text-white">Welcome to AcademyOS</h2>
              <p className="text-white/70">Your white-label AI platform is ready. Scale your academy with ease.</p>
            </div>
            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-4 p-4 glass-card border border-white/10 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-xs">1</div>
                <p className="text-sm font-medium text-white/90">Customize your white-label brand colors.</p>
              </div>
              <div className="flex items-center gap-4 p-4 glass-card border border-white/10 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-xs">2</div>
                <p className="text-sm font-medium text-white/90">Activate AI student care and automation.</p>
              </div>
              <div className="flex items-center gap-4 p-4 glass-card border border-white/10 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-xs">3</div>
                <p className="text-sm font-medium text-white/90">Link Stripe to accept global memberships.</p>
              </div>
            </div>
            <button
              onClick={() => setShowOnboarding(false)}
              className="relative z-10 w-full glass-dist text-white font-bold py-4 rounded-xl transition"
            >
              <span className="relative z-10">Enter Dashboard</span>
            </button>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 bg-black/40 backdrop-blur-xl border-r border-white/10 text-white flex flex-col shrink-0">
        <div className="p-8 flex items-center gap-3">
          <div className="glass-dist w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg">
            <span className="relative z-10">A</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">AcademyOS</h1>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest text-wrap">AI Platform</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <NavItem active={activeTab === 'branding'} icon="🎨" label="Branding" onClick={() => setActiveTab('branding')} />
          <NavItem active={activeTab === 'classes'} icon="📅" label="Schedules" onClick={() => setActiveTab('classes')} />
          <NavItem active={activeTab === 'students'} icon="👥" label="Students" onClick={() => setActiveTab('students')} />
          <NavItem active={activeTab === 'leads'} icon="🎯" label="CRM Leads" onClick={() => setActiveTab('leads')} />
          <NavItem active={activeTab === 'ai'} icon="🧠" label="AI Engine" onClick={() => setActiveTab('ai')} />
          <NavItem active={activeTab === 'payments'} icon="💳" label="Payments" onClick={() => setActiveTab('payments')} />
          <NavItem active={activeTab === 'automations'} icon="⚡" label="Automations" onClick={() => setActiveTab('automations')} />
          <NavItem active={activeTab === 'analytics'} icon="📊" label="Analytics" onClick={() => setActiveTab('analytics')} />
        </nav>

        <div className="p-6 border-t border-white/10 m-4 glass-card-tinted rounded-2xl">
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <div className="w-10 h-10 rounded-full glass-dist border-2 border-white/20 flex items-center justify-center font-bold text-xs">
              <span className="relative z-10">{user.fullName.charAt(0)}</span>
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold truncate">{user.fullName}</p>
              <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">{user.role}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="relative z-10 w-full bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs font-semibold py-2 rounded-lg transition"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 glass-card-tinted border-b border-white/10 flex items-center justify-between px-10 shrink-0">
          <div className="flex items-center gap-3 text-white/60 text-sm font-medium relative z-10">
            <span className="hover:text-white cursor-pointer">Academy</span>
            <span className="text-white/30">/</span>
            <span className="text-white font-bold capitalize">{activeTab}</span>
          </div>
          <div className="flex gap-4 items-center relative z-10">
            <div className="text-xs text-white/60">
              Business: <span className="font-bold text-white">{localBranding.businessName}</span>
            </div>
            <button className="glass-dist text-white px-6 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2">
              <span className="relative z-10">Deploy Mobile Sync</span>
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden flex-col lg:flex-row">
          <section className="flex-1 overflow-y-auto p-10">
            {activeTab === 'branding' && (
              <div className="max-w-2xl space-y-8">
                <div>
                  <h2 className="text-3xl font-extrabold text-white mb-2">App Customization</h2>
                  <p className="text-white/60">Configure your global theme. Changes apply to your mobile app preview.</p>
                </div>
                <div className="glass-card-tinted p-8 rounded-2xl border border-white/10 space-y-6">
                  <div className="grid grid-cols-2 gap-8 relative z-10">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Business Name</label>
                      <input name="businessName" value={localBranding.businessName} onChange={handleBrandingChange} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-white/30 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Border Radius</label>
                      <input name="borderRadius" value={localBranding.borderRadius} onChange={handleBrandingChange} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-white/30 outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8 relative z-10">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Primary Color</label>
                      <input type="color" name="primaryColor" value={localBranding.primaryColor} onChange={handleBrandingChange} className="w-full h-12 rounded-xl p-1 cursor-pointer border-2 border-white/20 bg-white/5" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Accent Color</label>
                      <input type="color" name="secondaryColor" value={localBranding.secondaryColor} onChange={handleBrandingChange} className="w-full h-12 rounded-xl p-1 cursor-pointer border-2 border-white/20 bg-white/5" />
                    </div>
                  </div>
                  <ImageUpload
                    label="Logo"
                    currentUrl={localBranding.logoUrl}
                    onUpload={async (file) => {
                      if (!user?.businessId) throw new Error('No business ID');
                      return await storageService.uploadLogo(file, user.businessId);
                    }}
                    onUrlChange={(url) => {
                      setLocalBranding(prev => prev ? { ...prev, logoUrl: url } : null);
                    }}
                  />
                  <ImageUpload
                    label="Hero Image"
                    currentUrl={localBranding.heroImage}
                    onUpload={async (file) => {
                      if (!user?.businessId) throw new Error('No business ID');
                      return await storageService.uploadHeroImage(file, user.businessId);
                    }}
                    onUrlChange={(url) => {
                      setLocalBranding(prev => prev ? { ...prev, heroImage: url } : null);
                    }}
                  />
                  <button
                    onClick={handleSaveBranding}
                    className="relative z-10 w-full glass-dist text-white font-bold py-3 rounded-xl transition"
                  >
                    <span className="relative z-10">Save Branding Changes</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'classes' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-extrabold text-white mb-2">Class Schedule</h2>
                    <p className="text-white/60">Manage your training sessions and instructors.</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowEnrollStudentModal(true)}
                      className="glass-card border border-white/20 text-white px-6 py-3 rounded-xl font-bold transition hover:bg-white/5"
                    >
                      <span className="relative z-10">📋 Enroll Student</span>
                    </button>
                    <button
                      onClick={() => setShowAddClassModal(true)}
                      className="glass-dist text-white px-6 py-3 rounded-xl font-bold transition"
                    >
                      <span className="relative z-10">+ Add Class</span>
                    </button>
                  </div>
                </div>
                <div className="grid gap-4">
                  {classes.length === 0 ? (
                    <div className="glass-card-tinted p-12 rounded-2xl border border-white/10 text-center">
                      <p className="relative z-10 text-white/60">No classes yet. Create your first class to get started!</p>
                    </div>
                  ) : (
                    classes.map((cls) => (
                      <div key={cls.id} className="glass-card-tinted p-6 rounded-xl border border-white/10 hover:border-white/20 transition">
                        <div className="flex items-center justify-between relative z-10">
                          <div>
                            <h3 className="font-bold text-lg text-white">{cls.name}</h3>
                            <p className="text-sm text-white/60">Instructor: {cls.instructor} • {cls.time}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-white/80">{cls.booked}/{cls.capacity} booked</p>
                            <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden mt-1">
                              <div
                                className="h-full bg-white/40 rounded-full"
                                style={{ width: `${(cls.booked / cls.capacity) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'students' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-extrabold text-white mb-2">Students</h2>
                    <p className="text-white/60">Manage your student roster and memberships.</p>
                  </div>
                  <button
                    onClick={() => setShowAddStudentModal(true)}
                    className="glass-dist text-white px-6 py-3 rounded-xl font-bold transition"
                  >
                    <span className="relative z-10">+ Add Student</span>
                  </button>
                </div>
                <div className="glass-card-tinted rounded-2xl border border-white/10 overflow-hidden">
                  <table className="w-full relative z-10">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr>
                        <th className="text-left px-6 py-4 text-xs font-bold text-white/60 uppercase">Name</th>
                        <th className="text-left px-6 py-4 text-xs font-bold text-white/60 uppercase">Email</th>
                        <th className="text-left px-6 py-4 text-xs font-bold text-white/60 uppercase">Phone</th>
                        <th className="text-left px-6 py-4 text-xs font-bold text-white/60 uppercase">Status</th>
                        <th className="text-left px-6 py-4 text-xs font-bold text-white/60 uppercase">Join Date</th>
                        <th className="text-left px-6 py-4 text-xs font-bold text-white/60 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-white/60">
                            No students yet. Add your first student to get started!
                          </td>
                        </tr>
                      ) : (
                        students.map((student) => (
                          <tr key={student.id} className="border-b border-white/10 hover:bg-white/5 cursor-pointer">
                            <td
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowStudentDetails(true);
                              }}
                              className="px-6 py-4 font-semibold text-white"
                            >
                              {student.name}
                            </td>
                            <td
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowStudentDetails(true);
                              }}
                              className="px-6 py-4 text-white/70"
                            >
                              {student.email}
                            </td>
                            <td
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowStudentDetails(true);
                              }}
                              className="px-6 py-4 text-white/70"
                            >
                              {student.phone || '—'}
                            </td>
                            <td
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowStudentDetails(true);
                              }}
                              className="px-6 py-4"
                            >
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                                student.membershipStatus === 'Active' ? 'bg-green-500/20 text-green-300' :
                                student.membershipStatus === 'Paused' ? 'bg-yellow-500/20 text-yellow-300' :
                                'bg-red-500/20 text-red-300'
                              }`}>
                                {student.membershipStatus}
                              </span>
                            </td>
                            <td
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowStudentDetails(true);
                              }}
                              className="px-6 py-4 text-white/70"
                            >
                              {new Date(student.joinDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedStudent(student);
                                    setShowEditStudentModal(true);
                                  }}
                                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-lg text-xs font-semibold transition"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    if (window.confirm(`Are you sure you want to delete ${student.name}?`)) {
                                      try {
                                        await apiService.deleteStudent(student.id);
                                        await refreshData();
                                      } catch (error) {
                                        alert('Failed to delete student');
                                      }
                                    }
                                  }}
                                  className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg text-xs font-semibold transition"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'leads' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-extrabold text-white mb-2">CRM Leads</h2>
                    <p className="text-white/60">Track potential students and conversion pipeline.</p>
                  </div>
                  <button
                    onClick={() => setShowAddLeadModal(true)}
                    className="glass-dist text-white px-6 py-3 rounded-xl font-bold transition"
                  >
                    <span className="relative z-10">+ Add Lead</span>
                  </button>
                </div>
                <div className="grid gap-4">
                  {leads.length === 0 ? (
                    <div className="glass-card-tinted p-12 rounded-2xl border border-white/10 text-center">
                      <p className="relative z-10 text-white/60">No leads yet. Your marketing efforts will appear here!</p>
                    </div>
                  ) : (
                    leads.map((lead) => (
                      <div
                        key={lead.id}
                        onClick={() => {
                          setSelectedLead(lead);
                          setShowLeadDetails(true);
                        }}
                        className="glass-card-tinted p-6 rounded-xl border border-white/10 hover:border-white/20 transition cursor-pointer"
                      >
                        <div className="flex items-center justify-between relative z-10">
                          <div>
                            <h3 className="font-bold text-lg text-white">{lead.name}</h3>
                            <p className="text-sm text-white/60">{lead.email} • Source: {lead.source}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              lead.status === 'Converted' ? 'bg-green-500/20 text-green-300' :
                              lead.status === 'Trial Booked' ? 'bg-blue-500/20 text-blue-300' :
                              lead.status === 'Contacted' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-white/10 text-white/70'
                            }`}>
                              {lead.status}
                            </span>
                            <span className="text-xs text-white/50">{new Date(lead.date).toLocaleDateString()}</span>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedLead(lead);
                                  setShowEditLeadModal(true);
                                }}
                                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-lg text-xs font-semibold transition"
                              >
                                Edit
                              </button>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Are you sure you want to delete ${lead.name}?`)) {
                                    try {
                                      await apiService.deleteLead(lead.id);
                                      await refreshData();
                                    } catch (error) {
                                      alert('Failed to delete lead');
                                    }
                                  }
                                }}
                                className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg text-xs font-semibold transition"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-extrabold text-white mb-2">AI Engine</h2>
                  <p className="text-white/60">Test and configure your AI capabilities.</p>
                </div>

                {/* Marketing Copy Generator */}
                <div className="glass-card-tinted p-8 rounded-2xl border border-white/10 space-y-6">
                  <h3 className="relative z-10 text-xl font-bold text-white">Marketing Copy Generator</h3>
                  <button
                    onClick={handleAiMarketing}
                    disabled={loading || classes.length === 0}
                    className="relative z-10 glass-dist text-white px-6 py-3 rounded-xl font-bold transition disabled:opacity-50"
                  >
                    <span className="relative z-10">{loading ? 'Generating...' : 'Generate Marketing Content'}</span>
                  </button>
                  {aiOutput && (
                    <div className="relative z-10 bg-white/5 p-6 rounded-xl border border-white/10">
                      <p className="text-sm text-white/90 whitespace-pre-wrap">{aiOutput}</p>
                    </div>
                  )}
                  {imageLoading && <p className="relative z-10 text-sm text-white/60">Generating image...</p>}
                  {marketingImg && (
                    <div className="relative z-10 rounded-xl overflow-hidden border border-white/10">
                      <img src={marketingImg} alt="Generated marketing" className="w-full" />
                    </div>
                  )}
                </div>

                {/* Coach Feedback Summarizer */}
                <div className="glass-card-tinted p-8 rounded-2xl border border-white/10 space-y-6">
                  <h3 className="relative z-10 text-xl font-bold text-white">Coach Feedback Summarizer</h3>
                  <textarea
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    placeholder="Paste coach feedback here..."
                    className="relative z-10 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 outline-none h-32 resize-none"
                  />
                  <button
                    onClick={handleSummarizeFeedback}
                    disabled={loading || !feedbackInput.trim()}
                    className="relative z-10 glass-dist text-white px-6 py-3 rounded-xl font-bold transition disabled:opacity-50"
                  >
                    <span className="relative z-10">{loading ? 'Summarizing...' : 'Summarize Feedback'}</span>
                  </button>
                  {feedbackOutput && (
                    <div className="relative z-10 bg-white/5 p-6 rounded-xl border border-white/10">
                      <p className="text-sm text-white/90 whitespace-pre-wrap">{feedbackOutput}</p>
                    </div>
                  )}
                </div>

                {/* Student Chat Test */}
                <div className="glass-card-tinted p-8 rounded-2xl border border-white/10 space-y-6">
                  <h3 className="relative z-10 text-xl font-bold text-white">Student Chat Assistant Test</h3>
                  <div className="relative z-10 bg-white/5 rounded-xl border border-white/10 p-4 max-h-96 overflow-y-auto space-y-3">
                    {chatHistory.length === 0 ? (
                      <p className="text-sm text-white/60 text-center py-8">Start a conversation to test the AI assistant...</p>
                    ) : (
                      chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] px-4 py-2 rounded-xl ${
                            msg.role === 'user'
                              ? 'glass-dist text-white'
                              : 'bg-white/10 border border-white/10 text-white'
                          }`}>
                            <p className="text-sm relative z-10">{msg.text}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex gap-3 relative z-10">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleTestChat()}
                      placeholder="Ask about class schedule, pricing, etc..."
                      className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-white/30 outline-none"
                    />
                    <button
                      onClick={handleTestChat}
                      disabled={loading || !chatMessage.trim()}
                      className="glass-dist text-white px-6 py-3 rounded-xl font-bold transition disabled:opacity-50"
                    >
                      <span className="relative z-10">Send</span>
                    </button>
                  </div>
                </div>

                {/* Knowledge Base */}
                <div className="glass-card-tinted p-8 rounded-2xl border border-white/10 space-y-6">
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <h3 className="text-xl font-bold text-white">Knowledge Base</h3>
                      <p className="text-sm text-white/60 mt-1">Train your AI with custom knowledge sources</p>
                    </div>
                    <button
                      onClick={() => setShowAddKnowledgeModal(true)}
                      className="glass-dist text-white px-6 py-3 rounded-xl font-bold transition"
                    >
                      <span className="relative z-10">+ Add Source</span>
                    </button>
                  </div>

                  <div className="relative z-10 space-y-3">
                    {knowledgeSources.length === 0 ? (
                      <div className="bg-white/5 p-8 rounded-xl border border-white/10 text-center">
                        <p className="text-white/60 text-sm">No knowledge sources yet. Add URLs, documents, or content to train your AI.</p>
                      </div>
                    ) : (
                      knowledgeSources.map((source) => (
                        <div key={source.id} className="glass-card p-4 rounded-xl border border-white/10 hover:border-white/20 transition">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg glass-dist flex items-center justify-center">
                                <span className="relative z-10 text-lg">
                                  {source.type === 'PDF' ? '📄' : source.type === 'DOC' ? '📝' : '🌐'}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-white">{source.name}</h4>
                                <p className="text-xs text-white/60">
                                  {source.type} • Added {new Date(source.uploadDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                source.status === 'Indexed'
                                  ? 'bg-green-500/20 text-green-300'
                                  : 'bg-yellow-500/20 text-yellow-300'
                              }`}>
                                {source.status}
                              </span>
                              <button
                                onClick={async () => {
                                  if (window.confirm(`Delete "${source.name}"?`)) {
                                    try {
                                      await apiService.deleteKnowledgeSource(source.id);
                                      await refreshData();
                                    } catch (error) {
                                      alert('Failed to delete knowledge source');
                                    }
                                  }
                                }}
                                className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg text-xs font-semibold transition"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-extrabold text-white mb-2">Payments</h2>
                    <p className="text-white/60">Track revenue and payment history.</p>
                  </div>
                  <button
                    onClick={() => setShowAddPaymentModal(true)}
                    className="glass-dist text-white px-6 py-3 rounded-xl font-bold transition"
                  >
                    <span className="relative z-10">+ Record Payment</span>
                  </button>
                </div>
                <div className="glass-card-tinted rounded-2xl border border-white/10 overflow-hidden">
                  <table className="w-full relative z-10">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr>
                        <th className="text-left px-6 py-4 text-xs font-bold text-white/60 uppercase">Student</th>
                        <th className="text-left px-6 py-4 text-xs font-bold text-white/60 uppercase">Amount</th>
                        <th className="text-left px-6 py-4 text-xs font-bold text-white/60 uppercase">Date</th>
                        <th className="text-left px-6 py-4 text-xs font-bold text-white/60 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-12 text-white/60">
                            No payments yet. Payments will appear here once students start paying!
                          </td>
                        </tr>
                      ) : (
                        payments.map((payment) => (
                          <tr key={payment.id} className="border-b border-white/10 hover:bg-white/5">
                            <td className="px-6 py-4 font-semibold text-white">{payment.studentName}</td>
                            <td className="px-6 py-4 text-white font-bold">${payment.amount}</td>
                            <td className="px-6 py-4 text-white/70">{new Date(payment.date).toLocaleDateString()}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                                payment.status === 'Succeeded' ? 'bg-green-500/20 text-green-300' :
                                payment.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-300' :
                                'bg-red-500/20 text-red-300'
                              }`}>
                                {payment.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'automations' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-extrabold text-white mb-2">Automations</h2>
                  <p className="text-white/60">Configure automated workflows for your academy.</p>
                </div>
                <div className="grid gap-4">
                  {automations.map((auto) => (
                    <div key={auto.id} className="glass-card-tinted p-6 rounded-xl border border-white/10 hover:border-white/20 transition">
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-lg text-white">{auto.label}</h3>
                            <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/70 font-semibold">{auto.type}</span>
                          </div>
                          <p className="text-sm text-white/60 mt-1">{auto.description}</p>
                        </div>
                        <button
                          onClick={() => toggleAutomation(auto.id)}
                          className={`ml-4 px-6 py-2 rounded-lg font-semibold transition ${
                            auto.enabled
                              ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                              : 'bg-white/10 text-white/70 hover:bg-white/20'
                          }`}
                        >
                          {auto.enabled ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-extrabold text-white mb-2">Analytics Dashboard</h2>
                  <p className="text-white/60">Track key metrics and business performance.</p>
                </div>
                {analytics && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="glass-card-tinted p-6 rounded-2xl border border-white/10">
                        <p className="relative z-10 text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Total Students</p>
                        <p className="relative z-10 text-4xl font-extrabold text-white">{analytics.totalStudents}</p>
                      </div>
                      <div className="glass-card-tinted p-6 rounded-2xl border border-white/10">
                        <p className="relative z-10 text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Active Enrollments</p>
                        <p className="relative z-10 text-4xl font-extrabold text-white">{analytics.activeEnrollments}</p>
                      </div>
                      <div className="glass-card-tinted p-6 rounded-2xl border border-white/10">
                        <p className="relative z-10 text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Total Revenue</p>
                        <p className="relative z-10 text-4xl font-extrabold text-white">${analytics.totalRevenue.toFixed(2)}</p>
                      </div>
                      <div className="glass-card-tinted p-6 rounded-2xl border border-white/10">
                        <p className="relative z-10 text-xs font-bold text-white/60 uppercase tracking-wider mb-2">New Leads (This Month)</p>
                        <p className="relative z-10 text-4xl font-extrabold text-white">{analytics.newLeads}</p>
                      </div>
                    </div>
                    <AnalyticsCharts students={students} leads={leads} payments={payments} />
                  </>
                )}
              </div>
            )}
          </section>

          {/* Mobile Preview */}
          <aside className="w-full lg:w-96 border-l border-white/10 bg-black/20 backdrop-blur-xl p-8 overflow-y-auto">
            <MobilePreview branding={localBranding} classes={classes} />
          </aside>
        </div>
      </main>

      {/* Add Class Modal */}
      {showAddClassModal && (
        <AddClassModal
          onClose={() => setShowAddClassModal(false)}
          onSuccess={() => refreshData()}
        />
      )}

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <AddStudentModal
          onClose={() => setShowAddStudentModal(false)}
          onSuccess={() => refreshData()}
        />
      )}

      {/* Edit Student Modal */}
      {showEditStudentModal && selectedStudent && (
        <EditStudentModal
          student={selectedStudent}
          onClose={() => {
            setShowEditStudentModal(false);
            setSelectedStudent(null);
          }}
          onSuccess={() => {
            refreshData();
            setShowEditStudentModal(false);
            setSelectedStudent(null);
          }}
        />
      )}

      {/* Student Details Modal */}
      {showStudentDetails && selectedStudent && (
        <StudentDetailsModal
          student={selectedStudent}
          onClose={() => {
            setShowStudentDetails(false);
            setSelectedStudent(null);
          }}
          onEdit={() => {
            setShowStudentDetails(false);
            setShowEditStudentModal(true);
          }}
          onDelete={async () => {
            if (window.confirm(`Are you sure you want to delete ${selectedStudent.name}?`)) {
              try {
                await apiService.deleteStudent(selectedStudent.id);
                await refreshData();
                setShowStudentDetails(false);
                setSelectedStudent(null);
              } catch (error) {
                alert('Failed to delete student');
              }
            }
          }}
        />
      )}

      {/* Add Lead Modal */}
      {showAddLeadModal && (
        <AddLeadModal
          onClose={() => setShowAddLeadModal(false)}
          onSuccess={() => refreshData()}
        />
      )}

      {/* Edit Lead Modal */}
      {showEditLeadModal && selectedLead && (
        <EditLeadModal
          lead={selectedLead}
          onClose={() => {
            setShowEditLeadModal(false);
            setSelectedLead(null);
          }}
          onSuccess={() => {
            refreshData();
            setShowEditLeadModal(false);
            setSelectedLead(null);
          }}
        />
      )}

      {/* Lead Details Modal */}
      {showLeadDetails && selectedLead && (
        <LeadDetailsModal
          lead={selectedLead}
          onClose={() => {
            setShowLeadDetails(false);
            setSelectedLead(null);
          }}
          onEdit={() => {
            setShowLeadDetails(false);
            setShowEditLeadModal(true);
          }}
          onDelete={async () => {
            if (window.confirm(`Are you sure you want to delete ${selectedLead.name}?`)) {
              try {
                await apiService.deleteLead(selectedLead.id);
                await refreshData();
                setShowLeadDetails(false);
                setSelectedLead(null);
              } catch (error) {
                alert('Failed to delete lead');
              }
            }
          }}
          onConvert={async () => {
            if (window.confirm(`Convert ${selectedLead.name} to a student?`)) {
              try {
                // Create student from lead
                await apiService.createStudent(user!.businessId, {
                  name: selectedLead.name,
                  email: selectedLead.email,
                  membershipStatus: 'Active',
                  joinDate: new Date().toISOString(),
                });

                // Update lead status to Converted
                await apiService.updateLead(selectedLead.id, { status: 'Converted' });

                await refreshData();
                setShowLeadDetails(false);
                setSelectedLead(null);
                alert(`${selectedLead.name} has been converted to a student!`);
              } catch (error) {
                alert('Failed to convert lead to student');
              }
            }
          }}
        />
      )}

      {/* Add Knowledge Source Modal */}
      {showAddKnowledgeModal && (
        <AddKnowledgeSourceModal
          onClose={() => setShowAddKnowledgeModal(false)}
          onSuccess={() => refreshData()}
        />
      )}

      {/* Add Payment Modal */}
      {showAddPaymentModal && (
        <AddPaymentModal
          onClose={() => setShowAddPaymentModal(false)}
          onSuccess={() => refreshData()}
        />
      )}

      {/* Enroll Student Modal */}
      {showEnrollStudentModal && (
        <EnrollStudentModal
          onClose={() => setShowEnrollStudentModal(false)}
          onSuccess={() => refreshData()}
        />
      )}
    </div>
  );
};

const NavItem: React.FC<{ active: boolean; icon: string; label: string; onClick: () => void }> = ({ active, icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition ${
      active ? 'glass-dist text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
    }`}
  >
    <span className={`text-lg ${active ? 'relative z-10' : ''}`}>{icon}</span>
    <span className={active ? 'relative z-10' : ''}>{label}</span>
  </button>
);

export default App;
