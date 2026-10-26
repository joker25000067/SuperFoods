import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Trash2,
  Edit2,
  Printer,
  Search,
  BookOpen,
} from 'lucide-react';
import { useFactory } from '../../context/FactoryContext';
import { Supplier } from '../../types';
import { formatCurrency, formatDate, getTodayDateString } from '../../utils/formatters';
import { PrintModal } from '../common/PrintModal';
import { PrintHeader } from '../common/PrintHeader';
import { EmptyState } from '../common/EmptyState';

export const SuppliersModule: React.FC = () => {
  const { suppliers, purchases, cashbook, settings, saveSupplier, deleteSupplier } = useFactory();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplierForLedger, setSelectedSupplierForLedger] = useState<Supplier | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setCompany('');
    setPhone('');
    setAddress('');
    setOpeningBalance(0);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Supplier) => {
    setEditingId(s.id);
    setName(s.name);
    setCompany(s.company || '');
    setPhone(s.phone || '');
    setAddress(s.address || '');
    setOpeningBalance(s.openingBalance || 0);
    setNotes(s.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Supplier name is required.');
      return;
    }

    const existing = editingId ? suppliers.find((s) => s.id === editingId) : null;
    const currentBalance = existing ? existing.currentBalance : openingBalance;

    await saveSupplier({
      id: editingId || undefined,
      name,
      company,
      phone,
      address,
      openingBalance,
      currentBalance,
      notes,
    });

    setIsModalOpen(false);
  };

  const filtered = suppliers.filter((s) => {
    return (
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.company && s.company.toLowerCase().includes(search.toLowerCase())) ||
      (s.phone && s.phone.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const totalPayable = suppliers.reduce((acc, curr) => acc + curr.currentBalance, 0);

  // Supplier Ledger Data
  const getSupplierLedger = (supplierId: string) => {
    const supPurchases = purchases
      .filter((p) => p.supplierId === supplierId)
      .map((p) => ({
        id: p.id,
        date: p.date,
        type: 'Purchase Bill',
        ref: p.invoiceNo,
        debit: 0,
        credit: p.totalAmount, // Increases what we owe
        paid: p.paidAmount,
      }));

    return supPurchases.sort((a, b) => a.date.localeCompare(b.date));
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-600" />
            Suppliers &amp; Vendors
          </h2>
          <p className="text-xs text-gray-500">
            Raw material, packaging and spares vendors, payment ledgers, and accounts payable.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Supplier
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500 block">Total Suppliers</span>
          <span className="text-xl font-bold text-gray-900 mt-1 block">{suppliers.length}</span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">Active trade vendors</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-rose-600 block">Total Payable Balance</span>
          <span className="text-xl font-bold text-rose-700 mt-1 block">
            {formatCurrency(totalPayable, settings.currencySymbol)}
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">Factory liabilities owed to suppliers</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500 block">Search &amp; Filter</span>
          <div className="relative mt-2">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendor name, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Suppliers Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No Suppliers Found"
          description="Add the vendors who supply raw materials, packaging, cartons or factory machine spare parts."
          actionText="Add Supplier"
          onAction={handleOpenAdd}
          icon={<Truck className="w-6 h-6 text-amber-600" />}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Supplier Name</th>
                  <th className="py-2.5 px-3">Company / Mill</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Address</th>
                  <th className="py-2.5 px-3 text-right">Opening Bal.</th>
                  <th className="py-2.5 px-3 text-right">Payable Balance</th>
                  <th className="py-2.5 px-3">Notes</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {filtered.map((sup) => (
                  <tr key={sup.id} className="hover:bg-amber-50/20 transition">
                    <td className="py-2.5 px-3 font-bold text-gray-900">{sup.name}</td>
                    <td className="py-2.5 px-3 text-gray-600 font-medium">{sup.company || '-'}</td>
                    <td className="py-2.5 px-3 text-gray-600 font-mono">{sup.phone || '-'}</td>
                    <td className="py-2.5 px-3 text-gray-500">{sup.address || '-'}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-gray-500">
                      {formatCurrency(sup.openingBalance, settings.currencySymbol)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-sm text-rose-700">
                      {formatCurrency(sup.currentBalance, settings.currencySymbol)}
                    </td>
                    <td className="py-2.5 px-3 text-gray-500 italic max-w-xs truncate">{sup.notes || '-'}</td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedSupplierForLedger(sup)}
                          className="px-2 py-1 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-md border border-amber-200 transition cursor-pointer flex items-center gap-1"
                          title="View Ledger Statement"
                        >
                          <BookOpen className="w-3 h-3" /> Ledger
                        </button>
                        <button
                          onClick={() => handleOpenEdit(sup)}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete supplier "${sup.name}"?`)) {
                              deleteSupplier(sup.id);
                            }
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
              <h3 className="font-bold text-gray-900 text-sm">
                {editingId ? 'Edit Supplier' : 'Add Supplier'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Contact Person / Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Haji Muhammad Aslam"
                  className="w-full px-2.5 py-1.5 rounded border border-gray-300 font-medium text-gray-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Company / Mill / Shop Name</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Al-Madina Oil Mills, Star Packages"
                  className="w-full px-2.5 py-1.5 rounded border border-gray-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0321-7654321"
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Opening Payable ({settings.currencySymbol})</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={openingBalance === 0 ? '' : openingBalance}
                    onChange={(e) => setOpeningBalance(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    disabled={!!editingId}
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300 font-mono text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Address / Market Location</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Grain Market, Sargodha Road"
                  className="w-full px-2.5 py-1.5 rounded border border-gray-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Notes / Items Supplied</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Supplies cooking oil drums, salt bags, payment terms..."
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
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                Save Supplier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUPPLIER LEDGER MODAL & PRINT */}
      {selectedSupplierForLedger && (
        <PrintModal
          isOpen={!!selectedSupplierForLedger}
          onClose={() => setSelectedSupplierForLedger(null)}
          title={`Supplier Ledger: ${selectedSupplierForLedger.name}`}
        >
          <div className="p-4 sm:p-6 text-black bg-white">
            <PrintHeader
              title="SUPPLIER ACCOUNT STATEMENT / LEDGER"
              subtitle={`Vendor: ${selectedSupplierForLedger.name} ${selectedSupplierForLedger.company ? `(${selectedSupplierForLedger.company})` : ''}`}
              date={getTodayDateString()}
            />

            <div className="grid grid-cols-2 gap-3 text-xs mb-4 border border-black p-2 bg-gray-50">
              <div>
                <p><span className="font-bold">Phone:</span> {selectedSupplierForLedger.phone || '-'}</p>
                <p><span className="font-bold">Address:</span> {selectedSupplierForLedger.address || '-'}</p>
              </div>
              <div className="text-right">
                <p><span className="font-bold">Opening Balance:</span> {formatCurrency(selectedSupplierForLedger.openingBalance, settings.currencySymbol)}</p>
                <p><span className="font-bold text-rose-800">Current Balance Due:</span> {formatCurrency(selectedSupplierForLedger.currentBalance, settings.currencySymbol)}</p>
              </div>
            </div>

            <table className="w-full text-xs border-collapse border border-black mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black py-1.5 px-2 text-center w-10">S.#</th>
                  <th className="border border-black py-1.5 px-2 text-left w-24">DATE</th>
                  <th className="border border-black py-1.5 px-2 text-left">DESCRIPTION / INVOICE</th>
                  <th className="border border-black py-1.5 px-2 text-right w-28">BILL AMOUNT</th>
                  <th className="border border-black py-1.5 px-2 text-right w-28">AMOUNT PAID</th>
                </tr>
              </thead>
              <tbody>
                {getSupplierLedger(selectedSupplierForLedger.id).map((entry, idx) => (
                  <tr key={idx} className="border-b border-gray-300">
                    <td className="border border-black py-1 px-2 text-center">{idx + 1}</td>
                    <td className="border border-black py-1 px-2 font-mono">{formatDate(entry.date)}</td>
                    <td className="border border-black py-1 px-2 font-medium">
                      Purchase Bill #{entry.ref}
                    </td>
                    <td className="border border-black py-1 px-2 text-right font-mono font-bold">
                      {formatCurrency(entry.credit, settings.currencySymbol)}
                    </td>
                    <td className="border border-black py-1 px-2 text-right font-mono text-emerald-800 font-bold">
                      {formatCurrency(entry.paid, settings.currencySymbol)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-8 pt-4 flex justify-between items-end text-xs">
              <div className="text-center w-48 border-t border-black pt-1">
                <p className="font-bold">Vendor Confirmation Signature</p>
              </div>
              <div className="text-center w-48 border-t border-black pt-1">
                <p className="font-bold">Accountant / Manager</p>
              </div>
            </div>
          </div>
        </PrintModal>
      )}
    </div>
  );
};
