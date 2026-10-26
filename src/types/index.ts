export type ItemType = 'product' | 'raw_material' | 'packaging' | 'other';

export interface PackVariant {
  id: string;
  name: string; // e.g. "Rs. 10 Pack", "500g Jar", "1kg Bag", "Carton 48pcs"
  rate: number;
}

export interface ProductItem {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  defaultRate: number;
  packVariants: PackVariant[];
  stock: number;
  alertLevel: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RawMaterial {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  alertLevel: number;
  lastPurchaseRate: number;
  supplierId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PackagingItem {
  id: string;
  code: string;
  name: string;
  type: string; // e.g., Pouch, Outer Carton, Roll, Tape, Box, Lid
  unit: string;
  stock: number;
  alertLevel: number;
  lastPurchaseRate: number;
  supplierId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  company?: string;
  category?: string;
  phone: string;
  address?: string;
  openingBalance?: number;
  currentBalance: number;
  notes?: string;
  createdAt: string;
}

export interface CustomerDueAdjustment {
  id: string;
  date: string;
  type: 'ADD_DUE' | 'PAYMENT_RECEIVED' | 'SET_BALANCE';
  amount: number;
  previousBalance: number;
  newBalance: number;
  paymentMode?: 'Cash' | 'Bank';
  referenceNo?: string;
  notes?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  shopName?: string;
  phone: string;
  city?: string;
  cityOrArea?: string;
  openingBalance?: number;
  currentBalance: number;
  dueAdjustments?: CustomerDueAdjustment[];
  notes?: string;
  createdAt: string;
}

export interface PurchaseItemRow {
  id: string;
  itemType: 'raw_material' | 'packaging' | 'other';
  itemId?: string;
  itemName: string;
  qty: number;
  quantity?: number;
  unit: string;
  rate: number;
  amount: number;
  totalAmount?: number;
}

export type PurchaseItem = PurchaseItemRow;

export interface Purchase {
  id: string;
  invoiceNo?: string;
  billNumber?: string;
  date: string;
  supplierId?: string;
  supplierName: string;
  items: PurchaseItem[];
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentMode?: 'Cash' | 'Bank' | 'Credit' | 'cash' | 'bank' | 'credit' | string;
  notes?: string;
  createdAt?: string;
}

export type PurchaseOrder = Purchase;

export interface SaleOrderItem {
  id: string;
  productId?: string;
  productName: string;
  variantName?: string;
  qty: number;
  unit: string;
  rate: number;
  amount: number;
}

export interface SaleOrder {
  id: string;
  invoiceNo: string;
  orderNumber?: string;
  date: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerArea?: string;
  items: SaleOrderItem[];
  subTotal: number;
  discount: number;
  totalAmount: number;
  grandTotal?: number;
  paidAmount: number;
  dueAmount: number;
  paymentMode: 'Cash' | 'Bank' | 'Credit' | 'Partial' | 'cash' | 'bank' | 'credit' | 'partial';
  paymentStatus: 'Paid' | 'Due' | 'Partial' | 'paid' | 'due' | 'partial';
  notes?: string;
  signatureText?: string;
  createdAt: string;
}

export interface MaterialUsage {
  id: string;
  type: 'raw_material' | 'packaging';
  itemId: string;
  itemName: string;
  qty: number;
  unit: string;
}

export interface ProductionMaterialConsumed {
  id?: string;
  materialType: 'raw_material' | 'packaging';
  materialId?: string;
  materialName: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
}

export interface ProductionBatch {
  id: string;
  batchNo?: string;
  batchNumber?: string;
  date: string;
  productId?: string;
  productName: string;
  producedQty?: number;
  outputQuantity?: number;
  unit?: string;
  outputUnit?: string;
  supervisor?: string;
  totalCost?: number;
  costPerUnit?: number;
  perUnitCost?: number;
  materialsUsed?: MaterialUsage[];
  consumedMaterials?: ProductionMaterialConsumed[];
  wastageQty?: number;
  wastageQuantity?: number;
  wastageReason?: string;
  notes?: string;
  createdAt?: string;
}

export interface StockLog {
  id: string;
  date: string;
  itemType: 'product' | 'raw_material' | 'packaging';
  itemId: string;
  itemName: string;
  changeQty: number; // positive for IN, negative for OUT
  resultingStock: number;
  reason: string; // e.g. "Sale #101", "Purchase #45", "Production Batch #8", "Manual Adjustment"
  referenceNo?: string;
  notes?: string;
  createdAt: string;
}

export interface WastageRecord {
  id: string;
  date: string;
  category?: 'Production' | 'Raw Material' | 'Packaging' | 'Expired' | 'Handling' | 'Other' | string;
  itemType?: 'product' | 'raw_material' | 'packaging' | 'other' | string;
  itemId?: string;
  itemName: string;
  quantity?: number;
  qty?: number;
  unit: string;
  estimatedLoss?: number;
  estimatedCost?: number;
  reason: string;
  notes?: string;
  createdAt?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  phone?: string;
  wageType?: 'Daily' | 'Monthly' | 'Piece-rate' | string;
  salaryType?: 'monthly' | 'daily' | 'piece_rate' | 'Daily' | 'Monthly' | 'Piece-rate' | string;
  rate?: number;
  basicSalary?: number;
  dailyRate?: number;
  joinDate?: string;
  joiningDate?: string;
  active?: boolean;
  status?: 'active' | 'inactive';
  notes?: string;
  createdAt?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  employeeId: string;
  employeeName: string;
  status: 'Present' | 'Absent' | 'Half-day' | 'Leave' | 'present' | 'absent' | 'half_day' | 'leave';
  overtimeHours?: number;
  calculatedWage?: number;
  notes?: string;
  createdAt?: string;
}

export interface SalaryPayment {
  id: string;
  voucherNo?: string;
  date?: string;
  paymentDate?: string;
  employeeId?: string;
  employeeName: string;
  period?: string;
  monthYear?: string;
  basePay?: number;
  basicSalary?: number;
  daysWorked?: number;
  overtimePay?: number;
  overtimeAmount?: number;
  bonus?: number;
  deductions?: number;
  advanceAdjusted?: number;
  advancesDeducted?: number;
  netPaid?: number;
  netSalary?: number;
  paymentMode: 'Cash' | 'Bank' | 'cash' | 'bank' | string;
  notes?: string;
  createdAt?: string;
}

export interface MaintenanceLog {
  id: string;
  date: string;
  serviceType?: string;
  description?: string;
  issueDescription?: string;
  actionTaken?: string;
  partsReplaced?: string;
  cost: number;
  technician: string;
  nextDueDate?: string;
}

export interface Machine {
  id: string;
  machineName?: string;
  name: string;
  code?: string;
  codeOrModel?: string;
  modelNumber?: string;
  lineOrLocation?: string;
  location?: string;
  purchaseDate?: string;
  lastServiceDate?: string;
  nextServiceDue?: string;
  status:
    | 'Operational'
    | 'Maintenance Due'
    | 'Under Repair'
    | 'Decommissioned'
    | 'operational'
    | 'maintenance_due'
    | 'breakdown'
    | 'inactive'
    | string;
  serviceLogs?: MaintenanceLog[];
  maintenanceLogs?: MaintenanceLog[];
  notes?: string;
  createdAt?: string;
}

export type MachineRecord = Machine;

export interface Expense {
  id: string;
  date: string;
  voucherNo: string;
  category: string;
  amount: number;
  paidTo?: string;
  paymentMode: 'Cash' | 'Bank' | 'cash' | 'bank';
  notes?: string;
  createdAt?: string;
}

export type ExpenseRecord = Expense;

export interface CashbookEntry {
  id: string;
  date: string;
  type: 'IN' | 'OUT' | 'in' | 'out' | string;
  category: string;
  amount: number;
  account?: 'Cash' | 'Bank' | string;
  paymentMode?: 'cash' | 'bank' | 'online' | string;
  reference?: string;
  referenceType?: string;
  description: string;
  balanceAfter?: number;
  createdAt?: string;
}

export interface FactorySettings {
  factoryName: string;
  tagline?: string;
  ownerName?: string;
  phone?: string;
  address?: string;
  ntn?: string;
  currencySymbol: string; // default "Rs."
  orderInvoicePrefix?: string; // e.g. "INV-"
  purchasePrefix?: string; // e.g. "PO-"
  batchPrefix?: string; // e.g. "BT-"
  expensePrefix?: string; // e.g. "EXP-"
  orderFooterTerms?: string;
  orderSignatoryName?: string;
  units?: string[];
  customUnits?: string[];
  expenseCategories?: string[];
  paperOrderPresets?: string[];
}

export type ModuleKey =
  | 'dashboard'
  | 'sales'
  | 'stock'
  | 'products'
  | 'raw_materials'
  | 'packaging'
  | 'production'
  | 'purchases'
  | 'wastage'
  | 'customers'
  | 'suppliers'
  | 'cashbook'
  | 'expenses'
  | 'employees'
  | 'attendance'
  | 'salaries'
  | 'machines'
  | 'reports'
  | 'settings'
  | 'backup';
