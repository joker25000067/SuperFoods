import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Trash2,
  Printer,
  Search,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { useFactory } from '../../context/FactoryContext';
import { SalaryPayment } from '../../types';
import { formatCurrency, formatDate, getTodayDateString } from '../../utils/formatters';
import { PrintModal } from '../common/PrintModal';
import { PrintHeader } from '../common/PrintHeader';
import { EmptyState } from '../common/EmptyState';

export const SalariesModule: React.FC = () => {
  const { employees, salaryPayments, settings, saveSalaryPayment, deleteSalaryPayment } = useFactory();

  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [search, setSearch] = useState('');
  const [selectedSlipForPrint, setSelectedSlipForPrint] = useState<SalaryPayment | null>(null);

  // Form State
  const [paymentDate, setPaymentDate] = useState(getTodayDateString());
  const [monthYear, setMonthYear] = useState(
    new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
  );
  const [employeeId, setEmployeeId] = useState(employees[0]?.id || '');
  const [employeeName, setEmployeeName] = useState(employees[0]?.name || '');
  const [basicSalary, setBasicSalary] = useState<number>(employees[0]?.basicSalary || 0);
  const [daysWorked, setDaysWorked] = useState<number>(26);
  const [overtimeAmount, setOvertimeAmount] = useState<number>(0);
  const [deductions, setDeductions] = useState<number>(0);
  const [advanceAdjusted, setAdvanceAdjusted] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'cash' | 'bank' | 'online'>('cash');
  const [notes, setNotes] = useState('');

  const handleEmployeeChange = (id: string) => {
    setEmployeeId(id);
    const emp = employees.find((e) => e.id === id);
    if (emp) {
      setEmployeeName(emp.name);
      if (emp.salaryType === 'monthly') {
        setBasicSalary(emp.basicSalary);
      } else {
        setBasicSalary(emp.dailyRate * (daysWorked || 26));
      }
    }
  };

  const handleDaysChange = (days: number) => {
    setDaysWorked(days);
    const emp = employees.find((e) => e.id === employeeId);
    if (emp && emp.salaryType === 'daily') {
      setBasicSalary(emp.dailyRate * days);
    }
  };

  const netSalary = Math.max(
    0,
    basicSalary + overtimeAmount - deductions - advanceAdjusted
  );

  const handleSavePayment = async () => {
    if (!employeeName.trim()) {
      alert('Please select an employee.');
      return;
    }
    if (netSalary <= 0 && basicSalary <= 0) {
      alert('Please enter a valid salary amount.');
      return;
    }

    const newPayment: Omit<SalaryPayment, 'id'> = {
      employeeId: employeeId || undefined,
      employeeName,
      monthYear,
      paymentDate,
      basicSalary,
      daysWorked,
      overtimeAmount,
      deductions,
      advanceAdjusted,
      netSalary,
      paymentMode,
      notes,
    };

    await saveSalaryPayment(newPayment);

    // Reset Form
    setOvertimeAmount(0);
    setDeductions(0);
    setAdvanceAdjusted(0);
    setNotes('');
    setActiveTab('list');
  };

  const totalDisbursed = salaryPayments.reduce((sum, s) => sum + s.netSalary, 0);

  const filtered = salaryPayments.filter((s) => {
    return (
      s.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      s.monthYear.toLowerCase().includes(search.toLowerCase()) ||
      s.paymentDate.includes(search)
    );
  });

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            Salaries, Wages &amp; Pay Slips
          </h2>
          <p className="text-xs text-gray-500">
            Generate worker wage slips, overtime additions, advance deductions, and auto-sync with Cashbook.
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
            {activeTab === 'create' ? 'View Payment History' : '+ Pay Worker Salary'}
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        /* DISBURSE SALARY FORM */
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-4 sm:p-5 space-y-4">
          <div className="border-b border-gray-200 pb-3 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Generate Worker Salary Voucher &amp; Pay Slip
            </h3>
            <span className="text-xs text-gray-500">Auto-logs payment into factory Cashbook</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Select Employee</label>
              <select
                value={employeeId}
                onChange={(e) => handleEmployeeChange(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-gray-300 bg-white font-medium"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.role}) - {emp.salaryType}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Salary Month / Period</label>
              <input
                type="text"
                value={monthYear}
                onChange={(e) => setMonthYear(e.target.value)}
                placeholder="e.g. October 2026"
                className="w-full px-2.5 py-1.5 rounded border border-gray-300 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Payment Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-gray-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Days Worked</label>
              <input
                type="number"
                min="0"
                max="31"
                value={daysWorked === 0 ? '' : daysWorked}
                onChange={(e) => handleDaysChange(parseFloat(e.target.value) || 0)}
                placeholder="26"
                className="w-full px-2.5 py-1.5 rounded border border-gray-300 bg-white text-center font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Base Pay ({settings.currencySymbol})</label>
              <input
                type="number"
                min="0"
                step="any"
                value={basicSalary === 0 ? '' : basicSalary}
                onChange={(e) => setBasicSalary(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full px-2.5 py-1.5 rounded border border-gray-300 bg-white text-right font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-emerald-800 mb-1">+ Overtime Pay</label>
              <input
                type="number"
                min="0"
                step="any"
                value={overtimeAmount === 0 ? '' : overtimeAmount}
                onChange={(e) => setOvertimeAmount(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full px-2.5 py-1.5 rounded border border-gray-300 bg-white text-right font-mono font-bold text-emerald-700"
              />
            </div>
            <div>
              <label className="block font-semibold text-rose-800 mb-1">- Deductions / Absences</label>
              <input
                type="number"
                min="0"
                step="any"
                value={deductions === 0 ? '' : deductions}
                onChange={(e) => setDeductions(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full px-2.5 py-1.5 rounded border border-gray-300 bg-white text-right font-mono font-bold text-rose-700"
              />
            </div>
            <div>
              <label className="block font-semibold text-amber-800 mb-1">- Advance Recovery</label>
              <input
                type="number"
                min="0"
                step="any"
                value={advanceAdjusted === 0 ? '' : advanceAdjusted}
                onChange={(e) => setAdvanceAdjusted(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full px-2.5 py-1.5 rounded border border-gray-300 bg-white text-right font-mono font-bold text-amber-700"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            <div className="w-full sm:w-1/2 space-y-3">
              <div>
                <label className="block font-semibold text-xs text-gray-700 mb-1">Payment Method</label>
                <div className="flex gap-4 text-xs font-semibold text-gray-800">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMode"
                      checked={paymentMode === 'cash'}
                      onChange={() => setPaymentMode('cash')}
                    />
                    Cash in Hand
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMode"
                      checked={paymentMode === 'bank'}
                      onChange={() => setPaymentMode('bank')}
                    />
                    Bank Transfer
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMode"
                      checked={paymentMode === 'online'}
                      onChange={() => setPaymentMode('online')}
                    />
                    EasyPaisa / JazzCash / Mobile
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-xs text-gray-700 mb-1">Remarks / Note</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Advance recovered details, bonus remarks..."
                  className="w-full px-2.5 py-1.5 rounded border border-gray-300 text-xs"
                />
              </div>
            </div>

            <div className="w-full sm:w-72 bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2 text-xs">
              <div className="flex justify-between items-center text-gray-600">
                <span>Gross Earnings:</span>
                <span className="font-mono font-semibold text-gray-900">
                  {formatCurrency(basicSalary + overtimeAmount, settings.currencySymbol)}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Total Deductions:</span>
                <span className="font-mono font-semibold text-rose-600">
                  -{formatCurrency(deductions + advanceAdjusted, settings.currencySymbol)}
                </span>
              </div>
              <div className="flex justify-between items-center text-base font-bold text-emerald-800 pt-2 border-t border-gray-200">
                <span>Net Payable Salary:</span>
                <span className="font-mono">
                  {formatCurrency(netSalary, settings.currencySymbol)}
                </span>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleSavePayment}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs transition cursor-pointer"
                >
                  Confirm &amp; Disburse Salary
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* SALARY PAYMENTS HISTORY */
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-xs font-medium text-gray-500 block">Total Slips Issued</span>
              <span className="text-xl font-bold text-gray-900 mt-1 block">{salaryPayments.length}</span>
              <span className="text-[11px] text-gray-500 mt-0.5 block">Disbursed salary vouchers</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-xs font-medium text-emerald-600 block">Total Wages Paid</span>
              <span className="text-xl font-bold text-emerald-700 mt-1 block">
                {formatCurrency(totalDisbursed, settings.currencySymbol)}
              </span>
              <span className="text-[11px] text-gray-500 mt-0.5 block">Recorded in factory Cashbook</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <span className="text-xs font-medium text-gray-500 block">Search Slips</span>
              <div className="relative mt-2">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by worker name, month..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title="No Salary Vouchers"
              description="Pay worker wages and generate printable pay slips."
              actionText="Disburse First Salary"
              onAction={() => setActiveTab('create')}
              icon={<CreditCard className="w-6 h-6 text-emerald-600" />}
            />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Date Paid</th>
                      <th className="py-2.5 px-3">Worker Name</th>
                      <th className="py-2.5 px-3">Month / Period</th>
                      <th className="py-2.5 px-3 text-right">Base Pay</th>
                      <th className="py-2.5 px-3 text-right">Overtime</th>
                      <th className="py-2.5 px-3 text-right">Deductions</th>
                      <th className="py-2.5 px-3 text-right">Net Paid</th>
                      <th className="py-2.5 px-3 text-center">Mode</th>
                      <th className="py-2.5 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-800">
                    {filtered.map((s) => (
                      <tr key={s.id} className="hover:bg-emerald-50/20 transition">
                        <td className="py-2.5 px-3 font-mono text-gray-600">{formatDate(s.paymentDate)}</td>
                        <td className="py-2.5 px-3 font-bold text-gray-900">{s.employeeName}</td>
                        <td className="py-2.5 px-3 text-gray-700 font-medium">{s.monthYear}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-gray-600">
                          {formatCurrency(s.basicSalary, settings.currencySymbol)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-700">
                          +{formatCurrency(s.overtimeAmount, settings.currencySymbol)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-rose-700">
                          -{formatCurrency(s.deductions + s.advanceAdjusted, settings.currencySymbol)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900 text-sm">
                          {formatCurrency(s.netSalary, settings.currencySymbol)}
                        </td>
                        <td className="py-2.5 px-3 text-center capitalize text-gray-500 font-medium">
                          {s.paymentMode}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedSlipForPrint(s)}
                              className="px-2 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition cursor-pointer flex items-center gap-1"
                            >
                              <Printer className="w-3 h-3" /> Pay Slip
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete salary slip for "${s.employeeName}"?`)) {
                                  deleteSalaryPayment(s.id);
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

      {/* PRINTABLE PAY SLIP */}
      {selectedSlipForPrint && (
        <PrintModal
          isOpen={!!selectedSlipForPrint}
          onClose={() => setSelectedSlipForPrint(null)}
          title={`Salary Slip: ${selectedSlipForPrint.employeeName}`}
        >
          <div className="p-4 sm:p-6 text-black bg-white">
            <PrintHeader
              title="FACTORY WORKER SALARY VOUCHER & PAY SLIP"
              subtitle={`Wage Period: ${selectedSlipForPrint.monthYear}`}
              date={selectedSlipForPrint.paymentDate}
            />

            <div className="grid grid-cols-2 gap-3 text-xs mb-4 border border-black p-2 bg-gray-50">
              <div>
                <p><span className="font-bold">Employee Name:</span> {selectedSlipForPrint.employeeName}</p>
                <p><span className="font-bold">Period / Month:</span> {selectedSlipForPrint.monthYear}</p>
                <p><span className="font-bold">Days Worked:</span> {selectedSlipForPrint.daysWorked || 26} days</p>
              </div>
              <div className="text-right">
                <p><span className="font-bold">Payment Date:</span> {formatDate(selectedSlipForPrint.paymentDate)}</p>
                <p><span className="font-bold">Payment Mode:</span> {selectedSlipForPrint.paymentMode.toUpperCase()}</p>
              </div>
            </div>

            <table className="w-full text-xs border-collapse border border-black mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black py-1.5 px-2 text-left">EARNINGS</th>
                  <th className="border border-black py-1.5 px-2 text-right w-28">AMOUNT</th>
                  <th className="border border-black py-1.5 px-2 text-left">DEDUCTIONS</th>
                  <th className="border border-black py-1.5 px-2 text-right w-28">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="border border-black py-1 px-2 font-medium">Basic Wages / Salary</td>
                  <td className="border border-black py-1 px-2 text-right font-mono">
                    {formatCurrency(selectedSlipForPrint.basicSalary, settings.currencySymbol)}
                  </td>
                  <td className="border border-black py-1 px-2 font-medium">Fines / Absences Deductions</td>
                  <td className="border border-black py-1 px-2 text-right font-mono">
                    {formatCurrency(selectedSlipForPrint.deductions, settings.currencySymbol)}
                  </td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="border border-black py-1 px-2 font-medium">Overtime Allowance</td>
                  <td className="border border-black py-1 px-2 text-right font-mono">
                    {formatCurrency(selectedSlipForPrint.overtimeAmount, settings.currencySymbol)}
                  </td>
                  <td className="border border-black py-1 px-2 font-medium">Advance Salary Adjustment</td>
                  <td className="border border-black py-1 px-2 text-right font-mono">
                    {formatCurrency(selectedSlipForPrint.advanceAdjusted, settings.currencySymbol)}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="font-bold bg-gray-100 border-t-2 border-black">
                  <td className="border border-black py-1.5 px-2">GROSS EARNINGS:</td>
                  <td className="border border-black py-1.5 px-2 text-right font-mono">
                    {formatCurrency(selectedSlipForPrint.basicSalary + selectedSlipForPrint.overtimeAmount, settings.currencySymbol)}
                  </td>
                  <td className="border border-black py-1.5 px-2">TOTAL DEDUCTIONS:</td>
                  <td className="border border-black py-1.5 px-2 text-right font-mono text-rose-800">
                    {formatCurrency(selectedSlipForPrint.deductions + selectedSlipForPrint.advanceAdjusted, settings.currencySymbol)}
                  </td>
                </tr>
                <tr className="font-bold bg-gray-200 border-t-2 border-black text-sm">
                  <td colSpan={3} className="border border-black py-2 px-2 text-right">NET SALARY RECEIVED:</td>
                  <td className="border border-black py-2 px-2 text-right font-mono font-bold">
                    {formatCurrency(selectedSlipForPrint.netSalary, settings.currencySymbol)}
                  </td>
                </tr>
              </tfoot>
            </table>

            {selectedSlipForPrint.notes && (
              <p className="text-xs mb-4 italic">Remarks: {selectedSlipForPrint.notes}</p>
            )}

            <div className="mt-12 pt-4 flex justify-between items-end text-xs">
              <div className="text-center w-48 border-t border-black pt-1">
                <p className="font-bold">Worker Signature / Thumb Impression</p>
              </div>
              <div className="text-center w-48 border-t border-black pt-1">
                <p className="font-bold">Cashier / Disbursing Officer</p>
              </div>
            </div>
          </div>
        </PrintModal>
      )}
    </div>
  );
};
