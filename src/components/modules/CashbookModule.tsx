import React, { useState } from 'react';
import {
  BookOpen,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Trash2,
  Printer,
  Search,
  Filter,
  Wallet,
} from 'lucide-react';
import { useFactory } from '../../context/FactoryContext';
import { CashbookEntry } from '../../types';
import { formatCurrency, formatDate, getTodayDateString } from '../../utils/formatters';
import { PrintModal } from '../common/PrintModal';
import { PrintHeader } from '../common/PrintHeader';
import { EmptyState } from '../common/EmptyState';

export const CashbookModule: React.FC = () => {
  const { cashbookEntries, settings, saveCashbookEntry, deleteCashbookEntry } = useFactory();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'cash' | 'bank' | 'online'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Form State for Manual Cashbook Entry
  const [date, setDate] = useState(getTodayDateString());
  const [type, setType] = useState<'in' | 'out'>('in');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'cash' | 'bank' | 'online'>('cash');
  const [category, setCategory] = useState('Manual Entry');
  const [description, setDescription] = useState('');

  const handleOpenAdd = (defaultType: 'in' | 'out' = 'in') => {
    setDate(getTodayDateString());
    setType(defaultType);
    setAmount(0);
    setPaymentMode('cash');
    setCategory(defaultType === 'in' ? 'Customer Payment / Cash Receipt' : 'General Payout / Drawings');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (amount <= 0) {
      alert('Please enter an amount greater than zero.');
      return;
    }
    if (!description.trim()) {
      alert('Please provide a description / note for this transaction.');
      return;
    }

    await saveCashbookEntry({
      date,
      type: type.toUpperCase() as 'IN' | 'OUT',
      amount,
      account: paymentMode === 'bank' ? 'Bank' : 'Cash',
      paymentMode,
      category,
      description,
      referenceType: 'manual',
    });

    setIsModalOpen(false);
  };

  const isCashIn = (e: any) => (e.type || '').toString().toLowerCase() === 'in';
  const getMode = (e: any) => (e.paymentMode || (e.account?.toLowerCase() === 'bank' ? 'bank' : 'cash') || 'cash').toString().toLowerCase();

  // Sort chronological for accurate running balance
  const sortedEntries = [...cashbookEntries].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Calculate Running Balance
  let runningBalance = 0;
  const entriesWithBalance = sortedEntries.map((e) => {
    if (isCashIn(e)) {
      runningBalance += e.amount;
    } else {
      runningBalance -= e.amount;
    }
    return {
      ...e,
      balanceAfter: runningBalance,
    };
  });

  // Now apply filters (display in reverse chronological order: newest first)
  const filtered = entriesWithBalance
    .filter((e) => {
      const matchesSearch =
        (e.description || '').toLowerCase().includes(search.toLowerCase()) ||
        (e.category || '').toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === 'all' || (filterType === 'in' ? isCashIn(e) : !isCashIn(e));
      const matchesMode = filterMode === 'all' || getMode(e) === filterMode;
      return matchesSearch && matchesType && matchesMode;
    })
    .reverse();

  // Summary Metrics
  const totalCashIn = cashbookEntries
    .filter(isCashIn)
    .reduce((sum, e) => sum + e.amount, 0);

  const totalCashOut = cashbookEntries
    .filter((e) => !isCashIn(e))
    .reduce((sum, e) => sum + e.amount, 0);

  const netBalance = totalCashIn - totalCashOut;

  // Breakdown by mode
  const cashOnlyBalance = cashbookEntries
    .filter((e) => getMode(e) === 'cash')
    .reduce((sum, e) => sum + (isCashIn(e) ? e.amount : -e.amount), 0);

  const bankBalance = cashbookEntries
    .filter((e) => getMode(e) === 'bank')
    .reduce((sum, e) => sum + (isCashIn(e) ? e.amount : -e.amount), 0);

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            Factory Cashbook &amp; Daily Roznamcha (روزنامچہ)
          </h2>
          <p className="text-xs text-gray-500">
            Real-time Cash IN / Cash OUT ledger auto-synchronized with Sales, Purchases, Salaries, and Expenses.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-gray-600" />
            Print Cash Statement
          </button>
          <button
            onClick={() => handleOpenAdd('in')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition cursor-pointer"
          >
            <ArrowDownLeft className="w-4 h-4" />
            Cash IN
          </button>
          <button
            onClick={() => handleOpenAdd('out')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            Cash OUT
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500 block">Total Net Cash Balance</span>
          <span
            className={`text-xl font-bold mt-1 block font-mono ${
              netBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {formatCurrency(netBalance, settings.currencySymbol)}
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">
            Cash: {formatCurrency(cashOnlyBalance, settings.currencySymbol)} | Bank: {formatCurrency(bankBalance, settings.currencySymbol)}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-emerald-600 block">Total Cash IN (Receipts)</span>
          <span className="text-xl font-bold text-emerald-700 mt-1 block font-mono">
            {formatCurrency(totalCashIn, settings.currencySymbol)}
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">From sales, customer receipts, capital</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-rose-600 block">Total Cash OUT (Payments)</span>
          <span className="text-xl font-bold text-rose-700 mt-1 block font-mono">
            {formatCurrency(totalCashOut, settings.currencySymbol)}
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">Purchases, wages, utility bills, repairs</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500 block">Search Entries</span>
          <div className="relative mt-2">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search description, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500">Flow:</span>
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-0.5 bg-gray-50">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                filterType === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('in')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                filterType === 'in' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600'
              }`}
            >
              Cash IN
            </button>
            <button
              onClick={() => setFilterType('out')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                filterType === 'out' ? 'bg-rose-600 text-white shadow-xs' : 'text-gray-600'
              }`}
            >
              Cash OUT
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500">Payment Channel:</span>
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-0.5 bg-gray-50">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition cursor-pointer ${
                filterMode === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'
              }`}
            >
              All Channels
            </button>
            <button
              onClick={() => setFilterMode('cash')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition cursor-pointer ${
                filterMode === 'cash' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'
              }`}
            >
              Cash
            </button>
            <button
              onClick={() => setFilterMode('bank')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition cursor-pointer ${
                filterMode === 'bank' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'
              }`}
            >
              Bank
            </button>
            <button
              onClick={() => setFilterMode('online')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition cursor-pointer ${
                filterMode === 'online' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'
              }`}
            >
              Online
            </button>
          </div>
        </div>
      </div>

      {/* Main Cashbook Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No Cashbook Transactions"
          description="Cashbook records all income and expenses automatically or via manual Cash IN / Cash OUT."
          actionText="Add Cash IN"
          onAction={() => handleOpenAdd('in')}
          icon={<BookOpen className="w-6 h-6 text-emerald-600" />}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Description / Narration</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-center">Channel</th>
                  <th className="py-2.5 px-3 text-right">Cash IN (+)</th>
                  <th className="py-2.5 px-3 text-right">Cash OUT (-)</th>
                  <th className="py-2.5 px-3 text-right font-bold">Balance</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-2.5 px-3 font-mono text-gray-600">{formatDate(e.date)}</td>
                    <td className="py-2.5 px-3 font-medium text-gray-900">{e.description}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-700">
                        {e.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center capitalize text-gray-600 font-medium">
                      {getMode(e)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                      {isCashIn(e) ? formatCurrency(e.amount, settings.currencySymbol) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700">
                      {!isCashIn(e) ? formatCurrency(e.amount, settings.currencySymbol) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900 bg-gray-50/50">
                      {formatCurrency(e.balanceAfter || 0, settings.currencySymbol)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => {
                          if (confirm('Delete this cashbook transaction?')) {
                            deleteCashbookEntry(e.id);
                          }
                        }}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MANUAL ENTRY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                {type === 'in' ? (
                  <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                ) : (
                  <ArrowUpRight className="w-4 h-4 text-rose-600" />
                )}
                {type === 'in' ? 'Record Cash IN (Receipt)' : 'Record Cash OUT (Payment)'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Transaction Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'in' | 'out')}
                    className="w-full px-2 py-1.5 rounded border border-gray-300 bg-white font-bold"
                  >
                    <option value="in">Cash IN (+)</option>
                    <option value="out">Cash OUT (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Amount ({settings.currencySymbol}) *</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={amount === 0 ? '' : amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300 font-mono font-bold text-right"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Payment Channel</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as typeof paymentMode)}
                    className="w-full px-2 py-1.5 rounded border border-gray-300 bg-white"
                  >
                    <option value="cash">Cash in Drawer</option>
                    <option value="bank">Bank Account</option>
                    <option value="online">Online / EasyPaisa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Owner Investment, Miscellaneous Sale, Cash Withdrawal"
                  className="w-full px-2.5 py-1.5 rounded border border-gray-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description / Narration *</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Received cash from Haji Bashir on account, deposited into Bank Alfalah..."
                  className="w-full px-2.5 py-1.5 rounded border border-gray-300"
                />
              </div>
            </div>

            <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3.5 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className={`px-4 py-1.5 text-white rounded-lg font-semibold cursor-pointer ${
                  type === 'in' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Save Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE CASH STATEMENT */}
      {isPrintModalOpen && (
        <PrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title="Factory Cashbook Statement / Roznamcha"
        >
          <div className="p-4 sm:p-6 text-black bg-white">
            <PrintHeader
              title="FACTORY CASHBOOK & ROZNAMCHA STATEMENT (روزنامچہ)"
              subtitle="Cash Inflow, Outflow and Running Balance Statement"
              date={getTodayDateString()}
            />

            <div className="grid grid-cols-3 gap-2 text-xs mb-4 border border-black p-2 bg-gray-50 text-center font-bold">
              <div className="text-emerald-800">
                TOTAL CASH IN: {formatCurrency(totalCashIn, settings.currencySymbol)}
              </div>
              <div className="text-rose-800">
                TOTAL CASH OUT: {formatCurrency(totalCashOut, settings.currencySymbol)}
              </div>
              <div>
                CLOSING NET BALANCE: {formatCurrency(netBalance, settings.currencySymbol)}
              </div>
            </div>

            <table className="w-full text-xs border-collapse border border-black mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black py-1.5 px-2 text-center w-10">S.#</th>
                  <th className="border border-black py-1.5 px-2 text-left w-24">DATE</th>
                  <th className="border border-black py-1.5 px-2 text-left">DESCRIPTION / NARRATION</th>
                  <th className="border border-black py-1.5 px-2 text-left w-28">CATEGORY</th>
                  <th className="border border-black py-1.5 px-2 text-center w-16">MODE</th>
                  <th className="border border-black py-1.5 px-2 text-right w-24">CASH IN</th>
                  <th className="border border-black py-1.5 px-2 text-right w-24">CASH OUT</th>
                  <th className="border border-black py-1.5 px-2 text-right w-24">BALANCE</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, idx) => (
                  <tr key={e.id} className="border-b border-gray-300">
                    <td className="border border-black py-1 px-2 text-center">{idx + 1}</td>
                    <td className="border border-black py-1 px-2 font-mono">{formatDate(e.date)}</td>
                    <td className="border border-black py-1 px-2 font-medium">{e.description}</td>
                    <td className="border border-black py-1 px-2">{e.category}</td>
                    <td className="border border-black py-1 px-2 text-center uppercase">{getMode(e)}</td>
                    <td className="border border-black py-1 px-2 text-right font-mono font-bold text-emerald-800">
                      {isCashIn(e) ? formatCurrency(e.amount, settings.currencySymbol) : '-'}
                    </td>
                    <td className="border border-black py-1 px-2 text-right font-mono font-bold text-rose-800">
                      {!isCashIn(e) ? formatCurrency(e.amount, settings.currencySymbol) : '-'}
                    </td>
                    <td className="border border-black py-1 px-2 text-right font-mono font-bold">
                      {formatCurrency(e.balanceAfter || 0, settings.currencySymbol)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold bg-gray-100 border-t-2 border-black">
                  <td colSpan={5} className="border border-black py-1.5 px-2 text-right">TOTALS:</td>
                  <td className="border border-black py-1.5 px-2 text-right font-mono">
                    {formatCurrency(totalCashIn, settings.currencySymbol)}
                  </td>
                  <td className="border border-black py-1.5 px-2 text-right font-mono">
                    {formatCurrency(totalCashOut, settings.currencySymbol)}
                  </td>
                  <td className="border border-black py-1.5 px-2 text-right font-mono">
                    {formatCurrency(netBalance, settings.currencySymbol)}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div className="mt-8 pt-4 flex justify-between items-end text-xs">
              <div className="text-center w-44 border-t border-black pt-1">
                <p className="font-bold">Cashier / Accountant</p>
              </div>
              <div className="text-center w-44 border-t border-black pt-1">
                <p className="font-bold">Auditor</p>
              </div>
              <div className="text-center w-44 border-t border-black pt-1">
                <p className="font-bold">Factory Owner / Sign</p>
              </div>
            </div>
          </div>
        </PrintModal>
      )}
    </div>
  );
};
