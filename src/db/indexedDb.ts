/**
 * 100% Offline IndexedDB Persistence Layer
 * Fully persistent, zero-dependency, works completely offline in Chrome/Edge/Mobile/Tablet.
 */

import { FactorySettings, ProductItem } from '../types';

const DB_NAME = 'FactoryManagementSystemDB';
const DB_VERSION = 1;

export const STORES = {
  SETTINGS: 'settings',
  PRODUCTS: 'products',
  RAW_MATERIALS: 'raw_materials',
  PACKAGING: 'packaging',
  SUPPLIERS: 'suppliers',
  CUSTOMERS: 'customers',
  PURCHASES: 'purchases',
  SALES: 'sales',
  PRODUCTION: 'production',
  STOCK_LOGS: 'stock_logs',
  WASTAGE: 'wastage',
  EMPLOYEES: 'employees',
  ATTENDANCE: 'attendance',
  SALARIES: 'salaries',
  MACHINES: 'machines',
  EXPENSES: 'expenses',
  CASHBOOK: 'cashbook',
} as const;

export type StoreName = (typeof STORES)[keyof typeof STORES];

export const DEFAULT_SETTINGS: FactorySettings = {
  factoryName: 'سُپر فوڈز (Super Foods)',
  tagline: 'RAVI NIMKO - Delicious & Crunchy',
  ownerName: 'سیلز منیجر: 0317-4882109',
  phone: '0300-9055575 / 0304-7021515',
  address: 'محبوب کالونی گلی نمبر 1 آپوزٹ جنرل بس اسٹینڈ چشتیاں',
  ntn: 'License No: BWN/M-A/74631825',
  currencySymbol: 'Rs.',
  orderInvoicePrefix: 'RN-',
  purchasePrefix: 'PUR-',
  batchPrefix: 'BAT-',
  expensePrefix: 'EXP-',
  orderFooterTerms: 'مال پہنچنے کی صورت میں اگر مال خراب ہو تو فورا کمپنی سے رابطہ کریں بعد میں کمپنی خراب کی ذمہ دار نہ ہوگی\nسیلزمین سے ذاتی لین دین کمپنی ذمہ دار نہ ہوگی',
  orderSignatoryName: 'دستخط / مہر',
  customUnits: ['packet', 'carton', 'dozen', 'kg', 'g', 'box', 'pcs', 'bag', 'roll', 'bundle'],
  units: ['packet', 'carton', 'dozen', 'kg', 'g', 'box', 'pcs', 'bag', 'roll', 'bundle'],
  expenseCategories: [
    'Electricity & Power',
    'Gas & Fuel (روغن و گیس)',
    'Factory Rent',
    'Maintenance & Spares',
    'Daily Labor (ڈیلی لیبر)',
    'Transport & Cartage (کرایہ مال)',
    'Printing & Packaging (پاؤچ و کارٹن)',
    'Tea & Refreshments',
    'Miscellaneous',
  ],
  paperOrderPresets: [
    'راوی مکس نمکو Rs 10 والی',
    'راوی مکس نمکو Rs 20 والی',
    'راوی مکس نمکو Rs 50 والی',
    'راوی مکس نمکو Rs 100 والی',
    'دال موٹھ Rs 10 والی',
    'دال موٹھ Rs 20 والی',
    'دال موٹھ Rs 50 والی',
    'دال موٹھ Rs 100 والی',
    'دال چنا Rs 10 والی',
    'دال چنا Rs 20 والی',
    'دال چنا Rs 50 والی',
    'پی نٹ Rs 20 والی',
    'پی نٹ Rs 50 والی',
  ],
};

