import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Edit2,
  Printer,
  Search,
  AlertTriangle,
} from 'lucide-react';
import { useFactory } from '../../context/FactoryContext';
import { RawMaterial } from '../../types';
import { formatCurrency, getTodayDateString } from '../../utils/formatters';
import { PrintModal } from '../common/PrintModal';
import { PrintHeader } from '../common/PrintHeader';
import { EmptyState } from '../common/EmptyState';

export const RawMaterialsModule: React.FC = () => {
  const { rawMaterials, settings, saveRawMaterial, deleteRawMaterial } = useFactory();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('kg');
  const [stock, setStock] = useState<number>(0);
  const [alertLevel, setAlertLevel] = useState<number>(20);
  const [lastPurchaseRate, setLastPurchaseRate] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Quick Inline Add State for ultra fast entry
  const [quickName, setQuickName] = useState('');
  const [quickUnit, setQuickUnit] = useState('kg');
  const [quickStock, setQuickStock] = useState<number | ''>('');
  const [quickRate, setQuickRate] = useState<number | ''>('');
  const [quickToast, setQuickToast] = useState<string | null>(null);

  const commonUnits = [
    { key: 'kg', label: 'kg (کلو)' },
    { key: 'pc', label: 'pc (پیس / عدد)' },
    { key: 'bag', label: 'bag (بوری)' },
    { key: 'liter', label: 'liter (لیٹر)' },
    { key: 'gram', label: 'gram (گرام)' },
    { key: 'carton', label: 'carton (کارٹن)' },
    { key: 'roll', label: 'roll (رول)' },
  ];

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) {
      alert('براہ کرم خام مال کا نام درج کریں (Please enter raw material name)');
      return;
    }

    const newCode = `RAW-${(rawMaterials.length + 1).toString().padStart(3, '0')}`;
    await saveRawMaterial({
      code: newCode,
      name: quickName.trim(),
      category: 'Ingredient',
      unit: quickUnit.trim() || 'kg',
      stock: Number(quickStock) || 0,
      alertLevel: 20,
      lastPurchaseRate: Number(quickRate) || 0,
      notes: 'Quick added independently',
    });

    setQuickToast(`"${quickName.trim()}" (${quickUnit}) کامیابی سے شامل ہو گیا!`);
    setQuickName('');
    setQuickStock('');
    setQuickRate('');
    setTimeout(() => setQuickToast(null), 3000);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setCode(`RAW-${(rawMaterials.length + 1).toString().padStart(3, '0')}`);
    setName('');
    setCategory('');
    setUnit('kg');
    setStock(0);
    setAlertLevel(20);
    setLastPurchaseRate(0);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (r: RawMaterial) => {
    setEditingId(r.id);
    setCode(r.code || '');
    setName(r.name);
    setCategory(r.category || '');
    setUnit(r.unit || 'kg');
    setStock(r.stock || 0);
    setAlertLevel(r.alertLevel || 20);
    setLastPurchaseRate(r.lastPurchaseRate || 0);
    setNotes(r.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Material name is required.');
      return;
    }

    await saveRawMaterial({
      id: editingId || undefined,
      code,
      name,
      category: category.trim() || 'Ingredient',
      unit,
      stock,
      alertLevel,
      lastPurchaseRate,
      notes,
    });

    setIsModalOpen(false);
  };

  const filtered = rawMaterials.filter((r) => {
    return (
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.code && r.code.toLowerCase().includes(search.toLowerCase())) ||
      (r.category && r.category.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            Raw Materials &amp; Ingredients
          </h2>
          <p className="text-xs text-gray-500">
            Track grains, oils, spices, chemicals, and supplies consumed in manufacturing.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-gray-600" />
            Print Inventory
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Raw Material
          </button>
        </div>
      </div>

      {quickToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          {quickToast}
        </div>
      )}

      {/* Quick Independent Entry Bar (آسان فوری اندراج) */}
      <div className="bg-linear-to-r from-emerald-50 via-teal-50 to-white p-4 rounded-xl border border-emerald-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                آسان اندراج
              </span>
              Quick Add Raw Material (اپنی مرضی سے kg یا pc منتخب کریں)
            </h3>
            <p className="text-xs text-emerald-800/80">
              کسی بھی آئٹم کا نام لکھیں، یونٹ (kg یا pc) پر کلک کریں اور فوری شامل کریں — بغیر کسی لمبی فارم کے!
            </p>
          </div>
        </div>

        <form onSubmit={handleQuickAdd} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                خام مال کا نام (Material Name) *
              </label>
              <input
                type="text"
                placeholder="مثلاً: بیسن A، کوکنگ آئل، مصالحہ جات..."
                value={quickName}
                onChange={(e) => setQuickName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                یونٹ منتخب کریں (Choose Unit: kg / pc)
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {['kg', 'pc', 'bag', 'liter', 'gram'].map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setQuickUnit(u)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      quickUnit === u
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {u === 'kg' ? 'kg (کلو)' : u === 'pc' ? 'pc (عدد)' : u === 'bag' ? 'bag (بوری)' : u}
                  </button>
                ))}
                <input
                  type="text"
                  placeholder="یا کسٹم یونٹ"
                  value={quickUnit}
                  onChange={(e) => setQuickUnit(e.target.value)}
                  className="w-20 px-2 py-1.5 text-xs rounded-lg border border-gray-300 bg-white font-mono text-center"
                  title="اپنی مرضی کا کوئی بھی یونٹ لکھیں"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                تعداد / وزن (Initial Stock)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={quickStock}
                onChange={(e) => setQuickStock(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white font-mono text-right font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 flex gap-2">
              <div className="w-full">
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  ریٹ / فی یونٹ
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0"
                  value={quickRate}
                  onChange={(e) => setQuickRate(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white font-mono text-right font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="self-end px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-xs transition cursor-pointer flex items-center gap-1 shrink-0"
              >
                <Plus className="w-4 h-4" />
                شامل کریں
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-xl border border-gray-200">
        <div className="text-xs text-gray-600 font-medium">
          Total Ingredients: <span className="font-bold text-gray-900">{rawMaterials.length}</span>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search raw materials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No Raw Materials Added"
          description="Register the raw materials and ingredients your factory purchases and consumes."
          actionText="Add Raw Material"
          onAction={handleOpenAdd}
          icon={<Layers className="w-6 h-6 text-emerald-600" />}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Material Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Current Stock</th>
                  <th className="py-2.5 px-3">Unit</th>
                  <th className="py-2.5 px-3 text-right">Reorder Alert</th>
                  <th className="py-2.5 px-3 text-right">Last Cost Rate</th>
                  <th className="py-2.5 px-3">Notes</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {filtered.map((mat) => {
                  const isLow = mat.stock <= mat.alertLevel;
                  return (
                    <tr key={mat.id} className="hover:bg-emerald-50/20 transition">
                      <td className="py-2.5 px-3 font-mono font-semibold text-gray-500">{mat.code || '-'}</td>
                      <td className="py-2.5 px-3 font-bold text-gray-900">{mat.name}</td>
                      <td className="py-2.5 px-3 text-gray-600">{mat.category}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-sm">
                        <span className={isLow ? 'text-rose-600 flex items-center justify-end gap-1' : 'text-gray-900'}>
                          {isLow && <AlertTriangle className="w-3.5 h-3.5 text-rose-500 inline" />}
                          {mat.stock}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {mat.unit}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-500">{mat.alertLevel}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium text-gray-700">
                        {formatCurrency(mat.lastPurchaseRate, settings.currencySymbol)}
                      </td>
                      <td className="py-2.5 px-3 text-gray-500 italic max-w-xs truncate">{mat.notes || '-'}</td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(mat)}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete raw material "${mat.name}"?`)) {
                                deleteRawMaterial(mat.id);
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
                {editingId ? 'Edit Raw Material' : 'Add Raw Material'}
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
                    placeholder="e.g. RAW-001"
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Flour, Oil, Spice, Chemical"
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Material Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Chickpea Flour (Besan) Grade A"
                  className="w-full px-2.5 py-1.5 rounded border border-gray-300 font-medium text-gray-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  یونٹ (Unit: kg, pc, bag, etc.)
                </label>
                <div className="flex flex-wrap items-center gap-1 mb-1.5">
                  {['kg', 'pc', 'bag', 'liter', 'gram', 'carton'].map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setUnit(u)}
                      className={`px-2.5 py-1 text-xs rounded font-bold cursor-pointer transition ${
                        unit === u
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {u === 'kg' ? 'kg (کلو)' : u === 'pc' ? 'pc (پیس)' : u === 'bag' ? 'bag (بوری)' : u}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1.5 items-center">
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="اپنی مرضی کا یونٹ (مثلاً pc یا kg)"
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300 font-medium bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                    placeholder="20"
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300 text-right font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Last Purchase Cost / Unit ({settings.currencySymbol})</label>
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
                <label className="block font-semibold text-gray-700 mb-1">Notes / Supplier info</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Supplier contacts, purity specs, storage precautions..."
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
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                Save Material
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
          title="Raw Materials Inventory Report"
        >
          <div className="p-4 sm:p-6 text-black bg-white">
            <PrintHeader
              title="RAW MATERIALS & INGREDIENTS REGISTER"
              subtitle="Factory Inventory Balances and Valuation"
              date={getTodayDateString()}
            />

            <table className="w-full text-xs border-collapse border border-black mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black py-1.5 px-2 text-center w-10">S.#</th>
                  <th className="border border-black py-1.5 px-2 text-left w-24">CODE</th>
                  <th className="border border-black py-1.5 px-2 text-left">ITEM NAME</th>
                  <th className="border border-black py-1.5 px-2 text-left w-28">CATEGORY</th>
                  <th className="border border-black py-1.5 px-2 text-right w-24">STOCK</th>
                  <th className="border border-black py-1.5 px-2 text-center w-16">UNIT</th>
                  <th className="border border-black py-1.5 px-2 text-right w-24">LAST RATE</th>
                  <th className="border border-black py-1.5 px-2 text-right w-28">EST. VALUE</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((mat, i) => (
                  <tr key={mat.id} className="border-b border-gray-300">
                    <td className="border border-black py-1 px-2 text-center">{i + 1}</td>
                    <td className="border border-black py-1 px-2 font-mono">{mat.code || '-'}</td>
                    <td className="border border-black py-1 px-2 font-bold">{mat.name}</td>
                    <td className="border border-black py-1 px-2">{mat.category}</td>
                    <td className="border border-black py-1 px-2 text-right font-bold">{mat.stock}</td>
                    <td className="border border-black py-1 px-2 text-center">{mat.unit}</td>
                    <td className="border border-black py-1 px-2 text-right font-mono">
                      {formatCurrency(mat.lastPurchaseRate, settings.currencySymbol)}
                    </td>
                    <td className="border border-black py-1 px-2 text-right font-mono font-bold">
                      {formatCurrency(mat.stock * mat.lastPurchaseRate, settings.currencySymbol)}
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
