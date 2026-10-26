import React, { useState } from 'react';
import { Calculator as CalcIcon, X, Copy, Check, RotateCcw } from 'lucide-react';

interface DesktopCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopCalculator: React.FC<DesktopCalculatorProps> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleNumber = (n: string) => {
    if (display === '0' || display === 'Error') {
      setDisplay(n);
    } else {
      setDisplay(display + n);
    }
  };

  const handleOperator = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleEqual = () => {
    try {
      const full = (equation + display).replace(/×/g, '*').replace(/÷/g, '/');
      // Safe math evaluation of numbers and basic operators
      if (/^[0-9+\-*/. ()]+$/.test(full)) {
        // eslint-disable-next-line no-eval
        const result = Function(`'use strict'; return (${full})`)();
        const rounded = Number.isInteger(result) ? result.toString() : Number(result.toFixed(4)).toString();
        setDisplay(rounded);
        setEquation('');
      } else {
        setDisplay('Error');
      }
    } catch {
      setDisplay('Error');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed bottom-12 right-6 z-50 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
      {/* Title Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-950 border-b border-slate-800 text-slate-200">
        <div className="flex items-center gap-2">
          <CalcIcon className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-slate-100">Desktop Calculator</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
            title="Copy Result"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Screen */}
      <div className="p-3.5 bg-slate-950/60 text-right">
        <div className="text-[11px] font-mono text-slate-500 h-4 overflow-hidden truncate">
          {equation}
        </div>
        <div className="text-2xl font-mono font-bold text-amber-400 tracking-wider truncate">
          {display}
        </div>
      </div>

      {/* Keypad Grid */}
      <div className="p-3 grid grid-cols-4 gap-1.5 bg-slate-900">
        <button
          onClick={handleClear}
          className="p-2.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 font-bold text-xs border border-rose-900/50 transition cursor-pointer"
        >
          C
        </button>
        <button
          onClick={handleBackspace}
          className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
        >
          ⌫
        </button>
        <button
          onClick={() => {
            const val = parseFloat(display);
            if (!isNaN(val)) setDisplay((val / 100).toString());
          }}
          className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
        >
          %
        </button>
        <button
          onClick={() => handleOperator('÷')}
          className="p-2.5 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 font-bold text-xs border border-amber-500/30 transition cursor-pointer"
        >
          ÷
        </button>

        {['7', '8', '9'].map((num) => (
          <button
            key={num}
            onClick={() => handleNumber(num)}
            className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-white font-semibold text-xs transition cursor-pointer"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handleOperator('×')}
          className="p-2.5 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 font-bold text-xs border border-amber-500/30 transition cursor-pointer"
        >
          ×
        </button>

        {['4', '5', '6'].map((num) => (
          <button
            key={num}
            onClick={() => handleNumber(num)}
            className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-white font-semibold text-xs transition cursor-pointer"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handleOperator('-')}
          className="p-2.5 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 font-bold text-xs border border-amber-500/30 transition cursor-pointer"
        >
          -
        </button>

        {['1', '2', '3'].map((num) => (
          <button
            key={num}
            onClick={() => handleNumber(num)}
            className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-white font-semibold text-xs transition cursor-pointer"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handleOperator('+')}
          className="p-2.5 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 font-bold text-xs border border-amber-500/30 transition cursor-pointer"
        >
          +
        </button>

        <button
          onClick={() => handleNumber('0')}
          className="col-span-2 p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-white font-semibold text-xs transition cursor-pointer"
        >
          0
        </button>
        <button
          onClick={() => {
            if (!display.includes('.')) setDisplay(display + '.');
          }}
          className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-white font-semibold text-xs transition cursor-pointer"
        >
          .
        </button>
        <button
          onClick={handleEqual}
          className="p-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition cursor-pointer"
        >
          =
        </button>
      </div>
    </div>
  );
};
