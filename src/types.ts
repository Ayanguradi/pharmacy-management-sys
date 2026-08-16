export type View =
  | 'landing'
  | 'dashboard'
  | 'purchases' | 'purchase-drafts' | 'purchase-orders' | 'purchase-analytics' | 'purchase-returns'
  | 'sales' | 'sales-drafts' | 'sales-analytics' | 'sales-returns'
  | 'customers' | 'customer-detail'
  | 'distributors' | 'distributor-detail'
  | 'inventory'
  | 'reports'
  | 'offers'
  | 'settings'
  | 'staff' | 'staff-detail'
  | 'expenses'
  | 'branch-transfers'
  | 'stock-audit'
  | 'my-space';

// ─── Branch ─────────────────────────────────────────────────────
export interface Branch {
  id: string;
  name: string;
  address: string;
  gstin: string;
  phone: string;
  isActive: boolean;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  altMobile?: string;
  address?: string;
  city: string;
  doctors?: string[];
  familyGroupId?: string;
  familyRelationship?: string;
  whatsappConsent: boolean;
  preferredLanguage?: string;
}

export interface PurchaseItem {
  id: string;
  name: string;
  batch: string;
  expiry: string;
  mrp: number;
  qty: number;
  free: number;
  discount: number;
  purchasePrice: number;
  gst: number;
  amount: number;
}

export interface PurchaseOrder {
  poNo: string;
  distributor: string;
  items: number;
  date: string;
  expected_delivery_date: string;
  placed_via: 'Manual' | 'IVR call' | 'WhatsApp';
  status: 'Pending' | 'Partially Received' | 'Received' | 'Cancelled';
  linked_bill_ids: string[];
  branchId?: string;
}

export interface PurchaseBill {
  id: string;
  billNo: string;
  entryDate: string;
  billDate: string;
  entryBy: string;
  distributor: string;
  amount: number;
  payments: { id: string, amount: number, date: string, mode: string, ref?: string, recorded_by: string }[];
  status: 'Finalized' | 'Draft' | 'Returned' | 'Cancelled' | 'Voided';
  logs: { timestamp: string, user: string, action: string, details?: string }[];
  items: PurchaseItem[];
  branchId?: string;
}

export interface Distributor {
  id: string;
  name: string;
  gstin: string;
  mobile: string;
  city: string;
  balance: number;
  totalBills: number;
  totalPurchases: number;
  returnPolicy?: {
    returnWindowDays: number;
    minShelfLifeDays: number;
  };
  independentOrderingPerBranch?: boolean;
}

export interface SalesItem {
  id: string;
  name: string;
  batch: string;
  expiry: string;
  mrp: number;
  qty: number;
  discount: number;
  amount: number;
  dosage?: string;
}

export interface SalesBill {
  id: string;
  billNo: string;
  entryDate: string;
  billDate: string;
  entryBy: string;
  patient: string;
  mobile: string;
  amount: number;
  due: number;
  status: 'Finalized' | 'Draft' | 'Returned';
  doctor?: string;
  paymentMode?: string;
  deliveryMode?: 'Self-pickup' | 'Self-delivery' | 'Third-party delivery';
  deliveryPartner?: string;
  payments: { id: string, amount: number, date: string, mode: string, recorded_by: string }[];
  logs: { timestamp: string, user: string, action: string, details?: string }[];
  items: SalesItem[];
  branchId?: string;
}

export type SalesReturnReason = 'Wrong Item' | 'Customer Dissatisfaction' | 'Adverse Reaction' | 'Doctor Changed Prescription' | 'Billing Error' | 'Damaged';
export type SalesRefundMethod = 'Cash Refund' | 'Store Credit' | 'Exchange';

export interface SalesReturn {
  id: string;
  patient: string;
  originalBillId?: string;
  itemName: string;
  batch: string;
  returnQty: number;
  reason: SalesReturnReason;
  refundMethod: SalesRefundMethod;
  refundAmount: number;
  status: ReturnStatus;
  createdDate: string;
  branchId?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  batch: string;
  stock: number;
  inTransitQty?: number; // Stock currently in transit via branch transfer
  mrp: number;
  purchasePrice: number;
  salePrice: number;
  discount: number;
  rack: string;
  location: string;
  generic: boolean;
  ownBrand: boolean;
  minStock: number;
  maxStock: number;
  expiry: string;
  composition?: string;
  manufacturer?: string;
  form?: 'Tablet' | 'Syrup' | 'Capsule' | 'Injection' | 'Ointment' | 'Drops' | 'Cream' | 'Powder' | 'Other';
  purchase_unit?: string;
  pack_size?: number;
  sale_unit?: string;
  branchId?: string;
}

