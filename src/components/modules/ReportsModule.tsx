import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Factory,
  Boxes,
  Users,
  Flame,
  Filter,
} from 'lucide-react';
import { useFactory } from '../../context/FactoryContext';
import { formatCurrency, formatDate, getTodayDateString } from '../../utils/formatters';
import { PrintModal } from '../common/PrintModal';
import { PrintHeader } from '../common/PrintHeader';

type ReportType =
  | 'pnl'
  | 'sales'
  | 'production'
  | 'expenses'
  | 'customers'
  | 'suppliers'
  | 'wastage';

export const ReportsModule: React.FC = () => {
  const {
    settings,
    orders,
    productionBatches,
    purchases,
    expenses,
    salaryPayments,
    customers,
    suppliers,
    stockItems,
    wastageRecords,
  } = useFactory();

  const [activeReport, setActiveReport] = useState<ReportType>('pnl');

  // Date Range (default first day of current month to today)
  const today = getTodayDateString();
  const firstDayOfMonth = today.slice(0, 8) + '01';

  const [fromDate, setFromDate] = useState(firstDayOfMonth);
  const [toDate, setToDate] = useState(today);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const setRangePreset = (preset: 'today' | 'this_month' | 'all') => {
    if (preset === 'today') {
      setFromDate(today);
      setToDate(today);
    } else if (preset === 'this_month') {
      setFromDate(firstDayOfMonth);
      setToDate(today);
    } else {
      setFromDate('2000-01-01');
      setToDate(today);
    }
  };

  // Helper date filter
  const isInRange = (d: string) => d >= fromDate && d <= toDate;

  // Filtered collections
  const filteredOrders = orders.filter((o) => isInRange(o.date));
  const filteredProduction = productionBatches.filter((b) => isInRange(b.date));
  const filteredPurchases = purchases.filter((p) => isInRange(p.date));
  const filteredExpenses = expenses.filter((e) => isInRange(e.date));
  const filteredSalaries = salaryPayments.filter((s) => isInRange(s.paymentDate || s.date || ''));
  const filteredWastage = wastageRecords.filter((w) => isInRange(w.date));

  // P&L Calculations
  const totalSalesRevenue = filteredOrders.reduce((sum, o) => sum + (o.grandTotal ?? o.totalAmount ?? 0), 0);
  const totalPurchasesCost = filteredPurchases.reduce((sum, p) => sum + (p.totalAmount ?? 0), 0);
  const totalExpensesCost = filteredExpenses.reduce((sum, e) => sum + (e.amount ?? 0), 0);
  const totalSalariesCost = filteredSalaries.reduce((sum, s) => sum + (s.netSalary ?? s.amountPaid ?? 0), 0);
  const totalWastageCost = filteredWastage.reduce((sum, w) => sum + (w.estimatedCost ?? w.estimatedLoss ?? 0), 0);

  const totalCostOfOperations =
    totalPurchasesCost + totalExpensesCost + totalSalariesCost + totalWastageCost;
  const netProfitOrLoss = totalSalesRevenue - totalCostOfOperations;

  // Expense grouping by category
  const expenseByCategory: Record<string, number> = filteredExpenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            Factory Analytical Reports &amp; Statements
          </h2>
          <p className="text-xs text-gray-500">
            Profit &amp; Loss accounts, sales summaries, batch yields, customer ledgers, and expense breakdowns.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Report Sheet
          </button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white p-3 rounded-xl border border-gray-200">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto text-xs">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-gray-700">From:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-2.5 py-1 rounded border border-gray-300 font-mono"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-700">To:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-2.5 py-1 rounded border border-gray-300 font-mono"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
          <button
            onClick={() => setRangePreset('today')}
            className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={() => setRangePreset('this_month')}
            className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition cursor-pointer"
          >
            This Month
          </button>
          <button
            onClick={() => setRangePreset('all')}
            className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition cursor-pointer"
          >
            All Time
          </button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { id: 'pnl', label: 'Profit & Loss Statement', icon: TrendingUp },
          { id: 'sales', label: 'Sales & Revenue', icon: ShoppingCart },
          { id: 'production', label: 'Production Batches', icon: Factory },
          { id: 'expenses', label: 'Expense Breakdown', icon: DollarSign },
          { id: 'customers', label: 'Customer Receivables', icon: Users },
          { id: 'suppliers', label: 'Supplier Payables', icon: Boxes },
          { id: 'wastage', label: 'Wastage & Scrap Audit', icon: Flame },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id as ReportType)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ACTIVE REPORT CONTENT */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-xs">
        {/* REPORT 1: PROFIT & LOSS */}
        {activeReport === 'pnl' && (
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-3 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Statement of Profit &amp; Loss</h3>
                <p className="text-xs text-gray-500">
                  Period: {formatDate(fromDate)} to {formatDate(toDate)}
                </p>
              </div>
              <span
                className={`text-sm font-bold font-mono px-3 py-1 rounded-lg ${
                  netProfitOrLoss >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                Net: {formatCurrency(netProfitOrLoss, settings.currencySymbol)}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <tbody className="divide-y divide-gray-200 text-gray-800">
                  {/* Revenue */}
                  <tr className="bg-gray-50 font-bold text-gray-900">
                    <td className="py-2.5 px-3" colSpan={2}>
                      1. OPERATING REVENUE / SALES
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-700">
                      {formatCurrency(totalSalesRevenue, settings.currencySymbol)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-6 text-gray-600">Gross Invoiced Product Sales ({filteredOrders.length} orders)</td>
                    <td className="py-2 px-3 text-right text-gray-500 font-mono">
                      {formatCurrency(totalSalesRevenue, settings.currencySymbol)}
                    </td>
                    <td></td>
                  </tr>

                  {/* COGS & Purchases */}
                  <tr className="bg-gray-50 font-bold text-gray-900">
                    <td className="py-2.5 px-3" colSpan={2}>
                      2. DIRECT PRODUCTION &amp; MATERIAL PURCHASES
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-rose-700">
                      -{formatCurrency(totalPurchasesCost, settings.currencySymbol)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-6 text-gray-600">
                      Raw Materials &amp; Packaging Bills ({filteredPurchases.length} invoices)
                    </td>
                    <td className="py-2 px-3 text-right text-gray-500 font-mono">
                      {formatCurrency(totalPurchasesCost, settings.currencySymbol)}
                    </td>
                    <td></td>
                  </tr>

                  {/* Operating Overheads */}
                  <tr className="bg-gray-50 font-bold text-gray-900">
                    <td className="py-2.5 px-3" colSpan={2}>
                      3. FACTORY OVERHEADS &amp; OPERATING EXPENSES
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-rose-700">
                      -{formatCurrency(totalExpensesCost, settings.currencySymbol)}
                    </td>
                  </tr>
                  {Object.entries(expenseByCategory).map(([cat, amt]) => (
                    <tr key={cat}>
                      <td className="py-1.5 px-6 text-gray-600">• {cat}</td>
                      <td className="py-1.5 px-3 text-right text-gray-500 font-mono">
                        {formatCurrency(Number(amt), settings.currencySymbol)}
                      </td>
                      <td></td>
                    </tr>
                  ))}

                  {/* Labor / Salaries */}
                  <tr className="bg-gray-50 font-bold text-gray-900">
                    <td className="py-2.5 px-3" colSpan={2}>
                      4. FACTORY PAYROLL &amp; WORKER WAGES
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-rose-700">
                      -{formatCurrency(totalSalariesCost, settings.currencySymbol)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-6 text-gray-600">
                      Staff Salaries, Overtime &amp; Daily Wages ({filteredSalaries.length} slips)
                    </td>
                    <td className="py-2 px-3 text-right text-gray-500 font-mono">
                      {formatCurrency(totalSalariesCost, settings.currencySymbol)}
                    </td>
                    <td></td>
                  </tr>

                  {/* Wastage / Scrap */}
                  <tr className="bg-gray-50 font-bold text-gray-900">
                    <td className="py-2.5 px-3" colSpan={2}>
                      5. WASTAGE &amp; PRODUCTION SCRAP LOSS
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-rose-700">
                      -{formatCurrency(totalWastageCost, settings.currencySymbol)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-6 text-gray-600">
                      Damaged goods, burnt product, scrap packaging ({filteredWastage.length} logs)
                    </td>
                    <td className="py-2 px-3 text-right text-gray-500 font-mono">
                      {formatCurrency(totalWastageCost, settings.currencySymbol)}
                    </td>
                    <td></td>
                  </tr>

                  {/* NET RESULT */}
                  <tr className="border-t-2 border-gray-400 bg-gray-100 font-bold text-sm">
                    <td className="py-3 px-3">NET OPERATING SURPLUS / (DEFICIT)</td>
                    <td className="py-3 px-3 text-right font-mono text-gray-500">
                      Margin: {totalSalesRevenue > 0 ? ((netProfitOrLoss / totalSalesRevenue) * 100).toFixed(1) : 0}%
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-mono text-base ${
                        netProfitOrLoss >= 0 ? 'text-emerald-800' : 'text-rose-800'
                      }`}
                    >
                      {formatCurrency(netProfitOrLoss, settings.currencySymbol)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REPORT 2: SALES SUMMARY */}
        {activeReport === 'sales' && (
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-3 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Sales &amp; Revenue Orders Report</h3>
                <p className="text-xs text-gray-500">
                  {filteredOrders.length} orders totaling {formatCurrency(totalSalesRevenue, settings.currencySymbol)}
                </p>
              </div>
            </div>

            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase">
                <tr>
                  <th className="py-2 px-3">Invoice #</th>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Customer</th>
                  <th className="py-2 px-3 text-right">Items Qty</th>
                  <th className="py-2 px-3 text-right">Bill Total</th>
                  <th className="py-2 px-3 text-right">Cash Received</th>
                  <th className="py-2 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {filteredOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="py-2 px-3 font-mono font-bold text-amber-700">{o.orderNumber || o.invoiceNo}</td>
                    <td className="py-2 px-3 font-mono text-gray-500">{formatDate(o.date)}</td>
                    <td className="py-2 px-3 font-semibold text-gray-900">{o.customerName}</td>
                    <td className="py-2 px-3 text-right font-mono">
                      {o.items?.reduce((s, i) => s + (i.quantity ?? (i as any).qty ?? 0), 0) || 0}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold">
                      {formatCurrency(o.grandTotal ?? o.totalAmount ?? 0, settings.currencySymbol)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-emerald-700">
                      {formatCurrency(o.paidAmount ?? 0, settings.currencySymbol)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          o.paymentStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.paymentStatus === 'partial'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {o.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 3: PRODUCTION BATCHES */}
        {activeReport === 'production' && (
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-3">
              <h3 className="font-bold text-gray-900 text-base">Production Batch Yield Report</h3>
              <p className="text-xs text-gray-500">
                {filteredProduction.length} batches logged in selected date range
              </p>
            </div>

            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase">
                <tr>
                  <th className="py-2 px-3">Batch #</th>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Product Name</th>
                  <th className="py-2 px-3 text-right">Output Yield</th>
                  <th className="py-2 px-3 text-center">Unit</th>
                  <th className="py-2 px-3 text-right">Raw Material Cost</th>
                  <th className="py-2 px-3 text-right">Unit Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {filteredProduction.map((b) => (
                  <tr key={b.id}>
                    <td className="py-2 px-3 font-mono font-bold text-indigo-700">{b.batchNumber || b.batchNo}</td>
                    <td className="py-2 px-3 font-mono text-gray-500">{formatDate(b.date)}</td>
                    <td className="py-2 px-3 font-semibold text-gray-900">{b.productName}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold">{b.outputQuantity ?? b.producedQty ?? 0}</td>
                    <td className="py-2 px-3 text-center text-gray-500">{b.unit || b.outputUnit || 'carton'}</td>
                    <td className="py-2 px-3 text-right font-mono">
                      {formatCurrency(b.totalCost || 0, settings.currencySymbol)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold">
                      {formatCurrency(b.costPerUnit ?? b.perUnitCost ?? 0, settings.currencySymbol)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 4: EXPENSES */}
        {activeReport === 'expenses' && (
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-3 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Expense Breakdown Summary</h3>
                <p className="text-xs text-gray-500">
                  Total overhead expenditures: {formatCurrency(totalExpensesCost, settings.currencySymbol)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <h4 className="font-bold text-xs text-gray-700 mb-2 uppercase tracking-wider">
                  By Category Breakdown
                </h4>
                <div className="space-y-2">
                  {Object.entries(expenseByCategory).map(([cat, amt]) => (
                    <div key={cat} className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-gray-700">{cat}</span>
                      <span className="font-mono font-bold text-gray-900">
                        {formatCurrency(Number(amt), settings.currencySymbol)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-3 overflow-y-auto max-h-72">
                <h4 className="font-bold text-xs text-gray-700 mb-2 uppercase tracking-wider">
                  Detailed Vouchers
                </h4>
                <div className="space-y-1.5">
                  {filteredExpenses.map((e) => (
                    <div key={e.id} className="text-xs p-1.5 rounded bg-gray-50 border border-gray-200">
                      <div className="flex justify-between font-semibold">
                        <span>{e.category} ({e.paidTo || 'N/A'})</span>
                        <span className="font-mono text-rose-700">
                          {formatCurrency(e.amount, settings.currencySymbol)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] text-gray-500">
                        <span>{formatDate(e.date)}</span>
                        <span>{e.notes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REPORT 5: CUSTOMER RECEIVABLES */}
        {activeReport === 'customers' && (
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-3 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Customer Balances &amp; Receivables Ledger</h3>
                <p className="text-xs text-gray-500">
                  Total Market Receivables: {formatCurrency(
                    customers.reduce((sum, c) => sum + Math.max(0, c.currentBalance), 0),
                    settings.currencySymbol
                  )}
                </p>
              </div>
            </div>

            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase">
                <tr>
                  <th className="py-2 px-3">Customer / Shop Name</th>
                  <th className="py-2 px-3">City / Area</th>
                  <th className="py-2 px-3">Phone</th>
                  <th className="py-2 px-3 text-right">Outstanding Balance (Payable by Client)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2 px-3 font-bold text-gray-900">{c.name}</td>
                    <td className="py-2 px-3 text-gray-600">{c.city || '-'}</td>
                    <td className="py-2 px-3 font-mono text-gray-500">{c.phone || '-'}</td>
                    <td
                      className={`py-2 px-3 text-right font-mono font-bold ${
                        c.currentBalance > 0 ? 'text-rose-700' : 'text-emerald-700'
                      }`}
                    >
                      {formatCurrency(c.currentBalance, settings.currencySymbol)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 6: SUPPLIER PAYABLES */}
        {activeReport === 'suppliers' && (
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-3 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Supplier Payables Ledger</h3>
                <p className="text-xs text-gray-500">
                  Total Outstanding to Vendors: {formatCurrency(
                    suppliers.reduce((sum, s) => sum + Math.max(0, s.currentBalance), 0),
                    settings.currencySymbol
                  )}
                </p>
              </div>
            </div>

            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase">
                <tr>
                  <th className="py-2 px-3">Supplier Name</th>
                  <th className="py-2 px-3">Supplying Material</th>
                  <th className="py-2 px-3">Contact #</th>
                  <th className="py-2 px-3 text-right">Our Payable Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {suppliers.map((s) => (
                  <tr key={s.id}>
                    <td className="py-2 px-3 font-bold text-gray-900">{s.name}</td>
                    <td className="py-2 px-3 text-gray-600">{s.category || 'Vendor'}</td>
                    <td className="py-2 px-3 font-mono text-gray-500">{s.phone || '-'}</td>
                    <td
                      className={`py-2 px-3 text-right font-mono font-bold ${
                        s.currentBalance > 0 ? 'text-rose-700' : 'text-emerald-700'
                      }`}
                    >
                      {formatCurrency(s.currentBalance, settings.currencySymbol)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 7: WASTAGE */}
        {activeReport === 'wastage' && (
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-3 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Factory Wastage &amp; Damage Audit</h3>
                <p className="text-xs text-gray-500">
                  Total scrap valuation loss: {formatCurrency(totalWastageCost, settings.currencySymbol)}
                </p>
              </div>
            </div>

            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase">
                <tr>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Item Name</th>
                  <th className="py-2 px-3 text-right">Quantity</th>
                  <th className="py-2 px-3 text-center">Unit</th>
                  <th className="py-2 px-3 text-right">Loss Cost</th>
                  <th className="py-2 px-3">Reason / Cause</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {filteredWastage.map((w) => (
                  <tr key={w.id}>
                    <td className="py-2 px-3 font-mono text-gray-500">{formatDate(w.date)}</td>
                    <td className="py-2 px-3 font-bold text-gray-900">{w.itemName}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-rose-600">{w.quantity}</td>
                    <td className="py-2 px-3 text-center text-gray-500">{w.unit}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold">
                      {formatCurrency(w.estimatedCost, settings.currencySymbol)}
                    </td>
                    <td className="py-2 px-3 text-gray-600">{w.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PRINTABLE REPORT MODAL */}
      {isPrintModalOpen && (
        <PrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title={`Factory Report: ${activeReport.toUpperCase()}`}
        >
          <div className="p-4 sm:p-6 text-black bg-white">
            <PrintHeader
              title={`FACTORY AUDIT & SUMMARY REPORT: ${activeReport.toUpperCase()}`}
              subtitle={`Period: ${formatDate(fromDate)} to ${formatDate(toDate)}`}
              date={getTodayDateString()}
            />

            {/* P&L Print View */}
            {activeReport === 'pnl' && (
              <table className="w-full text-xs border-collapse border border-black mb-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-black py-1.5 px-2 text-left">ACCOUNT DESCRIPTION</th>
                    <th className="border border-black py-1.5 px-2 text-right w-36">AMOUNT ({settings.currencySymbol})</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-black py-1.5 px-2 font-bold">1. GROSS SALES REVENUE</td>
                    <td className="border border-black py-1.5 px-2 text-right font-mono font-bold text-emerald-900">
                      {formatCurrency(totalSalesRevenue, settings.currencySymbol)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black py-1.5 px-2 font-bold">2. DIRECT PURCHASES (RAW MATERIAL & PACKAGING)</td>
                    <td className="border border-black py-1.5 px-2 text-right font-mono text-rose-900">
                      -{formatCurrency(totalPurchasesCost, settings.currencySymbol)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black py-1.5 px-2 font-bold">3. FACTORY OVERHEAD EXPENSES</td>
                    <td className="border border-black py-1.5 px-2 text-right font-mono text-rose-900">
                      -{formatCurrency(totalExpensesCost, settings.currencySymbol)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black py-1.5 px-2 font-bold">4. LABOR & EMPLOYEE WAGES</td>
                    <td className="border border-black py-1.5 px-2 text-right font-mono text-rose-900">
                      -{formatCurrency(totalSalariesCost, settings.currencySymbol)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black py-1.5 px-2 font-bold">5. PRODUCTION SCRAP & DAMAGED WASTAGE</td>
                    <td className="border border-black py-1.5 px-2 text-right font-mono text-rose-900">
                      -{formatCurrency(totalWastageCost, settings.currencySymbol)}
                    </td>
                  </tr>
                  <tr className="border-t-2 border-black bg-gray-200 font-bold text-sm">
                    <td className="border border-black py-2 px-2">NET OPERATING PROFIT / (LOSS):</td>
                    <td className="border border-black py-2 px-2 text-right font-mono">
                      {formatCurrency(netProfitOrLoss, settings.currencySymbol)}
                    </td>
                  </tr>
                </tbody>
              </table>
            )}

            {/* Other reports in print modal */}
            {activeReport !== 'pnl' && (
              <p className="text-xs italic mb-4">
                Detailed statement for {activeReport.toUpperCase()} as presented on factory dashboard for period {formatDate(fromDate)} to {formatDate(toDate)}.
              </p>
            )}

            <div className="mt-12 pt-4 flex justify-between items-end text-xs">
              <div className="text-center w-44 border-t border-black pt-1">
                <p className="font-bold">Prepared By / Accountant</p>
              </div>
              <div className="text-center w-44 border-t border-black pt-1">
                <p className="font-bold">Auditor Sign</p>
              </div>
              <div className="text-center w-44 border-t border-black pt-1">
                <p className="font-bold">Proprietor / Sign</p>
              </div>
            </div>
          </div>
        </PrintModal>
      )}
    </div>
  );
};
