import React from 'react';
import { Keyboard, X } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'F1', desc: 'Help & Keyboard Shortcuts (یہ رہنمائی اسکرین)' },
    { key: 'F2', desc: 'Sales & Invoices Module (فروخت و نئے آرڈرز)' },
    { key: 'F3', desc: 'Production Batches Module (پروڈکشن بیجز)' },
    { key: 'F4', desc: 'Cashbook (روزنامچہ آمدن و خرچ)' },
    { key: 'Ctrl + K', desc: 'Global Command Palette & Quick Search (فوری تلاش)' },
    { key: 'Ctrl + B', desc: 'Toggle Sidebar Collapse (سائڈبار کو سکیڑنا یا پھیلانا)' },
    { key: 'Alt + C', desc: 'Open Desktop Calculator (بلٹ اِن کیلکولیٹر)' },
    { key: 'Ctrl + P', desc: 'Print Active Screen or Voucher (پرنٹ واؤچر)' },
    { key: 'F11', desc: 'Toggle Fullscreen Mode (فل اسکرین موڈ)' },
    { key: 'Esc', desc: 'Close open dialogs & menus (ونڈو بند کرنا)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Desktop Keyboard Shortcuts (شارٹ کٹس)
              </h3>
              <p className="text-[11px] text-slate-400">
                تیز ترین فیکٹری آپریشنز کے لیے کی بورڈ شارٹ کٹس
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 hover:bg-slate-800 transition"
            >
              <span className="text-xs text-slate-300">{sc.desc}</span>
              <kbd className="px-2 py-1 text-xs font-mono font-bold text-amber-300 bg-slate-950 border border-slate-700 rounded shadow-xs shrink-0 ml-3">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-900 bg-amber-500 hover:bg-amber-400 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