export interface Offer {
  id: string;
  startDate: string;
  endDate: string;
  productId: string;
  productName: string;
  originalPrice: number;
  offerPrice: number;
  status: 'Active' | 'Upcoming' | 'Expired' | 'Draft';
  applicableCustomers: 'All Customers' | 'New Customers Only' | 'Regular Customers Only';
  redemptions: number;
  revenue: number;
  category: string;
}

export interface SalesRecord {
  id: string;
  staff: string;
  customer: string;
  amount: number;
  date: string;
  distributor?: string;
  branchId?: string;
}

export type ReturnReason = 'Expired' | 'Near-expiry' | 'Non-moving' | 'Damaged' | 'Wrong-item' | 'Recall' | 'Others';
export type ReturnStatus = 'Draft' | 'Saved' | 'Sent' | 'Credit-note-pending' | 'Settled' | 'Rejected';

export interface PurchaseReturn {
  id: string;
  distributor: string;
  originalBillId?: string;
  itemName: string;
  batch: string;
  returnQty: number;
  reason: ReturnReason;
  returnPrice: number;
  status: ReturnStatus;
  expectedCreditAmount: number;
  actualCreditAmount?: number;
  createdDate: string;
  linkedReconciliationIssueId?: string;
  branchId?: string;
}

export type EmploymentStatus = 'Active' | 'On Leave' | 'Inactive' | 'Terminated';
export type LeaveType = 'Casual' | 'Sick' | 'Earned';
export type AttendanceStatus = 'Present' | 'Absent' | 'Half-Day' | 'Leave' | 'Holiday';

export interface AttendanceRecord {
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  clockInTime?: string; // HH:MM format, for punctuality tracking
  clockOutTime?: string;
}

export interface LeaveBalance {
  type: LeaveType;
  allotted: number;
  used: number;
}

export interface SalaryStructure {
  basicPay: number;
  allowances: { name: string; amount: number }[];
  deductions: { name: string; amount: number }[];
}

export interface PayrollRun {
  id: string;
  period: string; // e.g. "August 2026"
  computedPay: number;
  status: 'Pending' | 'Paid';
  paidDate?: string;
  paymentMode?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'Owner' | 'Manager' | 'Pharmacist' | 'Cashier' | 'Assistant' | 'Admin' | 'Accountant';
  mobile: string;
  pin?: string;
  active: boolean; // For login access
  assignedBranchId?: string; // Required for Manager/Staff, not for Owner/Admin
  lastLoginAt?: string; // ISO date-time string, undefined = never logged in
  
  // HR fields
  email?: string;
  address?: string;
  joiningDate?: string;
  photo?: string;
  emergencyContact?: { name: string; number: string };
  bankDetails?: { accountNumber: string; ifsc: string; holderName: string };
  employmentStatus?: EmploymentStatus;
  
  attendance?: AttendanceRecord[];
  leaveBalances?: LeaveBalance[];
  salaryStructure?: SalaryStructure;
  payrollHistory?: PayrollRun[];
  
  // Permissions
  permissionOverrides?: Record<string, PermissionLevel>;
}

export type ExpenseCategory = 'Rent' | 'Electricity' | 'Maintenance' | 'Salaries' | 'Marketing' | 'Licenses & Compliance' | 'Misc';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  payee: string;
  paymentMode: string;
  receipt?: string;
  isRecurring: boolean;
  recurringFrequency?: 'Monthly' | 'Quarterly' | 'Yearly';
  status: 'Draft' | 'Finalized';
  branchId?: string;
}

// ─── Branch Transfer ────────────────────────────────────────────
export type TransferStatus = 'Draft' | 'Sent' | 'In Transit' | 'Received' | 'Partially Received' | 'Disputed' | 'Confirmed Delivered';
export type TransferType = 'Send' | 'Request';
export type TransferLineStatus = 'Matched' | 'Short' | 'Excess' | 'Missing' | 'Pending';
export type ChargeType = 'No Charge' | 'At Purchase Price' | 'At MRP' | 'Custom';
export type DestinationType = 'Internal' | 'External';

