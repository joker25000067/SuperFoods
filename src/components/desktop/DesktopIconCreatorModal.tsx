import React, { useState } from 'react';
import {
  Monitor,
  Download,
  CheckCircle,
  FileCode,
  ExternalLink,
  Laptop,
  X,
  Sparkles,
  MousePointerClick,
  ShieldCheck,
  FolderOpen
} from 'lucide-react';
import {
  downloadWindowsBat,
  downloadWindowsUrl,
  downloadWindowsVbs,
  getAppUrl
} from '../../utils/desktopShortcut';

interface DesktopIconCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  factoryName?: string;
}

export const DesktopIconCreatorModal: React.FC<DesktopIconCreatorModalProps> = ({
  isOpen,
  onClose,
  factoryName = 'Factory Record System',
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentUrl = getAppUrl();

  const handleBatDownload = () => {
    downloadWindowsBat(factoryName);
    setDownloadSuccess('Factory_Record_System.bat downloaded! Move it to your computer Desktop to double-click run.');
  };

  const handleVbsDownload = () => {
    downloadWindowsVbs(factoryName);
    setDownloadSuccess('Launch_Factory_System.vbs downloaded! Move it to your Desktop for silent double-click launch.');
  };

  const handleUrlDownload = () => {
    downloadWindowsUrl(factoryName);
    setDownloadSuccess('Desktop shortcut (.url) downloaded! Save to Desktop.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-100">
        
        {/* Header */}
        <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md shrink-0">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Create Double-Click Desktop Icon
                </h3>
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                  Windows PC
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                کمپیوٹر ڈیسک ٹاپ پر آئیکن بنائیں اور صرف ڈبل کلک سے سسٹم چلائیں
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {downloadSuccess && (
          <div className="m-4 mb-0 p-3 bg-amber-500/20 border border-amber-400/40 rounded-xl text-amber-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>{downloadSuccess}</span>
            </div>
            <button
              onClick={() => setDownloadSuccess(null)}
              className="text-amber-300 hover:text-white underline text-[11px] ml-2 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          
          {/* Method 1: Download .bat runner */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-200">
                  طریقہ نمبر 1: ونڈوز ڈبل کلک فائل (.bat Icon) — سب سے تیز طریقہ
                </span>
              </div>
              <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded">
                Instant
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              نیچے دیا گیا بٹن دبا کر ڈبل کلک فائل ڈاؤن لوڈ کریں، اور اسے اپنے کمپیوٹر کے <strong>Desktop</strong> پر رکھ لیں۔ اب روزانہ بغیر کسی براؤزر کے صرف <strong>ڈبل کلک (Double Click)</strong> کر کے پورا فیکٹری سسٹم چلائیں۔
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={handleBatDownload}
                className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Double-Click Icon (.bat)</span>
              </button>

              <button
                onClick={handleVbsDownload}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                title="No black CMD window appears"
              >
                <FileCode className="w-3.5 h-3.5 text-sky-400" />
                <span>Silent Runner (.vbs)</span>
              </button>

              <button
                onClick={handleUrlDownload}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                <span>Web Shortcut (.url)</span>
              </button>
            </div>

            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
              <MousePointerClick className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>طریقہ:</strong> ڈاؤن لوڈ ہونے کے بعد فائل کو اپنے <strong>Desktop</strong> پر کاپی/پیسٹ کر لیں اور جب چاہیں ڈبل کلک کر کے ونڈوز ایپ کے طور پر چلائیں۔
              </span>
            </div>
          </div>

          {/* Method 2: Browser native desktop shortcut */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2">
              <Laptop className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-200">
                طریقہ نمبر 2: براؤزر کے ذریعے ڈیسک ٹاپ پر آفیشل آئیکن بنائیں (Edge / Chrome)
              </span>
            </div>

            <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
              <li>
                <strong>Microsoft Edge:</strong> براؤزر میں اوپر دائیں جانب تین نقطوں <strong>(...)</strong> پر کلک کریں &gt; <strong>Apps</strong> &gt; <strong>"Install Factory Record System"</strong> منتخب کریں &gt; "Create Desktop Shortcut" پر کلک کریں۔
              </li>
              <li>
                <strong>Google Chrome:</strong> اوپر دائیں جانب تین نقطوں <strong>(...)</strong> پر کلک کریں &gt; <strong>"Save and share"</strong> &gt; <strong>"Install Factory Record System"</strong> منتخب کریں۔
              </li>
            </ul>

            <p className="text-[11px] text-emerald-400 font-medium">
              ✓ اس کے بعد آپ کے ونڈوز ڈیسک ٹاپ اور ٹاسک بار پر خودکار طور پر فیکٹری سسٹم کا خوبصورت آئیکن بن جائے گا۔
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Offline Local IndexedDB Storage</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
