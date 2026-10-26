import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Trash2,
  Edit2,
  Printer,
  Search,
  Phone,
  Calendar,
} from 'lucide-react';
import { useFactory } from '../../context/FactoryContext';
import { Employee } from '../../types';
import { formatCurrency, formatDate, getTodayDateString } from '../../utils/formatters';
import { PrintModal } from '../common/PrintModal';
import { PrintHeader } from '../common/PrintHeader';
import { EmptyState } from '../common/EmptyState';

export const EmployeesModule: React.FC = () => {
  const { employees, settings, saveEmployee, deleteEmployee } = useFactory();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [salaryType, setSalaryType] = useState<'monthly' | 'daily'>('monthly');
  const [basicSalary, setBasicSalary] = useState<number>(0);
  const [dailyRate, setDailyRate] = useState<number>(0);
  const [joiningDate, setJoiningDate] = useState(getTodayDateString());
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [notes, setNotes] = useState('');

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setRole('');
    setPhone('');
    setSalaryType('monthly');
    setBasicSalary(0);
    setDailyRate(0);
    setJoiningDate(getTodayDateString());
    setStatus('active');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setName(emp.name);
    setRole(emp.role);
    setPhone(emp.phone || '');
    setSalaryType(emp.salaryType);
    setBasicSalary(emp.basicSalary || 0);
    setDailyRate(emp.dailyRate || 0);
    setJoiningDate(emp.joiningDate || getTodayDateString());
    setStatus(emp.status);
    setNotes(emp.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Employee name is required.');
      return;
    }
    if (!role.trim()) {
      alert('Designation / role is required.');
      return;
    }

    await saveEmployee({
      id: editingId || undefined,
      name,
      role,
      phone,
      salaryType,
      basicSalary,
      dailyRate,
      joiningDate,
      status,
      notes,
    });

    setIsModalOpen(false);
  };

  const filtered = employees.filter((e) => {
    return (
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.role.toLowerCase().includes(search.toLowerCase()) ||
      (e.phone && e.phone.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const activeEmployees = employees.filter((e) => e.status === 'active');
  const totalMonthlyWage = activeEmployees.reduce((sum, e) => {
    return sum + (e.salaryType === 'monthly' ? e.basicSalary : e.dailyRate * 26);
  }, 0);

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600" />
            Employees &amp; Factory Staff
          </h2>
          <p className="text-xs text-gray-500">
            Workers, fryers, machine operators, supervisors, daily/monthly wages, and attendance profiles.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-gray-600" />
            Print Staff List
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Employee
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500 block">Total Staff</span>
          <span className="text-xl font-bold text-gray-900 mt-1 block">
            {activeEmployees.length} Active <span className="text-xs text-gray-400 font-normal">({employees.length} Total)</span>
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">Factory labor and staff</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-blue-600 block">Estimated Monthly Wage Bill</span>
          <span className="text-xl font-bold text-blue-700 mt-1 block">
            {formatCurrency(totalMonthlyWage, settings.currencySymbol)}
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">Base salary / estimated labor cost</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500 block">Search Staff</span>
          <div className="relative mt-2">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by worker name, role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No Employees Found"
          description="Register your factory workers, machine operators, supervisors, and packing labor."
          actionText="Add Employee"
          onAction={handleOpenAdd}
          icon={<UserCheck className="w-6 h-6 text-blue-600" />}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Worker Name</th>
                  <th className="py-2.5 px-3">Role / Designation</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3 text-center">Wage Type</th>
                  <th className="py-2.5 px-3 text-right">Base Salary / Daily Rate</th>
                  <th className="py-2.5 px-3">Joining Date</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-blue-50/20 transition">
                    <td className="py-2.5 px-3 font-bold text-gray-900">{emp.name}</td>
                    <td className="py-2.5 px-3 font-medium text-gray-700">{emp.role}</td>
                    <td className="py-2.5 px-3 text-gray-600 font-mono">{emp.phone || '-'}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="capitalize px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-800">
                        {emp.salaryType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900">
                      {emp.salaryType === 'monthly'
                        ? formatCurrency(emp.basicSalary, settings.currencySymbol)
                        : `${formatCurrency(emp.dailyRate, settings.currencySymbol)} / day`}
                    </td>
                    <td className="py-2.5 px-3 text-gray-500 font-mono">{formatDate(emp.joiningDate)}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          emp.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete employee record for "${emp.name}"?`)) {
                              deleteEmployee(emp.id);
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

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
              <h3 className="font-bold text-gray-900 text-sm">
                {editingId ? 'Edit Employee Profile' : 'Add New Employee'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Muhammad Ramzan"
                  className="w-full px-2.5 py-1.5 rounded border border-gray-300 font-medium text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Role / Designation *</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Master Fryer, Packer"
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0300-1234567"
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Wage Basis</label>
                  <select
                    value={salaryType}
                    onChange={(e) => setSalaryType(e.target.value as 'monthly' | 'daily')}
                    className="w-full px-2 py-1.5 rounded border border-gray-300 bg-white"
                  >
                    <option value="monthly">Monthly Fixed Salary</option>
                    <option value="daily">Daily Wage Rate</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    {salaryType === 'monthly' ? 'Monthly Salary' : 'Daily Wage Rate'} ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={
                      salaryType === 'monthly'
                        ? basicSalary === 0
                          ? ''
                          : basicSalary
                        : dailyRate === 0
                        ? ''
                        : dailyRate
                    }
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      if (salaryType === 'monthly') setBasicSalary(val);
                      else setDailyRate(val);
                    }}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300 text-right font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                    className="w-full px-2 py-1.5 rounded border border-gray-300 bg-white"
                  >
                    <option value="active">Active Worker</option>
                    <option value="inactive">Inactive / Left</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Notes / Emergency Contact / CNIC</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="CNIC #, home address, emergency phone, reference person..."
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
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                Save Employee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE STAFF DIRECTORY */}
      {isPrintModalOpen && (
        <PrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title="Factory Employee Directory &amp; Wage Sheet"
        >
          <div className="p-4 sm:p-6 text-black bg-white">
            <PrintHeader
              title="FACTORY WORKERS & STAFF REGISTER"
              subtitle="Employee Directory, Designations, and Wage Specifications"
              date={getTodayDateString()}
            />

            <table className="w-full text-xs border-collapse border border-black mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black py-1.5 px-2 text-center w-10">S.#</th>
                  <th className="border border-black py-1.5 px-2 text-left">WORKER NAME</th>
                  <th className="border border-black py-1.5 px-2 text-left w-28">DESIGNATION</th>
                  <th className="border border-black py-1.5 px-2 text-left w-28">PHONE</th>
                  <th className="border border-black py-1.5 px-2 text-center w-20">TYPE</th>
                  <th className="border border-black py-1.5 px-2 text-right w-24">BASE RATE</th>
                  <th className="border border-black py-1.5 px-2 text-center w-20">JOIN DATE</th>
                  <th className="border border-black py-1.5 px-2 text-center w-16">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, idx) => (
                  <tr key={e.id} className="border-b border-gray-300">
                    <td className="border border-black py-1 px-2 text-center">{idx + 1}</td>
                    <td className="border border-black py-1 px-2 font-bold">{e.name}</td>
                    <td className="border border-black py-1 px-2">{e.role}</td>
                    <td className="border border-black py-1 px-2 font-mono">{e.phone || '-'}</td>
                    <td className="border border-black py-1 px-2 text-center capitalize">{e.salaryType}</td>
                    <td className="border border-black py-1 px-2 text-right font-mono font-bold">
                      {e.salaryType === 'monthly'
                        ? formatCurrency(e.basicSalary, settings.currencySymbol)
                        : `${formatCurrency(e.dailyRate, settings.currencySymbol)}/d`}
                    </td>
                    <td className="border border-black py-1 px-2 text-center font-mono">{formatDate(e.joiningDate)}</td>
                    <td className="border border-black py-1 px-2 text-center uppercase font-bold">{e.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-8 pt-4 flex justify-between items-end text-xs">
              <div className="text-center w-44 border-t border-black pt-1">
                <p className="font-bold">HR / Timekeeper</p>
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
