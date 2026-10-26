import React from 'react';
import { Database, ShieldCheck, HardDrive, Keyboard, Calculator } from 'lucide-react';

interface DesktopStatusBarProps {
  activeTabLabel: string;
  ordersCount: number;
  batchesCount: number;
  stockItemsCount: number;
  lowStockCount: number;
  onOpenShortcuts: () => void;
  onOpenCalculator: () => void;
}

export const DesktopStatusBar: React.FC<DesktopStatusBarProps> = ({
  activeTabLabel,
  ordersCount,
  batchesCount,
  stockItemsCount,
  lowStockCount,
  onOpenShortcuts,
  onOpenCalculator,
}) => {
  return (
    <footer className="no-print h-6 px-3 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between select-none shrink-0 z-40">
      {/* Left: Engine & Workspace */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Local Engine: IndexedDB (100% Offline)</span>
        </div>

        <span className="text-slate-700">|</span>

        <div className="text-slate-300">
          <span>Active: </span>
          <span className="font-semibold text-amber-400">{activeTabLabel}</span>
        </div>
      </div>

      {/* Center: Live Stats */}
      <div className="hidden md:flex items-center gap-3 text-slate-400">
        <span>Orders: <strong className="text-slate-200">{ordersCount}</strong></span>
        <span>·</span>
        <span>Batches: <strong className="text-slate-200">{batchesCount}</strong></span>
        <span>·</span>
        <span>Inventory: <strong className="text-slate-200">{stockItemsCount}</strong> items</span>
        {lowStockCount > 0 && (
          <>
            <span>·</span>
            <span className="text-rose-400 font-bold">
              Low Stock: {lowStockCount} items
            </span>
          </>
        )}
      </div>

      {/* Right: Quick Tools & Station */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenCalculator}
          className="hover:text-amber-300 flex items-center gap-1 transition cursor-pointer"
          title="Open Calculator (Alt+C)"
        >
          <Calculator className="w-3 h-3" />
          <span className="hidden sm:inline">Calc</span>
        </button>

        <span className="text-slate-700">|</span>

        <button
          onClick={onOpenShortcuts}
          className="hover:text-amber-300 flex items-center gap-1 transition cursor-pointer"
          title="Keyboard Shortcuts (F1)"
        >
          <Keyboard className="w-3 h-3" />
          <span className="hidden sm:inline">F1 Shortcuts</span>
        </button>

        <span className="text-slate-700 hidden sm:inline">|</span>

        <span className="text-slate-500 font-mono hidden sm:inline">
          DESKTOP-STANDALONE-APP
        </span>
      </div>
    </footer>
  );
};