export interface ExternalDestination {
  name: string;
  contactPerson: string;
  mobile: string;
  address: string;
}

export interface TransferLineItem {
  itemName: string;
  batch: string;
  expiry: string;
  qtySent: number;
  qtyReceived?: number;
  unitPrice?: number; // Based on charge type
  lineChargeType?: ChargeType; // Per-line override
  status: TransferLineStatus;
}

export interface BranchTransfer {
  id: string;
  sourceBranchId: string;
  destinationBranchId: string;
  destinationType: DestinationType;
  externalDestination?: ExternalDestination;
  type: TransferType;
  chargeType: ChargeType;
  totalValue?: number;
  initiatedBy: string;
  date: string;
  receivedDate?: string;
  status: TransferStatus;
  items: TransferLineItem[];
  notes?: string;
  amendments?: { timestamp: string; user: string; action: string }[];
}

// ─── Disposal & Audit ───────────────────────────────────────────
export type DisposalReason = 'Expired' | 'Damaged' | 'Contaminated' | 'Recalled' | 'Other';

export interface DisposalLog {
  id: string;
  branchId: string;
  itemName: string;
  batch: string;
  qty: number;
  reason: DisposalReason;
  note?: string;
  disposedBy: string;
  date: string;
  value: number; // qty * purchasePrice
}

export type AuditScope = 'Full Inventory' | 'By Category' | 'By Rack' | 'Random Sample' | 'Specific Items';
export type AuditStatus = 'In Progress' | 'Counting' | 'Pending Review' | 'Completed';
export type VarianceReason = 'Shrinkage/Theft' | 'Breakage/Damage' | 'Expired & Discarded' | 'Miscount/Data Error' | 'Duplicate Item/Batch Record' | 'Found Extra' | 'Other';

export interface AuditLineItem {
  itemName: string;
  batch: string;
  expectedQty: number;
  countedQty: number;
  variance: number; // counted - expected
  varianceValue: number; // variance * purchasePrice
  reason?: VarianceReason;
  approved?: boolean;
  skipped?: boolean; // explicitly skipped during count (not treated as zero)
  inTransitExcluded?: number; // qty excluded from expected because in-transit
  unitPrice?: number; // purchase price for value calculation
}

export interface StockAudit {
  id: string;
  branchId: string;
  date: string;
  completedDate?: string;
  scope: AuditScope;
  scopeFilter?: string; // e.g. category name or rack id
  blindCount: boolean;
  status: AuditStatus;
  countedBy: string;
  approvedBy?: string;
  items: AuditLineItem[];
  totalVarianceValue: number;
  duplicatesDetected?: { item1: string; item2: string; similarity: number }[];
}

// ─── Business Reports ───────────────────────────────────────────
export type ReportCategory = 'Sales' | 'Stock' | 'Purchase' | 'Payments' | 'GST' | 'Party' | 'Order' | 'Staff & Expenses' | 'Custom Reports';

export interface ReportFilterDef {
  id: string;
  label: string;
  type: 'date-range' | 'multi-select' | 'single-select';
  options?: string[]; // For select types
}

export interface ReportColumnDef {
  id: string;
  label: string;
  type: 'string' | 'number' | 'currency' | 'date';
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: ReportCategory;
  isStarred: boolean;
  isCustom: boolean;
  dataSource: string; // e.g., 'sales', 'inventory', etc.
  availableFilters: ReportFilterDef[];
  columns: ReportColumnDef[];
  defaultGroupBy?: string;
}

export interface ReportSchedule {
  id: string;
  reportId: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  format: 'PDF' | 'XLS';
  recipients: string[];
  lastRun?: string;
  isActive: boolean;
}

export interface SavedRecipientList {
  id: string;
  name: string;
  emails: string[];
}

// ─── Permissions & RBAC ─────────────────────────────────────────
export type PermissionLevel = 'No Access' | 'View Only' | 'Full Access';

export interface RoleTemplate {
  id: string;
  role: string;
  permissions: Record<string, PermissionLevel>;
}

export interface LeaveRequest {
  id: string;
  staffId: string;
  type: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approverNote?: string;
  appliedOn: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  authorRole: string;
}
