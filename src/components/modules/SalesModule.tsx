import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Minus,
  Trash2,
  Printer,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  Layers,
  Sparkles,
  Save,
  RotateCcw,
  Package,
  Check,
} from 'lucide-react';
import { useFactory } from '../../context/FactoryContext';
import { SaleOrder, SaleOrderItem } from '../../types';
import { formatCurrency, formatDate, getTodayDateString } from '../../utils/formatters';
import { PrintModal } from '../common/PrintModal';
import { PrintHeader } from '../common/PrintHeader';
import { EmptyState } from '../common/EmptyState';

export const SalesModule: React.FC = () => {
  const { sales, customers, products, settings, saveSaleOrder, deleteSaleOrder, saveProduct, seedRaviCatalog } = useFactory();

  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<SaleOrder | null>(null);
  const [printLayout, setPrintLayout] = useState<'greenPad' | 'formalA4'>('greenPad');
  const [spareToast, setSpareToast] = useState<string | null>(null);

  // Quick New Product Modal
  const [isQuickProductModalOpen, setIsQuickProductModalOpen] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickVariant, setQuickVariant] = useState('Rs 10 والی');
  const [quickRate, setQuickRate] = useState<number>(10);
  const [quickUnit, setQuickUnit] = useState('packet');

  // Form State for Order
  const [editingId, setEditingId] = useState<string | null>(null);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [orderDate, setOrderDate] = useState(getTodayDateString());
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerArea, setCustomerArea] = useState('');
  const [items, setItems] = useState<SaleOrderItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'Bank' | 'Credit' | 'Partial'>('Cash');
  const [notes, setNotes] = useState('');
  const [signatureText, setSignatureText] = useState('');
  // View mode for order entry: 'grid' (Asan 4-product 10,20,50 pad) or 'table' (paper sheet table)
  const [orderViewMode, setOrderViewMode] = useState<'grid' | 'table'>('grid');

  // Step quantity easily for a layperson (+1, -1, +5)
  const handleStepQty = (index: number, delta: number) => {
    setItems((prev) => {
      const copy = [...prev];
      if (!copy[index]) return prev;
      const current = copy[index].qty || 0;
      const next = Math.max(0, current + delta);
      copy[index] = {
        ...copy[index],
        qty: next,
        amount: next * (copy[index].rate || 0),
      };
      return copy;
    });
  };

  // Generates Ravi Nimko pad with 13 official pack variants + extra catalog products + 2 spare rows
  const getStandardRaviNimkoPadItems = (): SaleOrderItem[] => {
    const padItems: SaleOrderItem[] = [];
    const timestamp = Date.now();

    // Standard 4 core Ravi Nimko items with their authentic pack variants
    const standardSpecs = [
      { name: 'راوی مکس نمکو', variants: [{ name: 'Rs 10 والی', rate: 10 }, { name: 'Rs 20 والی', rate: 20 }, { name: 'Rs 50 والی', rate: 50 }, { name: 'Rs 100 والی', rate: 100 }] },
      { name: 'دال موٹھ', variants: [{ name: 'Rs 10 والی', rate: 10 }, { name: 'Rs 20 والی', rate: 20 }, { name: 'Rs 50 والی', rate: 50 }, { name: 'Rs 100 والی', rate: 100 }] },
      { name: 'دال چنا', variants: [{ name: 'Rs 10 والی', rate: 10 }, { name: 'Rs 20 والی', rate: 20 }, { name: 'Rs 50 والی', rate: 50 }] },
      { name: 'پی نٹ', variants: [{ name: 'Rs 10 والی', rate: 10 }, { name: 'Rs 20 والی', rate: 20 }, { name: 'Rs 50 والی', rate: 50 }] },
    ];

    standardSpecs.forEach((spec, sIdx) => {
      const dbProd = products.find((p) => p.name.trim() === spec.name.trim());
      spec.variants.forEach((v, vIdx) => {
        padItems.push({
          id: `item_rn_${sIdx}_${vIdx}_${timestamp}`,
          productId: dbProd?.id,
          productName: spec.name,
          variantName: v.name,
          qty: 0,
          unit: dbProd?.unit || 'packet',
          rate: v.rate,
          amount: 0,
        });
      });
    });

    // Also include any other custom products that the user has added to their catalog!
    const standardNames = standardSpecs.map((s) => s.name.trim());
    const additionalProds = products.filter((p) => !standardNames.includes(p.name.trim()));
    additionalProds.forEach((p, pIdx) => {
      if (p.packVariants && p.packVariants.length > 0) {
        p.packVariants.forEach((v, vIdx) => {
          padItems.push({
            id: `item_custom_${pIdx}_${vIdx}_${timestamp}`,
            productId: p.id,
            productName: p.name,
            variantName: v.name,
            qty: 0,
            unit: p.unit || 'packet',
            rate: v.rate,
            amount: 0,
          });
        });
      } else {
        padItems.push({
          id: `item_custom_${pIdx}_${timestamp}`,
          productId: p.id,
          productName: p.name,
          variantName: '',
          qty: 0,
          unit: p.unit || 'packet',
          rate: p.defaultRate || 0,
          amount: 0,
        });
      }
    });

    // Append 2 pre-formatted Spare Option rows directly on the paper pad
    padItems.push({
      id: `spare_1_${timestamp}`,
      productName: '',
      variantName: 'اسپیئر / Spare 1',
      qty: 0,
      unit: 'packet',
      rate: 0,
      amount: 0,
    });
    padItems.push({
      id: `spare_2_${timestamp}`,
      productName: '',
      variantName: 'اسپیئر / Spare 2',
      qty: 0,
      unit: 'packet',
      rate: 0,
      amount: 0,
    });

    return padItems;
  };

  // Open editor for new order with pre-loaded Ravi Nimko pad
  const handleOpenNewOrder = () => {
    const nextNum = (sales.length + 1).toString().padStart(4, '0');
    setEditingId(null);
    setInvoiceNo(`${settings.orderInvoicePrefix || 'ORD-'}${nextNum}`);
    setOrderDate(getTodayDateString());
    setCustomerId('');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerArea('');
    setItems(getStandardRaviNimkoPadItems());
    setDiscount(0);
    setPaidAmount(0);
    setPaymentMode('Cash');
    setNotes('');
    setSignatureText(settings.orderSignatoryName || 'Authorized Signature');
    setIsEditorOpen(true);
  };

  // Open editor for existing order
  const handleEditOrder = (order: SaleOrder) => {
    setEditingId(order.id);
    setInvoiceNo(order.invoiceNo);
    setOrderDate(order.date);
    setCustomerId(order.customerId);
    setCustomerName(order.customerName);
    setCustomerPhone(order.customerPhone || '');
    setCustomerArea(order.customerArea || '');
    setItems(order.items.length > 0 ? [...order.items] : [{ id: '1', productName: '', qty: 1, unit: 'packet', rate: 0, amount: 0 }]);
    setDiscount(order.discount || 0);
    setPaidAmount(order.paidAmount || 0);
    setPaymentMode(order.paymentMode);
    setNotes(order.notes || '');
    setSignatureText(order.signatureText || '');
    setIsEditorOpen(true);
  };

  // Reset current order sheet to standard Ravi Nimko Pad
  const handleResetToStandardPad = () => {
    if (confirm('Load fresh Ravi Nimko order sheet (13 standard variants + spare rows)? Existing entered quantities in this form will be reset.')) {
      setItems(getStandardRaviNimkoPadItems());
    }
  };

  // Clear all quantities in the sheet
  const handleClearQuantities = () => {
    setItems((prev) =>
      prev.map((it) => ({
        ...it,
        qty: 0,
        amount: 0,
      }))
    );
  };

  // Fast load preset registered products into sheet
  const handlePopulateRegisteredProducts = () => {
    setItems(getStandardRaviNimkoPadItems());
  };

  // Add a brand new spare option row
  const handleAddSpareRow = () => {
    const spareIndex = items.filter((it) => it.variantName?.includes('Spare') || it.variantName?.includes('اسپیئر')).length + 1;
    setItems((prev) => [
      ...prev,
      {
        id: `spare_${Date.now()}_${spareIndex}`,
        productName: '',
        variantName: `اسپیئر / Spare ${spareIndex}`,
        qty: 0,
        unit: 'packet',
        rate: 0,
        amount: 0,
      },
    ]);
  };

  // Row manipulation
  const handleAddItemRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item_${Date.now()}_${prev.length + 1}`,
        productName: '',
        variantName: '',
        qty: 0,
        unit: settings.customUnits[0] || 'packet',
        rate: 0,
        amount: 0,
      },
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length <= 1) {
      setItems([{ id: '1', productName: '', qty: 0, unit: 'packet', rate: 0, amount: 0 }]);
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof SaleOrderItem, value: unknown) => {
    setItems((prev) => {
      const copy = [...prev];
      const row = { ...copy[index], [field]: value };

      // Auto update amount if qty or rate changes
      if (field === 'qty' || field === 'rate') {
        const q = field === 'qty' ? Number(value) : row.qty;
        const r = field === 'rate' ? Number(value) : row.rate;
        row.amount = (q || 0) * (r || 0);
      }

      copy[index] = row;
      return copy;
    });
  };

  const handleSelectProduct = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    setItems((prev) => {
      const copy = [...prev];
      const row = { ...copy[index] };
      row.productId = prod.id;
      row.productName = prod.name;
      row.unit = prod.unit || 'packet';
      row.rate = prod.defaultRate || 0;
      row.amount = (row.qty || 0) * (row.rate || 0);
      copy[index] = row;
      return copy;
    });
  };

  // Convert and save a spare row directly to permanent Product Catalog
  const handleSaveSpareToCatalog = async (index: number) => {
    const row = items[index];
    if (!row.productName.trim()) {
      alert('Please enter a product name first before saving to catalog.');
      return;
    }

    const newProd = await saveProduct({
      code: `SPR-${(products.length + 1).toString().padStart(3, '0')}`,
      name: row.productName.trim(),
      category: 'Spare / Snacks',
      unit: row.unit || 'packet',
      defaultRate: row.rate || 0,
      stock: 100,
      alertLevel: 20,
      packVariants: [
        {
          id: Date.now().toString(),
          name: row.variantName || 'Standard Pack',
          rate: row.rate || 0,
        },
      ],
      notes: 'Added from Sales Order Pad as spare product',
    });

    // Link row to newly created product
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], productId: newProd.id };
      return copy;
    });

    setSpareToast(`"${row.productName}" added permanently to Product Catalog!`);
    setTimeout(() => setSpareToast(null), 3500);
  };

  // Quick save future product modal
  const handleQuickAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) {
      alert('Product name is required.');
      return;
    }

    const newProd = await saveProduct({
      code: `RN-${(products.length + 1).toString().padStart(3, '0')}`,
      name: quickName.trim(),
      category: 'Nimko / Snacks',
      unit: quickUnit,
      defaultRate: quickRate,
      stock: 100,
      alertLevel: 20,
      packVariants: [
        {
          id: '1',
          name: quickVariant.trim() || 'Rs 10 والی',
          rate: quickRate,
        },
      ],
      notes: 'Added via Sales Order Quick Add',
    });

    // Also append it as a row in the current order sheet
    setItems((prev) => [
      ...prev,
      {
        id: `item_new_${Date.now()}`,
        productId: newProd.id,
        productName: newProd.name,
        variantName: quickVariant,
        qty: 1,
        unit: quickUnit,
        rate: quickRate,
        amount: quickRate,
      },
    ]);

    setQuickName('');
    setIsQuickProductModalOpen(false);
    setSpareToast(`New product "${newProd.name}" added to Catalog and Order Sheet!`);
    setTimeout(() => setSpareToast(null), 3500);
  };

  const handleSelectCustomer = (cId: string) => {
    setCustomerId(cId);
    const c = customers.find((cust) => cust.id === cId);
    if (c) {
      setCustomerName(c.name);
      setCustomerPhone(c.phone || '');
      setCustomerArea(c.cityOrArea || c.shopName || '');
    }
  };

  // Calculations
  // Only include items where qty > 0 and productName is not empty for actual totals
  const subTotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalAmount = Math.max(0, subTotal - (Number(discount) || 0));
  const dueAmount = Math.max(0, totalAmount - (Number(paidAmount) || 0));

  const handleSaveOrder = async (andPrint: boolean = false) => {
    if (!customerName.trim()) {
      alert('Please enter or select a customer name.');
      return;
    }

    const validItems = items.filter((it) => it.productName.trim() !== '' && (it.qty > 0 || it.amount > 0));
    if (validItems.length === 0) {
      alert('Please add at least one product with quantity and rate.');
      return;
    }

    let status: 'Paid' | 'Due' | 'Partial' = 'Due';
    if (dueAmount === 0 && totalAmount > 0) {
      status = 'Paid';
    } else if (paidAmount > 0 && dueAmount > 0) {
      status = 'Partial';
    }

    const saved = await saveSaleOrder({
      id: editingId || undefined,
      invoiceNo: invoiceNo || `ORD-${Date.now().toString().slice(-4)}`,
      date: orderDate,
      customerId,
      customerName,
      customerPhone,
      customerArea,
      items: validItems,
      subTotal,
      discount,
      totalAmount,
      paidAmount,
      dueAmount,
      paymentMode,
      paymentStatus: status,
      notes,
      signatureText: signatureText || settings.orderSignatoryName,
    });

    setIsEditorOpen(false);

    if (andPrint) {
      setSelectedOrderForPrint(saved);
    }
  };

  // Filter sales
  const filteredSales = sales.filter((s) => {
    const matchesSearch =
      s.customerName.toLowerCase().includes(search.toLowerCase()) ||
      s.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      (s.customerArea && s.customerArea.toLowerCase().includes(search.toLowerCase()));
    const matchesDate = !dateFilter || s.date === dateFilter;
    return matchesSearch && matchesDate;
  });

  const totalSalesRevenue = sales.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalReceived = sales.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalDue = sales.reduce((acc, curr) => acc + curr.dueAmount, 0);

  return (
    <div className="space-y-5">
      {/* Module Header & Summary Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Sales &amp; Orders (Paper Order Sheet Reference)
          </h2>
          <p className="text-xs text-gray-500">
            Rapid paper-sheet style order booking, custom variants (Rs10/Rs20/Rs50/Rs100), invoice printing &amp; receivables.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <button
            onClick={() => {
              setOrderViewMode('grid');
              handleOpenNewOrder();
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition cursor-pointer ring-2 ring-emerald-300"
          >
            <Sparkles className="w-4 h-4" />
            ⚡ آسان آرڈر (10، 20، 50 پیڈ)
          </button>
          <button
            onClick={() => {
              setOrderViewMode('table');
              handleOpenNewOrder();
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg shadow-2xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            پرچہ بل شیٹ
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500 block">Total Sales</span>
          <span className="text-xl font-bold text-gray-900 mt-1 block">
            {formatCurrency(totalSalesRevenue, settings.currencySymbol)}
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">{sales.length} Orders Recorded</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-emerald-600 block">Total Received</span>
          <span className="text-xl font-bold text-emerald-700 mt-1 block">
            {formatCurrency(totalReceived, settings.currencySymbol)}
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">Cash / Bank Inflows</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-amber-600 block">Outstanding Due</span>
          <span className="text-xl font-bold text-amber-700 mt-1 block">
            {formatCurrency(totalDue, settings.currencySymbol)}
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">Customer Receivables</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-xl border border-gray-200">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search customer, invoice, area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-xs text-blue-600 hover:underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Sales Records List */}
      {filteredSales.length === 0 ? (
        <EmptyState
          title="No Sales Orders Found"
          description="Start recording orders using the Ravi Nimko paper order sheet layout. Add custom products, packs, and pricing."
          actionText="Create First Order Sheet"
          onAction={handleOpenNewOrder}
          icon={<FileText className="w-6 h-6" />}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Order / Inv #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Items &amp; Packs</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                  <th className="py-2.5 px-3 text-right">Paid</th>
                  <th className="py-2.5 px-3 text-right">Due</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {filteredSales.map((order) => (
                  <tr key={order.id} className="hover:bg-blue-50/30 transition">
                    <td className="py-2.5 px-3 font-mono font-semibold text-blue-600">
                      {order.invoiceNo}
                    </td>
                    <td className="py-2.5 px-3 text-gray-600">{formatDate(order.date)}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold block text-gray-900">{order.customerName}</span>
                      {order.customerArea && (
                        <span className="text-[11px] text-gray-500 block">{order.customerArea}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 max-w-xs truncate text-gray-600">
                      {order.items.map((it) => `${it.productName}${it.variantName ? ` (${it.variantName})` : ''} x ${it.qty}`).join(', ')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-gray-900">
                      {formatCurrency(order.totalAmount, settings.currencySymbol)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-700 font-medium">
                      {formatCurrency(order.paidAmount, settings.currencySymbol)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-amber-700 font-medium">
                      {formatCurrency(order.dueAmount, settings.currencySymbol)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {order.paymentStatus === 'Paid' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3 h-3" /> Paid
                        </span>
                      )}
                      {order.paymentStatus === 'Partial' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3" /> Partial
                        </span>
                      )}
                      {order.paymentStatus === 'Due' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800">
                          <AlertCircle className="w-3 h-3" /> Due
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedOrderForPrint(order)}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition cursor-pointer"
                          title="Print Ravi Nimko Order Sheet"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditOrder(order)}
                          className="px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-100 rounded-md border border-gray-200 transition cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete Order #${order.invoiceNo}?`)) {
                              deleteSaleOrder(order.id);
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

      {/* PAPER ORDER SHEET MODAL / EDITOR */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col border border-gray-200 my-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50 rounded-t-xl gap-2">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Ravi Nimko Official Paper Order Pad
                </span>
                <h3 className="text-base font-bold text-gray-900">
                  {editingId ? 'Edit Order Sheet' : 'New Order Sheet / سبز پرچہ بل'}
                </h3>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* 1-Click View Switcher */}
                <div className="flex bg-gray-200/90 p-0.5 rounded-lg border border-gray-300">
                  <button
                    type="button"
                    onClick={() => setOrderViewMode('grid')}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                      orderViewMode === 'grid'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                    title="Switch to simple 4-Product 10, 20, 50 card pad"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    ⚡ آسان پیڈ (10، 20، 50)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderViewMode('table')}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                      orderViewMode === 'table'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-gray-700 hover:text-gray-900'
                    }`}
                    title="Switch to detailed paper sheet table"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    📋 پرچہ ٹیبل
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleResetToStandardPad}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg cursor-pointer"
                  title="Reload 13 Ravi Nimko standard packs + spare rows"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                  Standard Pad
                </button>
                <button
                  type="button"
                  onClick={handleAddSpareRow}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-300 rounded-lg cursor-pointer"
                  title="Add empty spare option row"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  + Spare Option
                </button>
                <button
                  type="button"
                  onClick={() => setIsQuickProductModalOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-lg cursor-pointer"
                  title="Add brand new product directly into database"
                >
                  <Package className="w-3.5 h-3.5 text-blue-600" />
                  + New Product
                </button>
                <button
                  type="button"
                  onClick={handleClearQuantities}
                  className="px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-300 rounded-lg cursor-pointer"
                  title="Reset all quantities to 0"
                >
                  Clear Qty
                </button>
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg cursor-pointer ml-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Notification Toast */}
            {spareToast && (
              <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-2 text-xs font-medium text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                {spareToast}
              </div>
            )}

            {/* Order Sheet Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
              {/* Paper Order Sheet Top Meta Box */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-gray-50/70 p-3.5 rounded-lg border border-gray-200">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Invoice / Order No.</label>
                  <input
                    type="text"
                    value={invoiceNo}
                    onChange={(e) => setInvoiceNo(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300 font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Customer Name / Shop</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Type customer name or select..."
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                    />
                    {customers.length > 0 && (
                      <select
                        onChange={(e) => handleSelectCustomer(e.target.value)}
                        value={customerId}
                        className="px-2 py-1.5 rounded border border-gray-300 text-gray-600 bg-white"
                      >
                        <option value="">Quick Select</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} {c.shopName ? `(${c.shopName})` : ''}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Customer Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. 0300-1234567"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Market / City / Area</label>
                  <input
                    type="text"
                    placeholder="e.g. Wholesale Market / Lahore"
                    value={customerArea}
                    onChange={(e) => setCustomerArea(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as 'Cash' | 'Bank' | 'Credit' | 'Partial')}
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank">Bank Transfer</option>
                    <option value="Credit">Credit / Due</option>
                    <option value="Partial">Partial Cash</option>
                  </select>
                </div>
              </div>

              {/* View 1: ASAN 4-PRODUCT GRID (10, 20, 50 CATEGORIES) */}
              {orderViewMode === 'grid' && (
                <div className="space-y-3">
                  <div className="bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        آسان پیڈ
                      </span>
                      <span className="text-xs font-bold text-emerald-950">
                        چار ورائٹیز و 10، 20، 50 کیٹیگریز - صرف تعداد لکھیں یا [+] / [-] دبائیں:
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={handleClearQuantities}
                        className="text-gray-600 hover:text-gray-900 bg-white px-2 py-1 rounded border border-gray-300 text-[11px] font-medium"
                      >
                        Clear Qty
                      </button>
                      <button
                        type="button"
                        onClick={handleAddSpareRow}
                        className="text-purple-700 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded border border-purple-300 text-[11px] font-bold flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" /> + اسپیئر
                      </button>
                    </div>
                  </div>

                  {/* Core & Custom Variant Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {(() => {
                      const coreList = [
                        {
                          name: 'راوی مکس نمکو',
                          roman: 'Ravi Mix Special',
                          headerTheme: 'bg-amber-600 text-white',
                          cardBorder: 'border-amber-300 ring-1 ring-amber-200',
                          icon: '🥣',
                        },
                        {
                          name: 'دال موٹھ',
                          roman: 'Special Dal Moth',
                          headerTheme: 'bg-emerald-600 text-white',
                          cardBorder: 'border-emerald-300 ring-1 ring-emerald-200',
                          icon: '🥣',
                        },
                        {
                          name: 'دال چنا',
                          roman: 'Crispy Dal Chana',
                          headerTheme: 'bg-yellow-600 text-white',
                          cardBorder: 'border-yellow-400 ring-1 ring-yellow-200',
                          icon: '🥣',
                        },
                        {
                          name: 'پی نٹ',
                          roman: 'Peanut (مونگ پھلی)',
                          headerTheme: 'bg-orange-600 text-white',
                          cardBorder: 'border-orange-300 ring-1 ring-orange-200',
                          icon: '🥜',
                        },
                      ];

                      // Also check if user added extra products to catalog with defined variants
                      const extraCatalogCards = products
                        .filter(
                          (p) =>
                            !coreList.some((c) => c.name.trim() === p.name.trim()) &&
                            items.some((it) => it.productName.trim() === p.name.trim())
                        )
                        .map((p) => ({
                          name: p.name,
                          roman: `${p.category || 'Product'} (نئی ورائٹی)`,
                          headerTheme: 'bg-purple-700 text-white',
                          cardBorder: 'border-purple-300 ring-1 ring-purple-200',
                          icon: '✨',
                        }));

                      const allCardsToRender = [...coreList, ...extraCatalogCards];

                      return allCardsToRender.map((core) => {
                      const cardItems = items
                        .map((item, idx) => ({ item, idx }))
                        .filter(({ item }) => item.productName.trim() === core.name.trim());
                      const totalCardQty = cardItems.reduce((acc, { item }) => acc + (item.qty || 0), 0);
                      const totalCardAmount = cardItems.reduce((acc, { item }) => acc + (item.amount || 0), 0);
                      const prodInDb = products.find((p) => p.name.trim() === core.name.trim());

                      return (
                        <div
                          key={core.name}
                          className={`bg-white rounded-xl overflow-hidden border shadow-xs ${core.cardBorder}`}
                        >
                          {/* Card Header */}
                          <div className={`px-3.5 py-2.5 flex items-center justify-between ${core.headerTheme}`}>
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{core.icon}</span>
                              <div>
                                <h4 className="font-bold text-sm leading-tight">{core.name}</h4>
                                <span className="text-[10px] opacity-85 block">{core.roman}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              {prodInDb && (
                                <span className="text-[10px] opacity-85 block">
                                  اسٹاک: {prodInDb.stock} {prodInDb.unit}
                                </span>
                              )}
                              {totalCardQty > 0 ? (
                                <span className="bg-white text-gray-900 font-mono font-bold text-xs px-2.5 py-0.5 rounded-full inline-block mt-0.5 shadow-2xs">
                                  {totalCardQty} کارٹن = {formatCurrency(totalCardAmount, settings.currencySymbol)}
                                </span>
                              ) : (
                                <span className="text-[11px] opacity-75">0 کارٹن</span>
                              )}
                            </div>
                          </div>

                          {/* Card Variants Rows */}
                          <div className="p-3 divide-y divide-gray-100 space-y-2">
                            {cardItems.map(({ item, idx }) => {
                              const is10 = item.variantName.includes('10');
                              const is20 = item.variantName.includes('20');
                              const is50 = item.variantName.includes('50');
                              const is100 = item.variantName.includes('100');

                              return (
                                <div
                                  key={item.id}
                                  className="pt-2 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                                >
                                  {/* Variant Tag & Rate */}
                                  <div className="flex items-center gap-2 min-w-[135px]">
                                    <span
                                      className={`px-2 py-0.5 rounded-md text-xs font-bold border ${
                                        is10
                                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                                          : is20
                                          ? 'bg-blue-100 text-blue-900 border-blue-300'
                                          : is50
                                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                          : is100
                                          ? 'bg-purple-100 text-purple-900 border-purple-300'
                                          : 'bg-gray-100 text-gray-800 border-gray-300'
                                      }`}
                                    >
                                      {item.variantName || 'پیک'}
                                    </span>
                                    <div className="text-[11px] text-gray-500 font-mono">
                                      نرخ: Rs {item.rate}
                                    </div>
                                  </div>

                                  {/* Stepper & Qty Control */}
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleStepQty(idx, -1)}
                                      className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-rose-100 text-gray-700 hover:text-rose-700 font-black flex items-center justify-center transition cursor-pointer"
                                      title="ایک کارٹن کم کریں (-1)"
                                    >
                                      <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <input
                                      type="number"
                                      min="0"
                                      value={item.qty === 0 ? '' : item.qty}
                                      onChange={(e) =>
                                        handleItemChange(idx, 'qty', parseFloat(e.target.value) || 0)
                                      }
                                      placeholder="0"
                                      className={`w-16 sm:w-20 text-center font-mono font-bold text-base py-1 rounded-lg border transition ${
                                        item.qty > 0
                                          ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 ring-1 ring-emerald-300'
                                          : 'border-gray-300 bg-white text-gray-800'
                                      }`}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleStepQty(idx, 1)}
                                      className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black flex items-center justify-center transition cursor-pointer shadow-xs"
                                      title="ایک کارٹن زیادہ کریں (+1)"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleStepQty(idx, 5)}
                                      className="px-2 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg cursor-pointer"
                                      title="+5 کارٹن فوری شامل کریں"
                                    >
                                      +5
                                    </button>
                                  </div>

                                  {/* Subtotal */}
                                  <div className="text-right min-w-[85px]">
                                    {item.qty > 0 ? (
                                      <span className="font-mono font-bold text-emerald-800 text-xs sm:text-sm">
                                        {formatCurrency(item.amount, settings.currencySymbol)}
                                      </span>
                                    ) : (
                                      <span className="text-gray-300 text-xs font-mono">—</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    });
                    })()}
                  </div>

                  {/* Additional / Spare Items Section in Grid View */}
                  {items.some(
                    ({ productName }) =>
                      !['راوی مکس نمکو', 'دال موٹھ', 'دال چنا', 'پی نٹ'].includes(productName.trim())
                  ) && (
                    <div className="bg-purple-50/60 rounded-xl border border-purple-200 p-3.5 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-purple-600" />
                          دیگر آئٹمز و اسپیئر پرچہ (Other &amp; Spare Items):
                        </span>
                        <button
                          type="button"
                          onClick={handleAddSpareRow}
                          className="text-xs font-semibold text-purple-800 bg-white px-2.5 py-1 rounded border border-purple-300 hover:bg-purple-100 cursor-pointer"
                        >
                          + Add Spare Row
                        </button>
                      </div>

                      <div className="space-y-2">
                        {items
                          .map((item, idx) => ({ item, idx }))
                          .filter(
                            ({ item }) =>
                              !['راوی مکس نمکو', 'دال موٹھ', 'دال چنا', 'پی نٹ'].includes(item.productName.trim())
                          )
                          .map(({ item, idx }) => (
                            <div
                              key={item.id}
                              className="bg-white p-2.5 rounded-lg border border-purple-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
                            >
                              <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
                                <input
                                  type="text"
                                  value={item.productName}
                                  onChange={(e) => handleItemChange(idx, 'productName', e.target.value)}
                                  placeholder="پروڈکٹ کا نام..."
                                  className="px-2 py-1 rounded border border-gray-300 font-medium flex-1"
                                />
                                <input
                                  type="text"
                                  value={item.variantName}
                                  onChange={(e) => handleItemChange(idx, 'variantName', e.target.value)}
                                  placeholder="کیٹیگری / سائز"
                                  className="w-24 px-2 py-1 rounded border border-gray-300"
                                />
                                <input
                                  type="text"
                                  value={item.unit}
                                  onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                                  placeholder="unit"
                                  className="w-16 px-1 py-1 text-center rounded border border-gray-300"
                                  title="یونٹ تبدیل کریں (pc یا kg)"
                                />
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500 text-[11px]">نرخ:</span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={item.rate === 0 ? '' : item.rate}
                                    onChange={(e) =>
                                      handleItemChange(idx, 'rate', parseFloat(e.target.value) || 0)
                                    }
                                    className="w-16 px-1.5 py-1 text-right rounded border border-gray-300 font-mono"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 justify-between w-full sm:w-auto">
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleStepQty(idx, -1)}
                                    className="w-7 h-7 rounded bg-gray-100 hover:bg-rose-100 text-gray-700 font-bold flex items-center justify-center cursor-pointer"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    min="0"
                                    value={item.qty === 0 ? '' : item.qty}
                                    onChange={(e) =>
                                      handleItemChange(idx, 'qty', parseFloat(e.target.value) || 0)
                                    }
                                    className="w-16 text-center font-mono font-bold py-0.5 border rounded"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleStepQty(idx, 1)}
                                    className="w-7 h-7 rounded bg-emerald-600 text-white font-bold flex items-center justify-center cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                                <span className="font-mono font-bold text-gray-900 min-w-[70px] text-right">
                                  {formatCurrency(item.amount, settings.currencySymbol)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItemRow(idx)}
                                  className="text-gray-400 hover:text-rose-600 p-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* View 2: DETAILED PAPER ORDER SHEET TABLE */}
              {orderViewMode === 'table' && (
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-3 py-2 border-b border-gray-300 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                      <span className="font-bold text-gray-800 uppercase tracking-wide block">
                        Ravi Nimko Order Items (Pre-printed Variants &amp; Spares)
                      </span>
                      <span className="text-[11px] text-gray-500">
                        Simply type Quantity in the box. Rate is pre-filled. Blank/0 items won&apos;t be billed.
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleAddSpareRow}
                        className="flex items-center gap-1 text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded border border-purple-300 hover:bg-purple-100 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        + Spare Row
                      </button>
                      <button
                        type="button"
                        onClick={handleAddItemRow}
                        className="flex items-center gap-1 text-xs font-semibold text-blue-700 bg-white px-2.5 py-1 rounded border border-gray-300 hover:bg-blue-50 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Row
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto max-h-80">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold sticky top-0 z-10">
                        <tr>
                          <th className="py-2 px-2.5 w-10 text-center">S.#</th>
                          <th className="py-2 px-2.5 min-w-[220px]">Product / Detail</th>
                          <th className="py-2 px-2.5 w-32">Pack / Variant</th>
                          <th className="py-2 px-2.5 w-24">Qty (تعداد)</th>
                          <th className="py-2 px-2.5 w-24 text-center">Unit (یونٹ)</th>
                          <th className="py-2 px-2.5 w-24">Rate (نرخ)</th>
                          <th className="py-2 px-2.5 w-28 text-right">Amount (روپے)</th>
                          <th className="py-2 px-2 w-16 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {items.map((item, idx) => {
                          const isSpareRow = !item.productId;
                          return (
                            <tr
                              key={item.id}
                              className={`transition ${
                                isSpareRow
                                  ? 'bg-purple-50/20 hover:bg-purple-50/40'
                                  : item.qty > 0
                                  ? 'bg-emerald-50/20 hover:bg-emerald-50/40'
                                  : 'hover:bg-gray-50/50'
                              }`}
                            >
                              <td className="py-1.5 px-2 text-center text-gray-500 font-medium">
                                {idx + 1}
                              </td>
                              <td className="py-1.5 px-2">
                                <div className="space-y-1">
                                  <div className="flex gap-1">
                                    <input
                                      type="text"
                                      placeholder={
                                        isSpareRow
                                          ? 'اسپیئر پروڈکٹ نام / Enter spare product...'
                                          : 'Product Name'
                                      }
                                      value={item.productName}
                                      onChange={(e) => handleItemChange(idx, 'productName', e.target.value)}
                                      className={`w-full px-2 py-1 rounded border font-medium focus:outline-none focus:ring-1 ${
                                        isSpareRow
                                          ? 'border-purple-300 bg-white focus:ring-purple-500 text-purple-950'
                                          : 'border-gray-300 focus:ring-blue-500 text-gray-900'
                                      }`}
                                    />
                                    {products.length > 0 && (
                                      <select
                                        onChange={(e) => handleSelectProduct(idx, e.target.value)}
                                        className="w-6 text-gray-400 border border-gray-300 rounded bg-gray-50 cursor-pointer"
                                        title="Pick from Registered Products"
                                      >
                                        <option value="">▼</option>
                                        {products.map((p) => (
                                          <option key={p.id} value={p.id}>
                                            {p.name}
                                          </option>
                                        ))}
                                      </select>
                                    )}
                                  </div>
                                  {isSpareRow && item.productName.trim() && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[10px] text-purple-600 bg-purple-100/70 px-1.5 py-0.2 rounded font-medium">
                                        Spare Item
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleSaveSpareToCatalog(idx)}
                                        className="text-[10px] text-blue-700 hover:text-blue-900 underline font-semibold flex items-center gap-0.5 cursor-pointer"
                                        title="Save this spare permanently to Product Catalog for future orders"
                                      >
                                        <Save className="w-2.5 h-2.5" />
                                        Save to Catalog (کیٹلاگ میں محفوظ کریں)
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="py-1.5 px-2">
                                <input
                                  type="text"
                                  placeholder="e.g. Rs 10 والی"
                                  value={item.variantName || ''}
                                  onChange={(e) => handleItemChange(idx, 'variantName', e.target.value)}
                                  className="w-full px-2 py-1 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </td>
                              <td className="py-1.5 px-2">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  value={item.qty === 0 ? '' : item.qty}
                                  onChange={(e) =>
                                    handleItemChange(idx, 'qty', parseFloat(e.target.value) || 0)
                                  }
                                  placeholder="0"
                                  className={`w-full px-2 py-1 rounded border text-right font-bold text-sm focus:outline-none focus:ring-1 ${
                                    item.qty > 0
                                      ? 'border-emerald-500 bg-emerald-50/30 text-emerald-800'
                                      : 'border-gray-300 focus:ring-blue-500'
                                  }`}
                                />
                              </td>
                              <td className="py-1.5 px-2 text-center">
                                <input
                                  type="text"
                                  value={item.unit}
                                  onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                                  placeholder="pc/kg"
                                  className="w-full px-1.5 py-1 text-center font-medium text-xs rounded border border-gray-300 bg-white"
                                  title="یونٹ تبدیل کریں (pc یا kg یا packet)"
                                />
                              </td>
                              <td className="py-1.5 px-2">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  value={item.rate === 0 ? '' : item.rate}
                                  onChange={(e) =>
                                    handleItemChange(idx, 'rate', parseFloat(e.target.value) || 0)
                                  }
                                  className="w-full px-2 py-1 rounded border border-gray-300 text-right font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </td>
                              <td className="py-1.5 px-2 text-right font-semibold text-gray-900 font-mono">
                                {formatCurrency(item.amount, settings.currencySymbol)}
                              </td>
                              <td className="py-1.5 px-1 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItemRow(idx)}
                                  className="text-gray-400 hover:text-rose-600 p-1 cursor-pointer"
                                  title="Remove row"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Order Calculations & Footer Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2.5">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Notes / Special Instructions</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Delivered via van #3, balance due on next trip..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Signatory Title</label>
                    <input
                      type="text"
                      value={signatureText}
                      onChange={(e) => setSignatureText(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2">
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-mono font-semibold text-gray-900">
                      {formatCurrency(subTotal, settings.currencySymbol)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Discount:</span>
                    <input
                      type="number"
                      min="0"
                      value={discount === 0 ? '' : discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      className="w-28 px-2 py-1 rounded border border-gray-300 text-right font-mono"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex justify-between items-center text-gray-900 font-bold border-t border-gray-300 pt-2 text-sm">
                    <span>Total Amount (Rupees):</span>
                    <span className="font-mono text-blue-700">
                      {formatCurrency(totalAmount, settings.currencySymbol)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-700 font-semibold">
                    <span>Paid / Advance:</span>
                    <input
                      type="number"
                      min="0"
                      value={paidAmount === 0 ? '' : paidAmount}
                      onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                      className="w-28 px-2 py-1 rounded border border-gray-300 text-right font-mono text-emerald-700"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex justify-between items-center text-amber-800 font-bold border-t border-gray-200 pt-1.5">
                    <span>Balance Due:</span>
                    <span className="font-mono">
                      {formatCurrency(dueAmount, settings.currencySymbol)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 rounded-b-xl flex flex-col sm:flex-row justify-between items-center gap-2">
              <span className="text-[11px] text-gray-500">
                Saving updates customer balance, deducts stock, and records in Cashbook automatically.
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-3.5 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveOrder(false)}
                  className="px-4 py-1.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-semibold cursor-pointer"
                >
                  Save Record
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveOrder(true)}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Save &amp; Print Sheet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK NEW PRODUCT MODAL (Add Future Products on the Fly) */}
      {isQuickProductModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200 overflow-hidden">
            <div className="bg-blue-600 px-5 py-3 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                <h3 className="font-bold text-sm">Add New Product to Catalog (نیا پروڈکٹ)</h3>
              </div>
              <button
                onClick={() => setIsQuickProductModalOpen(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleQuickAddProduct} className="p-5 space-y-3.5 text-xs">
              <p className="text-gray-600">
                This will save the product permanently in your Factory Catalog so you can use it in all future orders.
              </p>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Product Name (پروڈکٹ کا نام) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Potato Sticks, Papri, Sev Murmura..."
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Pack Variant (پیک سائز)</label>
                  <input
                    type="text"
                    placeholder="e.g. Rs 10 والی / Rs 20 والی"
                    value={quickVariant}
                    onChange={(e) => setQuickVariant(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Default Rate ({settings.currencySymbol})</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={quickRate}
                    onChange={(e) => setQuickRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Unit</label>
                <select
                  value={quickUnit}
                  onChange={(e) => setQuickUnit(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {settings.customUnits.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsQuickProductModalOpen(false)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save to Catalog &amp; Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE RAVI NIMKO PAPER ORDER SHEET PREVIEW MODAL */}
      {selectedOrderForPrint && (
        <PrintModal
          isOpen={!!selectedOrderForPrint}
          onClose={() => setSelectedOrderForPrint(null)}
          title={`Order Sheet / Invoice ${selectedOrderForPrint.invoiceNo}`}
        >
          {/* Layout Selector (Hidden when printing) */}
          <div className="no-print flex items-center justify-between bg-gray-100 p-2.5 rounded-lg mb-4 border border-gray-300">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-700">Slip Style:</span>
              <button
                type="button"
                onClick={() => setPrintLayout('greenPad')}
                className={`px-3 py-1 text-xs font-bold rounded cursor-pointer transition ${
                  printLayout === 'greenPad'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                📄 اصل سبز پرچہ (Ravi Nimko Green Order Pad)
              </button>
              <button
                type="button"
                onClick={() => setPrintLayout('formalA4')}
                className={`px-3 py-1 text-xs font-bold rounded cursor-pointer transition ${
                  printLayout === 'formalA4'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                📋 Formal A4 Invoice
              </button>
            </div>
            <span className="text-[11px] text-gray-500 hidden sm:inline">
              Select &quot;Green Order Pad&quot; to print identical to your physical paper order pad!
            </span>
          </div>

          {printLayout === 'greenPad' ? (
            /* AUTHENTIC PAKISTANI RAVI NIMKO GREEN ORDER SLIP (سبز پرچہ) */
            <div className="p-5 max-w-2xl mx-auto bg-[#d4f4d2] border-2 border-[#1e4d2b] text-[#0d2818] shadow-sm rounded-sm font-sans">
              {/* Slip Header */}
              <div className="border-b-2 border-[#1e4d2b] pb-2 mb-3">
                <div className="flex justify-between items-start">
                  {/* Left Oval Emblem */}
                  <div className="border-2 border-[#1e4d2b] rounded-full px-3 py-1 text-center bg-white/70 shadow-xs">
                    <span className="block text-sm font-black tracking-wider text-[#1e4d2b]">RAVI NIMKO</span>
                    <span className="block text-[9px] font-bold text-emerald-900 uppercase">Delicious &amp; Crunchy</span>
                  </div>

                  {/* Center Title Urdu */}
                  <div className="text-center flex-1 px-2">
                    <h1 className="text-3xl font-black tracking-wide text-[#1e4d2b] font-serif">
                      سُپر فوڈز
                    </h1>
                    <p className="text-[11px] font-bold text-emerald-950 mt-0.5">
                      محبوب کالونی گلی نمبر 1 آپوزٹ جنرل بس اسٹینڈ چشتیاں
                    </p>
                    <p className="text-[10px] font-semibold text-emerald-900 mt-0.5" dir="ltr">
                      فون: 0300-9055575 / 0304-7021515 | سیلز منیجر: 0317-4882109
                    </p>
                  </div>

                  {/* Right License info */}
                  <div className="text-right text-[10px] font-bold text-emerald-950">
                    <span className="block">لائسنس نمبر:</span>
                    <span className="block font-mono">BWN/M-A/74631825</span>
                  </div>
                </div>

                {/* Caution Banner */}
                <div className="border border-[#1e4d2b] px-3 py-1 rounded text-center text-xs font-bold bg-[#bbf0b7] my-2 text-rose-950">
                  سیلزمین سے ذاتی لین دین کمپنی ذمہ دار نہ ہوگی
                </div>
              </div>

              {/* Order Meta Info in Urdu Slip Format */}
              <div className="grid grid-cols-2 gap-2 text-xs border border-[#1e4d2b] p-2 mb-3 bg-white/50 rounded-xs">
                <div className="space-y-1">
                  <p>
                    <span className="font-bold text-[#1e4d2b]">نمبر (No):</span>{' '}
                    <span className="font-mono font-bold">{selectedOrderForPrint.invoiceNo}</span>
                  </p>
                  <p>
                    <span className="font-bold text-[#1e4d2b]">نام خریدار (Customer):</span>{' '}
                    <span className="font-bold">{selectedOrderForPrint.customerName}</span>
                  </p>
                  {selectedOrderForPrint.customerArea && (
                    <p>
                      <span className="font-bold text-[#1e4d2b]">پتہ / مارکیٹ:</span>{' '}
                      {selectedOrderForPrint.customerArea}
                    </p>
                  )}
                </div>
                <div className="space-y-1 text-right">
                  <p>
                    <span className="font-bold text-[#1e4d2b]">تاریخ (Date):</span>{' '}
                    <span className="font-medium">{formatDate(selectedOrderForPrint.date)}</span>
                  </p>
                  {selectedOrderForPrint.customerPhone && (
                    <p>
                      <span className="font-bold text-[#1e4d2b]">فون (Phone):</span>{' '}
                      <span className="font-mono">{selectedOrderForPrint.customerPhone}</span>
                    </p>
                  )}
                  <p>
                    <span className="font-bold text-[#1e4d2b]">شرائط ادائیگی:</span>{' '}
                    <span className="font-semibold">{selectedOrderForPrint.paymentMode}</span>
                  </p>
                </div>
              </div>

              {/* Order Ledger Table in Pakistani Paper Pad Format */}
              <table className="w-full text-xs border-collapse border-2 border-[#1e4d2b] mb-3 bg-white/60">
                <thead>
                  <tr className="bg-[#bbf0b7] border-b-2 border-[#1e4d2b] text-[#1e4d2b] font-bold">
                    <th className="border border-[#1e4d2b] py-1.5 px-2 w-14 text-center">تعداد (Qty)</th>
                    <th className="border border-[#1e4d2b] py-1.5 px-3 text-left">تفصیل مال (Description of Goods)</th>
                    <th className="border border-[#1e4d2b] py-1.5 px-2 w-20 text-right">نرخ (Rate)</th>
                    <th className="border border-[#1e4d2b] py-1.5 px-2 w-28 text-right">روپے (Amount Rs.)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e4d2b]/40">
                  {selectedOrderForPrint.items
                    .filter((it) => it.qty > 0 || it.amount > 0)
                    .map((item, idx) => (
                      <tr key={idx} className="hover:bg-emerald-50/50">
                        <td className="border border-[#1e4d2b] py-1.5 px-2 text-center font-bold text-sm font-mono">
                          {item.qty}
                        </td>
                        <td className="border border-[#1e4d2b] py-1.5 px-3 font-semibold">
                          <span>{item.productName}</span>
                          {item.variantName && (
                            <span className="text-emerald-800 text-[11px] font-normal ml-2">
                              ({item.variantName})
                            </span>
                          )}
                        </td>
                        <td className="border border-[#1e4d2b] py-1.5 px-2 text-right font-mono font-medium">
                          {item.rate}
                        </td>
                        <td className="border border-[#1e4d2b] py-1.5 px-2 text-right font-bold font-mono text-sm">
                          {formatCurrency(item.amount, settings.currencySymbol)}
                        </td>
                      </tr>
                    ))}

                  {/* Dotted Spare lines just like physical order pad */}
                  <tr className="h-6 border-b border-dashed border-[#1e4d2b]/40">
                    <td className="border border-[#1e4d2b] text-center text-gray-300">.</td>
                    <td className="border border-[#1e4d2b] text-gray-400 italic text-[10px]">اسپیئر / Spare Note</td>
                    <td className="border border-[#1e4d2b]"></td>
                    <td className="border border-[#1e4d2b]"></td>
                  </tr>
                  <tr className="h-6 border-b border-dashed border-[#1e4d2b]/40">
                    <td className="border border-[#1e4d2b] text-center text-gray-300">.</td>
                    <td className="border border-[#1e4d2b]"></td>
                    <td className="border border-[#1e4d2b]"></td>
                    <td className="border border-[#1e4d2b]"></td>
                  </tr>
                </tbody>
                <tfoot>
                  {selectedOrderForPrint.discount > 0 && (
                    <>
                      <tr className="border-t-2 border-[#1e4d2b]">
                        <td colSpan={3} className="border border-[#1e4d2b] py-1 px-2 text-right font-semibold">
                          سب ٹوٹل (Subtotal):
                        </td>
                        <td className="border border-[#1e4d2b] py-1 px-2 text-right font-mono">
                          {formatCurrency(selectedOrderForPrint.subTotal, settings.currencySymbol)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="border border-[#1e4d2b] py-1 px-2 text-right font-semibold text-rose-900">
                          ڈسکاؤنٹ (Discount):
                        </td>
                        <td className="border border-[#1e4d2b] py-1 px-2 text-right font-mono text-rose-900">
                          - {formatCurrency(selectedOrderForPrint.discount, settings.currencySymbol)}
                        </td>
                      </tr>
                    </>
                  )}
                  <tr className="bg-[#bbf0b7] font-bold border-t-2 border-[#1e4d2b]">
                    <td className="border border-[#1e4d2b] py-1.5 px-2 text-center font-mono text-sm">
                      {selectedOrderForPrint.items.reduce((sum, it) => sum + (it.qty || 0), 0)}
                    </td>
                    <td colSpan={2} className="border border-[#1e4d2b] py-1.5 px-3 text-right font-extrabold text-sm">
                      میزان کل رقم (Total Rupees):
                    </td>
                    <td className="border border-[#1e4d2b] py-1.5 px-2 text-right font-extrabold text-base font-mono text-[#1e4d2b]">
                      {formatCurrency(selectedOrderForPrint.totalAmount, settings.currencySymbol)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="border border-[#1e4d2b] py-1 px-2 text-right font-semibold text-emerald-900">
                      وصول شد (Paid Amount):
                    </td>
                    <td className="border border-[#1e4d2b] py-1 px-2 text-right font-bold text-emerald-950 font-mono">
                      {formatCurrency(selectedOrderForPrint.paidAmount, settings.currencySymbol)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="border border-[#1e4d2b] py-1 px-2 text-right font-bold text-rose-950">
                      بقایا رقم (Balance Due):
                    </td>
                    <td className="border border-[#1e4d2b] py-1 px-2 text-right font-bold text-rose-950 font-mono">
                      {formatCurrency(selectedOrderForPrint.dueAmount, settings.currencySymbol)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Bottom Return Policy Warning */}
              <div className="border border-[#1e4d2b] px-3 py-1.5 rounded text-center text-[10.5px] font-bold bg-[#bbf0b7] my-3 text-emerald-950">
                مال پہنچنے کی صورت میں اگر مال خراب ہو تو فورا کمپنی سے رابطہ کریں بعد میں کمپنی خراب کی ذمہ دار نہ ہوگی
              </div>

              {/* Signatures in Urdu */}
              <div className="mt-8 pt-4 flex justify-between items-end text-xs">
                <div className="text-center w-48 border-t-2 border-[#1e4d2b] pt-1">
                  <p className="font-bold text-[#1e4d2b]">دستخط خریدار / مہر</p>
                  <p className="text-[10px] text-emerald-900">Customer Stamp &amp; Signature</p>
                </div>
                <div className="text-center w-48 border-t-2 border-[#1e4d2b] pt-1">
                  <p className="font-bold text-[#1e4d2b]">
                    {selectedOrderForPrint.signatureText || 'سُپر فوڈز (راوی نمکو)'}
                  </p>
                  <p className="text-[10px] text-emerald-900">Authorized Signatory</p>
                </div>
              </div>
            </div>
          ) : (
            /* FORMAL A4 INVOICE VIEW */
            <div className="p-4 sm:p-6 max-w-3xl mx-auto bg-white border border-gray-400 text-black">
              {/* Header */}
              <div className="text-center border-b-2 border-black pb-2 mb-3">
                <h1 className="text-2xl sm:text-3xl font-black tracking-wider uppercase">
                  {settings.factoryName || 'RAVI NIMKO'}
                </h1>
                {settings.tagline && (
                  <p className="text-xs font-semibold tracking-wide uppercase text-gray-700">
                    {settings.tagline}
                  </p>
                )}
                <p className="text-xs text-gray-800 mt-0.5">
                  {settings.address || 'Industrial Area'} {settings.phone && `| Tel: ${settings.phone}`}
                </p>
                <div className="inline-block mt-2 px-4 py-0.5 border border-black font-bold uppercase tracking-widest text-xs">
                  ORDER BOOK / INVOICE SHEET
                </div>
              </div>

              {/* Order Sheet Metadata */}
              <div className="grid grid-cols-2 gap-2 text-xs border border-black p-2.5 mb-3 bg-gray-50/40">
                <div>
                  <p><span className="font-bold">Order / Invoice No:</span> {selectedOrderForPrint.invoiceNo}</p>
                  <p><span className="font-bold">Customer Name:</span> {selectedOrderForPrint.customerName}</p>
                  {selectedOrderForPrint.customerArea && (
                    <p><span className="font-bold">Market / Area:</span> {selectedOrderForPrint.customerArea}</p>
                  )}
                </div>
                <div className="text-right">
                  <p><span className="font-bold">Date:</span> {formatDate(selectedOrderForPrint.date)}</p>
                  {selectedOrderForPrint.customerPhone && (
                    <p><span className="font-bold">Phone:</span> {selectedOrderForPrint.customerPhone}</p>
                  )}
                  <p><span className="font-bold">Terms:</span> {selectedOrderForPrint.paymentMode}</p>
                </div>
              </div>

              {/* Ledger Table */}
              <table className="w-full text-xs border-collapse border border-black mb-3">
                <thead>
                  <tr className="bg-gray-100 border-b border-black text-black">
                    <th className="border border-black py-1.5 px-2 w-10 text-center">S.#</th>
                    <th className="border border-black py-1.5 px-2 text-left">DESCRIPTION OF GOODS</th>
                    <th className="border border-black py-1.5 px-2 text-left w-24">PACK / VARIANT</th>
                    <th className="border border-black py-1.5 px-2 w-16 text-center">QTY</th>
                    <th className="border border-black py-1.5 px-2 w-16 text-center">UNIT</th>
                    <th className="border border-black py-1.5 px-2 w-20 text-right">RATE</th>
                    <th className="border border-black py-1.5 px-2 w-28 text-right">AMOUNT (RS.)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrderForPrint.items
                    .filter((it) => it.qty > 0 || it.amount > 0)
                    .map((item, i) => (
                      <tr key={i} className="border-b border-gray-300">
                        <td className="border border-black py-1.5 px-2 text-center">{i + 1}</td>
                        <td className="border border-black py-1.5 px-2 font-medium">{item.productName}</td>
                        <td className="border border-black py-1.5 px-2 text-gray-700">{item.variantName || '-'}</td>
                        <td className="border border-black py-1.5 px-2 text-center font-bold">{item.qty}</td>
                        <td className="border border-black py-1.5 px-2 text-center">{item.unit}</td>
                        <td className="border border-black py-1.5 px-2 text-right">{item.rate}</td>
                        <td className="border border-black py-1.5 px-2 text-right font-bold">
                          {formatCurrency(item.amount, settings.currencySymbol)}
                        </td>
                      </tr>
                    ))}
                </tbody>
                <tfoot>
                  {selectedOrderForPrint.discount > 0 && (
                    <>
                      <tr className="border-t border-black">
                        <td colSpan={6} className="border border-black py-1 px-2 text-right font-semibold">Subtotal:</td>
                        <td className="border border-black py-1 px-2 text-right font-mono">
                          {formatCurrency(selectedOrderForPrint.subTotal, settings.currencySymbol)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={6} className="border border-black py-1 px-2 text-right font-semibold">Discount:</td>
                        <td className="border border-black py-1 px-2 text-right font-mono">
                          - {formatCurrency(selectedOrderForPrint.discount, settings.currencySymbol)}
                        </td>
                      </tr>
                    </>
                  )}
                  <tr className="bg-gray-100 font-bold border-t border-black">
                    <td colSpan={3} className="border border-black py-1.5 px-2 text-left">
                      TOTAL QUANTITY: {selectedOrderForPrint.items.reduce((s, it) => s + it.qty, 0)} UNITS
                    </td>
                    <td colSpan={3} className="border border-black py-1.5 px-2 text-right uppercase">
                      GRAND TOTAL:
                    </td>
                    <td className="border border-black py-1.5 px-2 text-right font-bold text-sm">
                      {formatCurrency(selectedOrderForPrint.totalAmount, settings.currencySymbol)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={6} className="border border-black py-1 px-2 text-right font-semibold text-emerald-800">
                      Paid / Received:
                    </td>
                    <td className="border border-black py-1 px-2 text-right font-bold text-emerald-800">
                      {formatCurrency(selectedOrderForPrint.paidAmount, settings.currencySymbol)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={6} className="border border-black py-1 px-2 text-right font-bold text-amber-900">
                      Balance Due:
                    </td>
                    <td className="border border-black py-1 px-2 text-right font-bold text-amber-900">
                      {formatCurrency(selectedOrderForPrint.dueAmount, settings.currencySymbol)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Remarks & Signatures */}
              {selectedOrderForPrint.notes && (
                <p className="text-xs italic text-gray-700 mb-4">
                  <span className="font-bold">Remarks:</span> {selectedOrderForPrint.notes}
                </p>
              )}

              <div className="mt-8 pt-4 flex justify-between items-end text-xs">
                <div className="text-center w-48 border-t border-black pt-1">
                  <p className="font-bold">Customer Signature</p>
                  <p className="text-[10px] text-gray-500">Receiver Stamp / Sign</p>
                </div>
                <div className="text-center w-48 border-t border-black pt-1">
                  <p className="font-bold">
                    {selectedOrderForPrint.signatureText || settings.orderSignatoryName || 'Authorized Signatory'}
                  </p>
                  <p className="text-[10px] text-gray-500">For {settings.factoryName || 'Factory'}</p>
                </div>
              </div>

              {settings.orderFooterTerms && (
                <p className="text-[10px] text-center text-gray-500 mt-6 border-t border-gray-200 pt-2">
                  {settings.orderFooterTerms}
                </p>
              )}
            </div>
          )}
        </PrintModal>
      )}
    </div>
  );
};
