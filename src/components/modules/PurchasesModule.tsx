import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Trash2,
  Printer,
  Search,
  Receipt,
  FileText,
} from 'lucide-react';
import { useFactory } from '../../context/FactoryContext';
import { PurchaseItemRow, PurchaseOrder } from '../../types';
import { formatCurrency, formatDate, getTodayDateString } from '../../utils/formatters';
import { PrintModal } from '../common/PrintModal';
import { PrintHeader } from '../common/PrintHeader';
import { EmptyState } from '../common/EmptyState';

export const PurchasesModule: React.FC = () => {
  const { purchases, suppliers, rawMaterials, packaging, settings, savePurchaseOrder, deletePurchaseOrder } = useFactory();

  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [search, setSearch] = useState('');
  const [selectedPurchaseForPrint, setSelectedPurchaseForPrint] = useState<PurchaseOrder | null>(null);

  // Form State
  const [date, setDate] = useState(getTodayDateString());
  const [invoiceNo, setInvoiceNo] = useState(`PUR-${Date.now().toString().slice(-6)}`);
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [supplierName, setSupplierName] = useState(suppliers[0]?.name || '');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const [items, setItems] = useState<PurchaseItemRow[]>([
    {
      id: '1',
      itemType: 'raw_material',
      itemId: rawMaterials[0]?.id || '',
      itemName: rawMaterials[0]?.name || 'Raw Material',
      quantity: 1,
      unit: rawMaterials[0]?.unit || 'kg',
      rate: rawMaterials[0]?.lastPurchaseRate || 0,
      amount: 0,
    },
  ]);

  const handleSupplierChange = (id: string) => {
    setSupplierId(id);
    const sup = suppliers.find((s) => s.id === id);
    if (sup) {
      setSupplierName(sup.name);
    }
  };

  const handleItemTypeChange = (index: number, newType: 'raw_material' | 'packaging') => {
    setItems((prev) => {
      const copy = [...prev];
      if (newType === 'raw_material') {
        const mat = rawMaterials[0];
        copy[index] = {
          ...copy[index],
          itemType: 'raw_material',
          itemId: mat?.id || '',
          itemName: mat?.name || 'Raw Material',
          unit: mat?.unit || 'kg',
          rate: mat?.lastPurchaseRate || 0,
          amount: (copy[index].quantity || 1) * (mat?.lastPurchaseRate || 0),
        };
      } else {
        const pkg = packaging[0];
        copy[index] = {
          ...copy[index],
          itemType: 'packaging',
          itemId: pkg?.id || '',
          itemName: pkg?.name || 'Packaging Item',
          unit: pkg?.unit || 'pcs',
          rate: pkg?.lastPurchaseRate || 0,
          amount: (copy[index].quantity || 1) * (pkg?.lastPurchaseRate || 0),
        };
      }
      return copy;
    });
  };

  const handleItemSelect = (index: number, itemId: string) => {
    setItems((prev) => {
      const copy = [...prev];
      const current = copy[index];
      if (current.itemType === 'raw_material') {
        const mat = rawMaterials.find((m) => m.id === itemId);
        if (mat) {
          copy[index] = {
            ...current,
            itemId: mat.id,
            itemName: mat.name,
            unit: mat.unit,
            rate: mat.lastPurchaseRate,
            amount: (current.quantity || 1) * mat.lastPurchaseRate,
          };
        }
      } else {
        const pkg = packaging.find((p) => p.id === itemId);
        if (pkg) {
          copy[index] = {
            ...current,
            itemId: pkg.id,
            itemName: pkg.name,
            unit: pkg.unit,
            rate: pkg.lastPurchaseRate,
            amount: (current.quantity || 1) * pkg.lastPurchaseRate,
          };
        }
      }
      return copy;
    });
  };

  const handleRowChange = (index: number, field: 'quantity' | 'rate' | 'itemName' | 'unit', val: unknown) => {
    setItems((prev) => {
      const copy = [...prev];
      const row = { ...copy[index], [field]: val };
      if (field === 'quantity' || field === 'rate') {
        const q = field === 'quantity' ? Number(val) : row.quantity;
        const r = field === 'rate' ? Number(val) : row.rate;
        row.amount = (q || 0) * (r || 0);
      }
      copy[index] = row;
      return copy;
    });
  };

  const handleAddRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        itemType: 'raw_material',
        itemId: rawMaterials[0]?.id || '',
        itemName: rawMaterials[0]?.name || 'Raw Material',
        quantity: 1,
        unit: rawMaterials[0]?.unit || 'kg',
        rate: rawMaterials[0]?.lastPurchaseRate || 0,
        amount: 0,
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((acc, row) => acc + (row.amount || 0), 0);
  const dueAmount = Math.max(0, totalAmount - (paidAmount || 0));

  const handleSavePurchase = async () => {
    if (!supplierName.trim()) {
      alert('Please enter or select a supplier.');
      return;
    }
    if (items.length === 0 || totalAmount <= 0) {
      alert('Please add valid purchase item rows.');
      return;
    }

    const mappedItems = items.map((it) => ({
      ...it,
      qty: Number(it.quantity || (it as any).qty || 1),
      quantity: Number(it.quantity || (it as any).qty || 1),
    }));

    const newPurchase: Omit<PurchaseOrder, 'id'> = {
      date,
      invoiceNo,
      supplierId: supplierId || undefined,
      supplierName,
      items: mappedItems,
      totalAmount,
      paidAmount,
      dueAmount,
      notes,
    };

    await savePurchaseOrder(newPurchase);

    // Reset form
    setDate(getTodayDateString());
    setInvoiceNo(`PUR-${Date.now().toString().slice(-6)}`);
    setPaidAmount(0);
    setNotes('');
    setItems([
      {
        id: '1',
        itemType: 'raw_material',
        itemId: rawMaterials[0]?.id || '',
        itemName: rawMaterials[0]?.name || 'Raw Material',
        quantity: 1,
        unit: rawMaterials[0]?.unit || 'kg',
        rate: rawMaterials[0]?.lastPurchaseRate || 0,
        amount: 0,
      },
    ]);
    setActiveTab('list');
  };

  const filtered = purchases.filter((p) => {
    return (
      p.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      p.supplierName.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            Purchases &amp; Receiving Register
          </h2>
          <p className="text-xs text-gray-500">
            Record raw material &amp; packaging purchases. Automatically increases stock &amp; updates supplier balance.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab(activeTab === 'list' ? 'create' : 'list')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer ${
              activeTab === 'create'
                ? 'bg-gray-800 hover:bg-gray-900 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {activeTab === 'create' ? <FileText className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {activeTab === 'create' ? 'View Purchase Invoices' : '+ New Purchase Bill'}
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        /* CREATE PURCHASE BILL FORM */
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-4 sm:p-5 space-y-4">
          <div className="border-b border-gray-200 pb-3 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              New Purchase Entry / Goods Receiving Voucher
            </h3>
            <span className="text-xs text-gray-500">Auto-adds inventory &amp; updates ledger</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
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
              <label className="block font-semibold text-gray-700 mb-1">Supplier Bill / Invoice #</label>
              <input
                type="text"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-gray-300 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Supplier / Vendor</label>
              <div className="flex gap-2">
                <select
                  value={supplierId}
                  onChange={(e) => handleSupplierChange(e.target.value)}
                  className="w-1/2 px-2 py-1.5 rounded border border-gray-300 bg-white"
                >
                  <option value="">Custom Vendor</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Supplier name"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-1/2 px-2.5 py-1.5 rounded border border-gray-300 font-medium"
                />
              </div>
            </div>
          </div>

          {/* ITEM ROWS */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex justify-between items-center">
              <span className="font-bold text-xs text-gray-700 uppercase tracking-wide">
                Items Purchased (Raw Materials &amp; Packaging)
              </span>
              <button
                type="button"
                onClick={handleAddRow}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Row
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100 text-gray-600 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="py-2 px-2 w-10 text-center">#</th>
                    <th className="py-2 px-2 w-36">Category</th>
                    <th className="py-2 px-2">Item Description</th>
                    <th className="py-2 px-2 w-24 text-right">Quantity</th>
                    <th className="py-2 px-2 w-20 text-center">Unit</th>
                    <th className="py-2 px-2 w-28 text-right">Rate ({settings.currencySymbol})</th>
                    <th className="py-2 px-2 w-28 text-right">Total Amount</th>
                    <th className="py-2 px-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((row, idx) => (
                    <tr key={row.id}>
                      <td className="py-2 px-2 text-center text-gray-400 font-mono">{idx + 1}</td>
                      <td className="py-2 px-2">
                        <select
                          value={row.itemType}
                          onChange={(e) =>
                            handleItemTypeChange(idx, e.target.value as 'raw_material' | 'packaging')
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
                            onChange={(e) => handleItemSelect(idx, e.target.value)}
                            className="w-1/2 px-2 py-1 rounded border border-gray-300 bg-white"
                          >
                            <option value="">Custom Item</option>
                            {row.itemType === 'raw_material'
                              ? rawMaterials.map((r) => (
                                  <option key={r.id} value={r.id}>
                                    {r.name}
                                  </option>
                                ))
                              : packaging.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name}
                                  </option>
                                ))}
                          </select>
                          <input
                            type="text"
                            value={row.itemName}
                            onChange={(e) => handleRowChange(idx, 'itemName', e.target.value)}
                            placeholder="Item description"
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
                          onChange={(e) => handleRowChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 rounded border border-gray-300 text-right font-mono font-bold"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <input
                          type="text"
                          value={row.unit}
                          onChange={(e) => handleRowChange(idx, 'unit', e.target.value)}
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
                          value={row.rate === 0 ? '' : row.rate}
                          onChange={(e) => handleRowChange(idx, 'rate', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 rounded border border-gray-300 text-right font-mono"
                        />
                      </td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-gray-900">
                        {formatCurrency(row.amount, settings.currencySymbol)}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(idx)}
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

          {/* TOTALS & PAYMENT */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            <div className="w-full sm:w-1/2">
              <label className="block font-semibold text-xs text-gray-700 mb-1">Notes / Receiving Vehicle / Remarks</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Bilty number, driver name, vehicle registration, batch remarks..."
                className="w-full px-2.5 py-1.5 rounded border border-gray-300 text-xs"
              />
            </div>

            <div className="w-full sm:w-72 bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-2 text-xs">
              <div className="flex justify-between items-center text-sm font-bold text-gray-900 border-b border-gray-200 pb-1.5">
                <span>Total Bill Amount:</span>
                <span className="font-mono">{formatCurrency(totalAmount, settings.currencySymbol)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Cash / Paid Now:</span>
                <div className="flex items-center gap-1 w-32">
                  <span className="text-gray-500">{settings.currencySymbol}</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={paidAmount === 0 ? '' : paidAmount}
                    onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-2 py-1 rounded border border-gray-300 bg-white text-right font-mono font-bold"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center text-xs font-bold pt-1 border-t border-gray-200 text-rose-700">
                <span>Payable Balance (Due):</span>
                <span className="font-mono">{formatCurrency(dueAmount, settings.currencySymbol)}</span>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSavePurchase}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs transition cursor-pointer"
                >
                  Save &amp; Update Inventory
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* PURCHASE INVOICES LIST */
        <div className="space-y-3">
          <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-200">
            <div className="text-xs text-gray-600 font-medium">
              Total Invoices: <span className="font-bold text-gray-900">{purchases.length}</span>
            </div>
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by invoice #, supplier..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title="No Purchase Invoices Found"
              description="Record goods received from your raw material or packaging suppliers."
              actionText="Create First Purchase Bill"
              onAction={() => setActiveTab('create')}
              icon={<ShoppingBag className="w-6 h-6 text-emerald-600" />}
            />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Invoice #</th>
                      <th className="py-2.5 px-3">Supplier Name</th>
                      <th className="py-2.5 px-3 text-center">Items</th>
                      <th className="py-2.5 px-3 text-right">Total Amount</th>
                      <th className="py-2.5 px-3 text-right">Paid</th>
                      <th className="py-2.5 px-3 text-right">Payable Due</th>
                      <th className="py-2.5 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-800">
                    {filtered.map((p) => (
                      <tr key={p.id} className="hover:bg-emerald-50/20 transition">
                        <td className="py-2.5 px-3 font-mono text-gray-600">{formatDate(p.date)}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-gray-900">{p.invoiceNo}</td>
                        <td className="py-2.5 px-3 font-medium text-gray-800">{p.supplierName}</td>
                        <td className="py-2.5 px-3 text-center text-gray-500">{p.items.length}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900">
                          {formatCurrency(p.totalAmount, settings.currencySymbol)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-medium text-emerald-700">
                          {formatCurrency(p.paidAmount, settings.currencySymbol)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700">
                          {formatCurrency(p.dueAmount, settings.currencySymbol)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedPurchaseForPrint(p)}
                              className="px-2 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition cursor-pointer flex items-center gap-1"
                            >
                              <Printer className="w-3 h-3" /> Bill
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete purchase bill "${p.invoiceNo}"? Note: Inventory will not be automatically reversed.`)) {
                                  deletePurchaseOrder(p.id);
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

      {/* PRINTABLE PURCHASE BILL */}
      {selectedPurchaseForPrint && (
        <PrintModal
          isOpen={!!selectedPurchaseForPrint}
          onClose={() => setSelectedPurchaseForPrint(null)}
          title={`Purchase Bill #${selectedPurchaseForPrint.invoiceNo}`}
        >
          <div className="p-4 sm:p-6 text-black bg-white">
            <PrintHeader
              title="GOODS RECEIPT / PURCHASE VOUCHER"
              subtitle={`Supplier Bill Reference: #${selectedPurchaseForPrint.invoiceNo}`}
              date={selectedPurchaseForPrint.date}
            />

            <div className="border border-black p-2 mb-4 bg-gray-50 text-xs">
              <div className="flex justify-between">
                <div>
                  <p><span className="font-bold">Supplier:</span> {selectedPurchaseForPrint.supplierName}</p>
                </div>
                <div className="text-right">
                  <p><span className="font-bold">Voucher No:</span> {selectedPurchaseForPrint.invoiceNo}</p>
                  <p><span className="font-bold">Date:</span> {formatDate(selectedPurchaseForPrint.date)}</p>
                </div>
              </div>
            </div>

            <table className="w-full text-xs border-collapse border border-black mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black py-1 px-2 text-center w-10">S.#</th>
                  <th className="border border-black py-1 px-2 text-left">ITEM DESCRIPTION</th>
                  <th className="border border-black py-1 px-2 text-left w-28">TYPE</th>
                  <th className="border border-black py-1 px-2 text-right w-24">QTY</th>
                  <th className="border border-black py-1 px-2 text-center w-16">UNIT</th>
                  <th className="border border-black py-1 px-2 text-right w-24">RATE</th>
                  <th className="border border-black py-1 px-2 text-right w-28">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {selectedPurchaseForPrint.items.map((it, idx) => (
                  <tr key={idx} className="border-b border-gray-300">
                    <td className="border border-black py-1 px-2 text-center">{idx + 1}</td>
                    <td className="border border-black py-1 px-2 font-bold">{it.itemName}</td>
                    <td className="border border-black py-1 px-2 capitalize">{it.itemType.replace('_', ' ')}</td>
                    <td className="border border-black py-1 px-2 text-right font-bold">{it.quantity}</td>
                    <td className="border border-black py-1 px-2 text-center">{it.unit}</td>
                    <td className="border border-black py-1 px-2 text-right font-mono">
                      {formatCurrency(it.rate, settings.currencySymbol)}
                    </td>
                    <td className="border border-black py-1 px-2 text-right font-mono font-bold">
                      {formatCurrency(it.amount, settings.currencySymbol)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold bg-gray-50 border-t-2 border-black">
                  <td colSpan={6} className="border border-black py-1 px-2 text-right">TOTAL INVOICE:</td>
                  <td className="border border-black py-1 px-2 text-right font-mono">
                    {formatCurrency(selectedPurchaseForPrint.totalAmount, settings.currencySymbol)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={6} className="border border-black py-1 px-2 text-right font-bold">PAID AMOUNT:</td>
                  <td className="border border-black py-1 px-2 text-right font-mono font-bold text-emerald-800">
                    {formatCurrency(selectedPurchaseForPrint.paidAmount, settings.currencySymbol)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={6} className="border border-black py-1 px-2 text-right font-bold">BALANCE DUE:</td>
                  <td className="border border-black py-1 px-2 text-right font-mono font-bold text-rose-800">
                    {formatCurrency(selectedPurchaseForPrint.dueAmount, settings.currencySymbol)}
                  </td>
                </tr>
              </tfoot>
            </table>

            {selectedPurchaseForPrint.notes && (
              <p className="text-xs mb-4 italic">Remarks: {selectedPurchaseForPrint.notes}</p>
            )}

            <div className="mt-8 pt-4 flex justify-between items-end text-xs">
              <div className="text-center w-44 border-t border-black pt-1">
                <p className="font-bold">Store Receiver Signature</p>
              </div>
              <div className="text-center w-44 border-t border-black pt-1">
                <p className="font-bold">Vendor / Driver Signature</p>
              </div>
              <div className="text-center w-44 border-t border-black pt-1">
                <p className="font-bold">Authorized Signatory</p>
              </div>
            </div>
          </div>
        </PrintModal>
      )}
    </div>
  );
};
