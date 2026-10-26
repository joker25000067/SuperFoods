import React, { useState } from 'react';
import {
  Flame,
  Plus,
  Trash2,
  Printer,
  Search,
  AlertTriangle,
} from 'lucide-react';
import { useFactory } from '../../context/FactoryContext';
import { WastageRecord } from '../../types';
import { formatCurrency, formatDate, getTodayDateString } from '../../utils/formatters';
import { PrintModal } from '../common/PrintModal';
import { PrintHeader } from '../common/PrintHeader';
import { EmptyState } from '../common/EmptyState';

export const WastageModule: React.FC = () => {
  const {
    wastageRecords,
    products,
    rawMaterials,
    packaging,
    settings,
    saveWastageRecord,
    deleteWastageRecord,
  } = useFactory();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Form State
  const [date, setDate] = useState(getTodayDateString());
  const [itemType, setItemType] = useState<'product' | 'raw_material' | 'packaging'>('product');
  const [itemId, setItemId] = useState(products[0]?.id || '');
  const [itemName, setItemName] = useState(products[0]?.name || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState(products[0]?.unit || 'kg');
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [reason, setReason] = useState('Damaged during production / handling');
  const [notes, setNotes] = useState('');
  const [deductStockNow, setDeductStockNow] = useState(true);

  const handleOpenAdd = () => {
    setDate(getTodayDateString());
    setItemType('product');
    setItemId(products[0]?.id || '');
    setItemName(products[0]?.name || '');
    setQuantity(1);
    setUnit(products[0]?.unit || 'kg');
    setEstimatedCost(products[0]?.defaultRate || 0);
    setReason('Damaged during production / handling');
    setNotes('');
    setDeductStockNow(true);
    setIsModalOpen(true);
  };

  const handleItemTypeChange = (newType: 'product' | 'raw_material' | 'packaging') => {
    setItemType(newType);
    if (newType === 'product') {
      const p = products[0];
      setItemId(p?.id || '');
      setItemName(p?.name || '');
      setUnit(p?.unit || 'carton');
      setEstimatedCost(p?.defaultRate || 0);
    } else if (newType === 'raw_material') {
      const r = rawMaterials[0];
      setItemId(r?.id || '');
      setItemName(r?.name || '');
      setUnit(r?.unit || 'kg');
      setEstimatedCost(r?.lastPurchaseRate || 0);
    } else {
      const pkg = packaging[0];
      setItemId(pkg?.id || '');
      setItemName(pkg?.name || '');
      setUnit(pkg?.unit || 'pcs');
      setEstimatedCost(pkg?.lastPurchaseRate || 0);
    }
  };

  const handleItemSelect = (id: string) => {
    setItemId(id);
    if (itemType === 'product') {
      const p = products.find((prod) => prod.id === id);
      if (p) {
        setItemName(p.name);
        setUnit(p.unit);
        setEstimatedCost(p.defaultRate * quantity);
      }
    } else if (itemType === 'raw_material') {
      const r = rawMaterials.find((mat) => mat.id === id);
      if (r) {
        setItemName(r.name);
        setUnit(r.unit);
        setEstimatedCost(r.lastPurchaseRate * quantity);
      }
    } else {
      const pkg = packaging.find((pk) => pk.id === id);
      if (pkg) {
        setItemName(pkg.name);
        setUnit(pkg.unit);
        setEstimatedCost(pkg.lastPurchaseRate * quantity);
      }
    }
  };

  const handleSave = async () => {
    if (!itemName.trim()) {
      alert('Item name is required.');
      return;
    }
    if (quantity <= 0) {
      alert('Quantity must be greater than zero.');
      return;
    }

    await saveWastageRecord(
      {
        date,
        itemType,
        itemId: itemId || undefined,
        itemName,
        quantity,
        unit,
        reason,
        estimatedCost,
        notes,
      },
      deductStockNow
    );

    setIsModalOpen(false);
  };

  const totalLossCost = wastageRecords.reduce((sum, w) => sum + (w.estimatedCost || 0), 0);

  const filtered = wastageRecords.filter((w) => {
    return (
      w.itemName.toLowerCase().includes(search.toLowerCase()) ||
      w.reason.toLowerCase().includes(search.toLowerCase()) ||
      (w.notes && w.notes.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-600" />
            Wastage, Scrap &amp; Damage Register
          </h2>
          <p className="text-xs text-gray-500">
            Track burnt, broken, spilled, and expired goods with root cause analysis and financial loss valuation.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-gray-600" />
            Print Scrap Log
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Record Wastage
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500 block">Total Wastage Incidents</span>
          <span className="text-xl font-bold text-gray-900 mt-1 block">{wastageRecords.length}</span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">Logged scrap events</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-rose-600 block">Total Financial Loss</span>
          <span className="text-xl font-bold text-rose-700 mt-1 block">
            {formatCurrency(totalLossCost, settings.currencySymbol)}
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">Estimated scrap cost</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500 block">Search Wastage</span>
          <div className="relative mt-2">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by item, reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No Wastage Records"
          description="Log any damaged packaging pouches, burnt frying batches, or spilled raw materials."
          actionText="Log Wastage"
          onAction={handleOpenAdd}
          icon={<Flame className="w-6 h-6 text-rose-600" />}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Item Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Wasted Qty</th>
                  <th className="py-2.5 px-3 text-center">Unit</th>
                  <th className="py-2.5 px-3 text-right">Estimated Loss</th>
                  <th className="py-2.5 px-3">Reason / Root Cause</th>
                  <th className="py-2.5 px-3">Notes</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {filtered.map((w) => (
                  <tr key={w.id} className="hover:bg-rose-50/20 transition">
                    <td className="py-2.5 px-3 font-mono text-gray-600">{formatDate(w.date)}</td>
                    <td className="py-2.5 px-3 font-bold text-gray-900">{w.itemName}</td>
                    <td className="py-2.5 px-3 capitalize text-gray-600">{w.itemType.replace('_', ' ')}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600">{w.quantity}</td>
                    <td className="py-2.5 px-3 text-center text-gray-500">{w.unit}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900">
                      {formatCurrency(w.estimatedCost, settings.currencySymbol)}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-gray-700">{w.reason}</td>
                    <td className="py-2.5 px-3 text-gray-500 italic max-w-xs truncate">{w.notes || '-'}</td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => {
                          if (confirm(`Delete wastage log for "${w.itemName}"?`)) {
                            deleteWastageRecord(w.id);
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

      {/* RECORD WASTAGE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-600" />
                Record Wastage / Scrap Incident
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
                    value={itemType}
                    onChange={(e) =>
                      handleItemTypeChange(e.target.value as 'product' | 'raw_material' | 'packaging')
                    }
                    className="w-full px-2 py-1.5 rounded border border-gray-300 bg-white"
                  >
                    <option value="product">Finished Product</option>
                    <option value="raw_material">Raw Material</option>
                    <option value="packaging">Packaging</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Select Item</label>
                <div className="flex gap-2">
                  <select
                    value={itemId}
                    onChange={(e) => handleItemSelect(e.target.value)}
                    className="w-1/2 px-2 py-1.5 rounded border border-gray-300 bg-white"
                  >
                    <option value="">Custom Item</option>
                    {itemType === 'product' &&
                      products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    {itemType === 'raw_material' &&
                      rawMaterials.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    {itemType === 'packaging' &&
                      packaging.map((pkg) => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.name}
                        </option>
                      ))}
                  </select>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="Item description"
                    className="w-1/2 px-2.5 py-1.5 rounded border border-gray-300 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={quantity === 0 ? '' : quantity}
                    onChange={(e) => {
                      const q = parseFloat(e.target.value) || 0;
                      setQuantity(q);
                    }}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300 text-right font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300 text-center"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Est. Loss ({settings.currencySymbol})</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={estimatedCost === 0 ? '' : estimatedCost}
                    onChange={(e) => setEstimatedCost(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300 text-right font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Reason / Cause *</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Over-frying, sealing roll cut error, expired batch..."
                  className="w-full px-2.5 py-1.5 rounded border border-gray-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Notes / Action Taken</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Machine heating recalibrated, supplier notified of pouch defect..."
                  className="w-full px-2.5 py-1.5 rounded border border-gray-300"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="deductStock"
                  checked={deductStockNow}
                  onChange={(e) => setDeductStockNow(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="deductStock" className="font-semibold text-gray-800 cursor-pointer">
                  Automatically deduct this quantity from Current Stock
                </label>
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
                Log Wastage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE REPORT */}
      {isPrintModalOpen && (
        <PrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title="Factory Wastage &amp; Scrap Incident Report"
        >
          <div className="p-4 sm:p-6 text-black bg-white">
            <PrintHeader
              title="FACTORY WASTAGE & LOSS AUDIT REPORT"
              subtitle="Damaged, Expired and Production Scrap Log"
              date={getTodayDateString()}
            />

            <table className="w-full text-xs border-collapse border border-black mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black py-1.5 px-2 text-center w-10">S.#</th>
                  <th className="border border-black py-1.5 px-2 text-left w-24">DATE</th>
                  <th className="border border-black py-1.5 px-2 text-left">ITEM NAME</th>
                  <th className="border border-black py-1.5 px-2 text-left w-24">CATEGORY</th>
                  <th className="border border-black py-1.5 px-2 text-right w-20">QTY</th>
                  <th className="border border-black py-1.5 px-2 text-center w-16">UNIT</th>
                  <th className="border border-black py-1.5 px-2 text-right w-24">EST. LOSS</th>
                  <th className="border border-black py-1.5 px-2 text-left">REASON</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((w, idx) => (
                  <tr key={w.id} className="border-b border-gray-300">
                    <td className="border border-black py-1 px-2 text-center">{idx + 1}</td>
                    <td className="border border-black py-1 px-2 font-mono">{formatDate(w.date)}</td>
                    <td className="border border-black py-1 px-2 font-bold">{w.itemName}</td>
                    <td className="border border-black py-1 px-2 capitalize">{w.itemType.replace('_', ' ')}</td>
                    <td className="border border-black py-1 px-2 text-right font-bold">{w.quantity}</td>
                    <td className="border border-black py-1 px-2 text-center">{w.unit}</td>
                    <td className="border border-black py-1 px-2 text-right font-mono font-bold">
                      {formatCurrency(w.estimatedCost, settings.currencySymbol)}
                    </td>
                    <td className="border border-black py-1 px-2">{w.reason}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold bg-gray-100 border-t-2 border-black">
                  <td colSpan={6} className="border border-black py-1 px-2 text-right">TOTAL ESTIMATED LOSS:</td>
                  <td className="border border-black py-1 px-2 text-right font-mono">
                    {formatCurrency(totalLossCost, settings.currencySymbol)}
                  </td>
                  <td className="border border-black py-1 px-2"></td>
                </tr>
              </tfoot>
            </table>

            <div className="mt-8 pt-4 flex justify-between items-end text-xs">
              <div className="text-center w-44 border-t border-black pt-1">
                <p className="font-bold">Production Supervisor</p>
              </div>
              <div className="text-center w-44 border-t border-black pt-1">
                <p className="font-bold">Loss Prevention / Auditor</p>
              </div>
              <div className="text-center w-44 border-t border-black pt-1">
                <p className="font-bold">Factory Owner</p>
              </div>
            </div>
          </div>
        </PrintModal>
      )}
    </div>
  );
};