export const DEFAULT_RAVI_PRODUCTS: ProductItem[] = [
  {
    id: 'prod_rn_01',
    code: 'RN-001',
    name: 'راوی مکس نمکو',
    category: 'Nimko',
    unit: 'packet',
    defaultRate: 10,
    stock: 500,
    alertLevel: 50,
    notes: 'Delicious & Crunchy Ravi Mix Nimko',
    packVariants: [
      { id: 'v_rn01_10', name: 'Rs 10 والی', rate: 10 },
      { id: 'v_rn01_20', name: 'Rs 20 والی', rate: 20 },
      { id: 'v_rn01_50', name: 'Rs 50 والی', rate: 50 },
      { id: 'v_rn01_100', name: 'Rs 100 والی', rate: 100 },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'prod_rn_02',
    code: 'RN-002',
    name: 'دال موٹھ',
    category: 'Nimko',
    unit: 'packet',
    defaultRate: 10,
    stock: 450,
    alertLevel: 50,
    notes: 'Special Crispy Fried Daal Moth',
    packVariants: [
      { id: 'v_rn02_10', name: 'Rs 10 والی', rate: 10 },
      { id: 'v_rn02_20', name: 'Rs 20 والی', rate: 20 },
      { id: 'v_rn02_50', name: 'Rs 50 والی', rate: 50 },
      { id: 'v_rn02_100', name: 'Rs 100 والی', rate: 100 },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'prod_rn_03',
    code: 'RN-003',
    name: 'دال چنا',
    category: 'Nimko',
    unit: 'packet',
    defaultRate: 10,
    stock: 400,
    alertLevel: 50,
    notes: 'Crunchy Spiced Daal Chana',
    packVariants: [
      { id: 'v_rn03_10', name: 'Rs 10 والی', rate: 10 },
      { id: 'v_rn03_20', name: 'Rs 20 والی', rate: 20 },
      { id: 'v_rn03_50', name: 'Rs 50 والی', rate: 50 },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'prod_rn_04',
    code: 'RN-004',
    name: 'پی نٹ',
    category: 'Nimko / Nuts',
    unit: 'packet',
    defaultRate: 20,
    stock: 350,
    alertLevel: 40,
    notes: 'Fresh Roasted Salted Peanuts (مونگ پھلی)',
    packVariants: [
      { id: 'v_rn04_20', name: 'Rs 20 والی', rate: 20 },
      { id: 'v_rn04_50', name: 'Rs 50 والی', rate: 50 },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

let dbInstance: IDBDatabase | null = null;

export function openDatabase(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create all object stores with keyPath 'id'
      Object.values(STORES).forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      });
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('IndexedDB open error:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

// Generic CRUD operations
export async function getAllFromStore<T>(storeName: StoreName): Promise<T[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve((request.result as T[]) || []);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function getFromStore<T>(storeName: StoreName, id: string): Promise<T | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve((request.result as T) || null);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function putInStore<T extends { id: string }>(storeName: StoreName, item: T): Promise<T> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);

    request.onsuccess = () => {
      resolve(item);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function deleteFromStore(storeName: StoreName, id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function clearStore(storeName: StoreName): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// Settings special handler
export async function getSettings(): Promise<FactorySettings> {
  const stored = await getFromStore<{ id: string } & FactorySettings>(STORES.SETTINGS, 'factory_settings');
  if (stored) {
    const isDefaultPlaceholder = !stored.factoryName || stored.factoryName === 'My Factory';
    return {
      ...DEFAULT_SETTINGS,
      ...stored,
      factoryName: isDefaultPlaceholder ? DEFAULT_SETTINGS.factoryName : stored.factoryName,
      tagline: isDefaultPlaceholder ? DEFAULT_SETTINGS.tagline : (stored.tagline || DEFAULT_SETTINGS.tagline),
      ownerName: isDefaultPlaceholder ? DEFAULT_SETTINGS.ownerName : (stored.ownerName || DEFAULT_SETTINGS.ownerName),
      phone: isDefaultPlaceholder || !stored.phone ? DEFAULT_SETTINGS.phone : stored.phone,
      address: isDefaultPlaceholder || !stored.address ? DEFAULT_SETTINGS.address : stored.address,
      ntn: isDefaultPlaceholder || !stored.ntn ? DEFAULT_SETTINGS.ntn : stored.ntn,
      customUnits: stored.customUnits || DEFAULT_SETTINGS.customUnits,
      units: stored.units || stored.customUnits || DEFAULT_SETTINGS.units,
      expenseCategories: stored.expenseCategories || DEFAULT_SETTINGS.expenseCategories,
      paperOrderPresets: (stored.paperOrderPresets && stored.paperOrderPresets.length > 0)
        ? stored.paperOrderPresets
        : DEFAULT_SETTINGS.paperOrderPresets,
    };
  }
  const initial = { id: 'factory_settings', ...DEFAULT_SETTINGS };
  await putInStore(STORES.SETTINGS, initial);
  return initial;
}

export async function saveSettings(settings: FactorySettings): Promise<FactorySettings> {
  const payload = { id: 'factory_settings', ...settings };
  await putInStore(STORES.SETTINGS, payload);
  return payload;
}

// Complete Full JSON Backup Export
export async function exportCompleteDatabase(): Promise<Record<string, unknown>> {
  const db = await openDatabase();
  const backup: Record<string, unknown> = {
    version: DB_VERSION,
    appName: 'Factory Record System',
    exportedAt: new Date().toISOString(),
    stores: {},
  };

  const storeKeys = Object.values(STORES);
  for (const storeName of storeKeys) {
    const records = await getAllFromStore(storeName);
    (backup.stores as Record<string, unknown>)[storeName] = records;
  }

  return backup;
}

// Complete Full JSON Restore with validation
export async function importCompleteDatabase(backupData: Record<string, unknown>): Promise<boolean> {
  if (!backupData || typeof backupData !== 'object' || !backupData.stores) {
    throw new Error('Invalid backup file format. Missing stores data.');
  }

  const storesData = backupData.stores as Record<string, unknown[]>;
  const db = await openDatabase();

  for (const storeName of Object.values(STORES)) {
    const items = storesData[storeName];
    if (Array.isArray(items)) {
      // Clear store
      await clearStore(storeName);
      // Batch insert items
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      for (const item of items) {
        if (item && typeof item === 'object' && 'id' in item) {
          store.put(item);
        }
      }
      await new Promise<void>((res, rej) => {
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error);
      });
    }
  }

  return true;
}

export const exportFullDatabase = exportCompleteDatabase;
export const importFullDatabase = importCompleteDatabase;
export async function clearAllData(): Promise<void> {
  for (const storeName of Object.values(STORES)) {
    if (storeName !== STORES.SETTINGS) {
      await clearStore(storeName);
    }
  }
}
