import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  FactorySettings,
  ProductItem,
  RawMaterial,
  PackagingItem,
  Supplier,
  Customer,
  Purchase,
  SaleOrder,
  ProductionBatch,
  StockLog,
  WastageRecord,
  Employee,
  AttendanceRecord,
  SalaryPayment,
  MachineRecord,
  Expense,
  CashbookEntry,
} from '../types';
import {
  STORES,
  getAllFromStore,
  putInStore,
  deleteFromStore,
  getSettings,
  saveSettings,
  exportCompleteDatabase,
  importCompleteDatabase,
  clearStore,
  DEFAULT_SETTINGS,
  DEFAULT_RAVI_PRODUCTS,
} from '../db/indexedDb';

function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

interface StockItemUnified {
  id: string;
  code: string;
  name: string;
  type: 'product' | 'raw_material' | 'packaging';
  category?: string;
  unit: string;
  stock: number;
  currentQuantity: number;
  alertLevel: number;
  minAlertQuantity: number;
  rate: number;
  defaultRate?: number;
  lastPurchaseRate?: number;
}

interface FactoryContextType {
  loading: boolean;
  settings: FactorySettings;
  products: ProductItem[];
  rawMaterials: RawMaterial[];
  packaging: PackagingItem[];
  suppliers: Supplier[];
  customers: Customer[];
  purchases: Purchase[];
  sales: SaleOrder[];
  orders: SaleOrder[];
  production: ProductionBatch[];
  productionBatches: ProductionBatch[];
  stockLogs: StockLog[];
  stockMovements: StockLog[];
  stockItems: StockItemUnified[];
  wastage: WastageRecord[];
  wastageRecords: WastageRecord[];
  employees: Employee[];
  attendance: AttendanceRecord[];
  attendanceRecords: AttendanceRecord[];
  salaries: SalaryPayment[];
  salaryPayments: SalaryPayment[];
  machines: MachineRecord[];
  expenses: Expense[];
  cashbook: CashbookEntry[];
  cashbookEntries: CashbookEntry[];

  // Settings
  updateSettings: (newSettings: FactorySettings) => Promise<void>;
  saveSettings?: (newSettings: FactorySettings) => Promise<void>;

