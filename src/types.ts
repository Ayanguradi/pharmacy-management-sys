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
  | 'expenses';

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
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  batch: string;
  stock: number;
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
}

export type EmploymentStatus = 'Active' | 'On Leave' | 'Inactive' | 'Terminated';
export type LeaveType = 'Casual' | 'Sick' | 'Earned';
export type AttendanceStatus = 'Present' | 'Absent' | 'Half-Day' | 'Leave' | 'Holiday';

export interface AttendanceRecord {
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
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
  role: 'Owner' | 'Manager' | 'Pharmacist' | 'Cashier' | 'Assistant' | 'Admin';
  mobile: string;
  pin?: string;
  active: boolean; // For login access
  
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
}

export type ExpenseCategory = 'Rent' | 'Electricity' | 'Maintenance' | 'Salaries' | 'Marketing' | 'Licenses & Compliance' | 'Misc';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  payee: string;
  paymentMode: string;
  receipt?: string; // URL or boolean flag for UI
  isRecurring: boolean;
  recurringFrequency?: 'Monthly' | 'Quarterly' | 'Yearly';
  status: 'Draft' | 'Finalized';
}
