import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  Trash2,
  Printer,
  Search,
  Receipt,
  Filter,
} from 'lucide-react';
import { useFactory } from '../../context/FactoryContext';
import { ExpenseRecord } from '../../types';
import { formatCurrency, formatDate, getTodayDateString } from '../../utils/formatters';
import { PrintModal } from '../common/PrintModal';
import { PrintHeader } from '../common/PrintHeader';
import { EmptyState } from '../common/EmptyState';

export const ExpensesModule: React.FC = () => {
  const { expenses, settings, saveExpenseRecord, deleteExpenseRecord } = useFactory();

  const expenseCategories = settings?.expenseCategories?.length
    ? settings.expenseCategories
    : [
        'Electricity & Power',
        'Gas & Fuel (روغن و گیس)',
        'Factory Rent',
        'Maintenance & Spares',
        'Daily Labor (ڈیلی لیبر)',
        'Transport & Cartage (کرایہ مال)',
        'Printing & Packaging (پاؤچ و کارٹن)',
        'Tea & Refreshments',
        'Miscellaneous',
      ];

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Form State
  const [date, setDate] = useState(getTodayDateString());
  const [category, setCategory] = useState(expenseCategories[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paidTo, setPaidTo] = useState('');
  const [paymentMode, setPaymentMode] = useState<'cash' | 'bank' | 'online'>('cash');
  const [receiptNo, setReceiptNo] = useState('');
  const [notes, setNotes] = useState('');

  const handleOpenAdd = () => {
    setDate(getTodayDateString());
    setCategory(expenseCategories[0]);
    setCustomCategory('');
    setAmount(0);
    setPaidTo('');
    setPaymentMode('cash');
    setReceiptNo('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (amount <= 0) {
      alert('Please enter an amount greater than zero.');
      return;
    }
    const finalCategory = customCategory.trim() ? customCategory.trim() : category;

    await saveExpenseRecord({
      date,
      category: finalCategory,
      amount,
      paidTo,
      paymentMode,
      receiptNo,
      notes,
    });

    setIsModalOpen(false);
  };

  const allCategories = ['All', ...expenseCategories];

  const filtered = expenses.filter((e) => {
    const matchesSearch =
      e.category.toLowerCase().includes(search.toLowerCase()) ||
      (e.paidTo && e.paidTo.toLowerCase().includes(search.toLowerCase())) ||
      (e.receiptNo && e.receiptNo.toLowerCase().includes(search.toLowerCase())) ||
      (e.notes && e.notes.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = selectedCategory === 'All' || e.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalExpense = filtered.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-rose-600" />
            Factory Expenses &amp; Petty Cash
          </h2>
          <p className="text-xs text-gray-500">
            Utility bills, generator diesel, van fuel, repairs, tea &amp; refreshments, and petty cash vouchers.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-gray-600" />
            Print Expense Sheet
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Record Expense
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500 block">Total Expense Vouchers</span>
          <span className="text-xl font-bold text-gray-900 mt-1 block">{filtered.length} Vouchers</span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">Filtered in current view</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-rose-600 block">Total Amount Spent</span>
          <span className="text-xl font-bold text-rose-700 mt-1 block">
            {formatCurrency(totalExpense, settings.currencySymbol)}
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">Logged automatically in factory Cashbook</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500 block">Search Expenses</span>
          <div className="relative mt-2">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search paid to, notes, receipt #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No Expenses Recorded"
          description="Log utility bills, generator diesel, transport, tea, or daily petty cash payouts."
          actionText="Add Expense"
          onAction={handleOpenAdd}
          icon={<DollarSign className="w-6 h-6 text-rose-600" />}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Paid To / Beneficiary</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-center">Payment Mode</th>
                  <th className="py-2.5 px-3">Receipt / Bill #</th>
                  <th className="py-2.5 px-3">Description / Remarks</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-rose-50/20 transition">
                    <td className="py-2.5 px-3 font-mono text-gray-600">{formatDate(e.date)}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-800">
                        {e.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-gray-900">{e.paidTo || '-'}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-sm text-rose-700">
                      {formatCurrency(e.amount, settings.currencySymbol)}
                    </td>
                    <td className="py-2.5 px-3 text-center capitalize text-gray-600 font-medium">
                      {e.paymentMode}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-gray-500">{e.receiptNo || '-'}</td>
                    <td className="py-2.5 px-3 text-gray-600 italic max-w-xs truncate">{e.notes || '-'}</td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => {
                          if (confirm(`Delete expense "${e.category}: ${e.amount}"? Note: Cashbook will not be auto-reversed.`)) {
                            deleteExpenseRecord(e.id);
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

      {/* RECORD EXPENSE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-rose-600" />
                Record Factory Expense Voucher
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
                  <label className="block font-semibold text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-2 py-1.5 rounded border border-gray-300 bg-white"
                  >
                    {expenseCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Custom / Specific Category (Optional)</label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Or write custom category name"
                  className="w-full px-2.5 py-1.5 rounded border border-gray-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Amount Spent ({settings.currencySymbol}) *</label>
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
                  <label className="block font-semibold text-gray-700 mb-1">Paid To / Recipient</label>
                  <input
                    type="text"
                    value={paidTo}
                    onChange={(e) => setPaidTo(e.target.value)}
                    placeholder="e.g. WAPDA, Driver, Petrol Pump"
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as typeof paymentMode)}
                    className="w-full px-2 py-1.5 rounded border border-gray-300 bg-white"
                  >
                    <option value="cash">Cash in Hand</option>
                    <option value="bank">Bank Transfer / Cheque</option>
                    <option value="online">Online / EasyPaisa / JazzCash</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Receipt / Bill #</label>
                  <input
                    type="text"
                    value={receiptNo}
                    onChange={(e) => setReceiptNo(e.target.value)}
                    placeholder="e.g. REC-9921"
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Notes / Item Details</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="50 liters diesel for generator, delivery van tuning..."
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
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                Record &amp; Deduct Cash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE EXPENSE SHEET */}
      {isPrintModalOpen && (
        <PrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title="Factory Expense &amp; Petty Cash Report"
        >
          <div className="p-4 sm:p-6 text-black bg-white">
            <PrintHeader
              title="FACTORY EXPENSE & DISBURSEMENT VOUCHERS"
              subtitle={`Expenses Register [Category: ${selectedCategory}]`}
              date={getTodayDateString()}
            />

            <table className="w-full text-xs border-collapse border border-black mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black py-1.5 px-2 text-center w-10">S.#</th>
                  <th className="border border-black py-1.5 px-2 text-left w-24">DATE</th>
                  <th className="border border-black py-1.5 px-2 text-left w-28">CATEGORY</th>
                  <th className="border border-black py-1.5 px-2 text-left">PAID TO / REASON</th>
                  <th className="border border-black py-1.5 px-2 text-center w-20">MODE</th>
                  <th className="border border-black py-1.5 px-2 text-left w-24">RECEIPT #</th>
                  <th className="border border-black py-1.5 px-2 text-right w-28">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, idx) => (
                  <tr key={e.id} className="border-b border-gray-300">
                    <td className="border border-black py-1 px-2 text-center">{idx + 1}</td>
                    <td className="border border-black py-1 px-2 font-mono">{formatDate(e.date)}</td>
                    <td className="border border-black py-1 px-2 font-semibold">{e.category}</td>
                    <td className="border border-black py-1 px-2">
                      <span className="font-bold">{e.paidTo}</span>
                      {e.notes && <span className="text-gray-600 ml-1">({e.notes})</span>}
                    </td>
                    <td className="border border-black py-1 px-2 text-center uppercase">{e.paymentMode}</td>
                    <td className="border border-black py-1 px-2 font-mono">{e.receiptNo || '-'}</td>
                    <td className="border border-black py-1 px-2 text-right font-mono font-bold">
                      {formatCurrency(e.amount, settings.currencySymbol)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold bg-gray-100 border-t-2 border-black">
                  <td colSpan={6} className="border border-black py-1.5 px-2 text-right">TOTAL EXPENSES:</td>
                  <td className="border border-black py-1.5 px-2 text-right font-mono">
                    {formatCurrency(totalExpense, settings.currencySymbol)}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div className="mt-8 pt-4 flex justify-between items-end text-xs">
              <div className="text-center w-44 border-t border-black pt-1">
                <p className="font-bold">Prepared By / Cashier</p>
              </div>
              <div className="text-center w-44 border-t border-black pt-1">
                <p className="font-bold">Verified by Supervisor</p>
              </div>
              <div className="text-center w-44 border-t border-black pt-1">
                <p className="font-bold">Proprietor / Manager</p>
              </div>
            </div>
          </div>
        </PrintModal>
      )}
    </div>
  );
};
