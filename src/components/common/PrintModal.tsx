import React from 'react';
import { Printer, X, Download } from 'lucide-react';
import { triggerPrint } from '../../utils/formatters';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const PrintModal: React.FC<PrintModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col my-auto border border-gray-200">
        {/* Modal Toolbar - Hidden during print */}
        <div className="no-print flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-gray-700" />
            <span className="font-semibold text-gray-800 text-sm">{title} (Print Preview)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={triggerPrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Body - Fits A4 aspect ratio */}
        <div className="p-6 overflow-y-auto flex-1 bg-white print-sheet">
          {children}
        </div>

        {/* Modal Footer - Hidden during print */}
        <div className="no-print px-5 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-between items-center text-xs text-gray-500">
          <span>Tip: In print dialog, select &quot;Save as PDF&quot; or choose your printer. Check &quot;Background graphics&quot; for best appearance.</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-100 font-medium cursor-pointer text-gray-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
