import React, { useState } from 'react';
import {
  Box,
  Plus,
  Trash2,
  Edit2,
  Printer,
  Search,
  AlertTriangle,
} from 'lucide-react';
import { useFactory } from '../../context/FactoryContext';
import { PackagingItem } from '../../types';
import { formatCurrency, getTodayDateString } from '../../utils/formatters';
import { PrintModal } from '../common/PrintModal';
import { PrintHeader } from '../common/PrintHeader';
import { EmptyState } from '../common/EmptyState';

export const PackagingModule: React.FC = () => {
  const { packaging, settings, savePackaging, deletePackaging } = useFactory();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('Pouch');
  const [unit, setUnit] = useState('pcs');
  const [stock, setStock] = useState<number>(0);
  const [alertLevel, setAlertLevel] = useState<number>(50);
  const [lastPurchaseRate, setLastPurchaseRate] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const handleOpenAdd = () => {
    setEditingId(null);
    setCode(`PKG-${(packaging.length + 1).toString().padStart(3, '0')}`);
    setName('');
    setType('Pouch');
    setUnit(settings.customUnits[0] || 'pcs');
    setStock(0);
    setAlertLevel(50);
    setLastPurchaseRate(0);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg: PackagingItem) => {
    setEditingId(pkg.id);
    setCode(pkg.code || '');
    setName(pkg.name);
    setType(pkg.type || 'Pouch');
    setUnit(pkg.unit || 'pcs');
    setStock(pkg.stock || 0);
    setAlertLevel(pkg.alertLevel || 50);
    setLastPurchaseRate(pkg.lastPurchaseRate || 0);
    setNotes(pkg.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Packaging item name is required.');
      return;
    }

    await savePackaging({
      id: editingId || undefined,
      code,
      name,
      type: type.trim() || 'General Packaging',
      unit,
      stock,
      alertLevel,
      lastPurchaseRate,
      notes,
    });

    setIsModalOpen(false);
  };

  const filtered = packaging.filter((p) => {
    return (
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.code && p.code.toLowerCase().includes(search.toLowerCase())) ||
      (p.type && p.type.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Box className="w-5 h-5 text-purple-600" />
            Packaging Materials &amp; Cartons
          </h2>
          <p className="text-xs text-gray-500">
            Pouches, outer cartons, film rolls, sealing tapes, and corrugated boxes.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-gray-600" />
            Print Stock Report
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Packaging Item
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-xl border border-gray-200">
        <div className="text-xs text-gray-600 font-medium">
          Total Items: <span className="font-bold text-gray-900">{packaging.length}</span>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search packaging items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No Packaging Items Added"
          description="Track pouches, rolls, master cartons, tapes and wrappers used to pack your finished goods."
          actionText="Add Packaging Item"
          onAction={handleOpenAdd}
          icon={<Box className="w-6 h-6 text-purple-600" />}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Packaging Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Current Stock</th>
                  <th className="py-2.5 px-3">Unit</th>
                  <th className="py-2.5 px-3 text-right">Reorder Alert</th>
                  <th className="py-2.5 px-3 text-right">Last Cost Rate</th>
                  <th className="py-2.5 px-3">Notes</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {filtered.map((pkg) => {
                  const isLow = pkg.stock <= pkg.alertLevel;
                  return (
                    <tr key={pkg.id} className="hover:bg-purple-50/20 transition">
                      <td className="py-2.5 px-3 font-mono font-semibold text-gray-500">{pkg.code || '-'}</td>
                      <td className="py-2.5 px-3 font-bold text-gray-900">{pkg.name}</td>
                      <td className="py-2.5 px-3 text-gray-600">{pkg.type}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-sm">
                        <span className={isLow ? 'text-rose-600 flex items-center justify-end gap-1' : 'text-gray-900'}>
                          {isLow && <AlertTriangle className="w-3.5 h-3.5 text-rose-500 inline" />}
                          {pkg.stock}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-gray-500">{pkg.unit}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-500">{pkg.alertLevel}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium text-gray-700">
                        {formatCurrency(pkg.lastPurchaseRate, settings.currencySymbol)}
                      </td>
                      <td className="py-2.5 px-3 text-gray-500 italic max-w-xs truncate">{pkg.notes || '-'}</td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(pkg)}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete packaging "${pkg.name}"?`)) {
                                deletePackaging(pkg.id);
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-gray-200">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
              <h3 className="font-bold text-gray-900 text-sm">
                {editingId ? 'Edit Packaging Item' : 'Add Packaging Item'}
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
                  <label className="block font-semibold text-gray-700 mb-1">Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. PKG-001"
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Type</label>
                  <input
                    type="text"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    placeholder="e.g. Printed Pouch, Outer Box, Roll, Tape"
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Packaging Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rs 10 Nimko Printed Pouch (50g)"
                  className="w-full px-2.5 py-1.5 rounded border border-gray-300 font-medium text-gray-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-2 py-1.5 rounded border border-gray-300 bg-white"
                  >
                    {settings.customUnits.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={stock === 0 ? '' : stock}
                    onChange={(e) => setStock(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300 text-right font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Alert Level</label>
                  <input
                    type="number"
                    min="0"
                    value={alertLevel === 0 ? '' : alertLevel}
                    onChange={(e) => setAlertLevel(parseFloat(e.target.value) || 0)}
                    placeholder="50"
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300 text-right font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Last Cost Rate / Unit ({settings.currencySymbol})</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={lastPurchaseRate === 0 ? '' : lastPurchaseRate}
                  onChange={(e) => setLastPurchaseRate(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 rounded border border-gray-300 text-right font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Notes / Cylinder / Printing Details</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Printer press info, cylinder size, barcode, microns..."
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
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                Save Packaging
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
          title="Packaging Inventory Report"
        >
          <div className="p-4 sm:p-6 text-black bg-white">
            <PrintHeader
              title="PACKAGING STOCKS & CARTONS INVENTORY"
              subtitle="Pouches, Boxes, Film and Consumables"
              date={getTodayDateString()}
            />

            <table className="w-full text-xs border-collapse border border-black mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black py-1.5 px-2 text-center w-10">S.#</th>
                  <th className="border border-black py-1.5 px-2 text-left w-24">CODE</th>
                  <th className="border border-black py-1.5 px-2 text-left">ITEM NAME</th>
                  <th className="border border-black py-1.5 px-2 text-left w-28">TYPE</th>
                  <th className="border border-black py-1.5 px-2 text-right w-24">STOCK</th>
                  <th className="border border-black py-1.5 px-2 text-center w-16">UNIT</th>
                  <th className="border border-black py-1.5 px-2 text-right w-24">LAST RATE</th>
                  <th className="border border-black py-1.5 px-2 text-right w-28">EST. VALUE</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((pkg, i) => (
                  <tr key={pkg.id} className="border-b border-gray-300">
                    <td className="border border-black py-1 px-2 text-center">{i + 1}</td>
                    <td className="border border-black py-1 px-2 font-mono">{pkg.code || '-'}</td>
                    <td className="border border-black py-1 px-2 font-bold">{pkg.name}</td>
                    <td className="border border-black py-1 px-2">{pkg.type}</td>
                    <td className="border border-black py-1 px-2 text-right font-bold">{pkg.stock}</td>
                    <td className="border border-black py-1 px-2 text-center">{pkg.unit}</td>
                    <td className="border border-black py-1 px-2 text-right font-mono">
                      {formatCurrency(pkg.lastPurchaseRate, settings.currencySymbol)}
                    </td>
                    <td className="border border-black py-1 px-2 text-right font-mono font-bold">
                      {formatCurrency(pkg.stock * pkg.lastPurchaseRate, settings.currencySymbol)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PrintModal>
      )}
    </div>
  );
};
