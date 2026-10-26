import React, { useState } from 'react';
import {
  Boxes,
  ArrowUpRight,
  ArrowDownRight,
  History,
  Sliders,
  AlertTriangle,
  Printer,
  Search,
  PackageCheck,
} from 'lucide-react';
import { useFactory } from '../../context/FactoryContext';
import { formatCurrency, formatDate, getTodayDateString } from '../../utils/formatters';
import { PrintModal } from '../common/PrintModal';
import { PrintHeader } from '../common/PrintHeader';
import { EmptyState } from '../common/EmptyState';

export const StockModule: React.FC = () => {
  const { products, rawMaterials, packaging, stockLogs, settings, adjustStock } = useFactory();

  const [activeTab, setActiveTab] = useState<'inventory' | 'history'>('inventory');
  const [filterType, setFilterType] = useState<'all' | 'product' | 'raw_material' | 'packaging'>('all');
  const [search, setSearch] = useState('');
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Adjustment Form State
  const [adjType, setAdjType] = useState<'product' | 'raw_material' | 'packaging'>('product');
  const [adjItemId, setAdjItemId] = useState('');
  const [adjQty, setAdjQty] = useState<number>(0);
  const [adjOperation, setAdjOperation] = useState<'add' | 'subtract'>('add');
  const [adjReason, setAdjReason] = useState('');
  const [adjNotes, setAdjNotes] = useState('');

  const handleOpenAdjust = () => {
    setAdjType('product');
    setAdjItemId(products[0]?.id || '');
    setAdjQty(0);
    setAdjOperation('add');
    setAdjReason('Manual Stock Count Adjustment');
    setAdjNotes('');
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjustment = async () => {
    if (!adjItemId) {
      alert('Please select an item to adjust.');
      return;
    }
    if (adjQty <= 0) {
      alert('Please enter a quantity greater than zero.');
      return;
    }

    const change = adjOperation === 'add' ? adjQty : -adjQty;
    await adjustStock(adjType, adjItemId, change, adjReason, adjNotes);
    setIsAdjustModalOpen(false);
  };

  // Compile combined inventory list
  const combinedItems = [
    ...products.map((p) => ({
      id: p.id,
      name: p.name,
      type: 'product' as const,
      typeName: 'Finished Product',
      stock: p.stock,
      unit: p.unit,
      alertLevel: p.alertLevel || 10,
      rate: p.defaultRate,
      code: p.code,
    })),
    ...rawMaterials.map((r) => ({
      id: r.id,
      name: r.name,
      type: 'raw_material' as const,
      typeName: 'Raw Material',
      stock: r.stock,
      unit: r.unit,
      alertLevel: r.alertLevel || 20,
      rate: r.lastPurchaseRate,
      code: r.code,
    })),
    ...packaging.map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      type: 'packaging' as const,
      typeName: 'Packaging',
      stock: pkg.stock,
      unit: pkg.unit,
      alertLevel: pkg.alertLevel || 50,
      rate: pkg.lastPurchaseRate,
      code: pkg.code,
    })),
  ];

  const filteredItems = combinedItems.filter((it) => {
    const matchesType = filterType === 'all' || it.type === filterType;
    const matchesSearch =
      it.name.toLowerCase().includes(search.toLowerCase()) ||
      (it.code && it.code.toLowerCase().includes(search.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const lowStockCount = combinedItems.filter((it) => it.stock <= it.alertLevel).length;

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-indigo-600" />
            Stock &amp; Inventory Management
          </h2>
          <p className="text-xs text-gray-500">
            Real-time finished goods, raw materials, packaging stocks, audit history, and manual adjustments.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-gray-600" />
            Print Stock Sheet
          </button>
          <button
            onClick={handleOpenAdjust}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
            Adjust Stock
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500 block">Total Catalog Items</span>
          <span className="text-xl font-bold text-gray-900 mt-1 block">{combinedItems.length}</span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">Across all categories</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-blue-600 block">Finished Goods</span>
          <span className="text-xl font-bold text-blue-700 mt-1 block">{products.length} Products</span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">
            {products.reduce((s, p) => s + p.stock, 0)} Total Units
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-emerald-600 block">Raw &amp; Packaging</span>
          <span className="text-xl font-bold text-emerald-700 mt-1 block">
            {rawMaterials.length + packaging.length} Items
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">In factory store</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-rose-600 block">Low Stock Alert</span>
          <span className="text-xl font-bold text-rose-700 mt-1 block">{lowStockCount} Items</span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">At or below reorder level</span>
        </div>
      </div>

      {/* Tab Navigation & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white p-3 rounded-xl border border-gray-200">
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1 bg-gray-50 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
              activeTab === 'inventory' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Current Stock ({combinedItems.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'history' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Audit History Log ({stockLogs.length})
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {activeTab === 'inventory' && (
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as unknown as typeof filterType)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none"
            >
              <option value="all">All Item Types</option>
              <option value="product">Finished Products Only</option>
              <option value="raw_material">Raw Materials Only</option>
              <option value="packaging">Packaging Only</option>
            </select>
          )}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'inventory' ? (
        filteredItems.length === 0 ? (
          <EmptyState
            title="No Items Found"
            description="Add products, raw materials, or packaging in their respective modules to track inventory."
            actionText="Adjust or Add Stock"
            onAction={handleOpenAdjust}
            icon={<Boxes className="w-6 h-6 text-indigo-600" />}
          />
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Item Name</th>
                    <th className="py-2.5 px-3">Category / Type</th>
                    <th className="py-2.5 px-3 text-right">Current Stock</th>
                    <th className="py-2.5 px-3">Unit</th>
                    <th className="py-2.5 px-3 text-right">Reorder Alert</th>
                    <th className="py-2.5 px-3 text-right">Rate</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800">
                  {filteredItems.map((item) => {
                    const isLow = item.stock <= item.alertLevel;
                    return (
                      <tr key={`${item.type}_${item.id}`} className="hover:bg-indigo-50/20 transition">
                        <td className="py-2.5 px-3 font-semibold text-gray-900">
                          {item.name}
                          {item.code && <span className="text-gray-400 font-normal ml-1 font-mono">[{item.code}]</span>}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                              item.type === 'product'
                                ? 'bg-blue-100 text-blue-800'
                                : item.type === 'raw_material'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {item.typeName}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-sm font-mono">
                          <span className={isLow ? 'text-rose-600' : 'text-gray-900'}>{item.stock}</span>
                        </td>
                        <td className="py-2.5 px-3 text-gray-500">{item.unit}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-gray-500">{item.alertLevel}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-medium text-gray-700">
                          {formatCurrency(item.rate, settings.currencySymbol)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {isLow ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800">
                              <AlertTriangle className="w-3 h-3" /> Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                              <PackageCheck className="w-3 h-3" /> Adequate
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => {
                              setAdjType(item.type);
                              setAdjItemId(item.id);
                              setAdjQty(0);
                              setIsAdjustModalOpen(true);
                            }}
                            className="px-2 py-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition cursor-pointer"
                          >
                            Adjust
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* STOCK AUDIT HISTORY LOG */
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          {stockLogs.length === 0 ? (
            <EmptyState
              title="No Movement Logs"
              description="Stock movements from sales, purchases, production batches, and adjustments will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-center">Change Qty</th>
                    <th className="py-2.5 px-3 text-right">Resulting Balance</th>
                    <th className="py-2.5 px-3">Reason / Reference</th>
                    <th className="py-2.5 px-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800">
                  {stockLogs.map((log) => {
                    const isPositive = log.changeQty > 0;
                    return (
                      <tr key={log.id} className="hover:bg-gray-50/50 transition">
                        <td className="py-2.5 px-3 text-gray-600 font-mono">{formatDate(log.date)}</td>
                        <td className="py-2.5 px-3 font-semibold text-gray-900">{log.itemName}</td>
                        <td className="py-2.5 px-3">
                          <span className="text-[11px] text-gray-500 capitalize">
                            {log.itemType.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded font-mono font-bold text-xs ${
                              isPositive
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {isPositive ? `+${log.changeQty}` : log.changeQty}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-gray-900">
                          {log.resultingStock}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-gray-700">{log.reason}</td>
                        <td className="py-2.5 px-3 text-gray-500 italic max-w-xs truncate">{log.notes || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MANUAL ADJUSTMENT MODAL */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                Manual Stock Adjustment
              </h3>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Item Category</label>
                <select
                  value={adjType}
                  onChange={(e) => {
                    const newType = e.target.value as typeof adjType;
                    setAdjType(newType);
                    if (newType === 'product') setAdjItemId(products[0]?.id || '');
                    else if (newType === 'raw_material') setAdjItemId(rawMaterials[0]?.id || '');
                    else setAdjItemId(packaging[0]?.id || '');
                  }}
                  className="w-full px-2.5 py-1.5 rounded border border-gray-300 bg-white"
                >
                  <option value="product">Finished Products</option>
                  <option value="raw_material">Raw Materials</option>
                  <option value="packaging">Packaging Items</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Select Item</label>
                <select
                  value={adjItemId}
                  onChange={(e) => setAdjItemId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-gray-300 bg-white font-medium"
                >
                  {adjType === 'product' &&
                    products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Current: {p.stock} {p.unit})
                      </option>
                    ))}
                  {adjType === 'raw_material' &&
                    rawMaterials.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} (Current: {r.stock} {r.unit})
                      </option>
                    ))}
                  {adjType === 'packaging' &&
                    packaging.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} (Current: {pkg.stock} {pkg.unit})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Operation</label>
                  <select
                    value={adjOperation}
                    onChange={(e) => setAdjOperation(e.target.value as 'add' | 'subtract')}
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300 bg-white font-semibold text-gray-800"
                  >
                    <option value="add">+ Stock IN (Increase)</option>
                    <option value="subtract">- Stock OUT (Decrease)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={adjQty === 0 ? '' : adjQty}
                    onChange={(e) => setAdjQty(parseFloat(e.target.value) || 0)}
                    placeholder="Enter qty"
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Reason / Reference</label>
                <input
                  type="text"
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  placeholder="e.g. Physical stock count check, damaged pouch..."
                  className="w-full px-2.5 py-1.5 rounded border border-gray-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Audit Notes (Optional)</label>
                <input
                  type="text"
                  value={adjNotes}
                  onChange={(e) => setAdjNotes(e.target.value)}
                  placeholder="Additional notes"
                  className="w-full px-2.5 py-1.5 rounded border border-gray-300"
                />
              </div>
            </div>

            <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdjustModalOpen(false)}
                className="px-3.5 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAdjustment}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                Confirm Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE STOCK SHEET MODAL */}
      {isPrintModalOpen && (
        <PrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title="Physical Stock Count &amp; Inventory Report"
        >
          <div className="p-4 sm:p-6 text-black bg-white">
            <PrintHeader
              title="FACTORY STOCK VERIFICATION SHEET"
              subtitle="Physical Inventory Verification & Stock Valuation"
              date={getTodayDateString()}
            />

            <table className="w-full text-xs border-collapse border border-black mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black py-1 px-2 text-center w-8">S.#</th>
                  <th className="border border-black py-1 px-2 text-left">ITEM DESCRIPTION</th>
                  <th className="border border-black py-1 px-2 text-left w-24">CATEGORY</th>
                  <th className="border border-black py-1 px-2 text-right w-24">SYSTEM STOCK</th>
                  <th className="border border-black py-1 px-2 text-center w-16">UNIT</th>
                  <th className="border border-black py-1 px-2 text-right w-28">PHYSICAL COUNT</th>
                  <th className="border border-black py-1 px-2 text-right w-24">DIFFERENCE</th>
                </tr>
              </thead>
              <tbody>
                {combinedItems.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-400">
                    <td className="border border-black py-1 px-2 text-center">{idx + 1}</td>
                    <td className="border border-black py-1 px-2 font-medium">{item.name}</td>
                    <td className="border border-black py-1 px-2 text-gray-700">{item.typeName}</td>
                    <td className="border border-black py-1 px-2 text-right font-bold">{item.stock}</td>
                    <td className="border border-black py-1 px-2 text-center">{item.unit}</td>
                    <td className="border border-black py-1 px-2 text-right">___________</td>
                    <td className="border border-black py-1 px-2 text-right">___________</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-8 pt-4 flex justify-between items-end text-xs">
              <div className="text-center w-44 border-t border-black pt-1">
                <p className="font-bold">Store Keeper / Supervisor</p>
              </div>
              <div className="text-center w-44 border-t border-black pt-1">
                <p className="font-bold">Audit Officer</p>
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
