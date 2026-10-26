import React, { useState } from 'react';
import {
  Factory,
  Plus,
  Trash2,
  Printer,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useFactory } from '../../context/FactoryContext';
import { ProductionBatch, ProductionMaterialConsumed } from '../../types';
import { formatCurrency, formatDate, getTodayDateString } from '../../utils/formatters';
import { PrintModal } from '../common/PrintModal';
import { PrintHeader } from '../common/PrintHeader';
import { EmptyState } from '../common/EmptyState';

export const ProductionModule: React.FC = () => {
  const {
    productionBatches,
    products,
    rawMaterials,
    packaging,
    settings,
    saveProductionBatch,
    deleteProductionBatch,
  } = useFactory();

  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [search, setSearch] = useState('');
  const [selectedBatchForPrint, setSelectedBatchForPrint] = useState<ProductionBatch | null>(null);

  // Form State
  const [date, setDate] = useState(getTodayDateString());
  const [batchNo, setBatchNo] = useState(`BATCH-${Date.now().toString().slice(-5)}`);
  const [productId, setProductId] = useState(products[0]?.id || '');
  const [productName, setProductName] = useState(products[0]?.name || '');
  const [outputQuantity, setOutputQuantity] = useState<number>(100);
  const [outputUnit, setOutputUnit] = useState(products[0]?.unit || 'carton');
  const [supervisor, setSupervisor] = useState('');
  const [notes, setNotes] = useState('');

  // Wastage during this batch
  const [wastageQuantity, setWastageQuantity] = useState<number>(0);
  const [wastageReason, setWastageReason] = useState('Production frying / packing breakage');
  const [selectedPackCategory, setSelectedPackCategory] = useState<string>('Rs 20 والی');

  // Materials Consumed in this batch
  const [consumedMaterials, setConsumedMaterials] = useState<ProductionMaterialConsumed[]>([
    {
      id: '1',
      materialType: 'raw_material',
      itemId: rawMaterials[0]?.id || '',
      itemName: rawMaterials[0]?.name || 'Raw Material',
      quantity: 50,
      unit: rawMaterials[0]?.unit || 'kg',
      unitCost: rawMaterials[0]?.lastPurchaseRate || 0,
      totalCost: (50) * (rawMaterials[0]?.lastPurchaseRate || 0),
    },
  ]);

  const handleProductSelect = (id: string, packCat?: string) => {
    setProductId(id);
    const p = products.find((prod) => prod.id === id);
    if (p) {
      const cat = packCat !== undefined ? packCat : selectedPackCategory;
      setProductName(cat ? `${p.name} (${cat})` : p.name);
      setOutputUnit(p.unit);
    }
  };

  const handlePackCategorySelect = (cat: string) => {
    setSelectedPackCategory(cat);
    const p = products.find((prod) => prod.id === productId);
    if (p) {
      setProductName(`${p.name} (${cat})`);
    }
  };

  const handleMaterialTypeChange = (index: number, newType: 'raw_material' | 'packaging') => {
    setConsumedMaterials((prev) => {
      const copy = [...prev];
      if (newType === 'raw_material') {
        const mat = rawMaterials[0];
        copy[index] = {
          ...copy[index],
          materialType: 'raw_material',
          itemId: mat?.id || '',
          itemName: mat?.name || 'Raw Material',
          unit: mat?.unit || 'kg',
          unitCost: mat?.lastPurchaseRate || 0,
          totalCost: (copy[index].quantity || 1) * (mat?.lastPurchaseRate || 0),
        };
      } else {
        const pkg = packaging[0];
        copy[index] = {
          ...copy[index],
          materialType: 'packaging',
          itemId: pkg?.id || '',
          itemName: pkg?.name || 'Packaging',
          unit: pkg?.unit || 'pcs',
          unitCost: pkg?.lastPurchaseRate || 0,
          totalCost: (copy[index].quantity || 1) * (pkg?.lastPurchaseRate || 0),
        };
      }
      return copy;
    });
  };

  const handleMaterialSelect = (index: number, itemId: string) => {
    setConsumedMaterials((prev) => {
      const copy = [...prev];
      const current = copy[index];
      if (current.materialType === 'raw_material') {
        const m = rawMaterials.find((mat) => mat.id === itemId);
        if (m) {
          copy[index] = {
            ...current,
            itemId: m.id,
            itemName: m.name,
            unit: m.unit,
            unitCost: m.lastPurchaseRate,
            totalCost: (current.quantity || 1) * m.lastPurchaseRate,
          };
        }
      } else {
        const p = packaging.find((pkg) => pkg.id === itemId);
        if (p) {
          copy[index] = {
            ...current,
            itemId: p.id,
            itemName: p.name,
            unit: p.unit,
            unitCost: p.lastPurchaseRate,
            totalCost: (current.quantity || 1) * p.lastPurchaseRate,
          };
        }
      }
      return copy;
    });
  };

  const handleConsumedRowChange = (index: number, field: 'quantity' | 'unitCost' | 'itemName' | 'unit', val: unknown) => {
    setConsumedMaterials((prev) => {
      const copy = [...prev];
      const row = { ...copy[index], [field]: val };
      if (field === 'quantity' || field === 'unitCost') {
        const q = field === 'quantity' ? Number(val) : row.quantity;
        const c = field === 'unitCost' ? Number(val) : row.unitCost;
        row.totalCost = (q || 0) * (c || 0);
      }
      copy[index] = row;
      return copy;
    });
  };

  const handleAddConsumedRow = () => {
    setConsumedMaterials((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        materialType: 'raw_material',
        itemId: rawMaterials[0]?.id || '',
        itemName: rawMaterials[0]?.name || 'Raw Material',
        quantity: 10,
        unit: rawMaterials[0]?.unit || 'kg',
        unitCost: rawMaterials[0]?.lastPurchaseRate || 0,
        totalCost: 0,
      },
    ]);
  };

  const handleRemoveConsumedRow = (index: number) => {
    if (consumedMaterials.length <= 1) return;
    setConsumedMaterials((prev) => prev.filter((_, i) => i !== index));
  };

  const totalBatchCost = consumedMaterials.reduce((sum, item) => sum + (item.totalCost || 0), 0);
  const perUnitCost = outputQuantity > 0 ? totalBatchCost / outputQuantity : 0;

  const handleSaveBatch = async () => {
    if (!productName.trim()) {
      alert('Please select or specify a finished product.');
      return;
    }
    if (outputQuantity <= 0) {
      alert('Output quantity must be greater than zero.');
      return;
    }

    const batchData: Omit<ProductionBatch, 'id'> = {
      batchNo,
      date,
      productId: productId || undefined,
      productName,
      outputQuantity,
      outputUnit,
      supervisor,
      totalCost: totalBatchCost,
      perUnitCost,
      consumedMaterials,
      wastageQuantity,
      wastageReason,
      notes,
    };

    await saveProductionBatch(batchData);

    // Reset Form
    setDate(getTodayDateString());
    setBatchNo(`BATCH-${Date.now().toString().slice(-5)}`);
    setOutputQuantity(100);
    setWastageQuantity(0);
    setSupervisor('');
    setNotes('');
    setActiveTab('list');
  };

  const filtered = productionBatches.filter((b) => {
    return (
      b.batchNo.toLowerCase().includes(search.toLowerCase()) ||
      b.productName.toLowerCase().includes(search.toLowerCase()) ||
      (b.supervisor && b.supervisor.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Factory className="w-5 h-5 text-indigo-600" />
            Production &amp; Batch Manufacturing
          </h2>
          <p className="text-xs text-gray-500">
            Create production batches, consume recipe ingredients &amp; packaging, track wastage, and calculate batch costs.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab(activeTab === 'list' ? 'create' : 'list')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer ${
              activeTab === 'create'
                ? 'bg-gray-800 hover:bg-gray-900 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {activeTab === 'create' ? <FileText className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {activeTab === 'create' ? 'View Batch Log' : '+ New Production Batch'}
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        /* CREATE PRODUCTION BATCH */
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-4 sm:p-5 space-y-4">
          <div className="border-b border-gray-200 pb-3 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Factory className="w-4 h-4 text-indigo-600" />
                Record Batch Manufacturing Run
              </h3>
              <p className="text-[11px] text-gray-500">
                Increases Finished Product stock and automatically deducts consumed materials from inventory.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
              {batchNo}
            </span>
          </div>

          {/* 4 Core Products & 10, 20, 50 Categories One-Click Selector */}
          <div className="bg-linear-to-r from-indigo-50/60 to-purple-50/60 p-3.5 rounded-xl border border-indigo-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                  آسان سلیکشن
                </span>
                پروڈکٹ منتخب کریں (1-Click Core Products):
              </span>
              <span className="text-[11px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                منتخب شدہ: {productName || 'کوئی نہیں'}
              </span>
            </div>

            {/* 4 Big Product Buttons + Any Future Products */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {[
                { name: 'راوی مکس نمکو', roman: 'Ravi Mix' },
                { name: 'دال موٹھ', roman: 'Dal Moth' },
                { name: 'دال چنا', roman: 'Dal Chana' },
                { name: 'پی نٹ', roman: 'Peanut (مونگ پھلی)' },
              ].map((item) => {
                const prod = products.find((p) => p.name.includes(item.name) || item.name.includes(p.name));
                const isSelected = prod ? productId === prod.id : false;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => {
                      if (prod) {
                        handleProductSelect(prod.id);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-400'
                        : 'bg-white hover:bg-indigo-50/80 border-gray-200 text-gray-800 shadow-2xs'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center text-[10px] mb-0.5 opacity-80">
                        <span>اسٹاک: {prod?.stock || 0}</span>
                        <span>{prod?.unit || 'carton'}</span>
                      </div>
                      <h4 className="font-bold text-xs leading-snug">{item.name}</h4>
                      <p className={`text-[10px] ${isSelected ? 'text-indigo-200' : 'text-gray-400'}`}>
                        {item.roman}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom / Future Products Chips if user has added any */}
            {products.some(
              (p) => !['راوی مکس نمکو', 'دال موٹھ', 'دال چنا', 'پی نٹ'].some((core) => p.name.includes(core))
            ) && (
              <div className="mb-3 pt-2 border-t border-indigo-100">
                <span className="text-[11px] font-bold text-purple-900 block mb-1.5">
                  ✨ دیگر و مستقبل کی پروڈکٹس (Other / Future Products):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {products
                    .filter(
                      (p) => !['راوی مکس نمکو', 'دال موٹھ', 'دال چنا', 'پی نٹ'].some((core) => p.name.includes(core))
                    )
                    .map((p) => {
                      const isSelected = productId === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleProductSelect(p.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-purple-700 text-white border-purple-800 shadow-xs ring-1 ring-purple-400'
                              : 'bg-white text-purple-900 border-purple-200 hover:bg-purple-50'
                          }`}
                        >
                          <span>{p.name}</span>
                          <span className="text-[10px] opacity-75 font-mono">({p.stock} {p.unit})</span>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            {/* 10, 20, 50 Category Chips */}
            <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-indigo-100">
              <span className="text-[11px] font-bold text-gray-700">پیکنگ کیٹیگری:</span>
              {['Rs 10 والی', 'Rs 20 والی', 'Rs 50 والی', 'Rs 100 والی'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handlePackCategorySelect(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    selectedPackCategory === cat
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Batch Run Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-gray-300"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Batch Number</label>
              <input
                type="text"
                value={batchNo}
                onChange={(e) => setBatchNo(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-gray-300 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Product Manufactured</label>
              <select
                value={productId}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-gray-300 bg-white font-medium"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.unit})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Supervisor / Head Cook</label>
              <input
                type="text"
                value={supervisor}
                onChange={(e) => setSupervisor(e.target.value)}
                placeholder="e.g. Ustad Asghar, Bilal"
                className="w-full px-2.5 py-1.5 rounded border border-gray-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 text-xs">
            <div>
              <label className="block font-bold text-indigo-950 mb-1">Total Finished Output Qty *</label>
              <div className="flex gap-2 mb-1.5">
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={outputQuantity === 0 ? '' : outputQuantity}
                  onChange={(e) => setOutputQuantity(parseFloat(e.target.value) || 0)}
                  placeholder="100"
                  className="w-2/3 px-2.5 py-1.5 rounded border border-indigo-200 bg-white text-right font-mono font-bold text-sm"
                />
                <input
                  type="text"
                  value={outputUnit}
                  onChange={(e) => setOutputUnit(e.target.value)}
                  placeholder="Unit"
                  className="w-1/3 px-2 py-1.5 rounded border border-indigo-200 bg-white text-center font-medium"
                />
              </div>
              <div className="flex items-center gap-1">
                {[10, 25, 50, 100].map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setOutputQuantity((prev) => (prev || 0) + step)}
                    className="px-2 py-0.5 bg-white border border-indigo-200 text-indigo-800 rounded text-[11px] font-bold hover:bg-indigo-100 cursor-pointer"
                  >
                    +{step}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setOutputQuantity(0)}
                  className="px-1.5 py-0.5 text-gray-500 hover:text-gray-700 text-[10px]"
                >
                  Clear
                </button>
              </div>
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Batch Wastage Qty</label>
              <input
                type="number"
                min="0"
                step="any"
                value={wastageQuantity === 0 ? '' : wastageQuantity}
                onChange={(e) => setWastageQuantity(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full px-2.5 py-1.5 rounded border border-gray-300 bg-white text-right font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Wastage Reason / Defect</label>
              <input
                type="text"
                value={wastageReason}
                onChange={(e) => setWastageReason(e.target.value)}
                placeholder="e.g. Burnt crust, sealing temperature defect..."
                className="w-full px-2.5 py-1.5 rounded border border-gray-300 bg-white"
              />
            </div>
          </div>

          {/* CONSUMED MATERIALS LIST */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex justify-between items-center">
              <span className="font-bold text-xs text-gray-700 uppercase tracking-wide">
                Materials &amp; Packaging Consumed in this Batch
              </span>
              <button
                type="button"
                onClick={handleAddConsumedRow}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Material / Ingredient
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100 text-gray-600 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="py-2 px-2 w-10 text-center">#</th>
                    <th className="py-2 px-2 w-32">Type</th>
                    <th className="py-2 px-2">Material / Item</th>
                    <th className="py-2 px-2 w-28 text-right">Consumed Qty</th>
                    <th className="py-2 px-2 w-20 text-center">Unit</th>
                    <th className="py-2 px-2 w-28 text-right">Unit Cost ({settings.currencySymbol})</th>
                    <th className="py-2 px-2 w-32 text-right">Total Cost</th>
                    <th className="py-2 px-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {consumedMaterials.map((row, idx) => (
                    <tr key={row.id}>
                      <td className="py-2 px-2 text-center text-gray-400 font-mono">{idx + 1}</td>
                      <td className="py-2 px-2">
                        <select
                          value={row.materialType}
                          onChange={(e) =>
                            handleMaterialTypeChange(idx, e.target.value as 'raw_material' | 'packaging')
                          }
                          className="w-full px-2 py-1 rounded border border-gray-300 bg-white"
                        >
                          <option value="raw_material">Raw Material</option>
                          <option value="packaging">Packaging</option>
                        </select>
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex gap-1.5">
                          <select
                            value={row.itemId}
                            onChange={(e) => handleMaterialSelect(idx, e.target.value)}
                            className="w-1/2 px-2 py-1 rounded border border-gray-300 bg-white"
                          >
                            <option value="">Custom Item</option>
                            {row.materialType === 'raw_material'
                              ? rawMaterials.map((r) => (
                                  <option key={r.id} value={r.id}>
                                    {r.name} (Stock: {r.stock})
                                  </option>
                                ))
                              : packaging.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} (Stock: {p.stock})
                                  </option>
                                ))}
                          </select>
                          <input
                            type="text"
                            value={row.itemName}
                            onChange={(e) => handleConsumedRowChange(idx, 'itemName', e.target.value)}
                            placeholder="Description"
                            className="w-1/2 px-2 py-1 rounded border border-gray-300"
                          />
                        </div>
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={row.quantity === 0 ? '' : row.quantity}
                          onChange={(e) =>
                            handleConsumedRowChange(idx, 'quantity', parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-2 py-1 rounded border border-gray-300 text-right font-mono font-bold"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <input
                          type="text"
                          value={row.unit}
                          onChange={(e) => handleConsumedRowChange(idx, 'unit', e.target.value)}
                          placeholder="kg/pc"
                          className="w-16 px-1.5 py-1 text-center font-bold text-xs rounded border border-gray-300 bg-white"
                          title="یونٹ تبدیل کریں (مثلاً pc یا kg)"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={row.unitCost === 0 ? '' : row.unitCost}
                          onChange={(e) =>
                            handleConsumedRowChange(idx, 'unitCost', parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-2 py-1 rounded border border-gray-300 text-right font-mono"
                        />
                      </td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-gray-900">
                        {formatCurrency(row.totalCost, settings.currencySymbol)}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveConsumedRow(idx)}
                          className="text-gray-400 hover:text-rose-600 p-1 cursor-pointer"
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

          {/* COSTING AND SAVE BAR */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            <div className="w-full sm:w-1/2">
              <label className="block font-semibold text-xs text-gray-700 mb-1">Batch Notes / Observations</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Oil temperature, frying time, salt taste test, machine speed..."
                className="w-full px-2.5 py-1.5 rounded border border-gray-300 text-xs"
              />
            </div>

            <div className="w-full sm:w-80 bg-gray-50 p-3.5 rounded-lg border border-gray-200 space-y-2 text-xs">
              <div className="flex justify-between items-center text-xs text-gray-600">
                <span>Total Materials Cost:</span>
                <span className="font-mono font-bold text-gray-900 text-sm">
                  {formatCurrency(totalBatchCost, settings.currencySymbol)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-indigo-700 font-bold border-t border-gray-200 pt-1.5">
                <span>Cost Per Unit Produced:</span>
                <span className="font-mono text-sm">
                  {formatCurrency(perUnitCost, settings.currencySymbol)} / {outputUnit}
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveBatch}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs transition cursor-pointer"
                >
                  Complete Batch &amp; Deduct Materials
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* BATCHES LIST */
        <div className="space-y-3">
          <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-200">
            <div className="text-xs text-gray-600 font-medium">
              Total Batches Logged: <span className="font-bold text-gray-900">{productionBatches.length}</span>
            </div>
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by batch #, product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title="No Production Batches"
              description="Record your factory's production runs to update finished goods and consume ingredients."
              actionText="Log Production Batch"
              onAction={() => setActiveTab('create')}
              icon={<Factory className="w-6 h-6 text-indigo-600" />}
            />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Batch #</th>
                      <th className="py-2.5 px-3">Finished Product</th>
                      <th className="py-2.5 px-3 text-right">Output Qty</th>
                      <th className="py-2.5 px-3 text-right">Batch Cost</th>
                      <th className="py-2.5 px-3 text-right">Per Unit Cost</th>
                      <th className="py-2.5 px-3">Supervisor</th>
                      <th className="py-2.5 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-800">
                    {filtered.map((b) => (
                      <tr key={b.id} className="hover:bg-indigo-50/20 transition">
                        <td className="py-2.5 px-3 font-mono text-gray-600">{formatDate(b.date)}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-gray-900">{b.batchNo}</td>
                        <td className="py-2.5 px-3 font-semibold text-gray-900">{b.productName}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-700">
                          {b.outputQuantity} {b.outputUnit}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-medium text-gray-700">
                          {formatCurrency(b.totalCost, settings.currencySymbol)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900">
                          {formatCurrency(b.perUnitCost, settings.currencySymbol)}
                        </td>
                        <td className="py-2.5 px-3 text-gray-600">{b.supervisor || '-'}</td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedBatchForPrint(b)}
                              className="px-2 py-1 text-[11px] font-semibold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-md border border-indigo-200 transition cursor-pointer flex items-center gap-1"
                            >
                              <Printer className="w-3 h-3" /> Batch Sheet
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete batch "${b.batchNo}"?`)) {
                                  deleteProductionBatch(b.id);
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
        </div>
      )}

      {/* PRINTABLE BATCH RECORD */}
      {selectedBatchForPrint && (
        <PrintModal
          isOpen={!!selectedBatchForPrint}
          onClose={() => setSelectedBatchForPrint(null)}
          title={`Batch Manufacturing Sheet: ${selectedBatchForPrint.batchNo}`}
        >
          <div className="p-4 sm:p-6 text-black bg-white">
            <PrintHeader
              title="FACTORY PRODUCTION & BATCH MANUFACTURING REPORT"
              subtitle={`Batch: ${selectedBatchForPrint.batchNo} | Product: ${selectedBatchForPrint.productName}`}
              date={selectedBatchForPrint.date}
            />

            <div className="grid grid-cols-2 gap-3 text-xs mb-4 border border-black p-2 bg-gray-50">
              <div>
                <p><span className="font-bold">Product:</span> {selectedBatchForPrint.productName}</p>
                <p><span className="font-bold">Output Yield:</span> {selectedBatchForPrint.outputQuantity} {selectedBatchForPrint.outputUnit}</p>
                <p><span className="font-bold">Supervisor:</span> {selectedBatchForPrint.supervisor || '-'}</p>
              </div>
              <div className="text-right">
                <p><span className="font-bold">Batch Cost:</span> {formatCurrency(selectedBatchForPrint.totalCost, settings.currencySymbol)}</p>
                <p><span className="font-bold">Per Unit Cost:</span> {formatCurrency(selectedBatchForPrint.perUnitCost, settings.currencySymbol)}</p>
                <p><span className="font-bold">Wastage / Scrap:</span> {selectedBatchForPrint.wastageQuantity || 0} {selectedBatchForPrint.wastageReason ? `(${selectedBatchForPrint.wastageReason})` : ''}</p>
              </div>
            </div>

            <h4 className="font-bold text-xs uppercase mb-2">Materials Consumed in Batch</h4>
            <table className="w-full text-xs border-collapse border border-black mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black py-1 px-2 text-center w-10">S.#</th>
                  <th className="border border-black py-1 px-2 text-left">ITEM NAME</th>
                  <th className="border border-black py-1 px-2 text-left w-28">TYPE</th>
                  <th className="border border-black py-1 px-2 text-right w-24">QTY CONSUMED</th>
                  <th className="border border-black py-1 px-2 text-center w-16">UNIT</th>
                  <th className="border border-black py-1 px-2 text-right w-24">UNIT COST</th>
                  <th className="border border-black py-1 px-2 text-right w-28">TOTAL COST</th>
                </tr>
              </thead>
              <tbody>
                {selectedBatchForPrint.consumedMaterials.map((mat, idx) => (
                  <tr key={idx} className="border-b border-gray-300">
                    <td className="border border-black py-1 px-2 text-center">{idx + 1}</td>
                    <td className="border border-black py-1 px-2 font-bold">{mat.itemName}</td>
                    <td className="border border-black py-1 px-2 capitalize">{mat.materialType.replace('_', ' ')}</td>
                    <td className="border border-black py-1 px-2 text-right font-bold">{mat.quantity}</td>
                    <td className="border border-black py-1 px-2 text-center">{mat.unit}</td>
                    <td className="border border-black py-1 px-2 text-right font-mono">
                      {formatCurrency(mat.unitCost, settings.currencySymbol)}
                    </td>
                    <td className="border border-black py-1 px-2 text-right font-mono font-bold">
                      {formatCurrency(mat.totalCost, settings.currencySymbol)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold bg-gray-100 border-t-2 border-black">
                  <td colSpan={6} className="border border-black py-1 px-2 text-right">TOTAL MATERIAL COST:</td>
                  <td className="border border-black py-1 px-2 text-right font-mono">
                    {formatCurrency(selectedBatchForPrint.totalCost, settings.currencySymbol)}
                  </td>
                </tr>
              </tfoot>
            </table>

            {selectedBatchForPrint.notes && (
              <p className="text-xs mb-4 italic">Remarks: {selectedBatchForPrint.notes}</p>
            )}

            <div className="mt-8 pt-4 flex justify-between items-end text-xs">
              <div className="text-center w-44 border-t border-black pt-1">
                <p className="font-bold">Production Incharge</p>
              </div>
              <div className="text-center w-44 border-t border-black pt-1">
                <p className="font-bold">Quality Inspector</p>
              </div>
              <div className="text-center w-44 border-t border-black pt-1">
                <p className="font-bold">Factory Manager</p>
              </div>
            </div>
          </div>
        </PrintModal>
      )}
    </div>
  );
};
