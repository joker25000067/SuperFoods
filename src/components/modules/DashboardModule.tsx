import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ShoppingCart,
  Factory,
  Package,
  Users,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen,
  Boxes,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { useFactory } from '../../context/FactoryContext';
import { formatCurrency, formatDate, getTodayDateString } from '../../utils/formatters';

interface DashboardModuleProps {
  onNavigate: (tabId: string) => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({ onNavigate }) => {
  const {
    settings,
    orders = [],
    productionBatches = [],
    purchases = [],
    expenses = [],
    salaryPayments = [],
    customers = [],
    suppliers = [],
    stockItems = [],
    employees = [],
    attendanceRecords = [],
    cashbookEntries = [],
  } = useFactory();

  const todayStr = getTodayDateString();
  const currentMonthPrefix = todayStr.substring(0, 7); // "YYYY-MM"

  // Today's Sales
  const todayOrders = orders.filter((o) => o?.date === todayStr);
  const todaySalesAmount = todayOrders.reduce((sum, o) => sum + (o?.grandTotal ?? o?.totalAmount ?? 0), 0);

  // Month-to-Date Sales
  const monthOrders = orders.filter((o) => (o?.date || '').startsWith(currentMonthPrefix));
  const monthSalesAmount = monthOrders.reduce((sum, o) => sum + (o?.grandTotal ?? o?.totalAmount ?? 0), 0);

  // Today's Production
  const todayBatches = productionBatches.filter((b) => b?.date === todayStr);
  const todayProductionUnits = todayBatches.reduce((sum, b) => sum + (b?.outputQuantity ?? b?.producedQty ?? 0), 0);

  // Month-to-Date Purchases
  const monthPurchases = purchases.filter((p) => (p?.date || '').startsWith(currentMonthPrefix));
  const monthPurchasesAmount = monthPurchases.reduce((sum, p) => sum + (p?.totalAmount ?? 0), 0);

  // Month-to-Date Expenses
  const monthExpenses = expenses.filter((e) => (e?.date || '').startsWith(currentMonthPrefix));
  const monthExpensesAmount = monthExpenses.reduce((sum, e) => sum + (e?.amount ?? 0), 0);

  // Month-to-Date Salaries
  const monthSalaries = salaryPayments.filter((s) => (s?.paymentDate || s?.date || '').startsWith(currentMonthPrefix));
  const monthSalariesAmount = monthSalaries.reduce((sum, s) => sum + (s?.netSalary ?? s?.netPaid ?? 0), 0);

  // Receivables & Payables
  const totalReceivables = customers.reduce((sum, c) => sum + Math.max(0, c?.currentBalance ?? 0), 0);
  const totalPayables = suppliers.reduce((sum, s) => sum + Math.max(0, s?.currentBalance ?? 0), 0);

  // Estimated Gross Profit / Operating Profit this month
  const monthOperatingExpenses = monthPurchasesAmount + monthExpensesAmount + monthSalariesAmount;
  const monthNetProfit = monthSalesAmount - monthOperatingExpenses;

  // Low Stock Items
  const lowStockItems = stockItems.filter(
    (i) => (i?.currentQuantity ?? i?.stock ?? 0) <= (i?.minAlertQuantity ?? i?.alertLevel ?? 0)
  );

  // Today's Cash Flow
  const todayCashIn = cashbookEntries
    .filter((e) => e?.date === todayStr && (e?.type || '').toLowerCase() === 'in')
    .reduce((sum, e) => sum + (e?.amount ?? 0), 0);

  const todayCashOut = cashbookEntries
    .filter((e) => e?.date === todayStr && (e?.type || '').toLowerCase() === 'out')
    .reduce((sum, e) => sum + (e?.amount ?? 0), 0);

  // Today's Attendance
  const activeEmployees = employees.filter((e) => e?.status === 'active' || e?.active === true);
  const todayAttendance = attendanceRecords.filter((a) => a?.date === todayStr);
  const presentCount = todayAttendance.filter((a) => (a?.status || '').toLowerCase() === 'present').length;

  // Last 7 days chart data
  const last7Days: { date: string; label: string; sales: number; production: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('default', { weekday: 'short' });

    const daySales = orders
      .filter((o) => o?.date === dateKey)
      .reduce((sum, o) => sum + (o?.grandTotal ?? o?.totalAmount ?? 0), 0);

    const dayProd = productionBatches
      .filter((b) => b?.date === dateKey)
      .reduce((sum, b) => sum + (b?.outputQuantity ?? b?.producedQty ?? 0), 0);

    last7Days.push({
      date: dateKey,
      label: dayName,
      sales: daySales,
      production: dayProd,
    });
  }

  const maxDailySales = Math.max(...last7Days.map((d) => d.sales), 1000);

  return (
    <div className="space-y-5">
      {/* Factory Welcome Header */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900">{settings.factoryName}</h2>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-emerald-100 text-emerald-800 tracking-wider">
              100% Offline Safe
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {settings.factoryAddress || 'Factory Operations'} • Owner: {settings.ownerName || 'Management'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('sales')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> New Order Sheet
          </button>
          <button
            onClick={() => onNavigate('production')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition cursor-pointer"
          >
            <Factory className="w-3.5 h-3.5" /> Start Batch
          </button>
          <button
            onClick={() => onNavigate('cashbook')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" /> Cashbook
          </button>
        </div>
      </div>

      {/* Critical Low Stock Warning Alert (if any) */}
      {lowStockItems.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-rose-900 text-sm">
              Low Stock Warning: {lowStockItems.length} items below minimum safety threshold!
            </h4>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {lowStockItems.slice(0, 6).map((item) => (
                <span
                  key={item.id}
                  className="px-2 py-0.5 bg-white border border-rose-200 rounded text-rose-800 font-semibold font-mono"
                >
                  {item.name}: {item.currentQuantity} {item.unit} (Min: {item.minAlertQuantity})
                </span>
              ))}
              {lowStockItems.length > 6 && (
                <span className="text-rose-700 font-semibold self-center">
                  +{lowStockItems.length - 6} more
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => onNavigate('stock')}
            className="text-xs font-bold text-rose-700 hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
          >
            Check Stock <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Today's Sales */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500">Today's Sales</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-gray-900 block">
              {formatCurrency(todaySalesAmount, settings.currencySymbol)}
            </span>
            <span className="text-xs text-gray-500 mt-1 block">
              {todayOrders.length} order{todayOrders.length === 1 ? '' : 's'} recorded today
            </span>
          </div>
        </div>

        {/* This Month's Revenue */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500">Month's Total Sales</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-emerald-700 block">
              {formatCurrency(monthSalesAmount, settings.currencySymbol)}
            </span>
            <span className="text-xs text-gray-500 mt-1 block">
              {monthOrders.length} total orders this month
            </span>
          </div>
        </div>

        {/* Customer Receivables */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500">Customer Dues (Receivables)</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-blue-700 block">
              {formatCurrency(totalReceivables, settings.currencySymbol)}
            </span>
            <span className="text-xs text-gray-500 mt-1 block">
              Owed by {customers.filter((c) => c.currentBalance > 0).length} market clients
            </span>
          </div>
        </div>

        {/* Supplier Payables */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-gray-500">Supplier Dues (Payables)</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-rose-700 block">
              {formatCurrency(totalPayables, settings.currencySymbol)}
            </span>
            <span className="text-xs text-gray-500 mt-1 block">
              To be paid to {suppliers.filter((s) => s.currentBalance > 0).length} vendors
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Net Monthly Profit Indicator */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-gray-500">Estimated Monthly Net Result</span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded ${
                monthNetProfit >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {monthNetProfit >= 0 ? 'Operating Surplus' : 'Operating Deficit'}
            </span>
          </div>
          <span
            className={`text-xl font-bold font-mono mt-1 block ${
              monthNetProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {formatCurrency(monthNetProfit, settings.currencySymbol)}
          </span>
          <div className="text-[11px] text-gray-500 mt-2 space-y-0.5">
            <div className="flex justify-between">
              <span>Gross Sales:</span>
              <span className="font-mono">{formatCurrency(monthSalesAmount, settings.currencySymbol)}</span>
            </div>
            <div className="flex justify-between text-rose-600">
              <span>Operating Costs (Purchases+Exp+Salaries):</span>
              <span className="font-mono">-{formatCurrency(monthOperatingExpenses, settings.currencySymbol)}</span>
            </div>
          </div>
        </div>

        {/* Today's Cash Movement */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-semibold text-gray-500 block mb-1">Today's Cash Movement</span>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
              <span className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
                <ArrowDownLeft className="w-3 h-3" /> Cash IN
              </span>
              <span className="text-base font-bold font-mono text-emerald-700 block mt-0.5">
                {formatCurrency(todayCashIn, settings.currencySymbol)}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-100">
              <span className="text-[11px] font-semibold text-rose-800 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> Cash OUT
              </span>
              <span className="text-base font-bold font-mono text-rose-700 block mt-0.5">
                {formatCurrency(todayCashOut, settings.currencySymbol)}
              </span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('cashbook')}
            className="w-full mt-2.5 py-1 text-center text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded border border-gray-200 transition cursor-pointer"
          >
            Open Roznamcha Register
          </button>
        </div>

        {/* Floor Operations: Production & Attendance */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-gray-500 block">Today's Plant Activity</span>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-[11px] text-gray-500 block">Production Output</span>
              <span className="text-base font-bold font-mono text-gray-900 block mt-0.5">
                {todayProductionUnits} units
              </span>
              <span className="text-[10px] text-gray-400">{todayBatches.length} batch(es)</span>
            </div>
            <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-[11px] text-gray-500 block">Attendance</span>
              <span className="text-base font-bold font-mono text-gray-900 block mt-0.5">
                {presentCount} / {activeEmployees.length}
              </span>
              <span className="text-[10px] text-gray-400">Workers Present</span>
            </div>
          </div>
          <div className="flex gap-2 mt-2.5">
            <button
              onClick={() => onNavigate('production')}
              className="flex-1 py-1 text-center text-xs font-semibold text-indigo-700 hover:bg-indigo-50 rounded border border-indigo-200 transition cursor-pointer"
            >
              Production
            </button>
            <button
              onClick={() => onNavigate('attendance')}
              className="flex-1 py-1 text-center text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded border border-gray-200 transition cursor-pointer"
            >
              Muster Roll
            </button>
          </div>
        </div>
      </div>

      {/* 7-Day Sales Performance Bar Visualizer */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-xs">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="font-bold text-gray-900 text-sm">7-Day Factory Sales Trend</h3>
            <p className="text-xs text-gray-500">Daily invoiced gross order revenue</p>
          </div>
          <span className="text-xs font-mono font-semibold text-gray-600">
            Last 7 Days
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2 pt-4 border-t border-gray-100 items-end h-44">
          {last7Days.map((d, idx) => {
            const heightPercent = Math.max(8, Math.min(100, Math.round((d.sales / maxDailySales) * 100)));
            const isToday = d.date === todayStr;

            return (
              <div key={idx} className="flex flex-col items-center h-full justify-end group">
                <span className="text-[10px] font-mono text-gray-500 mb-1 opacity-0 group-hover:opacity-100 transition truncate">
                  {formatCurrency(d.sales, settings.currencySymbol)}
                </span>
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full max-w-[36px] rounded-t-md transition-all ${
                    isToday
                      ? 'bg-amber-500 hover:bg-amber-600'
                      : 'bg-indigo-600/80 hover:bg-indigo-600'
                  }`}
                  title={`${d.label} (${d.date}): ${formatCurrency(d.sales, settings.currencySymbol)}`}
                />
                <span
                  className={`text-[11px] font-semibold mt-2 ${
                    isToday ? 'text-amber-600 font-bold' : 'text-gray-600'
                  }`}
                >
                  {d.label}
                </span>
                <span className="text-[9px] font-mono text-gray-400">{d.date.slice(5)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
