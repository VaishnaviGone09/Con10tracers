import React, { useState } from 'react';
import { useInvestigation } from '../../context/InvestigationContext';
import { Con10tracersLogo } from '../brand/Logo';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Network,
  FileCheck2,
  Clock,
  Sparkles,
  Binary,
  Radio,
  BellRing,
  FileText,
  FileSpreadsheet,
  Settings,
  Search,
  ChevronDown,
  X,
  CheckCircle,
  AlertTriangle,
  Upload,
  PlusCircle,
  LogOut,
} from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const {
    currentRoute,
    navigate,
    currentCaseId,
    setCurrentCaseId,
    cases,
    notifications,
    dismissNotification,
    isNewCaseModalOpen,
    setIsNewCaseModalOpen,
    isUploadModalOpen,
    setIsUploadModalOpen,
    setIsAuthenticated,
    currentUser,
  } = useInvestigation();

  const [isRailExpanded, setIsRailExpanded] = useState(false);
  const [isCaseDropdownOpen, setIsCaseDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');

  // New Case Modal Form state
  const [newCaseTitle, setNewCaseTitle] = useState('');
  const [newCaseDesc, setNewCaseDesc] = useState('');
  const [newCaseRef, setNewCaseRef] = useState('');

  // Upload Modal Form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Grouped Navigation Items matching prompt specification
  const navSections = [
    {
      group: '',
      items: [
        {
          route: '/dashboard',
          label: 'Command Center',
          icon: LayoutDashboard,
          badge: null,
        },
      ],
    },
    {
      group: 'INVESTIGATE',
      items: [
        {
          route: '/investigations',
          label: 'Investigations',
          icon: FolderKanban,
          badge: cases.length.toString(),
        },
        {
          route: '/entities',
          label: 'Entities',
          icon: Users,
          badge: null,
        },
        {
          route: '/network',
          label: 'Network',
          icon: Network,
          badge: 'Live',
        },
      ],
    },
    {
      group: 'UNDERSTAND',
      items: [
        {
          route: '/evidence',
          label: 'Evidence',
          icon: FileCheck2,
          badge: null,
        },
        {
          route: '/timeline',
          label: 'Timeline',
          icon: Clock,
          badge: null,
        },
        {
          route: '/ai',
          label: 'AI Assistant',
          icon: Sparkles,
          badge: 'Explain',
        },
        {
          route: '/obfuscation',
          label: 'Obfuscation',
          icon: Binary,
          badge: null,
        },
      ],
    },
    {
      group: 'MONITOR',
      items: [
        {
          route: '/monitoring',
          label: '24H Watch',
          icon: Radio,
          badge: 'Active',
        },
        {
          route: '/alerts',
          label: 'Alerts',
          icon: BellRing,
          badge: '8',
          alertColor: 'text-red-400',
        },
      ],
    },
    {
      group: 'OUTPUT',
      items: [
        {
          route: '/documents',
          label: 'Documents',
          icon: FileText,
          badge: null,
        },
        {
          route: '/reports',
          label: 'Reports',
          icon: FileSpreadsheet,
          badge: null,
        },
      ],
    },
    {
      group: 'SYSTEM',
      items: [
        {
          route: '/settings',
          label: 'Settings',
          icon: Settings,
          badge: null,
        },
      ],
    },
  ];

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearchTerm.trim()) return;
    navigate(`/entities?search=${encodeURIComponent(globalSearchTerm)}`);
  };

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseTitle.trim()) return;
    const newId = `CASE-${cases.length + 101}`;
    setCurrentCaseId(newId);
    setIsNewCaseModalOpen(false);
    navigate(`/investigations/${newId}`);
    setNewCaseTitle('');
    setNewCaseDesc('');
    setNewCaseRef('');
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setIsUploadModalOpen(false);
      navigate('/documents');
    }, 450);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#07080B] text-white select-none">
      {/* 1. Intelligent Compact Navigation Rail */}
      <aside
        onMouseEnter={() => setIsRailExpanded(true)}
        onMouseLeave={() => setIsRailExpanded(false)}
        className={`relative z-40 flex flex-col justify-between h-full bg-[#0B0D12] border-r border-white/5 transition-all duration-300 ease-in-out shrink-0 ${
          isRailExpanded ? 'w-60 shadow-2xl' : 'w-16'
        }`}
      >
        {/* Top Logo - Clickable to Enlarge Insignia */}
        <div className="flex items-center h-16 px-3 border-b border-white/5 overflow-hidden">
          <div className="cursor-pointer flex items-center">
            <Con10tracersLogo
              size="sm"
              markOnly={!isRailExpanded}
              showTagline={false}
              enlargeable={true}
              glow
              className="transition-all duration-300"
            />
          </div>
        </div>

        {/* Middle Navigation Icons */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-4 scrollbar-none">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {isRailExpanded && section.group && (
                <span className="px-2.5 text-[9px] font-bold tracking-[0.2em] text-white/30 uppercase block">
                  {section.group}
                </span>
              )}
              {section.items.map((item) => {
                const isActive = currentRoute === item.route || currentRoute.startsWith(item.route + '/');
                const Icon = item.icon;

                return (
                  <button
                    key={item.route}
                    onClick={() => navigate(item.route)}
                    title={!isRailExpanded ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all group relative ${
                      isActive
                        ? 'bg-purple-950/60 text-purple-200 border border-purple-700/50 shadow-[0_0_12px_rgba(139,92,246,0.2)]'
                        : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {/* Animated Icon Container */}
                    <div
                      className={`w-7 h-7 shrink-0 rounded-md flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-purple-600 text-white'
                          : 'group-hover:text-purple-300 group-hover:scale-105'
                      }`}
                    >
                      <Icon size={16} />
                    </div>

                    {/* Label (when rail expanded) */}
                    {isRailExpanded && (
                      <span className="truncate text-left flex-1 tracking-wide">
                        {item.label}
                      </span>
                    )}

                    {/* Badge */}
                    {item.badge && isRailExpanded && (
                      <span
                        className={`text-[9.5px] px-1.5 py-0.5 rounded font-mono font-bold ${
                          item.alertColor
                            ? 'bg-red-950/80 text-red-300 border border-red-800/50'
                            : 'bg-white/10 text-white/70'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* Left Active Pip Indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-purple-400 rounded-r" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom User / Logout */}
        <div className="p-2 border-t border-white/5">
          <button
            onClick={() => setIsAuthenticated(false)}
            title="Log Out / Exit Environment"
            className="w-full flex items-center gap-3 px-2.5 py-2 text-white/50 hover:text-red-400 hover:bg-red-950/20 rounded-lg text-xs transition"
          >
            <div className="w-7 h-7 rounded-md flex items-center justify-center">
              <LogOut size={16} />
            </div>
            {isRailExpanded && <span className="truncate">Exit Intelligence</span>}
          </button>
        </div>
      </aside>

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Persistent Top Utility Header */}
        <header className="h-14 shrink-0 bg-[#0B0D12]/90 backdrop-blur-md border-b border-white/5 px-6 flex items-center justify-between gap-4 z-30">
          {/* Active Case Selector */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setIsCaseDropdownOpen(!isCaseDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#121620] hover:bg-[#161C2A] border border-purple-500/30 rounded-lg text-xs text-white transition"
              >
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span className="font-mono text-purple-300 font-bold">{currentCaseId}</span>
                <span className="text-white/40">|</span>
                <span className="truncate max-w-[180px] text-white/90">
                  {cases.find((c) => c.id === currentCaseId)?.title || 'Active Investigation'}
                </span>
                <ChevronDown size={13} className="text-white/40" />
              </button>

              {/* Case Switcher Dropdown */}
              {isCaseDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-72 bg-[#0E1118] border border-white/10 rounded-xl shadow-2xl p-1.5 z-50">
                  <div className="px-2 py-1 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    Switch Investigation Scope
                  </div>
                  {cases.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setCurrentCaseId(c.id);
                        setIsCaseDropdownOpen(false);
                      }}
                      className={`p-2 rounded-lg text-xs cursor-pointer flex flex-col gap-0.5 transition ${
                        c.id === currentCaseId
                          ? 'bg-purple-950/60 text-purple-200 border border-purple-700/40'
                          : 'hover:bg-white/[0.04] text-white/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-purple-300">{c.id}</span>
                        <span className="text-[10px] text-white/40">{c.entityCount} Entities</span>
                      </div>
                      <span className="font-medium text-white truncate">{c.title}</span>
                    </div>
                  ))}
                  <div className="border-t border-white/5 pt-1 mt-1">
                    <button
                      onClick={() => {
                        setIsCaseDropdownOpen(false);
                        setIsNewCaseModalOpen(true);
                      }}
                      className="w-full py-1.5 text-center text-xs text-purple-300 hover:text-purple-200 flex items-center justify-center gap-1"
                    >
                      <PlusCircle size={13} />
                      <span>+ Create New Investigation</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Status Tag */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-[10px] text-emerald-300 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>24H WATCH: ACTIVE</span>
            </div>
          </div>

          {/* Center Search Bar */}
          <form onSubmit={handleGlobalSearch} className="hidden sm:flex items-center flex-1 max-w-md">
            <div className="relative w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={globalSearchTerm}
                onChange={(e) => setGlobalSearchTerm(e.target.value)}
                placeholder="Search across all entities, phone numbers, accounts, locations..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#10131A] text-white border border-white/10 rounded-lg placeholder-white/30 focus:outline-none focus:border-purple-500 transition"
              />
            </div>
          </form>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            {/* Ask AI Shortcut */}
            <button
              onClick={() => navigate('/ai')}
              className="px-2.5 py-1 text-xs bg-purple-950/50 hover:bg-purple-900/60 border border-purple-700/50 text-purple-300 rounded-lg flex items-center gap-1.5 transition"
            >
              <Sparkles size={13} />
              <span className="hidden md:inline">Ask AI</span>
            </button>

            {/* Notifications / Signal Pulses */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-1.5 text-white/60 hover:text-white bg-[#10131A] border border-white/10 rounded-lg transition"
              >
                <BellRing size={15} />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#0E1118] border border-white/10 rounded-xl shadow-2xl p-2 z-50">
                  <div className="flex items-center justify-between px-2 py-1 border-b border-white/5">
                    <span className="text-[10px] font-bold tracking-widest text-white/50 uppercase">
                      Intelligence Signals & Alerts
                    </span>
                    <span className="text-[10px] text-purple-400">{notifications.length} Unread</span>
                  </div>
                  <div className="space-y-1.5 max-h-64 overflow-y-auto mt-1.5">
                    {notifications.length === 0 ? (
                      <p className="text-center text-xs text-white/40 py-4">No active signals.</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className="p-2 rounded-lg bg-white/[0.02] border border-white/5 text-xs flex items-start justify-between gap-2"
                        >
                          <div>
                            <span className="font-bold text-purple-300 text-[11px] block">{n.title}</span>
                            <span className="text-white/70 text-[10px] block mt-0.5">{n.message}</span>
                            <span className="text-white/30 text-[9px] block mt-1">{n.timestamp}</span>
                          </div>
                          <button
                            onClick={() => dismissNotification(n.id)}
                            className="text-white/40 hover:text-white"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="border-t border-white/5 pt-1.5 mt-1.5">
                    <button
                      onClick={() => {
                        setIsNotificationsOpen(false);
                        navigate('/alerts');
                      }}
                      className="w-full text-center text-xs text-purple-300 hover:text-purple-200"
                    >
                      View All Priority Alerts →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Badge */}
            <div
              onClick={() => navigate('/settings')}
              className="hidden lg:flex items-center gap-2 pl-2 border-l border-white/10 cursor-pointer text-xs"
            >
              <div className="w-7 h-7 rounded-full bg-purple-950 border border-purple-700/50 flex items-center justify-center text-purple-300 font-bold">
                MT
              </div>
              <div className="text-left">
                <span className="font-medium text-white block text-[11px] leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[9.5px] text-white/40 font-mono block">
                  {currentUser.badge}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content View Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 bg-[#07080B]">
          {children}
        </main>
      </div>

      {/* Global Modal: New Investigation */}
      {isNewCaseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0E1118] border border-white/10 rounded-2xl p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold tracking-wider uppercase text-purple-300">
                + Create New Investigation
              </h3>
              <button
                onClick={() => setIsNewCaseModalOpen(false)}
                className="text-white/40 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-white/60 mb-1">Investigation Name</label>
                <input
                  type="text"
                  required
                  value={newCaseTitle}
                  onChange={(e) => setNewCaseTitle(e.target.value)}
                  placeholder="e.g. Operation Sovereign Gate"
                  className="w-full p-2 bg-[#121620] border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-white/60 mb-1">Reference ID (Optional)</label>
                <input
                  type="text"
                  value={newCaseRef}
                  onChange={(e) => setNewCaseRef(e.target.value)}
                  placeholder="e.g. REF-2026-SVG-401"
                  className="w-full p-2 bg-[#121620] border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-white/60 mb-1">Scope & Objective</label>
                <textarea
                  rows={3}
                  value={newCaseDesc}
                  onChange={(e) => setNewCaseDesc(e.target.value)}
                  placeholder="Summarize initial lead, intelligence source, and focal targets..."
                  className="w-full p-2 bg-[#121620] border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsNewCaseModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-white/10 text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition"
                >
                  Initialize Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Modal: Upload Document */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0E1118] border border-white/10 rounded-2xl p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold tracking-wider uppercase text-purple-300">
                Upload Investigation Source Document
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-white/40 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 mt-4 text-xs">
              <div className="border-2 border-dashed border-white/15 rounded-xl p-6 text-center hover:border-purple-500/50 transition cursor-pointer">
                <Upload size={28} className="mx-auto text-purple-400 mb-2" />
                <p className="text-white/80 font-medium">Select or drag FIR / transcript file</p>
                <p className="text-[10px] text-white/40 mt-1">PDF, DOCX, TXT, LOG, JSON (Up to 50MB)</p>
                <input
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="mt-3 text-[11px] text-white/60 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-purple-900 file:text-purple-200"
                />
              </div>

              <div>
                <label className="block text-white/60 mb-1">Target Investigation Scope</label>
                <select
                  value={currentCaseId}
                  onChange={(e) => setCurrentCaseId(e.target.value)}
                  className="w-full p-2 bg-[#121620] border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-purple-500"
                >
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id}: {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-white/10 text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition flex items-center gap-1.5"
                >
                  {isUploading ? (
                    <>
                      <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Ingesting...</span>
                    </>
                  ) : (
                    <span>Ingest & Extract Entities</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
