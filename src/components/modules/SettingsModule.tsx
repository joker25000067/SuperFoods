import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Plus,
  Trash2,
  CheckCircle,
  Building,
  Coins,
  Scale,
  Tag,
} from 'lucide-react';
import { useFactory } from '../../context/FactoryContext';
import { FactorySettings } from '../../types';

export const SettingsModule: React.FC = () => {
  const { settings, saveSettings } = useFactory();

  const [factoryName, setFactoryName] = useState(settings.factoryName);
  const [tagline, setTagline] = useState(settings.tagline || '');
  const [ownerName, setOwnerName] = useState(settings.ownerName || '');
  const [phone, setPhone] = useState(settings.phone || '');
  const [address, setAddress] = useState(settings.address || '');
  const [ntn, setNtn] = useState(settings.ntn || '');
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol || 'Rs.');

  const [units, setUnits] = useState<string[]>(settings.units || ['kg', 'gram', 'carton', 'pcs', 'liter', 'bag']);
  const [newUnit, setNewUnit] = useState('');

  const [expenseCategories, setExpenseCategories] = useState<string[]>(
    settings.expenseCategories || [
      'Utilities',
      'Transport & Fuel',
      'Repair & Maintenance',
      'Tea & Refreshments',
      'Petty Cash',
      'Machinery Spares',
      'Printing & Stationery',
      'Rent & Taxes',
    ]
  );
  const [newCategory, setNewCategory] = useState('');

  const [savedAlert, setSavedAlert] = useState(false);

  const handleAddUnit = () => {
    const trimmed = newUnit.trim().toLowerCase();
    if (trimmed && !units.includes(trimmed)) {
      setUnits([...units, trimmed]);
      setNewUnit('');
    }
  };

  const handleRemoveUnit = (u: string) => {
    if (units.length <= 1) {
      alert('At least one unit must be kept.');
      return;
    }
    setUnits(units.filter((unit) => unit !== u));
  };

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (trimmed && !expenseCategories.includes(trimmed)) {
      setExpenseCategories([...expenseCategories, trimmed]);
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (cat: string) => {
    if (expenseCategories.length <= 1) {
      alert('At least one expense category must be kept.');
      return;
    }
    setExpenseCategories(expenseCategories.filter((c) => c !== cat));
  };

  const handleSaveAll = async () => {
    if (!factoryName.trim()) {
      alert('Factory Name is required.');
      return;
    }

    const updatedSettings: FactorySettings = {
      ...settings,
      factoryName,
      tagline,
      ownerName,
      phone,
      address,
      ntn,
      currencySymbol,
      units,
      expenseCategories,
    };

    await saveSettings(updatedSettings);
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 3000);
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-gray-700" />
            Factory &amp; Application Configuration
          </h2>
          <p className="text-xs text-gray-500">
            Customize factory profile, invoice headers, currency symbol, measurement units, and expense heads.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleSaveAll}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>

      {savedAlert && (
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex items-center gap-2 text-xs text-emerald-800 font-bold">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          Settings saved to local IndexedDB successfully! All print headers and currencies updated.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Factory Profile */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
          <div className="border-b border-gray-100 pb-2.5 flex items-center gap-2">
            <Building className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-gray-900 text-sm">Factory Profile &amp; Invoice Header</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Factory / Business Name *</label>
              <input
                type="text"
                value={factoryName}
                onChange={(e) => setFactoryName(e.target.value)}
                placeholder="e.g. RAVI NIMKO & FOOD PRODUCTS"
                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 font-bold text-gray-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Tagline / Product Specialty</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Pure Taste, Superior Quality Snacks & Sweets"
                className="w-full px-3 py-1.5 rounded-lg border border-gray-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Owner / Proprietor Name</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Haji Muhammad Arif"
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Contact Phone(s)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 042-37654321, 0300-1234567"
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-300 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Factory Physical Address</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Plot 42, Industrial Area, Kot Lakhpat, Lahore"
                className="w-full px-3 py-1.5 rounded-lg border border-gray-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">NTN / Sales Tax / Registration #</label>
              <input
                type="text"
                value={ntn}
                onChange={(e) => setNtn(e.target.value)}
                placeholder="e.g. NTN-1234567-8"
                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Currency & Units */}
        <div className="space-y-5">
          {/* Currency */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
            <div className="border-b border-gray-100 pb-2 flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-gray-900 text-sm">Currency Notation</h3>
            </div>

            <div className="text-xs">
              <label className="block font-semibold text-gray-700 mb-1">Currency Symbol</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  placeholder="Rs."
                  className="w-24 px-3 py-1.5 rounded-lg border border-gray-300 font-bold font-mono text-center"
                />
                <div className="flex items-center gap-1.5 text-gray-500">
                  <button
                    type="button"
                    onClick={() => setCurrencySymbol('Rs.')}
                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-semibold"
                  >
                    Rs.
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrencySymbol('PKR')}
                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-semibold"
                  >
                    PKR
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrencySymbol('$')}
                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-semibold"
                  >
                    $
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrencySymbol('₹')}
                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-semibold"
                  >
                    ₹
                  </button>
                </div>
              </div>
              <span className="text-[11px] text-gray-400 mt-1 block">
                This symbol is rendered on all bills, order sheets, vouchers, and reports.
              </span>
            </div>
          </div>

          {/* Measurement Units */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
            <div className="border-b border-gray-100 pb-2 flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-gray-900 text-sm">Custom Measurement Units</h3>
            </div>

            <div className="text-xs space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {units.map((u) => (
                  <span
                    key={u}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-semibold"
                  >
                    {u}
                    <button
                      type="button"
                      onClick={() => handleRemoveUnit(u)}
                      className="text-blue-500 hover:text-rose-600 cursor-pointer"
                      title="Remove"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddUnit()}
                  placeholder="e.g. tin, drum, crate..."
                  className="flex-1 px-2.5 py-1 text-xs rounded border border-gray-300"
                />
                <button
                  type="button"
                  onClick={handleAddUnit}
                  className="px-3 py-1 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                >
                  Add Unit
                </button>
              </div>
            </div>
          </div>

          {/* Expense Categories */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
            <div className="border-b border-gray-100 pb-2 flex items-center gap-2">
              <Tag className="w-4 h-4 text-rose-600" />
              <h3 className="font-bold text-gray-900 text-sm">Custom Expense Categories</h3>
            </div>

            <div className="text-xs space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {expenseCategories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 font-medium"
                  >
                    {cat}
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(cat)}
                      className="text-rose-500 hover:text-rose-700 cursor-pointer"
                      title="Remove"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  placeholder="e.g. Generator Fuel, Packaging Cylinders..."
                  className="flex-1 px-2.5 py-1 text-xs rounded border border-gray-300"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-3 py-1 text-xs font-semibold bg-rose-600 text-white rounded hover:bg-rose-700 cursor-pointer"
                >
                  Add Category
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
