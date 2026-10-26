import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ShoppingCart,
  Factory,
  Boxes,
  Flame,
  Package,
  Layers,
  Users,
  Building2,
  Receipt,
  UserCheck,
  Clock,
  CreditCard,
  Wrench,
  DollarSign,
  BookOpen,
  FileSpreadsheet,
  Settings,
  HardDrive,
  LayoutDashboard,
  Calculator,
  ArrowRight,
  X
} from 'lucide-react';
import { useFactory } from '../../context/FactoryContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tabId: string) => void;
  onOpenCalculator: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Navigation' | 'Actions' | 'Tools';
  icon: React.FC<{ className?: string }>;
  action: () => void;
  shortcut?: string;
}

export const DesktopCommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenCalculator,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { stockItems = [], customers = [], products = [] } = useFactory();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const navItems: CommandItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard (ڈیش بورڈ)',
      subtitle: 'Main overview, summary, KPIs and statistics',
      category: 'Navigation',
      icon: LayoutDashboard,
      shortcut: 'F1',
      action: () => { onNavigate('dashboard'); onClose(); },
    },
    {
      id: 'sales',
      title: 'Sales & Invoices (سیلز و آرڈرز)',
      subtitle: 'Record customer sales, order sheets, dispatch and invoices',
      category: 'Navigation',
      icon: ShoppingCart,
      shortcut: 'F2',
      action: () => { onNavigate('sales'); onClose(); },
    },
    {
      id: 'production',
      title: 'Production Batches (پروڈکشن)',
      subtitle: 'Factory manufacturing batches, recipes, head cook output',
      category: 'Navigation',
      icon: Factory,
      shortcut: 'F3',
      action: () => { onNavigate('production'); onClose(); },
    },
    {
      id: 'cashbook',
      title: 'Cashbook (روزنامچہ)',
      subtitle: 'Daily cash in/out register, petty cash, ledger balance',
      category: 'Navigation',
      icon: BookOpen,
      shortcut: 'F4',
      action: () => { onNavigate('cashbook'); onClose(); },
    },
    {
      id: 'stock',
      title: 'Stock & Inventory (اسٹاک و گودام)',
      subtitle: 'View warehouse quantities, low stock alerts, valuation',
      category: 'Navigation',
      icon: Boxes,
      action: () => { onNavigate('stock'); onClose(); },
    },
    {
      id: 'products',
      title: 'Finished Products (تیار مال)',
      subtitle: 'Manage sweets, nimko, bakery items, cartons, packs',
      category: 'Navigation',
      icon: Package,
      action: () => { onNavigate('products'); onClose(); },
    },
    {
      id: 'raw_materials',
      title: 'Raw Materials (خام مال)',
      subtitle: 'Flour, sugar, ghee, dry fruits, spices inventory',
      category: 'Navigation',
      icon: Layers,
      action: () => { onNavigate('raw_materials'); onClose(); },
    },
    {
      id: 'packaging',
      title: 'Packaging Items (پیکنگ میٹریل)',
      subtitle: 'Boxes, wrappers, cartons, labels, pouches',
      category: 'Navigation',
      icon: Boxes,
      action: () => { onNavigate('packaging'); onClose(); },
    },
    {
      id: 'customers',
      title: 'Customers (گاہک و خریدار)',
      subtitle: 'Wholesalers, distributors, balance ledgers',
      category: 'Navigation',
      icon: Users,
      action: () => { onNavigate('customers'); onClose(); },
    },
    {
      id: 'suppliers',
      title: 'Suppliers (سپلائرز و ڈیلرز)',
      subtitle: 'Raw material vendors, payables, bills',
      category: 'Navigation',
      icon: Building2,
      action: () => { onNavigate('suppliers'); onClose(); },
    },
    {
      id: 'purchases',
      title: 'Purchases (خریداری بل)',
      subtitle: 'Raw material procurement vouchers and bills',
      category: 'Navigation',
      icon: Receipt,
      action: () => { onNavigate('purchases'); onClose(); },
    },
    {
      id: 'employees',
      title: 'Employees (ملازمین و کاریگر)',
      subtitle: 'Staff list, wages, designations, mobile numbers',
      category: 'Navigation',
      icon: UserCheck,
      action: () => { onNavigate('employees'); onClose(); },
    },
    {
      id: 'attendance',
      title: 'Attendance (حاضری رجسٹر)',
      subtitle: 'Daily worker presence, overtime, absent tracker',
      category: 'Navigation',
      icon: Clock,
      action: () => { onNavigate('attendance'); onClose(); },
    },
    {
      id: 'salaries',
      title: 'Salaries & Wages (تنخواہیں و دیہاڑی)',
      subtitle: 'Monthly payroll, advances, wage disbursement',
      category: 'Navigation',
      icon: CreditCard,
      action: () => { onNavigate('salaries'); onClose(); },
    },
    {
      id: 'expenses',
      title: 'Expenses (فیکٹری اخراجات)',
      subtitle: 'Electricity bills, fuel, rent, maintenance expenses',
      category: 'Navigation',
      icon: DollarSign,
      action: () => { onNavigate('expenses'); onClose(); },
    },
    {
      id: 'machines',
      title: 'Machines (مشینری سروس)',
      subtitle: 'Motors, mixers, packaging machines maintenance schedule',
      category: 'Navigation',
      icon: Wrench,
      action: () => { onNavigate('machines'); onClose(); },
    },
    {
      id: 'wastage',
      title: 'Wastage & Scrap (ضیاع و اسکریپ)',
      subtitle: 'Defective batch scrap, burnt items, packaging waste',
      category: 'Navigation',
      icon: Flame,
      action: () => { onNavigate('wastage'); onClose(); },
    },
    {
      id: 'reports',
      title: 'Audit Reports & P&L (رپورٹس و حسابات)',
      subtitle: 'Profit & loss, sales analysis, tax reports, audit print',
      category: 'Navigation',
      icon: FileSpreadsheet,
      action: () => { onNavigate('reports'); onClose(); },
    },
    {
      id: 'settings',
      title: 'Factory Settings (سیٹنگز)',
      subtitle: 'Factory name, currency, address, print header options',
      category: 'Navigation',
      icon: Settings,
      action: () => { onNavigate('settings'); onClose(); },
    },
    {
      id: 'backup',
      title: 'Backup & Restore (بیک اپ)',
      subtitle: 'Export offline database to file, import backup file',
      category: 'Navigation',
      icon: HardDrive,
      action: () => { onNavigate('backup'); onClose(); },
    },
    {
      id: 'calculator',
      title: 'Desktop Calculator (کیلکولیٹر)',
      subtitle: 'Quick math, tally calculations, cash check',
      category: 'Tools',
      icon: Calculator,
      shortcut: 'Alt+C',
      action: () => { onOpenCalculator(); onClose(); },
    },
  ];

  const filteredItems = navItems.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q)
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/70 backdrop-blur-xs">
      <div
        className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Box */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800 bg-slate-950">
          <Search className="w-5 h-5 text-amber-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or jump to module (e.g. Sales, Stock, Cashbook, Products)..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-500 hover:text-slate-300 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching modules or actions found for "{query}"
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/20 text-white border border-amber-500/40'
                      : 'text-slate-300 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-slate-100 flex items-center gap-2">
                        <span>{item.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {item.shortcut && (
                      <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-amber-300 bg-slate-800/80 border border-slate-700 rounded">
                        {item.shortcut}
                      </kbd>
                    )}
                    <ArrowRight
                      className={`w-3.5 h-3.5 ${
                        isSelected ? 'text-amber-400' : 'text-slate-600'
                      }`}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span>Factory Pro Desktop Edition</span>
        </div>
      </div>
    </div>
  );
};
