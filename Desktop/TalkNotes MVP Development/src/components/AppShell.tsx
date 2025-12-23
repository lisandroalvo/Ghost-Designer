import React from 'react';

type Tab = 'record' | 'transcript' | 'analysis' | 'export';

interface AppShellProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  sessionState: 'idle' | 'recording' | 'processing' | 'results';
  children: React.ReactNode;
}

export function AppShell({ 
  activeTab, 
  onTabChange, 
  isDarkMode, 
  onToggleTheme,
  sessionState,
  children 
}: AppShellProps) {
  const tabs: { id: Tab; label: string; icon: JSX.Element }[] = [
    {
      id: 'record',
      label: 'Record',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
    {
      id: 'transcript',
      label: 'Transcript',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
      ),
    },
    {
      id: 'analysis',
      label: 'Analysis',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
    {
      id: 'export',
      label: 'Export',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      ),
    },
  ];

  const getStatusIndicator = () => {
    if (sessionState === 'recording') {
      return (
        <div className="status-indicator recording">
          <div className="pulse-dot"></div>
          <span>Recording</span>
        </div>
      );
    }
    if (sessionState === 'processing') {
      return (
        <div className="status-indicator processing">
          <div className="spinner"></div>
          <span>Processing</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`app-shell ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Top Bar */}
      <header className="top-bar">
        <div className="top-bar-content">
          <h1 className="app-title">TalkNotes</h1>
          
          <div className="top-bar-right">
            {getStatusIndicator()}
            
            <button
              onClick={onToggleTheme}
              className="theme-toggle-btn"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <svg className="theme-icon" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                {isDarkMode ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="main-layout">
        {/* Desktop Sidebar */}
        <nav className="sidebar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`sidebar-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Content Area */}
        <main className="content-area">
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="bottom-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`bottom-nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <style jsx>{`
        .app-shell {
          position: fixed;
          inset: 0;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
          color: var(--text-primary);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        }

        .app-shell.dark {
          --bg-primary: #0B0D10;
          --bg-secondary: #111418;
          --bg-tertiary: #13151a;
          --border-color: rgba(255, 255, 255, 0.08);
          --text-primary: rgba(255, 255, 255, 0.9);
          --text-secondary: rgba(255, 255, 255, 0.6);
          --accent-color: #34c98f;
          --accent-hover: rgba(52, 201, 143, 0.1);
        }

        .app-shell.light {
          --bg-primary: #f8f9fa;
          --bg-secondary: #ffffff;
          --bg-tertiary: #f1f3f4;
          --border-color: rgba(0, 0, 0, 0.08);
          --text-primary: rgba(0, 0, 0, 0.9);
          --text-secondary: rgba(0, 0, 0, 0.6);
          --accent-color: #1e8e5e;
          --accent-hover: rgba(30, 142, 94, 0.1);
        }

        /* Top Bar */
        .top-bar {
          height: 64px;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-secondary);
          flex-shrink: 0;
          z-index: 100;
        }

        .top-bar-content {
          height: 100%;
          max-width: 100%;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .app-title {
          font-size: 20px;
          font-weight: 500;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }

        .top-bar-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
        }

        .status-indicator.recording {
          background: rgba(52, 201, 143, 0.1);
          color: var(--accent-color);
        }

        .status-indicator.processing {
          background: rgba(52, 201, 143, 0.1);
          color: var(--accent-color);
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent-color);
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid var(--accent-color);
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .theme-toggle-btn {
          padding: 8px;
          background: transparent;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          cursor: pointer;
          transition: all 150ms ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .theme-toggle-btn:hover {
          background: var(--accent-hover);
          border-color: var(--accent-color);
        }

        .theme-icon {
          width: 18px;
          height: 18px;
          color: var(--text-secondary);
        }

        /* Main Layout */
        .main-layout {
          flex: 1;
          display: flex;
          overflow: hidden;
          position: relative;
        }

        /* Desktop Sidebar */
        .sidebar {
          width: 240px;
          border-right: 1px solid var(--border-color);
          background: var(--bg-secondary);
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex-shrink: 0;
        }

        .sidebar-tab {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border: none;
          background: transparent;
          border-radius: 10px;
          cursor: pointer;
          transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
          color: var(--text-secondary);
          font-size: 15px;
          font-weight: 500;
          letter-spacing: -0.01em;
        }

        .sidebar-tab:hover {
          background: var(--accent-hover);
          color: var(--text-primary);
        }

        .sidebar-tab.active {
          background: var(--accent-hover);
          color: var(--accent-color);
        }

        .sidebar-tab .tab-icon {
          flex-shrink: 0;
          display: flex;
          opacity: 0.7;
        }

        .sidebar-tab.active .tab-icon {
          opacity: 1;
        }

        .sidebar-tab .tab-label {
          flex: 1;
          text-align: left;
        }

        /* Content Area */
        .content-area {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          background: var(--bg-primary);
        }

        /* Mobile Bottom Nav */
        .bottom-nav {
          display: none;
          height: 64px;
          border-top: 1px solid var(--border-color);
          background: var(--bg-secondary);
          padding: 0 8px;
          flex-shrink: 0;
        }

        .bottom-nav-tab {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 200ms ease;
          color: var(--text-secondary);
          padding: 8px;
        }

        .bottom-nav-tab:hover {
          color: var(--text-primary);
        }

        .bottom-nav-tab.active {
          color: var(--accent-color);
        }

        .bottom-nav-tab .tab-icon {
          display: flex;
          opacity: 0.7;
        }

        .bottom-nav-tab.active .tab-icon {
          opacity: 1;
        }

        .bottom-nav-tab .tab-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.01em;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .sidebar {
            display: none;
          }

          .bottom-nav {
            display: flex;
          }

          .content-area {
            padding-bottom: 0;
          }
        }

        @media (min-width: 769px) {
          .bottom-nav {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
