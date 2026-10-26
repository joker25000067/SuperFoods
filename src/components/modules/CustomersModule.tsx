import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Search,
  BookOpen,
  Wallet,
  PlusCircle,
  MinusCircle,
  CheckCircle2,
  SlidersHorizontal,
  History,
} from 'lucide-react';
import { useFactory } from '../../context/FactoryContext';
import { Customer, CustomerDueAdjustment } from '../../types';
import { formatCurrency, formatDate, getTodayDateString } from '../../utils/formatters';
import { PrintModal } from '../common/PrintModal';
import { PrintHeader } from '../common/PrintHeader';
import { EmptyState } from '../common/EmptyState';

type DueActionMode = 'ADD_DUE' | 'PAYMENT_RECEIVED' | 'SET_BALANCE';

export const CustomersModule: React.FC = () => {
  const { customers, sales, settings, saveCustomer, deleteCustomer, saveCashbookEntry } = useFactory();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomerForLedger, setSelectedCustomerForLedger] = useState<Customer | null>(null);

  // Add / Edit Customer Modal State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [shopName, setShopName] = useState('');
  const [phone, setPhone] = useState('');
  const [cityOrArea, setCityOrArea] = useState('');
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [currentBalanceInput, setCurrentBalanceInput] = useState<number>(0);
  const [collectiveAddInEdit, setCollectiveAddInEdit] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Collective Dues & Payment Adjustment Modal State
  const [isDuesModalOpen, setIsDuesModalOpen] = useState(false);
  const [duesCustomerId, setDuesCustomerId] = useState<string>('');
  const [dueMode, setDueMode] = useState<DueActionMode>('ADD_DUE');
  const [dueAmount, setDueAmount] = useState<number>(0);
  const [dueDate, setDueDate] = useState<string>(getTodayDateString());
  const [duePaymentMode, setDuePaymentMode] = useState<'Cash' | 'Bank'>('Cash');
  const [recordInCashbook, setRecordInCashbook] = useState<boolean>(true);
  const [dueReference, setDueReference] = useState<string>('');
  const [dueNotes, setDueNotes] = useState<string>('');
  const [duesError, setDuesError] = useState<string>('');
  const [duesSuccessBanner, setDuesSuccessBanner] = useState<string>('');

  const selectedDuesCustomer = customers.find((c) => c.id === duesCustomerId) || null;

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setShopName('');
    setPhone('');
    setCityOrArea('');
    setOpeningBalance(0);
    setCurrentBalanceInput(0);
    setCollectiveAddInEdit(0);
    setNotes('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingId(c.id);
    setName(c.name);
    setShopName(c.shopName || '');
    setPhone(c.phone || '');
    setCityOrArea(c.cityOrArea || '');
    setOpeningBalance(c.openingBalance || 0);
    setCurrentBalanceInput(c.currentBalance || 0);
    setCollectiveAddInEdit(0);
    setNotes(c.notes || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenDuesModal = (customer?: Customer, initialMode: DueActionMode = 'ADD_DUE') => {
    const targetCustomer = customer || customers[0] || null;
    setDuesCustomerId(targetCustomer ? targetCustomer.id : '');
    setDueMode(initialMode);
    setDueAmount(initialMode === 'SET_BALANCE' && targetCustomer ? targetCustomer.currentBalance : 0);
    setDueDate(getTodayDateString());
    setDuePaymentMode('Cash');
    setRecordInCashbook(true);
    setDueReference('');
    setDueNotes('');
    setDuesError('');
    setIsDuesModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setFormError('Customer name is required.');
      return;
    }

    const existing = editingId ? customers.find((c) => c.id === editingId) : null;
    const finalCurrentBalance = existing
      ? Number(currentBalanceInput || 0) + Number(collectiveAddInEdit || 0)
      : Number(openingBalance || 0) + Number(collectiveAddInEdit || 0);

    let updatedAdjustments = existing?.dueAdjustments ? [...existing.dueAdjustments] : [];

    // If user changed balance or added collective amount inside Edit Modal, log it in adjustments
    if (existing && finalCurrentBalance !== existing.currentBalance) {
      const diff = finalCurrentBalance - existing.currentBalance;
      const adj: CustomerDueAdjustment = {
        id: `adj_${Date.now()}`,
        date: getTodayDateString(),
        type: collectiveAddInEdit > 0 ? 'ADD_DUE' : 'SET_BALANCE',
        amount: Math.abs(diff),
        previousBalance: existing.currentBalance,
        newBalance: finalCurrentBalance,
        notes:
          collectiveAddInEdit > 0
            ? `Collective Due Added (+${formatCurrency(collectiveAddInEdit, settings.currencySymbol)}) via Customer Edit`
            : 'Balance updated directly via Customer Edit',
        createdAt: new Date().toISOString(),
      };
      updatedAdjustments = [adj, ...updatedAdjustments];
    }

    await saveCustomer({
      id: editingId || undefined,
      name: name.trim(),
      shopName: shopName.trim(),
      phone: phone.trim(),
      cityOrArea: cityOrArea.trim(),
      openingBalance: Number(openingBalance || 0),
      currentBalance: finalCurrentBalance,
      dueAdjustments: updatedAdjustments,
      notes: notes.trim(),
    });

    setIsModalOpen(false);
  };

  const getPreviewNewBalance = (): number => {
    if (!selectedDuesCustomer) return 0;
    const current = Number(selectedDuesCustomer.currentBalance || 0);
    const amt = Number(dueAmount || 0);
    if (dueMode === 'ADD_DUE') return current + amt;
    if (dueMode === 'PAYMENT_RECEIVED') return Math.max(0, current - amt);
    return amt; // SET_BALANCE
  };

  const handleSaveDueAdjustment = async () => {
    if (!selectedDuesCustomer) {
      setDuesError('Please select a customer.');
      return;
    }

    const amt = Number(dueAmount || 0);
    if (dueMode !== 'SET_BALANCE' && amt <= 0) {
      setDuesError('Please enter a valid amount greater than 0.');
      return;
    }
    if (dueMode === 'SET_BALANCE' && amt < 0) {
      setDuesError('Balance cannot be negative.');
      return;
    }

    const prevBalance = Number(selectedDuesCustomer.currentBalance || 0);
    const newBalance = getPreviewNewBalance();

    const adjustmentEntry: CustomerDueAdjustment = {
      id: `adj_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      date: dueDate || getTodayDateString(),
      type: dueMode,
      amount: dueMode === 'SET_BALANCE' ? Math.abs(newBalance - prevBalance) : amt,
      previousBalance: prevBalance,
      newBalance,
      paymentMode: dueMode === 'PAYMENT_RECEIVED' ? duePaymentMode : undefined,
      referenceNo: dueReference.trim() || undefined,
      notes:
        dueNotes.trim() ||
        (dueMode === 'ADD_DUE'
          ? 'Collective Due Amount Added'
          : dueMode === 'PAYMENT_RECEIVED'
          ? 'Collective Payment Received'
          : 'Direct Due Balance Adjustment'),
      createdAt: new Date().toISOString(),
    };

    const existingAdjustments = selectedDuesCustomer.dueAdjustments || [];

    await saveCustomer({
      ...selectedDuesCustomer,
      currentBalance: newBalance,
      dueAdjustments: [adjustmentEntry, ...existingAdjustments],
    });

    // If receiving payment and user opted to record in Cashbook
    if (dueMode === 'PAYMENT_RECEIVED' && recordInCashbook && amt > 0) {
      await saveCashbookEntry({
        date: dueDate || getTodayDateString(),
        type: 'IN',
        category: 'Customer Recovery / Due Receipt',
        amount: amt,
        account: duePaymentMode,
        paymentMode: duePaymentMode === 'Bank' ? 'bank' : 'cash',
        reference: dueReference.trim() || `REC-${Date.now().toString().slice(-4)}`,
        description: `Payment received from ${selectedDuesCustomer.name}${
          selectedDuesCustomer.shopName ? ` (${selectedDuesCustomer.shopName})` : ''
        }${dueNotes.trim() ? ` - ${dueNotes.trim()}` : ''}`,
      });
    }

    setDuesSuccessBanner(
      `Updated ${selectedDuesCustomer.name}'s due balance from ${formatCurrency(
        prevBalance,
        settings.currencySymbol
      )} to ${formatCurrency(newBalance, settings.currencySymbol)}`
    );
    setTimeout(() => setDuesSuccessBanner(''), 5000);
    setIsDuesModalOpen(false);
  };

  const handleDeleteAdjustment = async (customer: Customer, adj: CustomerDueAdjustment) => {
    // Revert balance effect if deleting adjustment
    let revertedBalance = customer.currentBalance;
    if (adj.type === 'ADD_DUE') {
      revertedBalance = Math.max(0, customer.currentBalance - adj.amount);
    } else if (adj.type === 'PAYMENT_RECEIVED') {
      revertedBalance = customer.currentBalance + adj.amount;
    } else if (adj.type === 'SET_BALANCE') {
      revertedBalance = adj.previousBalance;
    }

    const updatedAdjustments = (customer.dueAdjustments || []).filter((item) => item.id !== adj.id);
    await saveCustomer({
      ...customer,
      currentBalance: revertedBalance,
      dueAdjustments: updatedAdjustments,
    });
  };

  const filtered = customers.filter((c) => {
    return (
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.shopName && c.shopName.toLowerCase().includes(search.toLowerCase())) ||
      (c.cityOrArea && c.cityOrArea.toLowerCase().includes(search.toLowerCase())) ||
      (c.phone && c.phone.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const totalReceivable = customers.reduce((acc, curr) => acc + curr.currentBalance, 0);
  const customersWithDuesCount = customers.filter((c) => c.currentBalance > 0).length;

  const getCustomerLedger = (customer: Customer) => {
    const saleEntries = sales
      .filter((s) => s.customerId === customer.id)
      .map((s) => ({
        id: s.id,
        date: s.date,
        refNo: s.invoiceNo,
        description: `Sale Order (${s.items.length} items)`,
        totalBilled: s.totalAmount,
        received: s.paidAmount,
        netDueEffect: s.dueAmount,
        entryType: 'SALE' as const,
      }));

    const adjustmentEntries = (customer.dueAdjustments || []).map((adj) => ({
      id: adj.id,
      date: adj.date,
      refNo: adj.referenceNo || (adj.type === 'ADD_DUE' ? 'COLL-DUE' : adj.type === 'PAYMENT_RECEIVED' ? 'RECOVERY' : 'ADJ-BAL'),
      description:
        adj.notes ||
        (adj.type === 'ADD_DUE'
          ? 'Collective Due Amount Added'
          : adj.type === 'PAYMENT_RECEIVED'
          ? `Payment Received (${adj.paymentMode || 'Cash'})`
          : `Balance Set (${formatCurrency(adj.previousBalance, settings.currencySymbol)} → ${formatCurrency(adj.newBalance, settings.currencySymbol)})`),
      totalBilled: adj.type === 'ADD_DUE' ? adj.amount : adj.type === 'SET_BALANCE' && adj.newBalance > adj.previousBalance ? adj.amount : 0,
      received: adj.type === 'PAYMENT_RECEIVED' ? adj.amount : adj.type === 'SET_BALANCE' && adj.newBalance < adj.previousBalance ? adj.amount : 0,
      netDueEffect:
        adj.type === 'ADD_DUE'
          ? adj.amount
          : adj.type === 'PAYMENT_RECEIVED'
          ? -adj.amount
          : adj.newBalance - adj.previousBalance,
      entryType: adj.type,
    }));

    return [...saleEntries, ...adjustmentEntries].sort((a, b) => a.date.localeCompare(b.date));
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            Customers &amp; Wholesale Accounts (کسٹمرز اور بقایا جات)
          </h2>
          <p className="text-xs text-gray-500">
            Wholesale buyers, retail shops, collective payment dues, recovery entry, and customer ledgers.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {customers.length > 0 && (
            <button
              onClick={() => handleOpenDuesModal(undefined, 'ADD_DUE')}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg shadow-xs transition cursor-pointer"
              title="Add Collective Due Amount, Record Payment Recovery, or Edit Customer Balance"
            >
              <Wallet className="w-4 h-4 text-amber-700" />
              Add Collective Due / Payment (بقایا / وصولی)
            </button>
          )}
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {duesSuccessBanner && (
        <div className="flex items-center justify-between gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{duesSuccessBanner}</span>
          </div>
          <button
            onClick={() => setDuesSuccessBanner('')}
            className="text-emerald-600 hover:text-emerald-900 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500 block">Registered Customers</span>
          <span className="text-xl font-bold text-gray-900 mt-1 block">{customers.length}</span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">
            {customersWithDuesCount} accounts with active dues
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/30 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-700 block">
              Total Receivable Due (کل مارکیٹ بقایا)
            </span>
            <span className="text-xl font-bold text-amber-800 mt-1 block">
              {formatCurrency(totalReceivable, settings.currencySymbol)}
            </span>
            <span className="text-[11px] text-gray-500 mt-0.5 block">
              Click any customer&apos;s due to add collective amount or recovery
            </span>
          </div>
          {customers.length > 0 && (
            <button
              onClick={() => handleOpenDuesModal(undefined, 'ADD_DUE')}
              className="px-2.5 py-1.5 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-xs transition cursor-pointer shrink-0"
            >
              + Collective Entry
            </button>
          )}
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500 block">Search Customer</span>
          <div className="relative mt-2">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer, shop, area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Customers Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No Customers Found"
          description="Register your distributors, wholesalers, or retail shop clients."
          actionText="Add Customer"
          onAction={handleOpenAdd}
          icon={<Users className="w-6 h-6 text-teal-600" />}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Customer Name</th>
                  <th className="py-2.5 px-3">Shop / Market Name</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">City / Area</th>
                  <th className="py-2.5 px-3 text-right">Opening Bal.</th>
                  <th className="py-2.5 px-3 text-right">Current Due (Receivable)</th>
                  <th className="py-2.5 px-3">Notes</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-teal-50/20 transition">
                    <td className="py-2.5 px-3 font-bold text-gray-900">{c.name}</td>
                    <td className="py-2.5 px-3 text-gray-600 font-medium">{c.shopName || '-'}</td>
                    <td className="py-2.5 px-3 text-gray-600 font-mono">{c.phone || '-'}</td>
                    <td className="py-2.5 px-3 text-gray-600">{c.cityOrArea || '-'}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-gray-500">
                      {formatCurrency(c.openingBalance || 0, settings.currencySymbol)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <span
                          className={`font-mono font-bold text-sm ${
                            c.currentBalance > 0 ? 'text-amber-700' : 'text-emerald-700'
                          }`}
                        >
                          {formatCurrency(c.currentBalance, settings.currencySymbol)}
                        </span>
                        <button
                          onClick={() => handleOpenDuesModal(c, 'ADD_DUE')}
                          className="px-1.5 py-0.5 text-[10px] font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded transition cursor-pointer flex items-center gap-0.5"
                          title="Edit Payment Dues / Add Collective Amount / Record Recovery"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                          Edit Due
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-gray-500 italic max-w-xs truncate">{c.notes || '-'}</td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenDuesModal(c, 'ADD_DUE')}
                          className="px-2 py-1 text-[11px] font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-md border border-amber-200 transition cursor-pointer flex items-center gap-1"
                          title="Add Collective Due Amount or Record Payment Recovery"
                        >
                          <Wallet className="w-3 h-3 text-amber-700" /> Dues / Payment
                        </button>
                        <button
                          onClick={() => setSelectedCustomerForLedger(c)}
                          className="px-2 py-1 text-[11px] font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-md border border-teal-200 transition cursor-pointer flex items-center gap-1"
                          title="View Ledger Statement"
                        >
                          <BookOpen className="w-3 h-3" /> Ledger
                        </button>
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition cursor-pointer"
                          title="Edit Customer & Balances"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete customer "${c.name}"?`)) {
                              deleteCustomer(c.id);
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

      {/* COLLECTIVE DUES & PAYMENT ADJUSTMENT MODAL */}
      {isDuesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-gray-200 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-amber-50/70 rounded-t-xl">
              <div>
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-amber-700" />
                  Manage Payment Dues &amp; Collective Amount (بقایا جات اور وصولی)
                </h3>
                <p className="text-[11px] text-gray-500">
                  Add a lump-sum collective due, record payment received, or directly edit customer due balance.
                </p>
              </div>
              <button
                onClick={() => setIsDuesModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs overflow-y-auto">
              {duesError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg font-medium">
                  {duesError}
                </div>
              )}

              {/* Select Customer */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Select Customer Account *</label>
                <select
                  value={duesCustomerId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setDuesCustomerId(newId);
                    const found = customers.find((c) => c.id === newId);
                    if (dueMode === 'SET_BALANCE' && found) {
                      setDueAmount(found.currentBalance);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 font-semibold text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.shopName ? `(${c.shopName})` : ''} — Current Due:{' '}
                      {formatCurrency(c.currentBalance, settings.currencySymbol)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Mode Selector Tabs */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1.5">Select Adjustment Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDueMode('ADD_DUE');
                      setDueAmount(0);
                      setDuesError('');
                    }}
                    className={`p-2.5 rounded-lg border text-left transition cursor-pointer flex flex-col gap-1 ${
                      dueMode === 'ADD_DUE'
                        ? 'bg-amber-50 border-amber-500 text-amber-900 ring-1 ring-amber-500'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <PlusCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>+ Add Collective Due</span>
                    </div>
                    <span className="text-[10px] text-gray-500 leading-tight">
                      Add lump-sum bills/dues to existing balance
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDueMode('PAYMENT_RECEIVED');
                      setDueAmount(0);
                      setDuesError('');
                    }}
                    className={`p-2.5 rounded-lg border text-left transition cursor-pointer flex flex-col gap-1 ${
                      dueMode === 'PAYMENT_RECEIVED'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <MinusCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>- Receive Payment</span>
                    </div>
                    <span className="text-[10px] text-gray-500 leading-tight">
                      Deduct payment received from customer due
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDueMode('SET_BALANCE');
                      setDueAmount(selectedDuesCustomer ? selectedDuesCustomer.currentBalance : 0);
                      setDuesError('');
                    }}
                    className={`p-2.5 rounded-lg border text-left transition cursor-pointer flex flex-col gap-1 ${
                      dueMode === 'SET_BALANCE'
                        ? 'bg-teal-50 border-teal-500 text-teal-900 ring-1 ring-teal-500'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      <SlidersHorizontal className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>= Set Exact Due</span>
                    </div>
                    <span className="text-[10px] text-gray-500 leading-tight">
                      Directly overwrite total due balance
                    </span>
                  </button>
                </div>
              </div>

              {/* Live Calculation Summary Box */}
              {selectedDuesCustomer && (
                <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200 text-center">
                  <div>
                    <span className="text-[10px] uppercase text-gray-500 font-semibold block">
                      Previous Due
                    </span>
                    <span className="font-mono font-bold text-sm text-gray-800 mt-0.5 block">
                      {formatCurrency(selectedDuesCustomer.currentBalance, settings.currencySymbol)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-gray-500 font-semibold block">
                      {dueMode === 'ADD_DUE'
                        ? '+ Collective Added'
                        : dueMode === 'PAYMENT_RECEIVED'
                        ? '- Payment Received'
                        : 'Direct Override'}
                    </span>
                    <span
                      className={`font-mono font-bold text-sm mt-0.5 block ${
                        dueMode === 'ADD_DUE'
                          ? 'text-amber-700'
                          : dueMode === 'PAYMENT_RECEIVED'
                          ? 'text-emerald-700'
                          : 'text-teal-700'
                      }`}
                    >
                      {dueMode === 'ADD_DUE' ? '+' : dueMode === 'PAYMENT_RECEIVED' ? '-' : '='}{' '}
                      {formatCurrency(Number(dueAmount || 0), settings.currencySymbol)}
                    </span>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 py-1 px-2">
                    <span className="text-[10px] uppercase text-gray-500 font-semibold block">
                      New Total Due
                    </span>
                    <span className="font-mono font-bold text-sm text-amber-800 mt-0.5 block">
                      {formatCurrency(getPreviewNewBalance(), settings.currencySymbol)}
                    </span>
                  </div>
                </div>
              )}

              {/* Amount & Date Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-gray-700">
                      {dueMode === 'ADD_DUE'
                        ? `Collective Due Amount (${settings.currencySymbol}) *`
                        : dueMode === 'PAYMENT_RECEIVED'
                        ? `Payment Received (${settings.currencySymbol}) *`
                        : `New Total Due Balance (${settings.currencySymbol}) *`}
                    </label>
                    {dueMode === 'PAYMENT_RECEIVED' &&
                      selectedDuesCustomer &&
                      selectedDuesCustomer.currentBalance > 0 && (
                        <button
                          type="button"
                          onClick={() => setDueAmount(selectedDuesCustomer.currentBalance)}
                          className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                        >
                          Full Due ({formatCurrency(selectedDuesCustomer.currentBalance, settings.currencySymbol)})
                        </button>
                      )}
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={dueAmount === 0 && dueMode !== 'SET_BALANCE' ? '' : dueAmount}
                    onChange={(e) => {
                      setDueAmount(parseFloat(e.target.value) || 0);
                      setDuesError('');
                    }}
                    placeholder="Enter collective amount..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 font-mono text-sm font-bold text-right text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 font-mono text-gray-900"
                  />
                </div>
              </div>

              {/* Payment Mode & Cashbook Option (When Receiving Payment) */}
              {dueMode === 'PAYMENT_RECEIVED' && (
                <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Payment Mode</label>
                      <select
                        value={duePaymentMode}
                        onChange={(e) => setDuePaymentMode(e.target.value as 'Cash' | 'Bank')}
                        className="w-full px-2.5 py-1.5 rounded border border-gray-300 bg-white font-medium"
                      >
                        <option value="Cash">Cash (نقد)</option>
                        <option value="Bank">Bank / Online Transfer (بینک)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Receipt / Slip No.</label>
                      <input
                        type="text"
                        value={dueReference}
                        onChange={(e) => setDueReference(e.target.value)}
                        placeholder="Optional voucher/cheque #"
                        className="w-full px-2.5 py-1.5 rounded border border-gray-300 bg-white"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                    <input
                      type="checkbox"
                      checked={recordInCashbook}
                      onChange={(e) => setRecordInCashbook(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-gray-700 font-medium">
                      Automatically record this receipt as Cash IN in Daily Cashbook (روزنامچہ میں درج کریں)
                    </span>
                  </label>
                </div>
              )}

              {/* Reference & Notes for Add Due / Set Balance */}
              {dueMode !== 'PAYMENT_RECEIVED' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Reference / Bill Book No. (Optional)
                    </label>
                    <input
                      type="text"
                      value={dueReference}
                      onChange={(e) => setDueReference(e.target.value)}
                      placeholder="e.g. Khata Page #14, Bills #101-115"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Description / Notes
                    </label>
                    <input
                      type="text"
                      value={dueNotes}
                      onChange={(e) => setDueNotes(e.target.value)}
                      placeholder="e.g. Collective previous bills total"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300"
                    />
                  </div>
                </div>
              )}

              {dueMode === 'PAYMENT_RECEIVED' && (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Notes / Recovery Agent</label>
                  <input
                    type="text"
                    value={dueNotes}
                    onChange={(e) => setDueNotes(e.target.value)}
                    placeholder="e.g. Collective recovery via van salesman"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300"
                  />
                </div>
              )}

              {/* Recent Collective Dues / Payment History for Selected Customer */}
              {selectedDuesCustomer &&
                selectedDuesCustomer.dueAdjustments &&
                selectedDuesCustomer.dueAdjustments.length > 0 && (
                  <div className="border-t border-gray-200 pt-3">
                    <h4 className="font-bold text-gray-700 text-[11px] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <History className="w-3.5 h-3.5 text-gray-500" />
                      Recent Collective Entries &amp; Adjustments ({selectedDuesCustomer.dueAdjustments.length})
                    </h4>
                    <div className="max-h-36 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                      {selectedDuesCustomer.dueAdjustments.map((adj) => (
                        <div
                          key={adj.id}
                          className="flex items-center justify-between px-3 py-2 bg-white hover:bg-gray-50 text-[11px]"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                                  adj.type === 'ADD_DUE'
                                    ? 'bg-amber-100 text-amber-800'
                                    : adj.type === 'PAYMENT_RECEIVED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-teal-100 text-teal-800'
                                }`}
                              >
                                {adj.type === 'ADD_DUE'
                                  ? '+ Collective Due'
                                  : adj.type === 'PAYMENT_RECEIVED'
                                  ? '- Payment Received'
                                  : '= Balance Set'}
                              </span>
                              <span className="font-mono text-gray-500">{formatDate(adj.date)}</span>
                              {adj.referenceNo && (
                                <span className="font-mono text-gray-600 font-semibold">
                                  ({adj.referenceNo})
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 mt-0.5">{adj.notes || '-'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right font-mono">
                              <div className="font-bold text-gray-900">
                                {formatCurrency(adj.amount, settings.currencySymbol)}
                              </div>
                              <div className="text-[10px] text-gray-400">
                                Bal: {formatCurrency(adj.newBalance, settings.currencySymbol)}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteAdjustment(selectedDuesCustomer, adj)}
                              className="p-1 text-rose-500 hover:bg-rose-50 rounded cursor-pointer"
                              title="Revert & Delete this adjustment"
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

            <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDuesModalOpen(false)}
                className="px-3.5 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 font-medium text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDueAdjustment}
                className={`px-4 py-1.5 text-white rounded-lg font-semibold text-xs cursor-pointer shadow-xs ${
                  dueMode === 'ADD_DUE'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : dueMode === 'PAYMENT_RECEIVED'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-teal-600 hover:bg-teal-700'
                }`}
              >
                {dueMode === 'ADD_DUE'
                  ? 'Add Collective Due to Account'
                  : dueMode === 'PAYMENT_RECEIVED'
                  ? 'Save Payment Recovery'
                  : 'Update Total Due Balance'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT CUSTOMER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
              <h3 className="font-bold text-gray-900 text-sm">
                {editingId ? 'Edit Customer & Payment Dues' : 'Add Customer'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              {formError && (
                <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg font-medium">
                  {formError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Customer / Owner Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setFormError('');
                  }}
                  placeholder="e.g. Tariq Mehmood"
                  className="w-full px-2.5 py-1.5 rounded border border-gray-300 font-medium text-gray-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Shop / Store Name</label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="e.g. Tariq General Store, Nimko House"
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
                    placeholder="e.g. 0300-9876543"
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Opening Due ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={openingBalance === 0 ? '' : openingBalance}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setOpeningBalance(val);
                      if (!editingId) {
                        setCurrentBalanceInput(val);
                      }
                    }}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300 font-mono text-right"
                  />
                </div>
              </div>

              {/* Payment Dues / Collective Amount Section inside Edit/Add Modal */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-amber-700" />
                    Payment Dues &amp; Collective Amount
                  </span>
                  <span className="font-mono font-bold text-amber-800 text-xs">
                    Final Due:{' '}
                    {formatCurrency(
                      (editingId ? Number(currentBalanceInput || 0) : Number(openingBalance || 0)) +
                        Number(collectiveAddInEdit || 0),
                      settings.currencySymbol
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {editingId && (
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1 text-[11px]">
                        Current Due Balance ({settings.currencySymbol})
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={currentBalanceInput === 0 ? '' : currentBalanceInput}
                        onChange={(e) => setCurrentBalanceInput(parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full px-2.5 py-1.5 rounded border border-amber-300 bg-white font-mono font-bold text-right text-gray-900"
                      />
                    </div>
                  )}
                  <div className={editingId ? '' : 'sm:col-span-2'}>
                    <label className="block font-semibold text-amber-900 mb-1 text-[11px]">
                      + Add Collective Amount to Due ({settings.currencySymbol})
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={collectiveAddInEdit === 0 ? '' : collectiveAddInEdit}
                      onChange={(e) => setCollectiveAddInEdit(parseFloat(e.target.value) || 0)}
                      placeholder="Enter lump-sum amount to add..."
                      className="w-full px-2.5 py-1.5 rounded border border-amber-300 bg-white font-mono font-bold text-right text-amber-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">City / Market / Route Area</label>
                <input
                  type="text"
                  value={cityOrArea}
                  onChange={(e) => setCityOrArea(e.target.value)}
                  placeholder="e.g. Anarkali Bazaar, Sector F-10, Faisalabad"
                  className="w-full px-2.5 py-1.5 rounded border border-gray-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Notes / Delivery Van Route</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Van delivery day: Tuesday/Friday, special discount rate..."
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
                className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                Save Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER LEDGER STATEMENT MODAL */}
      {selectedCustomerForLedger && (
        <PrintModal
          isOpen={!!selectedCustomerForLedger}
          onClose={() => setSelectedCustomerForLedger(null)}
          title={`Customer Statement: ${selectedCustomerForLedger.name}`}
        >
          <div className="p-4 sm:p-6 text-black bg-white">
            <PrintHeader
              title="CUSTOMER ACCOUNT STATEMENT / RECOVERY SHEET"
              subtitle={`Client: ${selectedCustomerForLedger.name} ${
                selectedCustomerForLedger.shopName ? `| ${selectedCustomerForLedger.shopName}` : ''
              }`}
              date={getTodayDateString()}
            />

            <div className="grid grid-cols-2 gap-3 text-xs mb-4 border border-black p-2 bg-gray-50">
              <div>
                <p>
                  <span className="font-bold">Phone:</span> {selectedCustomerForLedger.phone || '-'}
                </p>
                <p>
                  <span className="font-bold">Market / Area:</span>{' '}
                  {selectedCustomerForLedger.cityOrArea || '-'}
                </p>
              </div>
              <div className="text-right">
                <p>
                  <span className="font-bold">Opening Balance:</span>{' '}
                  {formatCurrency(selectedCustomerForLedger.openingBalance || 0, settings.currencySymbol)}
                </p>
                <p>
                  <span className="font-bold text-amber-900 text-sm">Total Current Balance Due:</span>{' '}
                  {formatCurrency(selectedCustomerForLedger.currentBalance, settings.currencySymbol)}
                </p>
              </div>
            </div>

            <table className="w-full text-xs border-collapse border border-black mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black py-1.5 px-2 text-center w-10">S.#</th>
                  <th className="border border-black py-1.5 px-2 text-left w-24">DATE</th>
                  <th className="border border-black py-1.5 px-2 text-left w-28">REF / INVOICE</th>
                  <th className="border border-black py-1.5 px-2 text-left">PARTICULARS / DETAILS</th>
                  <th className="border border-black py-1.5 px-2 text-right w-28">BILLED / ADDED</th>
                  <th className="border border-black py-1.5 px-2 text-right w-28">RECEIVED</th>
                  <th className="border border-black py-1.5 px-2 text-right w-28">NET DUE EFFECT</th>
                </tr>
              </thead>
              <tbody>
                {getCustomerLedger(selectedCustomerForLedger).length === 0 ? (
                  <tr>
                    <td colSpan={7} className="border border-black py-4 px-2 text-center text-gray-500">
                      No individual invoices or collective adjustments recorded yet. Current Balance Due:{' '}
                      {formatCurrency(selectedCustomerForLedger.currentBalance, settings.currencySymbol)}
                    </td>
                  </tr>
                ) : (
                  getCustomerLedger(selectedCustomerForLedger).map((entry, idx) => (
                    <tr key={entry.id || idx} className="border-b border-gray-300">
                      <td className="border border-black py-1 px-2 text-center">{idx + 1}</td>
                      <td className="border border-black py-1 px-2 font-mono">{formatDate(entry.date)}</td>
                      <td className="border border-black py-1 px-2 font-bold font-mono">{entry.refNo}</td>
                      <td className="border border-black py-1 px-2">{entry.description}</td>
                      <td className="border border-black py-1 px-2 text-right font-mono font-bold">
                        {entry.totalBilled > 0
                          ? formatCurrency(entry.totalBilled, settings.currencySymbol)
                          : '-'}
                      </td>
                      <td className="border border-black py-1 px-2 text-right font-mono text-emerald-800 font-bold">
                        {entry.received > 0 ? formatCurrency(entry.received, settings.currencySymbol) : '-'}
                      </td>
                      <td className="border border-black py-1 px-2 text-right font-mono text-amber-900 font-bold">
                        {entry.netDueEffect >= 0
                          ? `+${formatCurrency(entry.netDueEffect, settings.currencySymbol)}`
                          : `-${formatCurrency(Math.abs(entry.netDueEffect), settings.currencySymbol)}`}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="mt-8 pt-4 flex justify-between items-end text-xs">
              <div className="text-center w-48 border-t border-black pt-1">
                <p className="font-bold">Customer Signature / Stamp</p>
              </div>
              <div className="text-center w-48 border-t border-black pt-1">
                <p className="font-bold">Sales / Recovery Agent</p>
              </div>
            </div>
          </div>
        </PrintModal>
      )}
    </div>
  );
};

