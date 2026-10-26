import React, { useState } from 'react';
import {
  Package,
  Plus,
  Trash2,
  Edit2,
  Printer,
  Search,
  Layers,
  Check,
  RotateCcw,
  Sparkles,
  Zap,
  BookmarkPlus,
} from 'lucide-react';
import { useFactory } from '../../context/FactoryContext';
import { ProductItem, PackVariant } from '../../types';
import { formatCurrency, getTodayDateString } from '../../utils/formatters';
import { PrintModal } from '../common/PrintModal';
import { PrintHeader } from '../common/PrintHeader';
import { EmptyState } from '../common/EmptyState';

export const ProductsModule: React.FC = () => {
  const { products, settings, saveProduct, deleteProduct, seedRaviCatalog } = useFactory();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [syncToast, setSyncToast] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState(settings.customUnits[0] || 'packet');
  const [defaultRate, setDefaultRate] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [alertLevel, setAlertLevel] = useState<number>(10);
  const [notes, setNotes] = useState('');
  const [variants, setVariants] = useState<PackVariant[]>([]);

  const handleOpenAdd = (isSpare: boolean = false, prefillName?: string, prefillCategory?: string) => {
    setEditingId(null);
    const prefix = isSpare ? 'SPR' : 'RN';
    setCode(`${prefix}-${(products.length + 1).toString().padStart(3, '0')}`);
    setName(prefillName || (isSpare ? 'اسپیئر آئٹم / Spare Product' : ''));
    setCategory(prefillCategory || (isSpare ? 'Spare / Spices' : 'Nimko'));
    setUnit(settings.customUnits[0] || 'packet');
    setDefaultRate(0);
    setStock(100);
    setAlertLevel(20);
    setNotes(isSpare ? 'Spare product added for customer orders' : 'New factory product');
    setVariants([
      { id: '1', name: 'Rs 10 والی', rate: 10 },
      { id: '2', name: 'Rs 20 والی', rate: 20 },
      { id: '3', name: 'Rs 50 والی', rate: 50 },
      { id: '4', name: 'Rs 100 والی', rate: 100 },
    ]);
    setIsModalOpen(true);
  };

  const handleApplyPresetVariants = (type: '4pack' | '3pack' | '2pack' | 'clear') => {
    if (type === '4pack') {
      setVariants([
        { id: '1', name: 'Rs 10 والی', rate: 10 },
        { id: '2', name: 'Rs 20 والی', rate: 20 },
        { id: '3', name: 'Rs 50 والی', rate: 50 },
        { id: '4', name: 'Rs 100 والی', rate: 100 },
      ]);
    } else if (type === '3pack') {
      setVariants([
        { id: '1', name: 'Rs 10 والی', rate: 10 },
        { id: '2', name: 'Rs 20 والی', rate: 20 },
        { id: '3', name: 'Rs 50 والی', rate: 50 },
      ]);
    } else if (type === '2pack') {
      setVariants([
        { id: '1', name: 'Rs 20 والی', rate: 20 },
        { id: '2', name: 'Rs 50 والی', rate: 50 },
      ]);
    } else {
      setVariants([]);
    }
  };

  const handleRestoreCatalog = async () => {
    if (confirm('Restore / synchronize standard Ravi Nimko products (13 pack variants)? Existing products will be preserved.')) {
      await seedRaviCatalog();
      setSyncToast(true);
      setTimeout(() => setSyncToast(false), 3000);
    }
  };

  const handleOpenEdit = (p: ProductItem) => {
    setEditingId(p.id);
    setCode(p.code || '');
    setName(p.name);
    setCategory(p.category || '');
    setUnit(p.unit || 'carton');
    setDefaultRate(p.defaultRate || 0);
    setStock(p.stock || 0);
    setAlertLevel(p.alertLevel || 10);
    setNotes(p.notes || '');
    setVariants(p.packVariants ? [...p.packVariants] : []);
    setIsModalOpen(true);
  };

  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      { id: Date.now().toString(), name: `Variant ${prev.length + 1}`, rate: 0 },
    ]);
  };

  const handleRemoveVariant = (idx: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleVariantChange = (idx: number, field: keyof PackVariant, val: unknown) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Product name is required.');
      return;
    }

    await saveProduct({
      id: editingId || undefined,
      code,
      name,
      category: category.trim() || 'General',
      unit,
      defaultRate,
      stock,
      alertLevel,
      notes,
      packVariants: variants,
    });

    setIsModalOpen(false);
  };

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.code && p.code.toLowerCase().includes(search.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Products &amp; Finished Goods
          </h2>
          <p className="text-xs text-gray-500">
            Configure your manufactured products, custom price/pack variants (e.g. Rs10/Rs20/Rs50/Rs100), and reorder alerts.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <button
            onClick={handleRestoreCatalog}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 rounded-lg shadow-xs cursor-pointer"
            title="Synchronize Ravi Nimko official products from order pad"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
            Sync Ravi Products
          </button>
          <button
            onClick={() => handleOpenAdd(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 rounded-lg shadow-xs cursor-pointer"
            title="Add spare option or future custom item"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            + Add Spare Option
          </button>
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-gray-600" />
            Print Price Catalog
          </button>
          <button
            onClick={() => handleOpenAdd(false)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </button>
        </div>
      </div>

      {syncToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium">
          <Check className="w-4 h-4 text-emerald-600" />
          Ravi Nimko official catalog synchronized! All 13 packs and items are active.
        </div>
      )}

      {/* 4 Core Variants & 10, 20, 50 Categories Visual Overview */}
      <div className="bg-linear-to-r from-blue-50 via-indigo-50 to-white p-4 rounded-xl border border-blue-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                4 بنیادی ورائٹیز
              </span>
              فیکٹری کے 4 پروڈکٹس اور 10، 20، 50 کیٹیگریز (4 Core Items &amp; Categories)
            </h3>
            <p className="text-xs text-gray-600">
              ہر ورائٹی پر کلک کر کے اس کا اسٹاک اور 10، 20، 50 ریٹ چیک یا ایڈٹ کریں۔
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              name: 'راوی مکس نمکو',
              roman: 'Ravi Mix',
              packs: ['Rs 10', 'Rs 20', 'Rs 50', 'Rs 100'],
              color: 'from-amber-500/10 to-orange-500/10 border-amber-300',
              badge: 'bg-amber-600',
            },
            {
              name: 'دال موٹھ',
              roman: 'Dal Moth',
              packs: ['Rs 10', 'Rs 20', 'Rs 50', 'Rs 100'],
              color: 'from-emerald-500/10 to-teal-500/10 border-emerald-300',
              badge: 'bg-emerald-600',
            },
            {
              name: 'دال چنا',
              roman: 'Dal Chana',
              packs: ['Rs 10', 'Rs 20', 'Rs 50'],
              color: 'from-yellow-500/10 to-amber-500/10 border-yellow-300',
              badge: 'bg-yellow-600',
            },
            {
              name: 'پی نٹ',
              roman: 'Peanut (مونگ پھلی)',
              packs: ['Rs 20', 'Rs 50'],
              color: 'from-rose-500/10 to-red-500/10 border-rose-300',
              badge: 'bg-rose-600',
            },
          ].map((item, idx) => {
            const matched = products.find((p) => p.name.includes(item.name) || item.name.includes(p.name));
            return (
              <div
                key={idx}
                onClick={() => {
                  if (matched) {
                    handleOpenEdit(matched);
                  }
                }}
                className={`bg-linear-to-b ${item.color} bg-white p-3 rounded-xl border hover:shadow-md transition cursor-pointer flex flex-col justify-between`}
              >
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-gray-500 font-mono">#{idx + 1}</span>
                    <span className={`text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${item.badge}`}>
                      {matched?.stock ?? 0} {matched?.unit || 'carton'}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm mb-0.5">{item.name}</h4>
                  <p className="text-[11px] text-gray-500 mb-2">{item.roman}</p>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {item.packs.map((p) => (
                      <span
                        key={p}
                        className="text-[10px] font-bold bg-white/90 border border-gray-200 text-gray-800 px-1.5 py-0.5 rounded shadow-2xs"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200/60 flex justify-between items-center text-[11px]">
                  <span className="text-gray-600 font-medium">کلک کر کے ایڈٹ کریں</span>
                  <Edit2 className="w-3 h-3 text-gray-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* NEW PRODUCTS ADD PORTION FOR FUTURE (مستقبل کے لیے نئی پروڈکٹس کا اضافہ) */}
      <div className="bg-linear-to-r from-purple-50 via-indigo-50/40 to-blue-50/50 p-4.5 rounded-xl border border-purple-200 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-purple-600 text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                <BookmarkPlus className="w-3 h-3" />
                مستقبل کے پروڈکٹس
              </span>
              <h3 className="text-sm font-bold text-gray-900">
                مستقبل کے لیے نئی پروڈکٹس کا پورشن (New Products Add Portion For Future)
              </h3>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              اگر فیکٹری مستقبل میں کوئی بھی نئی ورائٹی (جیسے کرکرے، چپس، گٹھیا، سیو، فرائیڈ چنا وغیرہ) شروع کرے، تو یہاں سے 1-کلک میں شامل کریں۔ 
              وہ خود بخود <strong>سیلز آرڈر پیڈ</strong>، <strong>پروڈکشن بیچ</strong> اور <strong>انونٹری</strong> میں دستیاب ہو جائے گی۔
            </p>
          </div>
          <button
            onClick={() => handleOpenAdd(false)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            + نئی پروڈکٹ بنائیں (Add Product)
          </button>
        </div>

        {/* 1-Click Popular Future Nimko & Snack Templates */}
        <div className="bg-white/80 backdrop-blur-xs rounded-xl p-3 border border-purple-100">
          <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1.5 mb-2">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            ایک کلک پر مستقبل کی مشہور ورائٹیز منتخب کریں (Quick-Add Templates):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {[
              { name: 'باریک سیو (Sev)', cat: 'Nimko' },
              { name: 'بیسن گٹھیا (Gathiya)', cat: 'Nimko' },
              { name: 'فرائیڈ دال مونگ (Moong Dal)', cat: 'Dal' },
              { name: 'کرکرے سنیکس (Kurkure)', cat: 'Snacks' },
              { name: 'پوٹاٹو چپس (Potato Chips)', cat: 'Chips' },
              { name: 'چنا چاٹ مصالحہ (Chana)', cat: 'Spicy' },
            ].map((tmpl) => (
              <button
                key={tmpl.name}
                type="button"
                onClick={() => handleOpenAdd(false, tmpl.name, tmpl.cat)}
                className="px-2.5 py-2 rounded-lg bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-300 text-left transition cursor-pointer group"
              >
                <span className="text-xs font-bold text-gray-800 group-hover:text-purple-900 block truncate">
                  + {tmpl.name}
                </span>
                <span className="text-[10px] text-gray-400 block">{tmpl.cat}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-xl border border-gray-200">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products, codes, categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Product List */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          title="No Products Registered"
          description="You can define any finished items manufactured by your factory with custom pricing and variants."
          actionText="Add First Product"
          onAction={handleOpenAdd}
          icon={<Package className="w-6 h-6" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs hover:border-blue-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-gray-400 block uppercase">
                      {product.code || 'NO-CODE'}
                    </span>
                    <h3 className="font-bold text-gray-900 text-base leading-snug">{product.name}</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
                    {product.category || 'General'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-gray-50 rounded-lg text-xs">
                  <div>
                    <span className="text-gray-500 block text-[11px]">Current Stock:</span>
                    <span className={`font-bold font-mono text-sm ${product.stock <= (product.alertLevel || 10) ? 'text-rose-600' : 'text-gray-900'}`}>
                      {product.stock} {product.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Default Rate:</span>
                    <span className="font-bold font-mono text-sm text-blue-700">
                      {formatCurrency(product.defaultRate, settings.currencySymbol)}
                    </span>
                  </div>
                </div>

                {/* Pack Variants Preview */}
                {product.packVariants && product.packVariants.length > 0 && (
                  <div className="mb-3">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                      Pack / Price Variants ({product.packVariants.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {product.packVariants.map((v) => (
                        <span
                          key={v.id}
                          className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-medium"
                        >
                          {v.name}: <strong className="font-bold">{formatCurrency(v.rate, settings.currencySymbol)}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {product.notes && (
                  <p className="text-xs text-gray-500 italic mt-1">{product.notes}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 mt-3 border-t border-gray-100">
                <button
                  onClick={() => handleOpenEdit(product)}
                  className="px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-md border border-gray-200 transition cursor-pointer flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete product "${product.name}"?`)) {
                      deleteProduct(product.id);
                    }
                  }}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col border border-gray-200 my-auto">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-gray-50 rounded-t-xl">
              <h3 className="font-bold text-gray-900 text-sm">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Product Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. PRD-001"
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Nimko, Dal, Snacks, Biscuits"
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Special Spicy Mix Nimko"
                  className="w-full px-2.5 py-1.5 rounded border border-gray-300 font-medium text-gray-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Unit of Measure (pc, kg, carton)</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="carton / packet / pc / kg"
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300 bg-white font-medium"
                  />
                  <div className="flex gap-1 mt-1">
                    {['carton', 'packet', 'kg', 'pc'].map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setUnit(u)}
                        className={`text-[10px] px-1.5 py-0.5 rounded border ${
                          unit === u ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Default Rate ({settings.currencySymbol})</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={defaultRate === 0 ? '' : defaultRate}
                    onChange={(e) => setDefaultRate(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300 text-right font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Current Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={stock === 0 ? '' : stock}
                    onChange={(e) => setStock(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 rounded border border-gray-300 text-right font-mono font-bold"
                  />
                </div>
              </div>

              {/* Pack Variants Section */}
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50/50 space-y-2">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1.5 mb-1">
                  <label className="font-bold text-gray-800 uppercase tracking-wide text-[11px]">
                    Pack / Price Variants (e.g. Rs10, Rs20, Rs50, Rs100)
                  </label>
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[10px] text-gray-400 font-medium">Quick Presets:</span>
                    <button
                      type="button"
                      onClick={() => handleApplyPresetVariants('4pack')}
                      className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100 cursor-pointer"
                    >
                      10, 20, 50, 100
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPresetVariants('3pack')}
                      className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded border border-gray-200 hover:bg-gray-200 cursor-pointer"
                    >
                      10, 20, 50
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPresetVariants('2pack')}
                      className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded border border-gray-200 hover:bg-gray-200 cursor-pointer"
                    >
                      20, 50
                    </button>
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="text-blue-600 hover:text-blue-700 font-semibold text-xs flex items-center gap-0.5 ml-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Custom
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {variants.map((v, i) => (
                    <div key={v.id} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Variant description (e.g. Rs. 10 Pack)"
                        value={v.name}
                        onChange={(e) => handleVariantChange(i, 'name', e.target.value)}
                        className="flex-1 px-2.5 py-1 rounded border border-gray-300 bg-white"
                      />
                      <div className="flex items-center gap-1 w-32">
                        <span className="text-gray-500">{settings.currencySymbol}</span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          placeholder="Rate"
                          value={v.rate === 0 ? '' : v.rate}
                          onChange={(e) => handleVariantChange(i, 'rate', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 rounded border border-gray-300 bg-white text-right font-mono"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(i)}
                        className="text-gray-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Notes / Description</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ingredients, shelf life, pack sizes, storage requirements..."
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
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE PRODUCT CATALOG */}
      {isPrintModalOpen && (
        <PrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title="Product Price Catalog &amp; Specification Sheet"
        >
          <div className="p-4 sm:p-6 text-black bg-white">
            <PrintHeader
              title="FACTORY PRODUCT CATALOG & PRICE LIST"
              subtitle="Wholesale Products & Price Pack Variants"
              date={getTodayDateString()}
            />

            <table className="w-full text-xs border-collapse border border-black mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black py-1.5 px-2 text-center w-10">S.#</th>
                  <th className="border border-black py-1.5 px-2 text-left w-24">CODE</th>
                  <th className="border border-black py-1.5 px-2 text-left">PRODUCT NAME</th>
                  <th className="border border-black py-1.5 px-2 text-left w-24">CATEGORY</th>
                  <th className="border border-black py-1.5 px-2 text-center w-16">UNIT</th>
                  <th className="border border-black py-1.5 px-2 text-right w-24">BASE RATE</th>
                  <th className="border border-black py-1.5 px-2 text-left">PACK VARIANTS</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p, i) => (
                  <tr key={p.id} className="border-b border-gray-300">
                    <td className="border border-black py-1 px-2 text-center">{i + 1}</td>
                    <td className="border border-black py-1 px-2 font-mono">{p.code || '-'}</td>
                    <td className="border border-black py-1 px-2 font-bold">{p.name}</td>
                    <td className="border border-black py-1 px-2">{p.category}</td>
                    <td className="border border-black py-1 px-2 text-center">{p.unit}</td>
                    <td className="border border-black py-1 px-2 text-right font-mono font-bold">
                      {formatCurrency(p.defaultRate, settings.currencySymbol)}
                    </td>
                    <td className="border border-black py-1 px-2">
                      {p.packVariants?.map((v) => `${v.name} (${formatCurrency(v.rate, settings.currencySymbol)})`).join(' | ') || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PrintModal>
      )}
    </div>
  );
};
