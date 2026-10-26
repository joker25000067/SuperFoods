import React, { useState, useEffect } from 'react';
import {
  Factory,
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  Layers,
  Package,
  Users,
  Building2,
  Receipt,
  Flame,
  UserCheck,
  Clock,
  CreditCard,
  Wrench,
  DollarSign,
  BookOpen,
  FileSpreadsheet,
  Settings,
  HardDrive,
  Menu,
  X,
  Plus,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Search,
  Calculator,
  Monitor
} from 'lucide-react';

import { FactoryProvider, useFactory } from './context/FactoryContext';

// Import Core Modules
import { DashboardModule } from './components/modules/DashboardModule';
import { SalesModule } from './components/modules/SalesModule';
import { ProductionModule } from './components/modules/ProductionModule';
import { StockModule } from './components/modules/StockModule';
import { WastageModule } from './components/modules/WastageModule';
import { ProductsModule } from './components/modules/ProductsModule';
import { RawMaterialsModule } from './components/modules/RawMaterialsModule';
import { PackagingModule } from './components/modules/PackagingModule';
import { CustomersModule } from './components/modules/CustomersModule';
import { SuppliersModule } from './components/modules/SuppliersModule';
import { PurchasesModule } from './components/modules/PurchasesModule';
import { EmployeesModule } from './components/modules/EmployeesModule';
import { AttendanceModule } from './components/modules/AttendanceModule';
import { SalariesModule } from './components/modules/SalariesModule';
import { MachinesModule } from './components/modules/MachinesModule';
import { ExpensesModule } from './components/modules/ExpensesModule';
import { CashbookModule } from './components/modules/CashbookModule';
import { ReportsModule } from './components/modules/ReportsModule';
import { SettingsModule } from './components/modules/SettingsModule';
import { BackupRestoreModule } from './components/modules/BackupRestoreModule';

// Desktop-Specific Components
import { DesktopTitleBar } from './components/desktop/DesktopTitleBar';
import { DesktopStatusBar } from './components/desktop/DesktopStatusBar';
import { DesktopCommandPalette } from './components/desktop/DesktopCommandPalette';
import { DesktopCalculator } from './components/desktop/DesktopCalculator';
import { DesktopIconCreatorModal } from './components/desktop/DesktopIconCreatorModal';
import { KeyboardShortcutsModal } from './components/desktop/KeyboardShortcutsModal';
import { OfflineIndicator } from './components/OfflineIndicator';

