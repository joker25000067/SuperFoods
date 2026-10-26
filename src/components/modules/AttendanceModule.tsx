import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  MinusCircle,
  HelpCircle,
  Printer,
  Calendar,
  Save,
  Users,
} from 'lucide-react';
import { useFactory } from '../../context/FactoryContext';
import { AttendanceRecord } from '../../types';
import { formatDate, getTodayDateString } from '../../utils/formatters';
import { PrintModal } from '../common/PrintModal';
import { PrintHeader } from '../common/PrintHeader';
import { EmptyState } from '../common/EmptyState';

export const AttendanceModule: React.FC = () => {
  const { employees, attendanceRecords, saveBulkAttendance } = useFactory();

  const [activeDate, setActiveDate] = useState(getTodayDateString());
  const [activeTab, setActiveTab] = useState<'daily' | 'history'>('daily');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Daily marking local state
  const [dailyEntries, setDailyEntries] = useState<{
    [empId: string]: {
      status: 'present' | 'absent' | 'half_day' | 'leave';
      overtimeHours: number;
      notes: string;
    };
  }>({});

  const activeEmployees = employees.filter((e) => e.status === 'active');

  // Load existing records for activeDate or initialize with default
  useEffect(() => {
    const existingForDate = attendanceRecords.filter((r) => r.date === activeDate);
    const map: typeof dailyEntries = {};

    activeEmployees.forEach((emp) => {
      const match = existingForDate.find((r) => r.employeeId === emp.id);
      if (match) {
        map[emp.id] = {
          status: match.status,
          overtimeHours: match.overtimeHours || 0,
          notes: match.notes || '',
        };
      } else {
        map[emp.id] = {
          status: 'present',
          overtimeHours: 0,
          notes: '',
        };
      }
    });

    setDailyEntries(map);
  }, [activeDate, attendanceRecords, employees]);

  const handleStatusChange = (
    empId: string,
    newStatus: 'present' | 'absent' | 'half_day' | 'leave'
  ) => {
    setDailyEntries((prev) => ({
      ...prev,
      [empId]: {
        ...prev[empId],
        status: newStatus,
      },
    }));
  };

  const handleOvertimeChange = (empId: string, hours: number) => {
    setDailyEntries((prev) => ({
      ...prev,
      [empId]: {
        ...prev[empId],
        overtimeHours: hours,
      },
    }));
  };

  const handleNotesChange = (empId: string, notes: string) => {
    setDailyEntries((prev) => ({
      ...prev,
      [empId]: {
        ...prev[empId],
        notes,
      },
    }));
  };

  const handleMarkAll = (status: 'present' | 'absent') => {
    setDailyEntries((prev) => {
      const copy = { ...prev };
      activeEmployees.forEach((emp) => {
        copy[emp.id] = {
          ...copy[emp.id],
          status,
        };
      });
      return copy;
    });
  };

  const handleSaveDaily = async () => {
    const recordsToSave: Omit<AttendanceRecord, 'id'>[] = activeEmployees.map((emp) => {
      const entry = dailyEntries[emp.id] || { status: 'present', overtimeHours: 0, notes: '' };
      return {
        date: activeDate,
        employeeId: emp.id,
        employeeName: emp.name,
        status: entry.status,
        overtimeHours: entry.overtimeHours,
        notes: entry.notes,
      };
    });

    await saveBulkAttendance(recordsToSave);
    alert(`Attendance for ${activeDate} saved successfully!`);
  };

  // Stats for active date
  const counts = (
    Object.values(dailyEntries) as Array<{
      status: 'present' | 'absent' | 'half_day' | 'leave';
      overtimeHours: number;
      notes: string;
    }>
  ).reduce(
    (acc, val) => {
      acc[val.status] = (acc[val.status] || 0) + 1;
      acc.totalOT += val.overtimeHours || 0;
      return acc;
    },
    { present: 0, absent: 0, half_day: 0, leave: 0, totalOT: 0 }
  );

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Worker Attendance &amp; Overtime Muster Roll
          </h2>
          <p className="text-xs text-gray-500">
            Daily present/absent/half-day marking, overtime tracking, and monthly attendance history.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-gray-600" />
            Print Muster Sheet
          </button>
        </div>
      </div>

      {/* Date Bar & Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white p-3 rounded-xl border border-gray-200">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-gray-700">Select Date:</span>
            <input
              type="date"
              value={activeDate}
              onChange={(e) => setActiveDate(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg border border-gray-300 font-mono font-medium"
            />
          </div>
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1 bg-gray-50">
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                activeTab === 'daily' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'
              }`}
            >
              Daily Sheet
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                activeTab === 'history' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'
              }`}
            >
              Attendance History
            </button>
          </div>
        </div>

        {activeTab === 'daily' && (
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => handleMarkAll('present')}
              className="px-2.5 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition cursor-pointer"
            >
              All Present
            </button>
            <button
              onClick={() => handleMarkAll('absent')}
              className="px-2.5 py-1.5 text-xs font-medium text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition cursor-pointer"
            >
              All Absent
            </button>
            <button
              onClick={handleSaveDaily}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Sheet
            </button>
          </div>
        )}
      </div>

      {/* KPI Counters for Active Date */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <div className="bg-white p-3 rounded-xl border border-gray-200 text-center">
          <span className="text-[11px] font-semibold text-gray-500 block">Total Scheduled</span>
          <span className="text-lg font-bold text-gray-900">{activeEmployees.length}</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-200 text-center">
          <span className="text-[11px] font-semibold text-emerald-600 block">Present</span>
          <span className="text-lg font-bold text-emerald-700">{counts.present}</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-200 text-center">
          <span className="text-[11px] font-semibold text-rose-600 block">Absent</span>
          <span className="text-lg font-bold text-rose-700">{counts.absent}</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-200 text-center">
          <span className="text-[11px] font-semibold text-amber-600 block">Half-Day / Leave</span>
          <span className="text-lg font-bold text-amber-700">{counts.half_day + counts.leave}</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-200 text-center col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-indigo-600 block">Total Overtime</span>
          <span className="text-lg font-bold text-indigo-700">{counts.totalOT} hrs</span>
        </div>
      </div>

      {activeTab === 'daily' ? (
        activeEmployees.length === 0 ? (
          <EmptyState
            title="No Active Workers"
            description="Add factory workers in the Employees module to mark daily attendance."
            icon={<Users className="w-6 h-6 text-indigo-600" />}
          />
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3">Worker Name</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3 text-center">Attendance Status</th>
                    <th className="py-2.5 px-3 text-center w-28">Overtime (Hrs)</th>
                    <th className="py-2.5 px-3">Daily Notes / Shift</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800">
                  {activeEmployees.map((emp, idx) => {
                    const entry = dailyEntries[emp.id] || {
                      status: 'present',
                      overtimeHours: 0,
                      notes: '',
                    };

                    return (
                      <tr key={emp.id} className="hover:bg-gray-50/50 transition">
                        <td className="py-2.5 px-3 text-center text-gray-400 font-mono">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-bold text-gray-900">{emp.name}</td>
                        <td className="py-2.5 px-3 text-gray-600">{emp.role}</td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(emp.id, 'present')}
                              className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer transition flex items-center gap-1 ${
                                entry.status === 'present'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-800'
                              }`}
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Present
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(emp.id, 'absent')}
                              className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer transition flex items-center gap-1 ${
                                entry.status === 'absent'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-gray-100 text-gray-600 hover:bg-rose-100 hover:text-rose-800'
                              }`}
                            >
                              <XCircle className="w-3.5 h-3.5" /> Absent
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(emp.id, 'half_day')}
                              className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer transition flex items-center gap-1 ${
                                entry.status === 'half_day'
                                  ? 'bg-amber-600 text-white shadow-xs'
                                  : 'bg-gray-100 text-gray-600 hover:bg-amber-100 hover:text-amber-800'
                              }`}
                            >
                              <MinusCircle className="w-3.5 h-3.5" /> Half-Day
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(emp.id, 'leave')}
                              className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer transition flex items-center gap-1 ${
                                entry.status === 'leave'
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-800'
                              }`}
                            >
                              <HelpCircle className="w-3.5 h-3.5" /> Leave
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={entry.overtimeHours === 0 ? '' : entry.overtimeHours}
                            onChange={(e) =>
                              handleOvertimeChange(emp.id, parseFloat(e.target.value) || 0)
                            }
                            placeholder="0"
                            className="w-16 px-2 py-1 text-xs text-center border border-gray-300 rounded font-mono font-bold"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={entry.notes}
                            onChange={(e) => handleNotesChange(emp.id, e.target.value)}
                            placeholder="Shift notes, late reason..."
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={handleSaveDaily}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save Today's Attendance Sheet
              </button>
            </div>
          </div>
        )
      ) : (
        /* ATTENDANCE HISTORY LOG */
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          {attendanceRecords.length === 0 ? (
            <EmptyState
              title="No Attendance Logs"
              description="Mark daily attendance above and save to build your worker attendance history."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Worker Name</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Overtime Hours</th>
                    <th className="py-2.5 px-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800">
                  {attendanceRecords
                    .slice()
                    .reverse()
                    .slice(0, 100)
                    .map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50/50 transition">
                        <td className="py-2 px-3 font-mono text-gray-600">{formatDate(r.date)}</td>
                        <td className="py-2 px-3 font-bold text-gray-900">{r.employeeName}</td>
                        <td className="py-2 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              r.status === 'present'
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.status === 'absent'
                                ? 'bg-rose-100 text-rose-800'
                                : r.status === 'half_day'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {r.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center font-mono font-semibold">
                          {r.overtimeHours ? `${r.overtimeHours} hrs` : '-'}
                        </td>
                        <td className="py-2 px-3 text-gray-500 italic">{r.notes || '-'}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PRINTABLE MUSTER SHEET */}
      {isPrintModalOpen && (
        <PrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title={`Daily Attendance Muster Sheet: ${activeDate}`}
        >
          <div className="p-4 sm:p-6 text-black bg-white">
            <PrintHeader
              title="DAILY FACTORY ATTENDANCE & MUSTER ROLL"
              subtitle={`Attendance Log for Date: ${formatDate(activeDate)}`}
              date={activeDate}
            />

            <div className="grid grid-cols-4 gap-2 text-xs mb-4 border border-black p-2 bg-gray-50 text-center font-bold">
              <div>Scheduled: {activeEmployees.length}</div>
              <div className="text-emerald-800">Present: {counts.present}</div>
              <div className="text-rose-800">Absent: {counts.absent}</div>
              <div>Overtime: {counts.totalOT} hrs</div>
            </div>

            <table className="w-full text-xs border-collapse border border-black mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black py-1 px-2 text-center w-10">S.#</th>
                  <th className="border border-black py-1 px-2 text-left">WORKER NAME</th>
                  <th className="border border-black py-1 px-2 text-left w-28">ROLE</th>
                  <th className="border border-black py-1 px-2 text-center w-24">STATUS</th>
                  <th className="border border-black py-1 px-2 text-center w-20">OT (HRS)</th>
                  <th className="border border-black py-1 px-2 text-left">REMARKS</th>
                  <th className="border border-black py-1 px-2 text-center w-28">WORKER SIGN</th>
                </tr>
              </thead>
              <tbody>
                {activeEmployees.map((emp, idx) => {
                  const entry = dailyEntries[emp.id] || { status: 'present', overtimeHours: 0, notes: '' };
                  return (
                    <tr key={emp.id} className="border-b border-gray-300">
                      <td className="border border-black py-1 px-2 text-center">{idx + 1}</td>
                      <td className="border border-black py-1 px-2 font-bold">{emp.name}</td>
                      <td className="border border-black py-1 px-2">{emp.role}</td>
                      <td className="border border-black py-1 px-2 text-center uppercase font-bold">
                        {entry.status.replace('_', ' ')}
                      </td>
                      <td className="border border-black py-1 px-2 text-center font-mono">{entry.overtimeHours || '-'}</td>
                      <td className="border border-black py-1 px-2 text-gray-700">{entry.notes || '-'}</td>
                      <td className="border border-black py-1 px-2 text-center">____________</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="mt-8 pt-4 flex justify-between items-end text-xs">
              <div className="text-center w-44 border-t border-black pt-1">
                <p className="font-bold">Timekeeper Signature</p>
              </div>
              <div className="text-center w-44 border-t border-black pt-1">
                <p className="font-bold">Factory Supervisor</p>
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
