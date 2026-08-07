export type View =
  | 'dashboard'
  | 'purchases' | 'purchase-drafts' | 'purchase-orders' | 'purchase-analytics' | 'purchase-returns'
  | 'sales' | 'sales-drafts' | 'sales-analytics' | 'sales-returns'
  | 'distributors' | 'distributor-detail'
  | 'inventory'
  | 'reports'
  | 'offers'
  | 'settings';

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
  paid: boolean;
  paymentType: 'UPI' | 'Credit' | 'Cash';
  status: 'Finalized' | 'Draft' | 'Returned' | 'Cancelled';
  utr?: string;
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
  items: SalesItem[];
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
}

export interface Offer {
  id: string;
  startDate: string;
  endDate: string;
  product: string;
  originalPrice: number;
  offerPrice: number;
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