interface NavItem {
  id: string;
  label: string;
  shortcut?: string;
  icon: React.FC<{ className?: string }>;
  badge?: number;
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

const MainAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isDesktopIconModalOpen, setIsDesktopIconModalOpen] = useState(false);

  const {
    settings,
    stockItems = [],
    orders = [],
    productionBatches = []
  } = useFactory();

  const lowStockCount = stockItems.filter(
    (i) => (i.currentQuantity ?? i.stock ?? 0) <= (i.minAlertQuantity ?? i.alertLevel ?? 0)
  ).length;

  const navGroups: NavGroup[] = [
    {
      groupName: 'CORE OPERATIONS',
      items: [
        { id: 'dashboard', label: 'Dashboard', shortcut: 'F1', icon: LayoutDashboard },
        { id: 'sales', label: 'Sales / Orders', shortcut: 'F2', icon: ShoppingCart },
        { id: 'production', label: 'Production Batches', shortcut: 'F3', icon: Factory },
        { id: 'stock', label: 'Stock & Inventory', icon: Boxes, badge: lowStockCount > 0 ? lowStockCount : undefined },
        { id: 'wastage', label: 'Wastage & Scrap', icon: Flame },
      ],
    },
    {
      groupName: 'ITEMS & CATALOG',
      items: [
        { id: 'products', label: 'Finished Products', icon: Package },
        { id: 'raw_materials', label: 'Raw Materials', icon: Layers },
        { id: 'packaging', label: 'Packaging Items', icon: Boxes },
      ],
    },
    {
      groupName: 'PARTIES & PURCHASES',
      items: [
        { id: 'customers', label: 'Customers', icon: Users },
        { id: 'suppliers', label: 'Suppliers', icon: Building2 },
        { id: 'purchases', label: 'Purchases', icon: Receipt },
      ],
    },
    {
      groupName: 'FACTORY LABOR & HR',
      items: [
        { id: 'employees', label: 'Employees', icon: UserCheck },
        { id: 'attendance', label: 'Attendance', icon: Clock },
        { id: 'salaries', label: 'Salaries & Wages', icon: CreditCard },
      ],
    },
    {
      groupName: 'FINANCE & ASSETS',
      items: [
        { id: 'cashbook', label: 'Cashbook (روزنامچہ)', shortcut: 'F4', icon: BookOpen },
        { id: 'expenses', label: 'Expenses & Petty Cash', icon: DollarSign },
        { id: 'machines', label: 'Machines & Service', icon: Wrench },
        { id: 'reports', label: 'Audit Reports & P&L', icon: FileSpreadsheet },
      ],
    },
    {
      groupName: 'SYSTEM & DATA',
      items: [
        { id: 'settings', label: 'Factory Settings', icon: Settings },
        { id: 'backup', label: 'Backup & Restore', icon: HardDrive },
      ],
    },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setIsMobileSidebarOpen(false);
  };

  // Desktop Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing inside an input, textarea or contentEditable
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (e.key === 'F1') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.key === 'F2') {
        e.preventDefault();
        setActiveTab('sales');
      } else if (e.key === 'F3') {
        e.preventDefault();
        setActiveTab('production');
      } else if (e.key === 'F4') {
        e.preventDefault();
        setActiveTab('cashbook');
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarCollapsed((prev) => !prev);
      } else if (e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setIsCalculatorOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setIsShortcutsOpen(false);
        setIsCalculatorOpen(false);
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getActiveTabLabel = () => {
    for (const group of navGroups) {
      const found = group.items.find((i) => i.id === activeTab);
      if (found) return found.label;
    }
    return 'Dashboard';
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-900 text-slate-100 font-sans antialiased">
      {/* 1. Desktop Window Frame & Title Bar */}
      <DesktopTitleBar
        factoryName={settings.factoryName || 'Factory Record System'}
        onNavigate={handleNavClick}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenCalculator={() => setIsCalculatorOpen((prev) => !prev)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenDesktopIconModal={() => setIsDesktopIconModalOpen(true)}
        onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
        isSidebarCollapsed={isSidebarCollapsed}
      />

      {/* 2. Desktop Quick Actions Ribbon Toolbar */}
      <div className="no-print h-10 px-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs select-none shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => handleNavClick('sales')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-semibold transition cursor-pointer ${
              activeTab === 'sales'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5 text-amber-400" />
            <span>New Sale (F2)</span>
          </button>

          <button
            onClick={() => handleNavClick('production')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-semibold transition cursor-pointer ${
              activeTab === 'production'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <Factory className="w-3.5 h-3.5 text-indigo-400" />
            <span>Batch (F3)</span>
          </button>

          <button
            onClick={() => handleNavClick('cashbook')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-semibold transition cursor-pointer ${
              activeTab === 'cashbook'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cashbook (F4)</span>
          </button>

          {lowStockCount > 0 && (
            <button
              onClick={() => handleNavClick('stock')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950/70 border border-rose-800/80 text-rose-300 font-semibold hover:bg-rose-900 transition cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Low Stock Alert ({lowStockCount})</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsDesktopIconModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold transition cursor-pointer"
            title="Create Double-Click Desktop Icon for Windows PC"
          >
            <Monitor className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px]">Desktop Icon (ڈبل کلک)</span>
          </button>

          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title="Search anything (Ctrl+K)"
          >
            <Search className="w-3 h-3 text-amber-400" />
            <span className="text-[11px]">Command Palette</span>
            <kbd className="text-[9px] px-1 bg-slate-900 rounded border border-slate-700 text-slate-400 font-mono">
              Ctrl+K
            </kbd>
          </button>

          <button
            onClick={() => setIsCalculatorOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title="Desktop Calculator (Alt+C)"
          >
            <Calculator className="w-3 h-3 text-amber-400" />
            <span className="text-[11px] hidden md:inline">Calculator</span>
          </button>
        </div>
      </div>

      {/* 3. Main Desktop Workspace (Sidebar + Scrollable Content) */}
      <div className="flex-1 flex overflow-hidden min-h-0 bg-slate-100">
        {/* Desktop Sidebar (Collapsible Rail Mode / Expanded Mode) */}
        <aside
          className={`no-print hidden lg:flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-200 select-none ${
            isSidebarCollapsed ? 'w-14' : 'w-60'
          }`}
        >
          {/* Sidebar Navigation Items */}
          <nav className="flex-1 overflow-y-auto p-2 space-y-4">
            {navGroups.map((group, idx) => (
              <div key={idx} className="space-y-1">
                {!isSidebarCollapsed && (
                  <span className="text-[10px] font-bold text-slate-500 px-2 tracking-wider uppercase block">
                    {group.groupName}
                  </span>
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        title={isSidebarCollapsed ? `${item.label} ${item.shortcut ? `(${item.shortcut})` : ''}` : undefined}
                        className={`w-full flex items-center justify-between rounded-lg transition cursor-pointer ${
                          isSidebarCollapsed
                            ? 'p-2.5 justify-center'
                            : 'px-2.5 py-1.5 text-xs font-semibold'
                        } ${
                          isActive
                            ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                          {!isSidebarCollapsed && (
                            <span className="truncate">{item.label}</span>
                          )}
                        </div>

                        {!isSidebarCollapsed && (
                          <div className="flex items-center gap-1 shrink-0 ml-1">
                            {item.shortcut && (
                              <span className={`text-[9px] font-mono font-medium px-1 rounded ${
                                isActive ? 'bg-amber-600/40 text-slate-900' : 'text-slate-500'
                              }`}>
                                {item.shortcut}
                              </span>
                            )}
                            {item.badge !== undefined && (
                              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-rose-500 text-white">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        )}

                        {isSidebarCollapsed && item.badge !== undefined && (
                          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Sidebar Bottom Toggle */}
          <div className="p-2 border-t border-slate-800 bg-slate-950/50">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="w-full flex items-center justify-center p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition text-xs cursor-pointer"
              title={isSidebarCollapsed ? 'Expand Sidebar (Ctrl+B)' : 'Collapse to Mini Rail (Ctrl+B)'}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <div className="flex items-center gap-2 w-full px-1 justify-between">
                  <span className="text-[11px] text-slate-400">Collapse Rail</span>
                  <kbd className="text-[9px] font-mono text-slate-500">Ctrl+B</kbd>
                </div>
              )}
            </button>
          </div>
        </aside>

        {/* Mobile Navigation Drawer for small screens */}
        {isMobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="relative w-72 max-w-[85vw] bg-slate-900 h-full shadow-2xl p-4 overflow-y-auto z-10 flex flex-col justify-between text-white">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Factory className="w-5 h-5 text-amber-500" />
                    <span className="font-bold text-slate-100 text-sm">{settings.factoryName}</span>
                  </div>
                  <button
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {navGroups.map((group, idx) => (
                  <div key={idx} className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 px-2 tracking-wider uppercase block">
                      {group.groupName}
                    </span>
                    <div className="space-y-0.5">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleNavClick(item.id)}
                            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                              isActive
                                ? 'bg-amber-500 text-slate-950'
                                : 'text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              <span>{item.label}</span>
                            </div>
                            {item.badge !== undefined && (
                              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-rose-500 text-white">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-800 text-center">
                <span className="text-[11px] text-slate-400 font-medium">Desktop Standalone Offline Engine</span>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Main Workspace Container */}
        <main className="flex-1 overflow-y-auto min-w-0 p-4 sm:p-6 bg-slate-100 text-slate-800">
          {activeTab === 'dashboard' && <DashboardModule onNavigate={handleNavClick} />}
          {activeTab === 'sales' && <SalesModule />}
          {activeTab === 'production' && <ProductionModule />}
          {activeTab === 'stock' && <StockModule />}
          {activeTab === 'wastage' && <WastageModule />}
          {activeTab === 'products' && <ProductsModule />}
          {activeTab === 'raw_materials' && <RawMaterialsModule />}
          {activeTab === 'packaging' && <PackagingModule />}
          {activeTab === 'customers' && <CustomersModule />}
          {activeTab === 'suppliers' && <SuppliersModule />}
          {activeTab === 'purchases' && <PurchasesModule />}
          {activeTab === 'employees' && <EmployeesModule />}
          {activeTab === 'attendance' && <AttendanceModule />}
          {activeTab === 'salaries' && <SalariesModule />}
          {activeTab === 'machines' && <MachinesModule />}
          {activeTab === 'expenses' && <ExpensesModule />}
          {activeTab === 'cashbook' && <CashbookModule />}
          {activeTab === 'reports' && <ReportsModule />}
          {activeTab === 'settings' && <SettingsModule />}
          {activeTab === 'backup' && <BackupRestoreModule />}
        </main>
      </div>

      {/* 4. Desktop Status Bar */}
      <DesktopStatusBar
        activeTabLabel={getActiveTabLabel()}
        ordersCount={orders.length}
        batchesCount={productionBatches.length}
        stockItemsCount={stockItems.length}
        lowStockCount={lowStockCount}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
      />

      {/* 5. Desktop Command Palette (Ctrl+K) */}
      <DesktopCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={handleNavClick}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
      />

      {/* 6. Built-in Desktop Floating Calculator */}
      <DesktopCalculator
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      {/* 7. Keyboard Shortcuts Modal (F1) */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* 8. Desktop Double-Click Icon Creator Modal */}
      <DesktopIconCreatorModal
        isOpen={isDesktopIconModalOpen}
        onClose={() => setIsDesktopIconModalOpen(false)}
        factoryName={settings.factoryName}
      />

      {/* 9. Offline Local Connectivity Notification */}
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <FactoryProvider>
      <MainAppContent />
    </FactoryProvider>
  );
}
