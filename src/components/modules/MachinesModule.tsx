import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  Trash2,
  Edit2,
  Printer,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
} from 'lucide-react';
import { useFactory } from '../../context/FactoryContext';
import { Machine, MaintenanceLog } from '../../types';
import { formatCurrency, formatDate, getTodayDateString } from '../../utils/formatters';
import { PrintModal } from '../common/PrintModal';
import { PrintHeader } from '../common/PrintHeader';
import { EmptyState } from '../common/EmptyState';

export const MachinesModule: React.FC = () => {
  const { machines, settings, saveMachine, deleteMachine, logMachineMaintenance } = useFactory();

  const [search, setSearch] = useState('');
  const [isMachineModalOpen, setIsMachineModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedMachineForLog, setSelectedMachineForLog] = useState<Machine | null>(null);
  const [selectedMachineForPrint, setSelectedMachineForPrint] = useState<Machine | null>(null);

  // Machine Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [lastServiceDate, setLastServiceDate] = useState(getTodayDateString());
  const [nextServiceDue, setNextServiceDue] = useState('');
  const [status, setStatus] = useState<'operational' | 'under_maintenance' | 'broken'>('operational');
  const [notes, setNotes] = useState('');

  // Maintenance Log Form State
  const [logDate, setLogDate] = useState(getTodayDateString());
  const [issueDescription, setIssueDescription] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [cost, setCost] = useState<number>(0);
  const [partsReplaced, setPartsReplaced] = useState('');
  const [technician, setTechnician] = useState('');
  const [newStatus, setNewStatus] = useState<'operational' | 'under_maintenance' | 'broken'>('operational');

  const handleOpenAddMachine = () => {
    setEditingId(null);
    setCode(`MCH-${(machines.length + 1).toString().padStart(3, '0')}`);
    setName('');
    setLocation('Production Line 1');
    setPurchaseDate('');
    setLastServiceDate(getTodayDateString());
    setNextServiceDue('');
    setStatus('operational');
    setNotes('');
    setIsMachineModalOpen(true);
  };

  const handleOpenEditMachine = (m: Machine) => {
    setEditingId(m.id);
    setCode(m.code || '');
    setName(m.name);
    setLocation(m.location || '');
    setPurchaseDate(m.purchaseDate || '');
    setLastServiceDate(m.lastServiceDate || '');
    setNextServiceDue(m.nextServiceDue || '');
    setStatus(m.status);
    setNotes(m.notes || '');
    setIsMachineModalOpen(true);
  };

  const handleSaveMachine = async () => {
    if (!name.trim()) {
      alert('Machine name is required.');
      return;
    }

    const existing = editingId ? machines.find((m) => m.id === editingId) : null;
    const history = existing ? existing.maintenanceHistory : [];

    await saveMachine({
      id: editingId || undefined,
      code,
      name,
      location,
      purchaseDate,
      lastServiceDate,
      nextServiceDue,
      status,
      notes,
      maintenanceHistory: history,
    });

    setIsMachineModalOpen(false);
  };

  const handleOpenAddLog = (m: Machine) => {
    setSelectedMachineForLog(m);
    setLogDate(getTodayDateString());
    setIssueDescription('');
    setActionTaken('');
    setCost(0);
    setPartsReplaced('');
    setTechnician('');
    setNewStatus('operational');
    setIsLogModalOpen(true);
  };

  const handleSaveLog = async () => {
    if (!selectedMachineForLog) return;
    if (!issueDescription.trim()) {
      alert('Issue / Maintenance description is required.');
      return;
    }

    const logEntry: Omit<MaintenanceLog, 'id'> = {
      date: logDate,
      issueDescription,
      actionTaken,
      cost,
      partsReplaced,
      technician,
    };

    await logMachineMaintenance(selectedMachineForLog.id, logEntry, newStatus);
    setIsLogModalOpen(false);
  };

  const filtered = machines.filter((m) => {
    return (
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.code && m.code.toLowerCase().includes(search.toLowerCase())) ||
      (m.location && m.location.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-600" />
            Machines &amp; Plant Equipment Maintenance
          </h2>
          <p className="text-xs text-gray-500">
            Fryers, packaging machines, extruders, motors, service schedules, and repair history.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleOpenAddMachine}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Machine
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500 block">Total Equipment</span>
          <span className="text-xl font-bold text-gray-900 mt-1 block">{machines.length} Machines</span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">Installed in factory</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-emerald-600 block">Operational Status</span>
          <span className="text-xl font-bold text-emerald-700 mt-1 block">
            {machines.filter((m) => m.status === 'operational').length} Running
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">
            {machines.filter((m) => m.status !== 'operational').length} Under service / down
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-medium text-gray-500 block">Search Equipment</span>
          <div className="relative mt-2">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search machinery, line, code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No Machines Registered"
          description="Track deep fryers, sealing machines, mixing drums, boilers, and packaging units."
          actionText="Add Machine"
          onAction={handleOpenAddMachine}
          icon={<Wrench className="w-6 h-6 text-amber-600" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs hover:border-amber-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-gray-400 block uppercase">
                      {m.code || 'MCH'}
                    </span>
                    <h3 className="font-bold text-gray-900 text-base leading-snug">{m.name}</h3>
                    <span className="text-xs text-gray-500">{m.location || 'Factory Floor'}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      m.status === 'operational'
                        ? 'bg-emerald-100 text-emerald-800'
                        : m.status === 'under_maintenance'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {m.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-gray-50 rounded-lg text-xs">
                  <div>
                    <span className="text-gray-500 block text-[11px]">Last Service:</span>
                    <span className="font-semibold font-mono text-gray-800">
                      {m.lastServiceDate ? formatDate(m.lastServiceDate) : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Next Due:</span>
                    <span className="font-semibold font-mono text-amber-700">
                      {m.nextServiceDue ? formatDate(m.nextServiceDue) : 'Not scheduled'}
                    </span>
                  </div>
                </div>

                {/* Maintenance Logs Summary */}
                <div className="mb-2">
                  <div className="flex justify-between items-center text-[11px] font-semibold text-gray-500 mb-1">
                    <span>SERVICE HISTORY ({m.maintenanceHistory?.length || 0})</span>
                    <button
                      onClick={() => setSelectedMachineForPrint(m)}
                      className="text-amber-700 hover:text-amber-800 flex items-center gap-0.5 cursor-pointer"
                    >
                      <Printer className="w-3 h-3" /> Log Sheet
                    </button>
                  </div>
                  {m.maintenanceHistory && m.maintenanceHistory.length > 0 ? (
                    <div className="space-y-1">
                      {m.maintenanceHistory.slice(-2).map((log) => (
                        <div
                          key={log.id}
                          className="text-[11px] p-1.5 bg-amber-50/50 border border-amber-100 rounded text-gray-800"
                        >
                          <div className="flex justify-between font-semibold">
                            <span>{formatDate(log.date)}</span>
                            <span className="font-mono">{formatCurrency(log.cost, settings.currencySymbol)}</span>
                          </div>
                          <p className="truncate text-gray-600">{log.issueDescription}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-400 italic">No maintenance history recorded.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center gap-2 pt-3 mt-3 border-t border-gray-100">
                <button
                  onClick={() => handleOpenAddLog(m)}
                  className="px-2.5 py-1 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-md transition cursor-pointer flex items-center gap-1"
                >
                  <Wrench className="w-3 h-3" /> Log Service
                </button>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenEditMachine(m)}
                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete machine record "${m.name}"?`)) {
                        deleteMachine(m.id);
                      }
                    }}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT MACHINE MODAL */}
      {isMachineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
              <h3 className="font-bold text-gray-900 text-sm">
                {editingId ? 'Edit Machine Info' : 'Add New Machine'}
              </h3>
              <button
                onClick={() => setIsMachineModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. MCH-001"
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as typeof status)}
                    className="w-full px-2 py-1.5 rounded border border-gray-300 bg-white capitalize"
                  >
                    <option value="operational">Operational</option>
                    <option value="under_maintenance">Under Maintenance</option>
                    <option value="broken">Broken / Down</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Machine Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Continuous Automatic Frying Plant"
                  className="w-full px-2.5 py-1.5 rounded border border-gray-300 font-medium text-gray-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Location / Department / Line</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Main Hall Line 2, Packaging Section"
                  className="w-full px-2.5 py-1.5 rounded border border-gray-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Last Service Date</label>
                  <input
                    type="date"
                    value={lastServiceDate}
                    onChange={(e) => setLastServiceDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Next Service Due</label>
                  <input
                    type="date"
                    value={nextServiceDue}
                    onChange={(e) => setNextServiceDue(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Notes / Specifications</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Motor kW, gas consumption, burner specs, manufacturer contacts..."
                  className="w-full px-2.5 py-1.5 rounded border border-gray-300"
                />
              </div>
            </div>

            <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsMachineModalOpen(false)}
                className="px-3.5 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMachine}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                Save Machine
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOG MAINTENANCE MODAL */}
      {isLogModalOpen && selectedMachineForLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-600" />
                Log Maintenance: {selectedMachineForLog.name}
              </h3>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Service Date</label>
                  <input
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Updated Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as typeof newStatus)}
                    className="w-full px-2 py-1.5 rounded border border-gray-300 bg-white"
                  >
                    <option value="operational">Operational (Fixed)</option>
                    <option value="under_maintenance">Under Maintenance</option>
                    <option value="broken">Broken / Awaiting Parts</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Issue / Breakdown Description *</label>
                <input
                  type="text"
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="e.g. Oil pump seal leaking, heater element tripping..."
                  className="w-full px-2.5 py-1.5 rounded border border-gray-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Action Taken / Repair Work</label>
                <textarea
                  rows={2}
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  placeholder="Repaired oil seal, replaced bearing, re-wired thermo-sensor..."
                  className="w-full px-2.5 py-1.5 rounded border border-gray-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Cost ({settings.currencySymbol})</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={cost === 0 ? '' : cost}
                    onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300 font-mono text-right"
                  />
                  <span className="text-[10px] text-gray-400">Auto-logged in Cashbook</span>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Technician / Workshop</label>
                  <input
                    type="text"
                    value={technician}
                    onChange={(e) => setTechnician(e.target.value)}
                    placeholder="e.g. Master Latif, In-house"
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Parts Replaced / Spares Used</label>
                <input
                  type="text"
                  value={partsReplaced}
                  onChange={(e) => setPartsReplaced(e.target.value)}
                  placeholder="e.g. 6204 Bearing, Teflon tape, Nichrome wire"
                  className="w-full px-2.5 py-1.5 rounded border border-gray-300"
                />
              </div>
            </div>

            <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsLogModalOpen(false)}
                className="px-3.5 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveLog}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                Save Maintenance Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE MAINTENANCE LOG */}
      {selectedMachineForPrint && (
        <PrintModal
          isOpen={!!selectedMachineForPrint}
          onClose={() => setSelectedMachineForPrint(null)}
          title={`Equipment Service Log: ${selectedMachineForPrint.name}`}
        >
          <div className="p-4 sm:p-6 text-black bg-white">
            <PrintHeader
              title="PLANT EQUIPMENT SERVICE & MAINTENANCE CARD"
              subtitle={`Machine: ${selectedMachineForPrint.name} [Code: ${selectedMachineForPrint.code || 'N/A'}]`}
              date={getTodayDateString()}
            />

            <div className="grid grid-cols-2 gap-3 text-xs mb-4 border border-black p-2 bg-gray-50">
              <div>
                <p><span className="font-bold">Location / Line:</span> {selectedMachineForPrint.location || '-'}</p>
                <p><span className="font-bold">Current Status:</span> {selectedMachineForPrint.status.toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p><span className="font-bold">Last Service:</span> {formatDate(selectedMachineForPrint.lastServiceDate)}</p>
                <p><span className="font-bold">Next Service Due:</span> {formatDate(selectedMachineForPrint.nextServiceDue)}</p>
              </div>
            </div>

            <table className="w-full text-xs border-collapse border border-black mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black py-1.5 px-2 text-center w-10">S.#</th>
                  <th className="border border-black py-1.5 px-2 text-left w-24">DATE</th>
                  <th className="border border-black py-1.5 px-2 text-left">BREAKDOWN / ISSUE</th>
                  <th className="border border-black py-1.5 px-2 text-left">ACTION TAKEN</th>
                  <th className="border border-black py-1.5 px-2 text-left w-28">PARTS REPLACED</th>
                  <th className="border border-black py-1.5 px-2 text-right w-24">COST</th>
                  <th className="border border-black py-1.5 px-2 text-left w-24">TECHNICIAN</th>
                </tr>
              </thead>
              <tbody>
                {selectedMachineForPrint.maintenanceHistory?.map((log, idx) => (
                  <tr key={idx} className="border-b border-gray-300">
                    <td className="border border-black py-1 px-2 text-center">{idx + 1}</td>
                    <td className="border border-black py-1 px-2 font-mono">{formatDate(log.date)}</td>
                    <td className="border border-black py-1 px-2 font-medium">{log.issueDescription}</td>
                    <td className="border border-black py-1 px-2">{log.actionTaken || '-'}</td>
                    <td className="border border-black py-1 px-2">{log.partsReplaced || '-'}</td>
                    <td className="border border-black py-1 px-2 text-right font-mono font-bold">
                      {formatCurrency(log.cost, settings.currencySymbol)}
                    </td>
                    <td className="border border-black py-1 px-2">{log.technician || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-8 pt-4 flex justify-between items-end text-xs">
              <div className="text-center w-48 border-t border-black pt-1">
                <p className="font-bold">Maintenance Incharge</p>
              </div>
              <div className="text-center w-48 border-t border-black pt-1">
                <p className="font-bold">Plant Manager</p>
              </div>
            </div>
          </div>
        </PrintModal>
      )}
    </div>
  );
};
