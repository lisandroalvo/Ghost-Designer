
import React, { useState } from 'react';
import { BrandingConfig, TrainingClass, Student, PaymentRecord, Automation, Lead, KnowledgeSource } from './types';
import { DEFAULT_BRANDING, MOCK_CLASSES, MOCK_STUDENTS, MOCK_PAYMENTS, MOCK_AUTOMATIONS, MOCK_LEADS, MOCK_SOURCES } from './constants';
import MobilePreview from './components/MobilePreview';
import { academyAIService } from './services/gemini';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'branding' | 'classes' | 'students' | 'leads' | 'ai' | 'analytics' | 'payments' | 'automations'>('branding');
  const [branding, setBranding] = useState<BrandingConfig>(DEFAULT_BRANDING);
  const [classes] = useState<TrainingClass[]>(MOCK_CLASSES);
  const [students] = useState<Student[]>(MOCK_STUDENTS);
  const [leads] = useState<Lead[]>(MOCK_LEADS);
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>(MOCK_SOURCES);
  const [payments] = useState<PaymentRecord[]>(MOCK_PAYMENTS);
  const [automations, setAutomations] = useState<Automation[]>(MOCK_AUTOMATIONS);
  
  const [aiOutput, setAiOutput] = useState<string>('');
  const [marketingImg, setMarketingImg] = useState<string | null>(null);
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [feedbackOutput, setFeedbackOutput] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);

  const handleBrandingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBranding(prev => ({ ...prev, [name]: value }));
  };

  const handleAiMarketing = async () => {
    setLoading(true);
    setMarketingImg(null);
    try {
      const copy = await academyAIService.generateMarketingCopy(branding.businessName, classes[0].name);
      setAiOutput(copy || 'No response from AI');
      
      setImageLoading(true);
      const img = await academyAIService.generateMarketingImage(`${branding.businessName} ${classes[0].name} class training`);
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
    if (!chatMessage.trim()) return;
    const userMsg = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);
    
    try {
      const scheduleText = classes.map(c => `${c.name} at ${c.time} with ${c.instructor}`).join(', ');
      const knowledgeContext = knowledgeSources.map(s => s.name).join(', ');
      const response = await academyAIService.chatWithStudent(userMsg, branding.businessName, scheduleText, knowledgeContext);
      setChatHistory(prev => [...prev, { role: 'ai', text: response || 'No response' }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'ai', text: 'Error connecting to Gemini. Check API Key.' }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleAutomation = (id: string) => {
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50">
      {/* Onboarding Overlay */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg shadow-indigo-200">A</div>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Welcome to AcademyOS</h2>
              <p className="text-slate-500">Your white-label AI platform is ready. Scale your academy with ease.</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 border rounded-xl bg-slate-50">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">1</div>
                <p className="text-sm font-medium text-slate-700">Customize your white-label brand colors.</p>
              </div>
              <div className="flex items-center gap-4 p-4 border rounded-xl bg-slate-50">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">2</div>
                <p className="text-sm font-medium text-slate-700">Activate AI student care and automation.</p>
              </div>
              <div className="flex items-center gap-4 p-4 border rounded-xl bg-slate-50">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">3</div>
                <p className="text-sm font-medium text-slate-700">Link Stripe to accept global memberships.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowOnboarding(false)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition shadow-xl shadow-indigo-100"
            >
              Enter Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-500/20">A</div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">AcademyOS</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-wrap">AI Platform</p>
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

        <div className="p-6 border-t border-slate-800 m-4 bg-slate-800/50 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-slate-700 flex items-center justify-center font-bold text-xs">
              {branding.businessName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{branding.businessName}</p>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Owner Portal</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b flex items-center justify-between px-10 shrink-0">
          <div className="flex items-center gap-3 text-slate-400 text-sm font-medium">
            <span className="hover:text-slate-600 cursor-pointer">Academy</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-bold capitalize">{activeTab}</span>
          </div>
          <div className="flex gap-4">
             <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 flex items-center gap-2">
                Deploy Mobile Sync
             </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden flex-col lg:flex-row">
          <section className="flex-1 overflow-y-auto p-10">
            {activeTab === 'branding' && (
              <div className="max-w-2xl space-y-8">
                <div>
                  <h2 className="text-3xl font-extrabold text-slate-900 mb-2">App Customization</h2>
                  <p className="text-slate-500">Configure your global theme. Changes apply instantly to all student devices.</p>
                </div>
                <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Business Name</label>
                        <input name="businessName" value={branding.businessName} onChange={handleBrandingChange} className="w-full border-slate-200 border-2 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Border Radius</label>
                        <input name="borderRadius" value={branding.borderRadius} onChange={handleBrandingChange} className="w-full border-slate-200 border-2 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none" />
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Color</label>
                        <input type="color" name="primaryColor" value={branding.primaryColor} onChange={handleBrandingChange} className="w-full h-12 rounded-xl p-1 cursor-pointer border-2 border-slate-200" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Accent Color</label>
                        <input type="color" name="secondaryColor" value={branding.secondaryColor} onChange={handleBrandingChange} className="w-full h-12 rounded-xl p-1 cursor-pointer border-2 border-slate-200" />
                     </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Logo Image URL</label>
                    <input name="logoUrl" value={branding.logoUrl} onChange={handleBrandingChange} className="w-full border-slate-200 border-2 rounded-xl px-4 py-3 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">App Hero Image URL</label>
                    <input name="heroImage" value={branding.heroImage} onChange={handleBrandingChange} className="w-full border-slate-200 border-2 rounded-xl px-4 py-3 text-sm" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="max-w-3xl space-y-10">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-2">AI Engine Suite</h2>
                    <p className="text-slate-500">Configure multi-modal AI tasks for your academy.</p>
                  </div>
                </div>

                {/* Knowledge Base Section */}
                <div className="bg-white border rounded-2xl p-8 space-y-4 shadow-sm">
                   <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                     <span className="text-indigo-600">📚</span> Grounding Knowledge Base
                   </h3>
                   <p className="text-xs text-slate-500">Upload documents or URLs to help the AI answer studio-specific questions accurately.</p>
                   <div className="grid grid-cols-2 gap-4">
                      {knowledgeSources.map(source => (
                        <div key={source.id} className="p-4 border rounded-xl flex items-center justify-between hover:bg-slate-50 transition cursor-default">
                           <div className="flex items-center gap-3">
                              <span className="text-xl">{source.type === 'PDF' ? '📄' : '📝'}</span>
                              <div>
                                <p className="text-xs font-bold text-slate-800">{source.name}</p>
                                <p className="text-[10px] text-slate-400">{source.uploadDate}</p>
                              </div>
                           </div>
                           <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{source.status}</span>
                        </div>
                      ))}
                      <div className="p-4 border border-dashed rounded-xl flex items-center justify-center text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition cursor-pointer">
                        + Add New Source
                      </div>
                   </div>
                </div>

                {/* Multi-modal Marketing */}
                <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-2xl space-y-6">
                   <div className="flex justify-between items-start">
                     <div className="space-y-1">
                        <h3 className="text-xl font-bold">Smart Campaign Generator</h3>
                        <p className="text-xs text-slate-400">Uses Gemini 3 Flash for copy and Gemini 2.5 Flash Image for visuals.</p>
                     </div>
                     <button 
                       onClick={handleAiMarketing}
                       disabled={loading || imageLoading}
                       className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition shadow-lg shadow-indigo-500/30 flex items-center gap-2"
                     >
                        {(loading || imageLoading) ? <span className="animate-spin text-lg">⏳</span> : '🚀 Generate Campaign'}
                     </button>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Generated Copy</label>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs italic text-slate-300 min-h-32">
                           {aiOutput || 'Copy will appear here...'}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Generated Creative</label>
                        <div className="aspect-square bg-white/5 border border-white/10 rounded-xl flex items-center justify-center overflow-hidden">
                           {imageLoading ? (
                             <div className="text-center space-y-2">
                               <p className="text-[10px] animate-pulse">Painting with Gemini 2.5...</p>
                             </div>
                           ) : marketingImg ? (
                             <img src={marketingImg} className="w-full h-full object-cover animate-in fade-in" />
                           ) : (
                             <span className="text-xs text-slate-500">Visual will appear here</span>
                           )}
                        </div>
                      </div>
                   </div>
                </div>

                {/* Coach Feedback Tool */}
                <div className="bg-white border rounded-2xl p-8 space-y-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-xl">🎙️</div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Coach Feedback Summarizer</h3>
                      <p className="text-xs text-slate-500">Transform voice notes into professional student logs.</p>
                    </div>
                  </div>
                  <textarea 
                    placeholder="Coach says: 'Excellent footwork today Marcus, focus more on hip rotation...'"
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    className="w-full border-slate-200 border-2 rounded-xl px-4 py-3 text-sm h-32 focus:border-indigo-500 outline-none"
                  />
                  <button 
                    onClick={handleSummarizeFeedback}
                    disabled={loading || !feedbackInput}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 w-full"
                  >
                    {loading ? 'Thinking...' : 'Generate Progress Summary'}
                  </button>
                  {feedbackOutput && (
                    <div className="p-6 bg-slate-50 border rounded-xl text-sm text-slate-700 whitespace-pre-wrap leading-relaxed animate-in zoom-in-95">
                      {feedbackOutput}
                    </div>
                  )}
                </div>

                {/* Testing Chat */}
                <div className="bg-white border rounded-2xl p-8 space-y-4 shadow-sm">
                  <h3 className="text-xl font-bold text-slate-900">Student AI Sandbox</h3>
                  <div className="bg-slate-50 border rounded-xl h-48 overflow-y-auto p-4 flex flex-col gap-3">
                    {chatHistory.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs ${msg.role === 'user' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-white border text-slate-700'}`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleTestChat()} placeholder="Ask the studio assistant..." className="flex-1 border rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500" />
                    <button onClick={handleTestChat} disabled={loading} className="bg-slate-900 text-white px-6 rounded-xl text-sm font-bold">{loading ? '...' : 'Test'}</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'leads' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex justify-between items-end">
                   <div>
                     <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Lead Pipeline</h2>
                     <p className="text-slate-500">Track and convert potential members from social media and your website.</p>
                   </div>
                   <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold">Manually Add Lead</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border shadow-sm border-t-4 border-t-indigo-500">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Leads</p>
                    <p className="text-2xl font-black text-slate-900">128</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border shadow-sm border-t-4 border-t-amber-500">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Needs Follow-up</p>
                    <p className="text-2xl font-black text-slate-900">14</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border shadow-sm border-t-4 border-t-green-500">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Conversion Rate</p>
                    <p className="text-2xl font-black text-slate-900">18.4%</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border shadow-sm border-t-4 border-t-slate-500">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">AI Handled</p>
                    <p className="text-2xl font-black text-slate-900">92%</p>
                  </div>
                </div>

                <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="px-8 py-5 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Name</th>
                        <th className="px-8 py-5 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Source</th>
                        <th className="px-8 py-5 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Status</th>
                        <th className="px-8 py-5 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Date Added</th>
                        <th className="px-8 py-5 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {leads.map(l => (
                        <tr key={l.id} className="hover:bg-slate-50/50 transition group cursor-pointer">
                          <td className="px-8 py-6">
                             <p className="font-bold text-slate-900">{l.name}</p>
                             <p className="text-[10px] text-slate-400">{l.email}</p>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">{l.source}</span>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-widest ${l.status === 'Trial Booked' ? 'bg-indigo-50 text-indigo-600' : l.status === 'New' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'}`}>
                              {l.status}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-slate-500">{l.date}</td>
                          <td className="px-8 py-6">
                             <button className="text-indigo-600 font-bold text-xs opacity-0 group-hover:opacity-100 transition">Contact AI Assistant</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Existing Tabs Re-Integrated */}
            {activeTab === 'classes' && <ClassesSection classes={classes} />}
            {activeTab === 'students' && <StudentsSection students={students} />}
            {activeTab === 'payments' && <PaymentsSection payments={payments} />}
            {activeTab === 'automations' && <AutomationsSection automations={automations} toggleAutomation={toggleAutomation} />}
            {activeTab === 'analytics' && <AnalyticsSection />}
          </section>

          {/* Real-time Preview Area */}
          <section className="w-full lg:w-[480px] bg-slate-100 p-12 flex flex-col items-center justify-start border-l border-slate-200 shrink-0">
             <div className="text-center mb-10">
                <div className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-extrabold uppercase tracking-widest mb-3">Mobile Build Preview</div>
                <h3 className="text-lg font-bold text-slate-900">White-Label Output</h3>
                <p className="text-xs text-slate-500 font-medium max-w-[240px] mt-1">Branded for {branding.businessName}</p>
             </div>
             <MobilePreview branding={branding} classes={classes} />
          </section>
        </div>
      </main>
    </div>
  );
};

// UI Components
const ClassesSection = ({ classes }: { classes: TrainingClass[] }) => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="flex justify-between items-end">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Session Schedules</h2>
        <p className="text-slate-500">Your academy's weekly lineup.</p>
      </div>
      <button className="bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-xl transition hover:scale-105 active:scale-95">Add Class</button>
    </div>
    <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 border-b">
          <tr>
            <th className="px-8 py-5 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Name</th>
            <th className="px-8 py-5 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Coach</th>
            <th className="px-8 py-5 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Time</th>
            <th className="px-8 py-5 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Occupancy</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {classes.map(c => (
            <tr key={c.id} className="hover:bg-slate-50/50 transition">
              <td className="px-8 py-6 font-bold text-slate-900">{c.name}</td>
              <td className="px-8 py-6 text-slate-600">{c.instructor}</td>
              <td className="px-8 py-6 text-slate-500 font-medium">{c.time}</td>
              <td className="px-8 py-6">
                <div className="flex items-center gap-2">
                   <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${(c.booked/c.capacity)*100}%` }} />
                   </div>
                   <span className="text-[10px] font-bold text-slate-400">{c.booked}/{c.capacity}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const StudentsSection = ({ students }: { students: Student[] }) => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <h2 className="text-3xl font-extrabold text-slate-900">Members Directory</h2>
    <div className="grid grid-cols-2 gap-4">
      {students.map(s => (
        <div key={s.id} className="bg-white p-6 border rounded-2xl flex items-center justify-between shadow-sm hover:border-indigo-200 transition">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-600">{s.name.charAt(0)}</div>
            <div>
              <p className="font-bold text-slate-900">{s.name}</p>
              <p className="text-xs text-slate-400">{s.email}</p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold text-green-600 bg-green-50 px-2 py-1 rounded-lg uppercase">{s.membershipStatus}</span>
        </div>
      ))}
    </div>
  </div>
);

const PaymentsSection = ({ payments }: { payments: PaymentRecord[] }) => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <h2 className="text-3xl font-extrabold text-slate-900">Billing History</h2>
    <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 border-b">
          <tr>
            <th className="px-8 py-5 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Student</th>
            <th className="px-8 py-5 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Amount</th>
            <th className="px-8 py-5 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {payments.map(p => (
            <tr key={p.id} className="hover:bg-slate-50/50 transition">
              <td className="px-8 py-6 font-bold text-slate-900">{p.studentName}</td>
              <td className="px-8 py-6 font-bold text-slate-800">${p.amount}</td>
              <td className="px-8 py-6">
                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${p.status === 'Succeeded' ? 'text-green-600 bg-green-50' : 'text-amber-600 bg-amber-50'}`}>{p.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const AutomationsSection = ({ automations, toggleAutomation }: { automations: Automation[], toggleAutomation: (id: string) => void }) => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <h2 className="text-3xl font-extrabold text-slate-900">Automation Workflows</h2>
    <div className="space-y-4">
      {automations.map(a => (
        <div key={a.id} className="bg-white border p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
             <span className="text-2xl">{a.type === 'WhatsApp' ? '💬' : a.type === 'Push' ? '🔔' : '✉️'}</span>
             <div>
               <h4 className="font-bold text-slate-900">{a.label}</h4>
               <p className="text-xs text-slate-400">{a.description}</p>
             </div>
          </div>
          <button onClick={() => toggleAutomation(a.id)} className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${a.enabled ? 'bg-indigo-600' : 'bg-slate-200'}`}>
             <div className={`w-4 h-4 bg-white rounded-full transition-transform ${a.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      ))}
    </div>
  </div>
);

const AnalyticsSection = () => (
  <div className="space-y-8 animate-in fade-in duration-500">
     <h2 className="text-3xl font-extrabold text-slate-900">Performance Dashboard</h2>
     <div className="grid grid-cols-3 gap-6">
        <StatCard label="Monthly Revenue" value="$14.2k" trend="+8%" />
        <StatCard label="Active Students" value="284" trend="+12" />
        <StatCard label="Lead Conv." value="14.2%" trend="+2.4%" />
     </div>
     <div className="h-64 bg-white border border-dashed rounded-2xl flex items-center justify-center text-slate-400 font-bold text-xs uppercase tracking-widest">
        Studio Utilization Chart Visual
     </div>
  </div>
);

const NavItem = ({ active, label, icon, onClick }: { active: boolean, label: string, icon: string, onClick: () => void }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-200 group ${active ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-800/80 text-slate-400'}`}>
    <span className={`text-lg ${active ? 'scale-110' : ''}`}>{icon}</span>
    <span className={`text-sm font-bold tracking-tight ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{label}</span>
  </button>
);

const StatCard = ({ label, value, trend }: { label: string, value: string, trend: string }) => (
  <div className="bg-white p-6 border rounded-2xl shadow-sm space-y-2">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
    <div className="flex items-end justify-between">
      <h4 className="text-2xl font-extrabold text-slate-900">{value}</h4>
      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{trend}</span>
    </div>
  </div>
);

export default App;
