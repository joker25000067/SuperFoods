import React, { useState, useRef } from 'react';
import {
  Database,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  HardDrive,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { useFactory } from '../../context/FactoryContext';
import { exportFullDatabase, importFullDatabase, clearAllData } from '../../db/indexedDb';

export const BackupRestoreModule: React.FC = () => {
  const {
    products,
    rawMaterials,
    packaging,
    suppliers,
    customers,
    purchases,
    orders,
    productionBatches,
    stockItems,
    stockMovements,
    wastageRecords,
    employees,
    attendanceRecords,
    salaryPayments,
    machines,
    expenses,
    cashbookEntries,
    settings,
    refreshAll,
  } = useFactory();

  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export JSON file
  const handleExport = async () => {
    try {
      const data = await exportFullDatabase();
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `Factory_Backup_${settings.factoryName.replace(/\s+/g, '_')}_${timestamp}.json`;

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export factory backup.');
    }
  };

  // Import JSON file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Invalid JSON format');
        }

        const confirmRestore = window.confirm(
          'Are you sure you want to restore this backup file? Existing data will be replaced with the backup file data.'
        );
        if (!confirmRestore) return;

        await importFullDatabase(parsed);
        await refreshAll();
        setImportStatus('Backup restored successfully! All factory records refreshed.');
        setTimeout(() => setImportStatus(null), 5000);
      } catch (err) {
        console.error('Import failed:', err);
        alert('Invalid or corrupted backup JSON file. Restore cancelled.');
      }
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Clear / Reset All Data
  const handleReset = async () => {
    if (resetConfirmText !== 'RESET') {
      alert('Please type "RESET" in capital letters to confirm data wipe.');
      return;
    }

    try {
      setIsResetting(true);
      await clearAllData();
      await refreshAll();
      setResetConfirmText('');
      alert('All factory data has been wiped clean. Database is ready for fresh entry.');
    } catch (err) {
      console.error('Clear failed:', err);
      alert('Failed to wipe data.');
    } finally {
      setIsResetting(false);
    }
  };

  // Store counts
  const recordCounts = [
    { label: 'Products & Variants', count: products.length },
    { label: 'Raw Materials', count: rawMaterials.length },
    { label: 'Packaging Items', count: packaging.length },
    { label: 'Customers', count: customers.length },
    { label: 'Suppliers', count: suppliers.length },
    { label: 'Purchase Invoices', count: purchases.length },
    { label: 'Sales Orders', count: orders.length },
    { label: 'Production Batches', count: productionBatches.length },
    { label: 'Stock Items', count: stockItems.length },
    { label: 'Stock Audit Movements', count: stockMovements.length },
    { label: 'Wastage Logs', count: wastageRecords.length },
    { label: 'Employees / Labor', count: employees.length },
    { label: 'Attendance Records', count: attendanceRecords.length },
    { label: 'Salary Vouchers', count: salaryPayments.length },
    { label: 'Machines & Equipment', count: machines.length },
    { label: 'Expense Vouchers', count: expenses.length },
    { label: 'Cashbook Transactions', count: cashbookEntries.length },
  ];

  const totalRecordsCount = recordCounts.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-indigo-600" />
            100% Offline Backup, Restore &amp; Data Safety
          </h2>
          <p className="text-xs text-gray-500">
            Export full JSON data backups to your computer or USB drive, restore previous snapshots, or reset records.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          IndexedDB Local Storage Active
        </div>
      </div>

      {importStatus && (
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-900">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {importStatus}
        </div>
      )}

      {/* Main Backup & Restore Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* EXPORT CARD */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Download Complete Database Backup</h3>
                <p className="text-xs text-gray-500">Save everything as a standalone JSON file</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 my-3 leading-relaxed">
              Downloads a timestamped file containing all your products, customers, sales order sheets, batch records, cashbook transactions, and employee wages. Keep backups on a USB flash drive or external folder daily.
            </p>
          </div>

          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-xs transition cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Backup File (.JSON)
          </button>
        </div>

        {/* IMPORT / RESTORE CARD */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Restore From Backup File</h3>
                <p className="text-xs text-gray-500">Load previously saved JSON snapshot</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 my-3 leading-relaxed">
              Select a previously exported factory JSON backup to restore all registers, orders, and ledger balances. Useful when moving data between different office tablets or computers.
            </p>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
              id="backup-file-input"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition cursor-pointer"
            >
              <Upload className="w-4 h-4" /> Select Backup File to Restore
            </button>
          </div>
        </div>
      </div>

      {/* Database Content Diagnostics */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <Database className="w-4 h-4 text-gray-600" />
            Current Local Storage Inventory ({totalRecordsCount} total records)
          </h3>
          <span className="text-xs font-mono font-semibold text-gray-500">
            Database: IndexedDB v1
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs">
          {recordCounts.map((r, idx) => (
            <div key={idx} className="p-2 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center">
              <span className="text-gray-600 font-medium">{r.label}:</span>
              <span className="font-bold font-mono text-gray-900">{r.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone: Wipe Factory Database */}
      <div className="bg-rose-50/50 p-5 rounded-xl border border-rose-200 shadow-xs">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-2 text-xs flex-1">
            <h4 className="font-bold text-rose-900 text-sm">Danger Zone: Clear / Factory Reset All Data</h4>
            <p className="text-rose-700">
              Permanently wipe all products, customers, suppliers, inventory, orders, cashbook, and production batches from this device. Please export a backup first before wiping!
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">Type "RESET" to confirm:</span>
                <input
                  type="text"
                  value={resetConfirmText}
                  onChange={(e) => setResetConfirmText(e.target.value)}
                  placeholder="RESET"
                  className="px-3 py-1.5 rounded border border-rose-300 bg-white font-mono font-bold text-rose-700 w-28 uppercase text-center"
                />
              </div>
              <button
                disabled={resetConfirmText !== 'RESET' || isResetting}
                onClick={handleReset}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-lg transition cursor-pointer"
              >
                {isResetting ? 'Wiping...' : 'Permanently Wipe All Factory Records'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