  // Products
  saveProduct: (product: Omit<ProductItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<ProductItem>;
  deleteProduct: (id: string) => Promise<void>;
  seedRaviCatalog: () => Promise<void>;

  // Raw Materials
  saveRawMaterial: (material: Omit<RawMaterial, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<RawMaterial>;
  deleteRawMaterial: (id: string) => Promise<void>;

  // Packaging
  savePackaging: (item: Omit<PackagingItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<PackagingItem>;
  deletePackaging: (id: string) => Promise<void>;

  // Suppliers
  saveSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'> & { id?: string }) => Promise<Supplier>;
  deleteSupplier: (id: string) => Promise<void>;

  // Customers
  saveCustomer: (customer: Omit<Customer, 'id' | 'createdAt'> & { id?: string }) => Promise<Customer>;
  deleteCustomer: (id: string) => Promise<void>;

  // Purchases
  savePurchase: (purchase: Omit<Purchase, 'id' | 'createdAt'> & { id?: string }) => Promise<Purchase>;
  deletePurchase: (id: string) => Promise<void>;
  savePurchaseOrder: (purchase: Omit<Purchase, 'id' | 'createdAt'> & { id?: string }) => Promise<Purchase>;
  deletePurchaseOrder: (id: string) => Promise<void>;

  // Sales Orders (Paper Order sheet format)
  saveSaleOrder: (order: Omit<SaleOrder, 'id' | 'createdAt'> & { id?: string }) => Promise<SaleOrder>;
  deleteSaleOrder: (id: string) => Promise<void>;

  // Production
  saveProductionBatch: (batch: Omit<ProductionBatch, 'id' | 'createdAt'> & { id?: string }) => Promise<ProductionBatch>;
  deleteProductionBatch: (id: string) => Promise<void>;

  // Stock
  adjustStock: (
    itemType: 'product' | 'raw_material' | 'packaging',
    itemId: string,
    changeQty: number,
    reason: string,
    notes?: string
  ) => Promise<void>;

  // Wastage
  saveWastage: (wastage: Omit<WastageRecord, 'id' | 'createdAt'> & { id?: string }) => Promise<WastageRecord>;
  deleteWastage: (id: string) => Promise<void>;
  saveWastageRecord: (wastage: Omit<WastageRecord, 'id' | 'createdAt'> & { id?: string }) => Promise<WastageRecord>;
  deleteWastageRecord: (id: string) => Promise<void>;

  // Employees
  saveEmployee: (employee: Omit<Employee, 'id' | 'createdAt'> & { id?: string }) => Promise<Employee>;
  deleteEmployee: (id: string) => Promise<void>;

  // Attendance
  saveAttendance: (record: Omit<AttendanceRecord, 'id' | 'createdAt'> & { id?: string }) => Promise<AttendanceRecord>;
  deleteAttendance: (id: string) => Promise<void>;
  saveBulkAttendance: (records: Array<Omit<AttendanceRecord, 'id' | 'createdAt'> & { id?: string }>) => Promise<void>;

  // Salaries
  saveSalaryPayment: (payment: Omit<SalaryPayment, 'id' | 'createdAt'> & { id?: string }) => Promise<SalaryPayment>;
  deleteSalaryPayment: (id: string) => Promise<void>;

  // Machines
  saveMachine: (machine: Omit<MachineRecord, 'id' | 'createdAt'> & { id?: string }) => Promise<MachineRecord>;
  deleteMachine: (id: string) => Promise<void>;
  addMaintenanceLog: (
    machineId: string,
    log: { serviceType?: string; description?: string; issueDescription?: string; actionTaken?: string; partsReplaced?: string; cost: number; technician: string; nextDueDate?: string },
    newStatus?: string
  ) => Promise<void>;
  logMachineMaintenance: (
    machineId: string,
    log: { serviceType?: string; description?: string; issueDescription?: string; actionTaken?: string; partsReplaced?: string; cost: number; technician: string; nextDueDate?: string },
    newStatus?: string
  ) => Promise<void>;

  // Expenses
  saveExpense: (expense: Omit<Expense, 'id' | 'createdAt'> & { id?: string }) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;
  saveExpenseRecord: (expense: Omit<Expense, 'id' | 'createdAt'> & { id?: string }) => Promise<Expense>;
  deleteExpenseRecord: (id: string) => Promise<void>;

  // Cashbook
  saveCashbookEntry: (entry: Omit<CashbookEntry, 'id' | 'createdAt'> & { id?: string }) => Promise<CashbookEntry>;
  deleteCashbookEntry: (id: string) => Promise<void>;

  // Backup & Safety
  downloadJsonBackup: () => Promise<void>;
  restoreFromJson: (file: File) => Promise<{ success: boolean; message: string }>;
  resetAllData: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const FactoryContext = createContext<FactoryContextType | null>(null);

export const FactoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<FactorySettings>(DEFAULT_SETTINGS);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [packaging, setPackaging] = useState<PackagingItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [sales, setSales] = useState<SaleOrder[]>([]);
  const [production, setProduction] = useState<ProductionBatch[]>([]);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [wastage, setWastage] = useState<WastageRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [salaries, setSalaries] = useState<SalaryPayment[]>([]);
  const [machines, setMachines] = useState<MachineRecord[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [cashbook, setCashbook] = useState<CashbookEntry[]>([]);

  const refreshAll = useCallback(async () => {
    try {
      const [
        sSettings,
        sProducts,
        sRaw,
        sPkg,
        sSuppliers,
        sCustomers,
        sPurchases,
        sSales,
        sProd,
        sStock,
        sWastage,
        sEmp,
        sAtt,
        sSal,
        sMach,
        sExp,
        sCash,
      ] = await Promise.all([
        getSettings(),
        getAllFromStore<ProductItem>(STORES.PRODUCTS),
        getAllFromStore<RawMaterial>(STORES.RAW_MATERIALS),
        getAllFromStore<PackagingItem>(STORES.PACKAGING),
        getAllFromStore<Supplier>(STORES.SUPPLIERS),
        getAllFromStore<Customer>(STORES.CUSTOMERS),
        getAllFromStore<Purchase>(STORES.PURCHASES),
        getAllFromStore<SaleOrder>(STORES.SALES),
        getAllFromStore<ProductionBatch>(STORES.PRODUCTION),
        getAllFromStore<StockLog>(STORES.STOCK_LOGS),
        getAllFromStore<WastageRecord>(STORES.WASTAGE),
        getAllFromStore<Employee>(STORES.EMPLOYEES),
        getAllFromStore<AttendanceRecord>(STORES.ATTENDANCE),
        getAllFromStore<SalaryPayment>(STORES.SALARIES),
        getAllFromStore<MachineRecord>(STORES.MACHINES),
        getAllFromStore<Expense>(STORES.EXPENSES),
        getAllFromStore<CashbookEntry>(STORES.CASHBOOK),
      ]);

      // If products store is empty, automatically seed with official Ravi Nimko catalog
      let loadedProducts = sProducts;
      if (!loadedProducts || loadedProducts.length === 0) {
        for (const p of DEFAULT_RAVI_PRODUCTS) {
          await putInStore(STORES.PRODUCTS, p);
        }
        loadedProducts = [...DEFAULT_RAVI_PRODUCTS];
      }

      setSettings(sSettings);
      setProducts((loadedProducts || []).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      setRawMaterials(sRaw.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      setPackaging(sPkg.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      setSuppliers(sSuppliers.sort((a, b) => a.name.localeCompare(b.name)));
      setCustomers(sCustomers.sort((a, b) => a.name.localeCompare(b.name)));
      setPurchases(sPurchases.sort((a, b) => b.date.localeCompare(a.date)));
      setSales(sSales.sort((a, b) => b.date.localeCompare(a.date)));
      setProduction(sProd.sort((a, b) => b.date.localeCompare(a.date)));
      setStockLogs(sStock.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      setWastage(sWastage.sort((a, b) => b.date.localeCompare(a.date)));
      setEmployees(sEmp.sort((a, b) => a.name.localeCompare(b.name)));
      setAttendance(sAtt.sort((a, b) => b.date.localeCompare(a.date)));
      setSalaries(sSal.sort((a, b) => b.date.localeCompare(a.date)));
      setMachines(sMach.sort((a, b) => a.machineName.localeCompare(b.machineName)));
      setExpenses(sExp.sort((a, b) => b.date.localeCompare(a.date)));
      setCashbook(sCash.sort((a, b) => b.date.localeCompare(a.date)));
    } catch (err) {
      console.error('Failed to load records from IndexedDB:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // SETTINGS
  const updateSettings = async (newSettings: FactorySettings) => {
    const updated = await saveSettings(newSettings);
    setSettings(updated);
  };

  // PRODUCTS
  const saveProduct = async (data: Omit<ProductItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const now = new Date().toISOString();
    const product: ProductItem = {
      ...data,
      id: data.id || generateId('prod'),
      createdAt: (data as ProductItem).createdAt || now,
      updatedAt: now,
    };
    await putInStore(STORES.PRODUCTS, product);
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = product;
        return copy;
      }
      return [product, ...prev];
    });
    return product;
  };

  const deleteProduct = async (id: string) => {
    await deleteFromStore(STORES.PRODUCTS, id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const seedRaviCatalog = async () => {
    for (const p of DEFAULT_RAVI_PRODUCTS) {
      await putInStore(STORES.PRODUCTS, p);
    }
    setProducts((prev) => {
      const existingIds = new Set(prev.map((x) => x.id));
      const newItems = DEFAULT_RAVI_PRODUCTS.filter((x) => !existingIds.has(x.id));
      const updated = prev.map((p) => {
        const found = DEFAULT_RAVI_PRODUCTS.find((x) => x.id === p.id);
        return found || p;
      });
      return [...newItems, ...updated];
    });
  };

  // RAW MATERIALS
  const saveRawMaterial = async (data: Omit<RawMaterial, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const now = new Date().toISOString();
    const item: RawMaterial = {
      ...data,
      id: data.id || generateId('raw'),
      createdAt: (data as RawMaterial).createdAt || now,
      updatedAt: now,
    };
    await putInStore(STORES.RAW_MATERIALS, item);
    setRawMaterials((prev) => {
      const idx = prev.findIndex((p) => p.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item;
        return copy;
      }
      return [item, ...prev];
    });
    return item;
  };

  const deleteRawMaterial = async (id: string) => {
    await deleteFromStore(STORES.RAW_MATERIALS, id);
    setRawMaterials((prev) => prev.filter((p) => p.id !== id));
  };

  // PACKAGING
  const savePackaging = async (data: Omit<PackagingItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const now = new Date().toISOString();
    const item: PackagingItem = {
      ...data,
      id: data.id || generateId('pkg'),
      createdAt: (data as PackagingItem).createdAt || now,
      updatedAt: now,
    };
    await putInStore(STORES.PACKAGING, item);
    setPackaging((prev) => {
      const idx = prev.findIndex((p) => p.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = item;
        return copy;
      }
      return [item, ...prev];
    });
    return item;
  };

  const deletePackaging = async (id: string) => {
    await deleteFromStore(STORES.PACKAGING, id);
    setPackaging((prev) => prev.filter((p) => p.id !== id));
  };

  // SUPPLIERS
  const saveSupplier = async (data: Omit<Supplier, 'id' | 'createdAt'> & { id?: string }) => {
    const now = new Date().toISOString();
    const supplier: Supplier = {
      ...data,
      id: data.id || generateId('sup'),
      createdAt: (data as Supplier).createdAt || now,
    };
    await putInStore(STORES.SUPPLIERS, supplier);
    setSuppliers((prev) => {
      const idx = prev.findIndex((s) => s.id === supplier.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = supplier;
        return copy;
      }
      return [...prev, supplier].sort((a, b) => a.name.localeCompare(b.name));
    });
    return supplier;
  };

  const deleteSupplier = async (id: string) => {
    await deleteFromStore(STORES.SUPPLIERS, id);
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  // CUSTOMERS
  const saveCustomer = async (data: Omit<Customer, 'id' | 'createdAt'> & { id?: string }) => {
    const now = new Date().toISOString();
    const customer: Customer = {
      ...data,
      id: data.id || generateId('cust'),
      createdAt: (data as Customer).createdAt || now,
    };
    await putInStore(STORES.CUSTOMERS, customer);
    setCustomers((prev) => {
      const idx = prev.findIndex((c) => c.id === customer.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = customer;
        return copy;
      }
      return [...prev, customer].sort((a, b) => a.name.localeCompare(b.name));
    });
    return customer;
  };

  const deleteCustomer = async (id: string) => {
    await deleteFromStore(STORES.CUSTOMERS, id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  // PURCHASES (With automatic Stock In, Supplier balance update, Cashbook recording)
  const savePurchase = async (data: Omit<Purchase, 'id' | 'createdAt'> & { id?: string }) => {
    const now = new Date().toISOString();
    const isNew = !data.id;
    const purchase: Purchase = {
      ...data,
      id: data.id || generateId('pur'),
      createdAt: (data as Purchase).createdAt || now,
    };

    await putInStore(STORES.PURCHASES, purchase);

    // Apply stock and accounts if new purchase
    if (isNew) {
      for (const item of purchase.items) {
        const itemQty = Number(item.qty ?? item.quantity ?? 0);
        if (item.itemId && itemQty > 0) {
          if (item.itemType === 'raw_material') {
            const raw = rawMaterials.find((r) => r.id === item.itemId);
            if (raw) {
              const updatedQty = raw.stock + itemQty;
              const updatedRaw: RawMaterial = {
                ...raw,
                stock: updatedQty,
                lastPurchaseRate: item.rate,
                updatedAt: now,
              };
              await putInStore(STORES.RAW_MATERIALS, updatedRaw);
              const log: StockLog = {
                id: generateId('stk'),
                date: purchase.date,
                itemType: 'raw_material',
                itemId: raw.id,
                itemName: raw.name,
                changeQty: itemQty,
                resultingStock: updatedQty,
                reason: `Purchase Bill #${purchase.invoiceNo}`,
                referenceNo: purchase.invoiceNo,
                createdAt: now,
              };
              await putInStore(STORES.STOCK_LOGS, log);
            }
          } else if (item.itemType === 'packaging') {
            const pkg = packaging.find((p) => p.id === item.itemId);
            if (pkg) {
              const updatedQty = pkg.stock + itemQty;
              const updatedPkg: PackagingItem = {
                ...pkg,
                stock: updatedQty,
                lastPurchaseRate: item.rate,
                updatedAt: now,
              };
              await putInStore(STORES.PACKAGING, updatedPkg);
              const log: StockLog = {
                id: generateId('stk'),
                date: purchase.date,
                itemType: 'packaging',
                itemId: pkg.id,
                itemName: pkg.name,
                changeQty: itemQty,
                resultingStock: updatedQty,
                reason: `Purchase Bill #${purchase.invoiceNo}`,
                referenceNo: purchase.invoiceNo,
                createdAt: now,
              };
              await putInStore(STORES.STOCK_LOGS, log);
            }
          }
        }
      }

      // Update Supplier Balance (dueAmount adds to payable)
      if (purchase.supplierId && purchase.dueAmount > 0) {
        const sup = suppliers.find((s) => s.id === purchase.supplierId);
        if (sup) {
          const updatedSup = { ...sup, currentBalance: sup.currentBalance + purchase.dueAmount };
          await putInStore(STORES.SUPPLIERS, updatedSup);
        }
      }

      // If paid amount > 0, log in Cashbook
      if (purchase.paidAmount > 0) {
        const isBank = (purchase.paymentMode || '').toLowerCase() === 'bank';
        const cashEntry: CashbookEntry = {
          id: generateId('csh'),
          date: purchase.date,
          type: 'OUT',
          category: 'Purchase Payment',
          amount: purchase.paidAmount,
          account: isBank ? 'Bank' : 'Cash',
          paymentMode: isBank ? 'bank' : 'cash',
          reference: purchase.invoiceNo,
          description: `Paid to ${purchase.supplierName || 'Supplier'} for Bill #${purchase.invoiceNo}`,
          createdAt: now,
        };
        await putInStore(STORES.CASHBOOK, cashEntry);
      }
    }

    await refreshAll();
    return purchase;
  };

  const deletePurchase = async (id: string) => {
    await deleteFromStore(STORES.PURCHASES, id);
    setPurchases((prev) => prev.filter((p) => p.id !== id));
  };

  // SALES ORDERS (With automatic Finished Goods stock deduction, Customer balance update, Cashbook recording)
  const saveSaleOrder = async (data: Omit<SaleOrder, 'id' | 'createdAt'> & { id?: string }) => {
    const now = new Date().toISOString();
    const isNew = !data.id;
    const order: SaleOrder = {
      ...data,
      id: data.id || generateId('ord'),
      createdAt: (data as SaleOrder).createdAt || now,
    };

    await putInStore(STORES.SALES, order);

    if (isNew) {
      // Deduct Finished Product Stock
      for (const item of order.items) {
        if (item.productId) {
          const prod = products.find((p) => p.id === item.productId);
          if (prod) {
            const updatedStock = Math.max(0, prod.stock - item.qty);
            const updatedProd = { ...prod, stock: updatedStock, updatedAt: now };
            await putInStore(STORES.PRODUCTS, updatedProd);

            const log: StockLog = {
              id: generateId('stk'),
              date: order.date,
              itemType: 'product',
              itemId: prod.id,
              itemName: `${prod.name} ${item.variantName ? `(${item.variantName})` : ''}`,
              changeQty: -item.qty,
              resultingStock: updatedStock,
              reason: `Sale Invoice #${order.invoiceNo}`,
              referenceNo: order.invoiceNo,
              createdAt: now,
            };
            await putInStore(STORES.STOCK_LOGS, log);
          }
        }
      }

      // Update Customer balance (due amount adds to customer receivable)
      if (order.customerId && order.dueAmount > 0) {
        const cust = customers.find((c) => c.id === order.customerId);
        if (cust) {
          const updatedCust = { ...cust, currentBalance: cust.currentBalance + order.dueAmount };
          await putInStore(STORES.CUSTOMERS, updatedCust);
        }
      }

      // If paid amount > 0, log in Cashbook
      if (order.paidAmount > 0) {
        const isBank = (order.paymentMode || '').toLowerCase() === 'bank';
        const cashEntry: CashbookEntry = {
          id: generateId('csh'),
          date: order.date,
          type: 'IN',
          category: 'Sale Receipt',
          amount: order.paidAmount,
          account: isBank ? 'Bank' : 'Cash',
          paymentMode: isBank ? 'bank' : 'cash',
          reference: order.invoiceNo,
          description: `Received from ${order.customerName} for Order #${order.invoiceNo}`,
          createdAt: now,
        };
        await putInStore(STORES.CASHBOOK, cashEntry);
      }
    }

    await refreshAll();
    return order;
  };

  const deleteSaleOrder = async (id: string) => {
    await deleteFromStore(STORES.SALES, id);
    setSales((prev) => prev.filter((s) => s.id !== id));
  };

  // PRODUCTION (Adds to Finished Goods, deducts used Raw Materials and Packaging)
  const saveProductionBatch = async (data: Omit<ProductionBatch, 'id' | 'createdAt'> & { id?: string }) => {
    const now = new Date().toISOString();
    const isNew = !data.id;

    const producedQty = Number(data.producedQty ?? data.outputQuantity ?? 0);
    const outputQuantity = producedQty;
    const unit = data.unit || data.outputUnit || 'carton';
    const outputUnit = unit;
    const wastageQty = Number(data.wastageQty ?? data.wastageQuantity ?? 0);
    const wastageQuantity = wastageQty;
    const batchNo = data.batchNo || (data as any).batchNumber || `BAT-${Date.now().toString().slice(-4)}`;
    const batchNumber = batchNo;
    const totalCost = Number(data.totalCost || 0);
    const perUnitCost = Number(data.perUnitCost ?? data.costPerUnit ?? (producedQty > 0 ? totalCost / producedQty : 0));
    const costPerUnit = perUnitCost;

    // Normalize materials list so both formats are fully populated
    let normalizedMaterials: Array<{ id: string; type: 'raw_material' | 'packaging'; itemId: string; itemName: string; qty: number; unit: string; unitCost: number; totalCost: number }> = [];

    if (Array.isArray(data.consumedMaterials) && data.consumedMaterials.length > 0) {
      normalizedMaterials = data.consumedMaterials.map((cm, idx) => ({
        id: cm.id || String(idx + 1),
        type: cm.materialType,
        itemId: (cm as any).itemId || cm.materialId || '',
        itemName: (cm as any).itemName || cm.materialName || '',
        qty: Number(cm.quantity || (cm as any).qty || 0),
        unit: cm.unit || '',
        unitCost: Number(cm.unitCost || 0),
        totalCost: Number(cm.totalCost || 0),
      }));
    } else if (Array.isArray(data.materialsUsed) && data.materialsUsed.length > 0) {
      normalizedMaterials = data.materialsUsed.map((mu, idx) => ({
        id: mu.id || String(idx + 1),
        type: mu.type,
        itemId: mu.itemId || '',
        itemName: mu.itemName || '',
        qty: Number(mu.qty || 0),
        unit: mu.unit || '',
        unitCost: 0,
        totalCost: 0,
      }));
    }

    const materialsUsed = normalizedMaterials.map((m) => ({
      id: m.id,
      type: m.type,
      itemId: m.itemId,
      itemName: m.itemName,
      qty: m.qty,
      unit: m.unit,
    }));

    const consumedMaterials = normalizedMaterials.map((m) => ({
      id: m.id,
      materialType: m.type,
      materialId: m.itemId,
      itemId: m.itemId,
      materialName: m.itemName,
      itemName: m.itemName,
      quantity: m.qty,
      unit: m.unit,
      unitCost: m.unitCost,
      totalCost: m.totalCost,
    }));

    const batch: ProductionBatch = {
      ...data,
      batchNo,
      batchNumber,
      producedQty,
      outputQuantity,
      unit,
      outputUnit,
      wastageQty,
      wastageQuantity,
      totalCost,
      perUnitCost,
      costPerUnit,
      materialsUsed,
      consumedMaterials,
      id: data.id || generateId('bat'),
      createdAt: (data as ProductionBatch).createdAt || now,
    };

    await putInStore(STORES.PRODUCTION, batch);

    if (isNew) {
      // 1. Increase finished product stock
      if (batch.productId && producedQty > 0) {
        const prod = products.find((p) => p.id === batch.productId);
        if (prod) {
          const newStock = prod.stock + producedQty;
          await putInStore(STORES.PRODUCTS, { ...prod, stock: newStock, updatedAt: now });

          const log: StockLog = {
            id: generateId('stk'),
            date: batch.date,
            itemType: 'product',
            itemId: prod.id,
            itemName: prod.name,
            changeQty: producedQty,
            resultingStock: newStock,
            reason: `Production Batch #${batch.batchNo}`,
            referenceNo: batch.batchNo,
            createdAt: now,
          };
          await putInStore(STORES.STOCK_LOGS, log);
        }
      }

      // 2. Deduct materials used
      for (const mat of normalizedMaterials) {
        if (mat.itemId && mat.qty > 0) {
          if (mat.type === 'raw_material') {
            const raw = rawMaterials.find((r) => r.id === mat.itemId);
            if (raw) {
              const newStock = Math.max(0, raw.stock - mat.qty);
              await putInStore(STORES.RAW_MATERIALS, { ...raw, stock: newStock, updatedAt: now });
              const log: StockLog = {
                id: generateId('stk'),
                date: batch.date,
                itemType: 'raw_material',
                itemId: raw.id,
                itemName: raw.name,
                changeQty: -mat.qty,
                resultingStock: newStock,
                reason: `Used in Batch #${batch.batchNo} (${batch.productName})`,
                referenceNo: batch.batchNo,
                createdAt: now,
              };
              await putInStore(STORES.STOCK_LOGS, log);
            }
          } else if (mat.type === 'packaging') {
            const pkg = packaging.find((p) => p.id === mat.itemId);
            if (pkg) {
              const newStock = Math.max(0, pkg.stock - mat.qty);
              await putInStore(STORES.PACKAGING, { ...pkg, stock: newStock, updatedAt: now });
              const log: StockLog = {
                id: generateId('stk'),
                date: batch.date,
                itemType: 'packaging',
                itemId: pkg.id,
                itemName: pkg.name,
                changeQty: -mat.qty,
                resultingStock: newStock,
                reason: `Used in Batch #${batch.batchNo} (${batch.productName})`,
                referenceNo: batch.batchNo,
                createdAt: now,
              };
              await putInStore(STORES.STOCK_LOGS, log);
            }
          }
        }
      }

      // 3. Record wastage if any
      if (wastageQty > 0) {
        const waste: WastageRecord = {
          id: generateId('wst'),
          date: batch.date,
          category: 'Production',
          itemType: 'product',
          itemId: batch.productId,
          itemName: batch.productName,
          qty: wastageQty,
          quantity: wastageQty,
          unit: batch.unit,
          estimatedLoss: 0,
          estimatedCost: 0,
          reason: batch.wastageReason || `Batch #${batch.batchNo} wastage`,
          createdAt: now,
        };
        await putInStore(STORES.WASTAGE, waste);
      }
    }

    await refreshAll();
    return batch;
  };

  const deleteProductionBatch = async (id: string) => {
    await deleteFromStore(STORES.PRODUCTION, id);
    setProduction((prev) => prev.filter((p) => p.id !== id));
  };

  // MANUAL STOCK ADJUSTMENT
  const adjustStock = async (
    itemType: 'product' | 'raw_material' | 'packaging',
    itemId: string,
    changeQty: number,
    reason: string,
    notes?: string
  ) => {
    const now = new Date().toISOString();
    let itemName = '';
    let resultingStock = 0;

    if (itemType === 'product') {
      const item = products.find((p) => p.id === itemId);
      if (!item) return;
      itemName = item.name;
      resultingStock = Math.max(0, item.stock + changeQty);
      await putInStore(STORES.PRODUCTS, { ...item, stock: resultingStock, updatedAt: now });
    } else if (itemType === 'raw_material') {
      const item = rawMaterials.find((r) => r.id === itemId);
      if (!item) return;
      itemName = item.name;
      resultingStock = Math.max(0, item.stock + changeQty);
      await putInStore(STORES.RAW_MATERIALS, { ...item, stock: resultingStock, updatedAt: now });
    } else if (itemType === 'packaging') {
      const item = packaging.find((p) => p.id === itemId);
      if (!item) return;
      itemName = item.name;
      resultingStock = Math.max(0, item.stock + changeQty);
      await putInStore(STORES.PACKAGING, { ...item, stock: resultingStock, updatedAt: now });
    }

    const log: StockLog = {
      id: generateId('stk'),
      date: now.split('T')[0],
      itemType,
      itemId,
      itemName,
      changeQty,
      resultingStock,
      reason: reason || 'Manual Stock Adjustment',
      notes,
      createdAt: now,
    };
    await putInStore(STORES.STOCK_LOGS, log);

    await refreshAll();
  };

  // WASTAGE
  const saveWastage = async (data: Omit<WastageRecord, 'id' | 'createdAt'> & { id?: string }, deductStock: boolean = true) => {
    const now = new Date().toISOString();
    const isNew = !data.id;
    const wasteQty = Number(data.qty ?? (data as any).quantity ?? 0);
    const estCost = Number(data.estimatedCost ?? data.estimatedLoss ?? 0);
    const record: WastageRecord = {
      ...data,
      qty: wasteQty,
      quantity: wasteQty,
      estimatedLoss: estCost,
      estimatedCost: estCost,
      id: data.id || generateId('wst'),
      createdAt: (data as WastageRecord).createdAt || now,
    };
    await putInStore(STORES.WASTAGE, record);

    if (isNew && record.itemId && wasteQty > 0 && deductStock) {
      // Deduct from appropriate stock
      if (record.itemType === 'product') {
        const prod = products.find((p) => p.id === record.itemId);
        if (prod) {
          const updatedStock = Math.max(0, prod.stock - wasteQty);
          await putInStore(STORES.PRODUCTS, { ...prod, stock: updatedStock, updatedAt: now });
          await putInStore(STORES.STOCK_LOGS, {
            id: generateId('stk'),
            date: record.date,
            itemType: 'product',
            itemId: prod.id,
            itemName: prod.name,
            changeQty: -wasteQty,
            resultingStock: updatedStock,
            reason: `Wastage: ${record.reason}`,
            createdAt: now,
          });
        }
      } else if (record.itemType === 'raw_material') {
        const raw = rawMaterials.find((r) => r.id === record.itemId);
        if (raw) {
          const updatedStock = Math.max(0, raw.stock - wasteQty);
          await putInStore(STORES.RAW_MATERIALS, { ...raw, stock: updatedStock, updatedAt: now });
          await putInStore(STORES.STOCK_LOGS, {
            id: generateId('stk'),
            date: record.date,
            itemType: 'raw_material',
            itemId: raw.id,
            itemName: raw.name,
            changeQty: -wasteQty,
            resultingStock: updatedStock,
            reason: `Wastage: ${record.reason}`,
            createdAt: now,
          });
        }
      } else if (record.itemType === 'packaging') {
        const pkg = packaging.find((p) => p.id === record.itemId);
        if (pkg) {
          const updatedStock = Math.max(0, pkg.stock - wasteQty);
          await putInStore(STORES.PACKAGING, { ...pkg, stock: updatedStock, updatedAt: now });
          await putInStore(STORES.STOCK_LOGS, {
            id: generateId('stk'),
            date: record.date,
            itemType: 'packaging',
            itemId: pkg.id,
            itemName: pkg.name,
            changeQty: -wasteQty,
            resultingStock: updatedStock,
            reason: `Wastage: ${record.reason}`,
            createdAt: now,
          });
        }
      }
    }

    await refreshAll();
    return record;
  };

  const deleteWastage = async (id: string) => {
    await deleteFromStore(STORES.WASTAGE, id);
    setWastage((prev) => prev.filter((w) => w.id !== id));
  };

  // EMPLOYEES
  const saveEmployee = async (data: Omit<Employee, 'id' | 'createdAt'> & { id?: string }) => {
    const now = new Date().toISOString();
    const employee: Employee = {
      ...data,
      id: data.id || generateId('emp'),
      createdAt: (data as Employee).createdAt || now,
    };
    await putInStore(STORES.EMPLOYEES, employee);
    setEmployees((prev) => {
      const idx = prev.findIndex((e) => e.id === employee.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = employee;
        return copy;
      }
      return [...prev, employee].sort((a, b) => a.name.localeCompare(b.name));
    });
    return employee;
  };

  const deleteEmployee = async (id: string) => {
    await deleteFromStore(STORES.EMPLOYEES, id);
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  // ATTENDANCE
  const saveAttendance = async (data: Omit<AttendanceRecord, 'id' | 'createdAt'> & { id?: string }) => {
    const now = new Date().toISOString();
    const record: AttendanceRecord = {
      ...data,
      id: data.id || generateId('att'),
      createdAt: (data as AttendanceRecord).createdAt || now,
    };
    await putInStore(STORES.ATTENDANCE, record);
    setAttendance((prev) => {
      const idx = prev.findIndex((a) => a.id === record.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = record;
        return copy;
      }
      return [record, ...prev];
    });
    return record;
  };

  const deleteAttendance = async (id: string) => {
    await deleteFromStore(STORES.ATTENDANCE, id);
    setAttendance((prev) => prev.filter((a) => a.id !== id));
  };

  // SALARIES (Records Cashbook outflow)
  const saveSalaryPayment = async (data: Omit<SalaryPayment, 'id' | 'createdAt'> & { id?: string }) => {
    const now = new Date().toISOString();
    const isNew = !data.id;
    const payment: SalaryPayment = {
      ...data,
      id: data.id || generateId('sal'),
      createdAt: (data as SalaryPayment).createdAt || now,
    };
    await putInStore(STORES.SALARIES, payment);

    const paidAmt = payment.netPaid ?? payment.netSalary ?? 0;
    if (isNew && paidAmt > 0) {
      const cashEntry: CashbookEntry = {
        id: generateId('csh'),
        date: payment.date || payment.paymentDate || now.split('T')[0],
        type: 'OUT',
        category: 'Salary & Wages',
        amount: paidAmt,
        account: payment.paymentMode?.toLowerCase() === 'bank' ? 'Bank' : 'Cash',
        reference: payment.voucherNo || '',
        description: `Salary paid to ${payment.employeeName} for ${payment.period || payment.monthYear || ''}`,
        createdAt: now,
      };
      await putInStore(STORES.CASHBOOK, cashEntry);
    }

    await refreshAll();
    return payment;
  };

  const deleteSalaryPayment = async (id: string) => {
    await deleteFromStore(STORES.SALARIES, id);
    setSalaries((prev) => prev.filter((s) => s.id !== id));
  };

  // MACHINES & MAINTENANCE
  const saveMachine = async (data: Omit<MachineRecord, 'id' | 'createdAt'> & { id?: string }) => {
    const now = new Date().toISOString();
    const machine: MachineRecord = {
      ...data,
      id: data.id || generateId('mac'),
      createdAt: (data as MachineRecord).createdAt || now,
    };
    await putInStore(STORES.MACHINES, machine);
    setMachines((prev) => {
      const idx = prev.findIndex((m) => m.id === machine.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = machine;
        return copy;
      }
      return [...prev, machine].sort((a, b) => a.machineName.localeCompare(b.machineName));
    });
    return machine;
  };

  const deleteMachine = async (id: string) => {
    await deleteFromStore(STORES.MACHINES, id);
    setMachines((prev) => prev.filter((m) => m.id !== id));
  };

  const addMaintenanceLog = async (
    machineId: string,
    log: { serviceType?: string; description?: string; issueDescription?: string; actionTaken?: string; partsReplaced?: string; cost: number; technician: string; nextDueDate?: string; date?: string },
    newStatus?: string
  ) => {
    const now = new Date().toISOString();
    const machine = machines.find((m) => m.id === machineId);
    if (!machine) return;

    const newLog = {
      id: generateId('log'),
      date: log.date || now.split('T')[0],
      serviceType: log.serviceType || 'Maintenance',
      description: log.description || log.issueDescription || '',
      issueDescription: log.issueDescription,
      actionTaken: log.actionTaken,
      partsReplaced: log.partsReplaced,
      cost: log.cost || 0,
      technician: log.technician || '',
      nextDueDate: log.nextDueDate,
    };

    const updatedMachine: MachineRecord = {
      ...machine,
      status: (newStatus as any) || machine.status,
      lastServiceDate: newLog.date,
      nextServiceDue: log.nextDueDate || machine.nextServiceDue,
      serviceLogs: [newLog, ...(machine.serviceLogs || [])],
      maintenanceLogs: [newLog, ...(machine.maintenanceLogs || [])],
    };

    await putInStore(STORES.MACHINES, updatedMachine);

    // If cost > 0, log as Expense and Cashbook outflow
    if (log.cost > 0) {
      const exp: Expense = {
        id: generateId('exp'),
        date: newLog.date,
        voucherNo: `MNT-${Date.now().toString().slice(-4)}`,
        category: 'Machine Maintenance',
        amount: log.cost,
        paidTo: log.technician || 'Maintenance Vendor',
        paymentMode: 'Cash',
        notes: `${machine.machineName}: ${log.serviceType} - ${log.description}`,
        createdAt: now,
      };
      await putInStore(STORES.EXPENSES, exp);

      const cashEntry: CashbookEntry = {
        id: generateId('csh'),
        date: newLog.date,
        type: 'OUT',
        category: 'Machine Maintenance',
        amount: log.cost,
        account: 'Cash',
        reference: exp.voucherNo,
        description: `Maintenance on ${machine.machineName} by ${log.technician}`,
        createdAt: now,
      };
      await putInStore(STORES.CASHBOOK, cashEntry);
    }

    await refreshAll();
  };

  // EXPENSES
  const saveExpense = async (data: Omit<Expense, 'id' | 'createdAt'> & { id?: string }) => {
    const now = new Date().toISOString();
    const isNew = !data.id;
    const expense: Expense = {
      ...data,
      id: data.id || generateId('exp'),
      createdAt: (data as Expense).createdAt || now,
    };
    await putInStore(STORES.EXPENSES, expense);

    if (isNew && expense.amount > 0) {
      const cashEntry: CashbookEntry = {
        id: generateId('csh'),
        date: expense.date,
        type: 'OUT',
        category: `Expense: ${expense.category}`,
        amount: expense.amount,
        account: expense.paymentMode?.toLowerCase() === 'bank' ? 'Bank' : 'Cash',
        reference: expense.voucherNo,
        description: `Paid to ${expense.paidTo} for ${expense.category}${expense.notes ? ` (${expense.notes})` : ''}`,
        createdAt: now,
      };
      await putInStore(STORES.CASHBOOK, cashEntry);
    }

    await refreshAll();
    return expense;
  };

  const deleteExpense = async (id: string) => {
    await deleteFromStore(STORES.EXPENSES, id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // CASHBOOK
  const saveCashbookEntry = async (data: Omit<CashbookEntry, 'id' | 'createdAt'> & { id?: string }) => {
    const now = new Date().toISOString();
    const rawType = (data.type || 'IN').toString().toUpperCase();
    const type: 'IN' | 'OUT' = rawType === 'OUT' ? 'OUT' : 'IN';
    const isBank = (data.account || data.paymentMode || 'Cash').toString().toLowerCase() === 'bank';
    const account = isBank ? 'Bank' : 'Cash';
    const paymentMode = isBank ? 'bank' : 'cash';

    const entry: CashbookEntry = {
      ...data,
      type,
      account,
      paymentMode,
      id: data.id || generateId('csh'),
      createdAt: (data as CashbookEntry).createdAt || now,
    };
    await putInStore(STORES.CASHBOOK, entry);
    setCashbook((prev) => {
      const idx = prev.findIndex((c) => c.id === entry.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = entry;
        return copy;
      }
      return [entry, ...prev].sort((a, b) => b.date.localeCompare(a.date));
    });
    return entry;
  };

  const deleteCashbookEntry = async (id: string) => {
    await deleteFromStore(STORES.CASHBOOK, id);
    setCashbook((prev) => prev.filter((c) => c.id !== id));
  };

  // BACKUP & RESTORE
  const downloadJsonBackup = async () => {
    const data = await exportCompleteDatabase();
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `factory_backup_${dateStr}_${Date.now()}.json`;
    const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(jsonBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const restoreFromJson = async (file: File): Promise<{ success: boolean; message: string }> => {
    try {
      // 1. SAFETY BACKUP FIRST! Automatically trigger current backup download before wiping/replacing
      await downloadJsonBackup();

      // 2. Read new file
      const text = await file.text();
      const parsed = JSON.parse(text);

      // 3. Restore
      await importCompleteDatabase(parsed);
      await refreshAll();

      return {
        success: true,
        message: 'Database restored successfully! A safety backup of your previous state was automatically downloaded.',
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error parsing backup file';
      return {
        success: false,
        message: `Restore failed: ${msg}`,
      };
    }
  };

  const resetAllData = async () => {
    // Safety backup first
    await downloadJsonBackup();

    for (const storeName of Object.values(STORES)) {
      if (storeName !== STORES.SETTINGS) {
        await clearStore(storeName);
      }
    }
    await refreshAll();
  };

  const stockItems: StockItemUnified[] = useMemo(() => {
    const list: StockItemUnified[] = [];

    (products || []).forEach((p) => {
      list.push({
        id: p.id,
        code: p.code || '',
        name: p.name,
        type: 'product',
        category: p.category,
        unit: p.unit,
        stock: p.stock || 0,
        currentQuantity: p.stock || 0,
        alertLevel: p.alertLevel || 0,
        minAlertQuantity: p.alertLevel || 0,
        rate: p.defaultRate || 0,
        defaultRate: p.defaultRate || 0,
      });
    });

    (rawMaterials || []).forEach((r) => {
      list.push({
        id: r.id,
        code: r.code || '',
        name: r.name,
        type: 'raw_material',
        category: r.category,
        unit: r.unit,
        stock: r.stock || 0,
        currentQuantity: r.stock || 0,
        alertLevel: r.alertLevel || 0,
        minAlertQuantity: r.alertLevel || 0,
        rate: r.lastPurchaseRate || 0,
        lastPurchaseRate: r.lastPurchaseRate || 0,
      });
    });

    (packaging || []).forEach((pk) => {
      list.push({
        id: pk.id,
        code: pk.code || '',
        name: pk.name,
        type: 'packaging',
        category: pk.type,
        unit: pk.unit,
        stock: pk.stock || 0,
        currentQuantity: pk.stock || 0,
        alertLevel: pk.alertLevel || 0,
        minAlertQuantity: pk.alertLevel || 0,
        rate: pk.lastPurchaseRate || 0,
        lastPurchaseRate: pk.lastPurchaseRate || 0,
      });
    });

    return list;
  }, [products, rawMaterials, packaging]);

  const saveBulkAttendance = async (
    records: Array<Omit<AttendanceRecord, 'id' | 'createdAt'> & { id?: string }>
  ) => {
    for (const rec of records) {
      await saveAttendance(rec);
    }
  };

  const logMachineMaintenance = async (
    machineId: string,
    log: {
      serviceType?: string;
      description?: string;
      issueDescription?: string;
      actionTaken?: string;
      partsReplaced?: string;
      cost: number;
      technician: string;
      nextDueDate?: string;
    },
    newStatus?: string
  ) => {
    await addMaintenanceLog(
      machineId,
      {
        serviceType: log.serviceType || 'Maintenance',
        description: log.description || log.issueDescription || '',
        cost: log.cost || 0,
        technician: log.technician || '',
        nextDueDate: log.nextDueDate,
      },
      newStatus
    );
  };

  return (
    <FactoryContext.Provider
      value={{
        loading,
        settings,
        products,
        rawMaterials,
        packaging,
        suppliers,
        customers,
        purchases,
        sales,
        orders: sales,
        production,
        productionBatches: production,
        stockLogs,
        stockMovements: stockLogs,
        stockItems,
        wastage,
        wastageRecords: wastage,
        employees,
        attendance,
        attendanceRecords: attendance,
        salaries,
        salaryPayments: salaries,
        machines,
        expenses,
        cashbook,
        cashbookEntries: cashbook,
        updateSettings,
        saveSettings: updateSettings,
        saveProduct,
        deleteProduct,
        seedRaviCatalog,
        saveRawMaterial,
        deleteRawMaterial,
        savePackaging,
        deletePackaging,
        saveSupplier,
        deleteSupplier,
        saveCustomer,
        deleteCustomer,
        savePurchase,
        deletePurchase,
        savePurchaseOrder: savePurchase,
        deletePurchaseOrder: deletePurchase,
        saveSaleOrder,
        deleteSaleOrder,
        saveProductionBatch,
        deleteProductionBatch,
        adjustStock,
        saveWastage,
        deleteWastage,
        saveWastageRecord: saveWastage,
        deleteWastageRecord: deleteWastage,
        saveEmployee,
        deleteEmployee,
        saveAttendance,
        deleteAttendance,
        saveBulkAttendance,
        saveSalaryPayment,
        deleteSalaryPayment,
        saveMachine,
        deleteMachine,
        addMaintenanceLog,
        logMachineMaintenance,
        saveExpense,
        deleteExpense,
        saveExpenseRecord: saveExpense,
        deleteExpenseRecord: deleteExpense,
        saveCashbookEntry,
        deleteCashbookEntry,
        downloadJsonBackup,
        restoreFromJson,
        resetAllData,
        refreshAll,
      }}
    >
      {children}
    </FactoryContext.Provider>
  );
};

export const useFactory = () => {
  const context = useContext(FactoryContext);
  if (!context) {
    throw new Error('useFactory must be used within a FactoryProvider');
  }
  return context;
};
