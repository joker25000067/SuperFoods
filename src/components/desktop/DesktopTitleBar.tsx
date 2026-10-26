import React, { useState, useEffect, useRef } from 'react';
import {
  Factory,
  Search,
  Maximize2,
  Minimize2,
  Minus,
  Square,
  X,
  Calculator,
  Keyboard,
  Printer,
  RotateCcw,
  HardDrive,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  FileSpreadsheet,
  HelpCircle,
  Clock as ClockIcon,
  Monitor,
} from 'lucide-react';

interface DesktopTitleBarProps {
  factoryName: string;
  onNavigate: (tabId: string) => void;
  onOpenCommandPalette: () => void;
  onOpenCalculator: () => void;
  onOpenShortcuts: () => void;
  onOpenDesktopIconModal: () => void;
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

export const DesktopTitleBar: React.FC<DesktopTitleBarProps> = ({
  factoryName,
  onNavigate,
  onOpenCommandPalette,
  onOpenCalculator,
  onOpenShortcuts,
  onOpenDesktopIconModal,
  onToggleSidebar,
  isSidebarCollapsed,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
      );
      setCurrentDate(
        now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="no-print bg-slate-950 text-slate-200 border-b border-slate-800 select-none z-40 shrink-0">
      {/* Top Application Frame Bar */}
      <div className="h-9 px-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-950 text-xs">
        {/* Left: Window Identity & System Indicator */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-5 h-5 rounded bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs shrink-0">
            <Factory className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-100 truncate text-[11px] sm:text-xs tracking-tight">
            {factoryName || 'Factory Record System'}
          </span>
          <span className="hidden md:inline-block text-[10px] text-slate-500 font-mono">·</span>
          <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Desktop Edition · Offline Local Storage</span>
          </span>
        </div>

        {/* Center: Search / Command Palette Trigger */}
        <div className="hidden lg:flex items-center justify-center flex-1 max-w-sm px-4">
          <button
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800/80 border border-slate-800 text-[11px] text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3 h-3 text-amber-400" />
              <span>Search modules, items, parties...</span>
            </div>
            <kbd className="px-1 py-0.2 text-[9px] font-mono text-slate-400 bg-slate-950 border border-slate-800 rounded">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right: Live Clock & Native Window Controls */}
        <div className="flex items-center gap-2">
          {/* Live Clock */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-slate-400 mr-2">
            <ClockIcon className="w-3 h-3 text-amber-500" />
            <span>{currentDate}</span>
            <span className="text-slate-200 font-bold">{currentTime}</span>
          </div>

          {/* Create Desktop Double-Click Icon button */}
          <button
            onClick={onOpenDesktopIconModal}
            className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition cursor-pointer mr-1"
            title="Create Double-Click Icon for Windows Desktop (.bat)"
          >
            <Monitor className="w-3.5 h-3.5 text-amber-400" />
            <span>Desktop Icon (ڈبل کلک)</span>
          </button>

          {/* Quick Calculator Tool button */}
          <button
            onClick={onOpenCalculator}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition cursor-pointer"
            title="Desktop Calculator (Alt+C)"
          >
            <Calculator className="w-3.5 h-3.5" />
          </button>

          {/* Window Control Buttons */}
          <div className="flex items-center border-l border-slate-800 pl-2 ml-1">
            <button
              onClick={() => onNavigate('dashboard')}
              className="w-7 h-6 flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition cursor-pointer"
              title="Minimize to Dashboard"
            >
              <Minus className="w-3 h-3" />
            </button>
            <button
              onClick={handleToggleFullscreen}
              className="w-7 h-6 flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition cursor-pointer"
              title={isFullscreen ? 'Restore' : 'Maximize (F11)'}
            >
              <Square className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={() => {
                if (window.confirm('Do you want to minimize or reload the desktop application session?')) {
                  window.location.reload();
                }
              }}
              className="w-7 h-6 flex items-center justify-center hover:bg-rose-600 text-slate-400 hover:text-white rounded transition cursor-pointer"
              title="Close Session"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Classic Desktop Application Menu Bar */}
      <div
        ref={menuRef}
        className="h-7 px-2 flex items-center justify-between bg-slate-900 border-b border-slate-800 text-[11px] font-medium"
      >
        <div className="flex items-center space-x-0.5">
          {/* File Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
              className={`px-2 py-0.5 rounded transition cursor-pointer ${
                activeMenu === 'file' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              File
            </button>
            {activeMenu === 'file' && (
              <div className="absolute left-0 top-full mt-1 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-1 z-50 text-xs">
                <button
                  onClick={() => { onNavigate('sales'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200 flex justify-between"
                >
                  <span>New Sale Order</span>
                  <span className="text-[10px] text-slate-500 font-mono">F2</span>
                </button>
                <button
                  onClick={() => { onNavigate('production'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200 flex justify-between"
                >
                  <span>New Production Batch</span>
                  <span className="text-[10px] text-slate-500 font-mono">F3</span>
                </button>
                <button
                  onClick={() => { onNavigate('cashbook'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200 flex justify-between"
                >
                  <span>Cashbook Roznamcha</span>
                  <span className="text-[10px] text-slate-500 font-mono">F4</span>
                </button>
                <div className="my-1 border-t border-slate-800" />
                <button
                  onClick={() => { handlePrint(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200 flex justify-between"
                >
                  <span>Print Document</span>
                  <span className="text-[10px] text-slate-500 font-mono">Ctrl+P</span>
                </button>
                <button
                  onClick={() => { onNavigate('backup'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200 flex items-center gap-1.5"
                >
                  <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                  <span>Backup & Restore DB</span>
                </button>
                <button
                  onClick={() => { onOpenDesktopIconModal(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-amber-300 font-semibold flex items-center gap-1.5"
                >
                  <Monitor className="w-3.5 h-3.5 text-amber-400" />
                  <span>Create Desktop Icon (.bat)</span>
                </button>
                <div className="my-1 border-t border-slate-800" />
                <button
                  onClick={() => { window.location.reload(); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200 flex justify-between"
                >
                  <span>Reload Session</span>
                  <span className="text-[10px] text-slate-500 font-mono">F5</span>
                </button>
              </div>
            )}
          </div>

          {/* Edit Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
              className={`px-2 py-0.5 rounded transition cursor-pointer ${
                activeMenu === 'edit' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Edit
            </button>
            {activeMenu === 'edit' && (
              <div className="absolute left-0 top-full mt-1 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-1 z-50 text-xs">
                <button
                  onClick={() => { onOpenCommandPalette(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200 flex justify-between"
                >
                  <span>Find Record</span>
                  <span className="text-[10px] text-slate-500 font-mono">Ctrl+K</span>
                </button>
                <button
                  onClick={() => { onNavigate('settings'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200"
                >
                  Factory Profile Settings
                </button>
              </div>
            )}
          </div>

          {/* View Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'view' ? null : 'view')}
              className={`px-2 py-0.5 rounded transition cursor-pointer ${
                activeMenu === 'view' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              View
            </button>
            {activeMenu === 'view' && (
              <div className="absolute left-0 top-full mt-1 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-1 z-50 text-xs">
                <button
                  onClick={() => { onToggleSidebar(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200 flex justify-between"
                >
                  <span>{isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}</span>
                  <span className="text-[10px] text-slate-500 font-mono">Ctrl+B</span>
                </button>
                <button
                  onClick={() => { onNavigate('dashboard'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200 flex justify-between"
                >
                  <span>Dashboard</span>
                  <span className="text-[10px] text-slate-500 font-mono">F1</span>
                </button>
                <button
                  onClick={() => { handleToggleFullscreen(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200 flex justify-between"
                >
                  <span>Toggle Fullscreen</span>
                  <span className="text-[10px] text-slate-500 font-mono">F11</span>
                </button>
              </div>
            )}
          </div>

          {/* Operations Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'operations' ? null : 'operations')}
              className={`px-2 py-0.5 rounded transition cursor-pointer ${
                activeMenu === 'operations' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Operations
            </button>
            {activeMenu === 'operations' && (
              <div className="absolute left-0 top-full mt-1 w-52 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-1 z-50 text-xs">
                <button
                  onClick={() => { onNavigate('sales'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200"
                >
                  Sales & Orders
                </button>
                <button
                  onClick={() => { onNavigate('production'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200"
                >
                  Production Batches
                </button>
                <button
                  onClick={() => { onNavigate('stock'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200"
                >
                  Stock & Inventory
                </button>
                <button
                  onClick={() => { onNavigate('products'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200"
                >
                  Finished Products Catalog
                </button>
                <button
                  onClick={() => { onNavigate('customers'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200"
                >
                  Customers & Ledgers
                </button>
                <button
                  onClick={() => { onNavigate('suppliers'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200"
                >
                  Suppliers & Vendors
                </button>
                <button
                  onClick={() => { onNavigate('employees'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200"
                >
                  Factory Labor & Staff
                </button>
              </div>
            )}
          </div>

          {/* Reports Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'reports' ? null : 'reports')}
              className={`px-2 py-0.5 rounded transition cursor-pointer ${
                activeMenu === 'reports' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Reports
            </button>
            {activeMenu === 'reports' && (
              <div className="absolute left-0 top-full mt-1 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-1 z-50 text-xs">
                <button
                  onClick={() => { onNavigate('reports'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200"
                >
                  Financial P&L & Audits
                </button>
                <button
                  onClick={() => { onNavigate('cashbook'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200"
                >
                  Cashbook Daily Ledger
                </button>
                <button
                  onClick={() => { onNavigate('attendance'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200"
                >
                  Attendance Register
                </button>
              </div>
            )}
          </div>

          {/* Tools Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'tools' ? null : 'tools')}
              className={`px-2 py-0.5 rounded transition cursor-pointer ${
                activeMenu === 'tools' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Tools
            </button>
            {activeMenu === 'tools' && (
              <div className="absolute left-0 top-full mt-1 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-1 z-50 text-xs">
                <button
                  onClick={() => { onOpenCalculator(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200 flex justify-between"
                >
                  <span>Desktop Calculator</span>
                  <span className="text-[10px] text-slate-500 font-mono">Alt+C</span>
                </button>
                <button
                  onClick={() => { onNavigate('backup'); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200"
                >
                  Export Local Backup
                </button>
                <button
                  onClick={() => { onOpenDesktopIconModal(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-amber-300 font-semibold flex items-center justify-between"
                >
                  <span>Create Desktop Icon (.bat)</span>
                  <span className="text-[10px] bg-amber-500/20 px-1 rounded text-amber-400">Double-Click</span>
                </button>
              </div>
            )}
          </div>

          {/* Help Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'help' ? null : 'help')}
              className={`px-2 py-0.5 rounded transition cursor-pointer ${
                activeMenu === 'help' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Help
            </button>
            {activeMenu === 'help' && (
              <div className="absolute left-0 top-full mt-1 w-52 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-1 z-50 text-xs">
                <button
                  onClick={() => { onOpenShortcuts(); setActiveMenu(null); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-200 flex justify-between"
                >
                  <span>Keyboard Shortcuts</span>
                  <span className="text-[10px] text-slate-500 font-mono">F1</span>
                </button>
                <div className="my-1 border-t border-slate-800" />
                <div className="px-3 py-1 text-[10px] text-slate-400">
                  <div>Factory Pro v2.5.0</div>
                  <div>100% Offline IndexedDB Engine</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right side helper shortcuts */}
        <div className="flex items-center gap-2 text-slate-400 text-[10px]">
          <span className="hidden sm:inline">Shortcuts:</span>
          <span className="text-amber-400 font-mono">F2</span> Sale ·
          <span className="text-amber-400 font-mono">F3</span> Batch ·
          <span className="text-amber-400 font-mono">F4</span> Cash ·
          <span className="text-amber-400 font-mono">Ctrl+K</span> Search
        </div>
      </div>
    </header>
  );
};
