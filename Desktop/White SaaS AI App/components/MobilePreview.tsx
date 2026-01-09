
import React, { useState } from 'react';
import { BrandingConfig, TrainingClass } from '../types';

interface MobilePreviewProps {
  branding: BrandingConfig;
  classes: TrainingClass[];
}

type MobileScreen = 'home' | 'classes' | 'chat';

const MobilePreview: React.FC<MobilePreviewProps> = ({ branding, classes }) => {
  const [activeScreen, setActiveScreen] = useState<MobileScreen>('home');

  const renderScreen = () => {
    switch(activeScreen) {
      case 'home':
        return (
          <div className="flex-1 overflow-y-auto animate-in fade-in slide-in-from-right-2 duration-300">
             <div className="relative h-40 w-full mb-4 group">
               <img src={branding.heroImage} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                 <p className="text-white text-[10px] font-bold uppercase tracking-widest mb-1 opacity-80">Featured Event</p>
                 <h4 className="text-white font-extrabold text-lg leading-tight">Elite Training Seminar 2024</h4>
               </div>
             </div>
             
             <div className="px-4 space-y-4 pb-8">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Your Membership</p>
                    <p className="text-xs font-extrabold text-slate-900">Black Belt Pro</p>
                  </div>
                  <div className="w-10 h-10 rounded-full border-4 border-indigo-100 border-t-indigo-600 flex items-center justify-center text-[10px] font-bold">85%</div>
                </div>

                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                   <div className="bg-white border rounded-xl p-3 shadow-sm hover:border-indigo-200 transition">
                      <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-2">🎟️</div>
                      <p className="text-[10px] font-bold">My Passes</p>
                   </div>
                   <div className="bg-white border rounded-xl p-3 shadow-sm hover:border-indigo-200 transition">
                      <div className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-2">📊</div>
                      <p className="text-[10px] font-bold">Progress</p>
                   </div>
                </div>
             </div>
          </div>
        );
      case 'classes':
        return (
          <div className="flex-1 overflow-y-auto p-4 animate-in fade-in slide-in-from-right-2 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Class Schedule</h3>
              <div className="bg-slate-100 rounded-full p-1 flex gap-1">
                 <div className="px-2 py-0.5 bg-white shadow-sm rounded-full text-[8px] font-bold">List</div>
                 <div className="px-2 py-0.5 text-slate-400 rounded-full text-[8px] font-bold">Cal</div>
              </div>
            </div>
            <div className="space-y-3 pb-8">
              {classes.map(c => (
                <div key={c.id} className="p-4 border border-slate-100 rounded-2xl flex justify-between items-center shadow-sm bg-white hover:border-indigo-100 transition">
                  <div>
                    <div className="text-[12px] font-extrabold text-slate-900">{c.name}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{c.time} • {c.instructor}</div>
                  </div>
                  <button 
                    className="px-4 py-1.5 text-[10px] font-bold text-white shadow-lg shadow-current/20 active:scale-95 transition"
                    style={{ backgroundColor: branding.secondaryColor, borderRadius: branding.borderRadius }}
                  >
                    Book
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'chat':
        return (
          <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-2 duration-300">
             <div className="flex-1 p-4 overflow-y-auto space-y-4">
                <div className="bg-slate-100 rounded-2xl p-3 max-w-[85%] text-[11px] text-slate-600 leading-relaxed font-medium">
                  Hi! I'm your {branding.businessName} Assistant. How can I help you today?
                </div>
                <div className="bg-indigo-600 text-white rounded-2xl p-3 max-w-[85%] ml-auto text-[11px] leading-relaxed font-medium shadow-lg shadow-indigo-600/20">
                  What classes are available on Monday?
                </div>
                <div className="bg-slate-100 rounded-2xl p-3 max-w-[85%] text-[11px] text-slate-600 leading-relaxed font-medium">
                  We have Morning Muay Thai at 7:30 AM and Brazilian Jiu-Jitsu at 5:30 PM. Would you like to book one?
                </div>
             </div>
             <div className="p-4 border-t bg-slate-50">
                <div className="bg-white border border-slate-200 rounded-full px-4 py-2 flex items-center justify-between shadow-inner">
                   <span className="text-[10px] text-slate-400 font-medium">Ask something...</span>
                   <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center">⬆️</div>
                </div>
             </div>
          </div>
        );
    }
  };

  return (
    <div className="relative mx-auto border-slate-900 bg-slate-900 border-[14px] rounded-[3rem] h-[640px] w-[320px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden scale-90 lg:scale-100">
      {/* Device Side Buttons */}
      <div className="h-[40px] w-[4px] bg-slate-800 absolute -start-[17px] top-[100px] rounded-s-lg border border-slate-700/50"></div>
      <div className="h-[60px] w-[4px] bg-slate-800 absolute -start-[17px] top-[160px] rounded-s-lg border border-slate-700/50"></div>
      <div className="h-[80px] w-[4px] bg-slate-800 absolute -end-[17px] top-[140px] rounded-e-lg border border-slate-700/50"></div>
      
      {/* Dynamic App Shell */}
      <div className="rounded-[2.5rem] overflow-hidden w-full h-full bg-white flex flex-col">
        {/* Mobile Status Bar */}
        <div className="h-10 px-6 flex items-center justify-between text-[11px] font-bold text-slate-900">
          <span>9:41</span>
          <div className="flex gap-1.5 items-center">
            <span className="w-3.5 h-3.5 bg-slate-900 rounded-[2px] opacity-20"></span>
            <span className="w-4 h-2 bg-slate-900 rounded-[1px]"></span>
          </div>
        </div>

        {/* Branding Header */}
        <header 
          className="p-4 flex items-center justify-between text-white shadow-xl relative z-10"
          style={{ backgroundColor: branding.primaryColor }}
        >
          <div className="flex items-center gap-2 max-w-[70%]">
            <div className="shrink-0 w-8 h-8 rounded-xl bg-white/20 border border-white/30 p-1 backdrop-blur-md overflow-hidden flex items-center justify-center">
              <img src={branding.logoUrl} alt="logo" className="max-w-full max-h-full object-contain" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest truncate">{branding.businessName}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs">🔔</div>
        </header>

        {/* Dynamic Content */}
        {renderScreen()}

        {/* Tab Bar Interaction */}
        <nav className="h-18 border-t flex justify-around items-center px-4 bg-white/95 backdrop-blur-md shrink-0 pb-2 pt-2">
          <TabButton 
            active={activeScreen === 'home'} 
            label="Home" 
            icon="🏠" 
            onClick={() => setActiveScreen('home')} 
            activeColor={branding.primaryColor}
          />
          <TabButton 
            active={activeScreen === 'classes'} 
            label="Booking" 
            icon="🎟️" 
            onClick={() => setActiveScreen('classes')} 
            activeColor={branding.primaryColor}
          />
          <TabButton 
            active={activeScreen === 'chat'} 
            label="AI Assist" 
            icon="🧠" 
            onClick={() => setActiveScreen('chat')} 
            activeColor={branding.primaryColor}
          />
        </nav>
        
        {/* Home Indicator */}
        <div className="flex justify-center pb-2 bg-white">
           <div className="w-24 h-1 bg-slate-900/10 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, label, icon, onClick, activeColor }: { active: boolean, label: string, icon: string, onClick: () => void, activeColor: string }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-0.5 group">
    <span className={`text-base transition-transform ${active ? 'scale-110' : 'opacity-40 grayscale group-hover:opacity-60'}`}>{icon}</span>
    <span className={`text-[9px] font-black uppercase tracking-tighter ${active ? '' : 'text-slate-400 font-bold'}`} style={{ color: active ? activeColor : undefined }}>
      {label}
    </span>
    {active && <div className="w-1 h-1 rounded-full mt-0.5" style={{ backgroundColor: activeColor }}></div>}
  </button>
);

export default MobilePreview;
