import type {
  PurchaseBill, Distributor, SalesBill, InventoryItem, Offer, SalesRecord, PurchaseReturn,
} from '@/types';

export const distributors: Distributor[] = [
  { id: 'd1', name: 'MediSupply Distributors', gstin: '27ABCDE1234F1Z5', mobile: '9876543210', city: 'Mumbai', balance: 45200, totalBills: 128, totalPurchases: 1240000, returnPolicy: { returnWindowDays: 30, minShelfLifeDays: 90 } },
  { id: 'd2', name: 'PharmaCorp India', gstin: '29XYZAB5678G2Z3', mobile: '9811122233', city: 'Delhi', balance: -12500, totalBills: 95, totalPurchases: 890000, returnPolicy: { returnWindowDays: 45, minShelfLifeDays: 120 } },
  { id: 'd3', name: 'Cipla Wholesale', gstin: '07CIPLA9012H1Z1', mobile: '9988776655', city: 'Jaipur', balance: 7800, totalBills: 210, totalPurchases: 2100000 }, // No policy
  { id: 'd4', name: 'Sun Pharma Depot', gstin: '33SUNP3456K1Z9', mobile: '9001122334', city: 'Chennai', balance: 0, totalBills: 76, totalPurchases: 650000, returnPolicy: { returnWindowDays: 15, minShelfLifeDays: 60 } },
  { id: 'd5', name: 'Alkem Distributors', gstin: '36ALKE7890L1Z2', mobile: '9123456780', city: 'Hyderabad', balance: 23000, totalBills: 142, totalPurchases: 980000, returnPolicy: { returnWindowDays: 30, minShelfLifeDays: 90 } },
];

export const purchaseBills: PurchaseBill[] = [
  { id: 'p1', billNo: 'INV-2024-001', entryDate: '2024-08-01', billDate: '2024-07-31', entryBy: 'Rahul', distributor: 'MediSupply Distributors', amount: 24500, paid: true, paymentType: 'UPI', utr: 'UTR123456789', status: 'Finalized', items: [
    { id: 'i1', name: 'Paracetamol 500mg', batch: 'PC2401', expiry: '2026-06', mrp: 25, qty: 100, free: 10, discount: 5, purchasePrice: 18, gst: 12, amount: 2016 },
    { id: 'i2', name: 'Azithromycin 500mg', batch: 'AZ2402', expiry: '2025-11', mrp: 120, qty: 50, free: 5, discount: 10, purchasePrice: 90, gst: 12, amount: 5040 },
  ]},
  { id: 'p2', billNo: 'INV-2024-002', entryDate: '2024-08-02', billDate: '2024-08-01', entryBy: 'Priya', distributor: 'Cipla Wholesale', amount: 18200, paid: false, paymentType: 'Credit', status: 'Finalized', items: [
    { id: 'i3', name: 'Cetirizine 10mg', batch: 'CZ2403', expiry: '2026-03', mrp: 35, qty: 200, free: 20, discount: 8, purchasePrice: 24, gst: 12, amount: 5376 },
  ]},
  { id: 'p3', billNo: 'INV-2024-003', entryDate: '2024-08-03', billDate: '2024-08-02', entryBy: 'Rahul', distributor: 'Sun Pharma Depot', amount: 9300, paid: true, paymentType: 'Cash', status: 'Finalized', items: [
    { id: 'i4', name: 'Omeprazole 20mg', batch: 'OM2404', expiry: '2025-09', mrp: 65, qty: 80, free: 0, discount: 5, purchasePrice: 48, gst: 12, amount: 4032 },
  ]},
  {
    id: 'B003',
    billNo: 'DRAFT-001',
    entryDate: '2024-07-25',
    billDate: '2024-07-24',
    entryBy: 'Ramesh K.',
    distributor: 'Cipla Stockist',
    amount: 12500,
    paid: false,
    paymentType: 'Credit',
    status: 'Draft',
    items: [
      { id: '1', name: 'Montair LC', batch: 'MTC2401', expiry: '2025-11', mrp: 185, qty: 30, free: 0, discount: 10, purchasePrice: 120, gst: 12, amount: 4032 }
    ]
  },
  {
    id: 'B004',
    billNo: 'DRAFT-002',
    entryDate: '2024-08-06',
    billDate: '2024-08-05',
    entryBy: 'Suresh M.',
    distributor: 'Apollo Distributors',
    amount: 5400,
    paid: false,
    paymentType: 'Cash',
    status: 'Draft',
    items: [
      { id: '1', name: 'Dolo 650', batch: 'DL0824', expiry: '2026-01', mrp: 30, qty: 100, free: 10, discount: 5, purchasePrice: 20, gst: 12, amount: 2128 }
    ]
  },
  { id: 'p4', billNo: 'INV-2024-004', entryDate: '2024-08-03', billDate: '2024-08-02', entryBy: 'Amit', distributor: 'PharmaCorp India', amount: 31200, paid: false, paymentType: 'Credit', status: 'Draft', items: [
    { id: 'i5', name: 'Metformin 500mg', batch: 'MF2405', expiry: '2026-08', mrp: 45, qty: 300, free: 30, discount: 12, purchasePrice: 30, gst: 12, amount: 10080 },
  ]},
  { id: 'p5', billNo: 'INV-2024-005', entryDate: '2024-08-04', billDate: '2024-08-03', entryBy: 'Priya', distributor: 'Alkem Distributors', amount: 15600, paid: true, paymentType: 'UPI', utr: 'UTR998877665', status: 'Finalized', items: [
    { id: 'i6', name: 'Ranitidine 150mg', batch: 'RN2406', expiry: '2025-12', mrp: 30, qty: 150, free: 15, discount: 6, purchasePrice: 22, gst: 12, amount: 3696 },
  ]},
  { id: 'p6', billNo: 'INV-2024-006', entryDate: '2024-08-04', billDate: '2024-08-03', entryBy: 'Rahul', distributor: 'MediSupply Distributors', amount: 8900, paid: false, paymentType: 'Credit', status: 'Returned', items: [] },
];

export const salesBills: SalesBill[] = [
  { id: 's1', billNo: 'SAL-2024-1001', entryDate: '2024-08-04', billDate: '2024-08-04', entryBy: 'Rahul', patient: 'Ramesh Patel', mobile: '9820012345', amount: 450, due: 0, status: 'Finalized', doctor: 'Dr. Sharma', items: [
    { id: 'si1', name: 'Paracetamol 500mg', batch: 'PC2401', expiry: '2026-06', mrp: 25, qty: 10, discount: 0, amount: 250 },
    { id: 'si2', name: 'Cetirizine 10mg', batch: 'CZ2403', expiry: '2026-03', mrp: 35, qty: 5, discount: 5, amount: 166 },
  ]},
  { id: 's2', billNo: 'SAL-2024-1002', entryDate: '2024-08-04', billDate: '2024-08-04', entryBy: 'Priya', patient: 'Sita Devi', mobile: '9811122334', amount: 1200, due: 200, status: 'Finalized', doctor: 'Dr. Gupta', items: [
    { id: 'si3', name: 'Azithromycin 500mg', batch: 'AZ2402', expiry: '2025-11', mrp: 120, qty: 10, discount: 0, amount: 1200 },
  ]},
  { id: 's3', billNo: 'SAL-2024-1003', entryDate: '2024-08-03', billDate: '2024-08-03', entryBy: 'Amit', patient: 'John Dsouza', mobile: '9988776655', amount: 320, due: 0, status: 'Finalized', items: [
    { id: 'si4', name: 'Omeprazole 20mg', batch: 'OM2404', expiry: '2025-09', mrp: 65, qty: 5, discount: 2, amount: 318 },
  ]},
  { id: 's4', billNo: 'SAL-2024-1004', entryDate: '2024-08-03', billDate: '2024-08-03', entryBy: 'Priya', patient: 'Walk-in Customer', mobile: '9001122334', amount: 180, due: 0, status: 'Draft', items: [
    { id: 'si5', name: 'Ranitidine 150mg', batch: 'RN2406', expiry: '2025-12', mrp: 30, qty: 6, discount: 0, amount: 180 },
  ]},
  { id: 's5', billNo: 'SAL-2024-1005', entryDate: '2024-08-02', billDate: '2024-08-02', entryBy: 'Rahul', patient: 'Meera Joshi', mobile: '9123456780', amount: 890, due: 890, status: 'Finalized', doctor: 'Dr. Sharma', items: [
    { id: 'si6', name: 'Metformin 500mg', batch: 'MF2405', expiry: '2026-08', mrp: 45, qty: 20, discount: 2, amount: 882 },
  ]},
  { id: 's6', billNo: 'SAL-2024-1006', entryDate: '2024-08-02', billDate: '2024-08-01', entryBy: 'Amit', patient: 'Kiran Rao', mobile: '9876543210', amount: 540, due: 0, status: 'Returned', items: [] },
];

export const inventoryItems: InventoryItem[] = [
  { id: 'inv1', name: 'Paracetamol 500mg', category: 'Analgesic', batch: 'PC2401', stock: 90, mrp: 25, purchasePrice: 18, salePrice: 23, discount: 5, rack: 'A-01', location: 'Shelf A', generic: true, ownBrand: false, minStock: 50, maxStock: 200, expiry: '2026-06' },
  { id: 'inv2', name: 'Azithromycin 500mg', category: 'Antibiotic', batch: 'AZ2402', stock: 45, mrp: 120, purchasePrice: 90, salePrice: 110, discount: 10, rack: 'B-03', location: 'Shelf B', generic: false, ownBrand: false, minStock: 30, maxStock: 100, expiry: '2025-11' },
  { id: 'inv3', name: 'Cetirizine 10mg', category: 'Antihistamine', batch: 'CZ2403', stock: 180, mrp: 35, purchasePrice: 24, salePrice: 32, discount: 8, rack: 'A-02', location: 'Shelf A', generic: true, ownBrand: false, minStock: 100, maxStock: 300, expiry: '2026-03' },
  { id: 'inv4', name: 'Omeprazole 20mg', category: 'PPI', batch: 'OM2404', stock: 12, mrp: 65, purchasePrice: 48, salePrice: 60, discount: 5, rack: 'C-05', location: 'Shelf C', generic: false, ownBrand: false, minStock: 40, maxStock: 120, expiry: '2025-09' },
  { id: 'inv5', name: 'Metformin 500mg', category: 'Antidiabetic', batch: 'MF2405', stock: 270, mrp: 45, purchasePrice: 30, salePrice: 42, discount: 12, rack: 'D-01', location: 'Shelf D', generic: true, ownBrand: false, minStock: 100, maxStock: 400, expiry: '2026-08' },
  { id: 'inv6', name: 'Ranitidine 150mg', category: 'Antacid', batch: 'RN2406', stock: 135, mrp: 30, purchasePrice: 22, salePrice: 28, discount: 6, rack: 'B-07', location: 'Shelf B', generic: true, ownBrand: false, minStock: 80, maxStock: 250, expiry: '2025-12' },
  { id: 'inv7', name: 'Aspirin 75mg', category: 'Antiplatelet', batch: 'AS2407', stock: 8, mrp: 10, purchasePrice: 6, salePrice: 9, discount: 3, rack: 'A-04', location: 'Shelf A', generic: true, ownBrand: false, minStock: 50, maxStock: 200, expiry: '2026-05' },
  { id: 'inv8', name: 'Vitamin C 1000mg', category: 'Supplement', batch: 'VC2408', stock: 220, mrp: 50, purchasePrice: 35, salePrice: 48, discount: 4, rack: 'E-02', location: 'Shelf E', generic: false, ownBrand: true, minStock: 50, maxStock: 300, expiry: '2027-01' },
  { id: 'inv9', name: 'Insulin Glargine', category: 'Hormone', batch: 'IN2409', stock: 25, mrp: 850, purchasePrice: 720, salePrice: 820, discount: 0, rack: 'F-01', location: 'Cold Storage', generic: false, ownBrand: false, minStock: 15, maxStock: 50, expiry: '2025-04' },
  { id: 'inv10', name: 'Amoxicillin 250mg', category: 'Antibiotic', batch: 'AM2410', stock: 60, mrp: 40, purchasePrice: 28, salePrice: 37, discount: 7, rack: 'B-02', location: 'Shelf B', generic: true, ownBrand: false, minStock: 40, maxStock: 150, expiry: '2025-08' },
];

export const offers: Offer[] = [
  { id: 'o1', startDate: '2024-08-01', endDate: '2024-08-31', product: 'Paracetamol 500mg', originalPrice: 25, offerPrice: 20 },
  { id: 'o2', startDate: '2024-08-05', endDate: '2024-08-20', product: 'Vitamin C 1000mg', originalPrice: 50, offerPrice: 39 },
  { id: 'o3', startDate: '2024-07-15', endDate: '2024-08-15', product: 'Azithromycin 500mg', originalPrice: 120, offerPrice: 99 },
];

export const salesRecords: SalesRecord[] = [
  { id: 'r1', staff: 'Rahul', customer: 'Ramesh Patel', amount: 450, date: '2024-08-04', distributor: 'MediSupply Distributors' },
  { id: 'r2', staff: 'Priya', customer: 'Sita Devi', amount: 1200, date: '2024-08-04', distributor: 'Cipla Wholesale' },
  { id: 'r3', staff: 'Amit', customer: 'John Dsouza', amount: 320, date: '2024-08-03', distributor: 'Sun Pharma Depot' },
  { id: 'r4', staff: 'Rahul', customer: 'Meera Joshi', amount: 890, date: '2024-08-02', distributor: 'Alkem Distributors' },
  { id: 'r5', staff: 'Priya', customer: 'Walk-in Customer', amount: 180, date: '2024-08-03', distributor: 'Cipla Wholesale' },
  { id: 'r6', staff: 'Amit', customer: 'Kiran Rao', amount: 540, date: '2024-08-02', distributor: 'MediSupply Distributors' },
  { id: 'r7', staff: 'Rahul', customer: 'Sneha Reddy', amount: 760, date: '2024-08-01', distributor: 'Alkem Distributors' },
  { id: 'r8', staff: 'Priya', customer: 'Vikram Singh', amount: 210, date: '2024-08-01', distributor: 'PharmaCorp India' },
];

export const weeklySales = [
  { day: 'Mon', sales: 3200, purchases: 1800 },
  { day: 'Tue', sales: 4100, purchases: 2200 },
  { day: 'Wed', sales: 2800, purchases: 950 },
  { day: 'Thu', sales: 5400, purchases: 3100 },
  { day: 'Fri', sales: 6200, purchases: 2800 },
  { day: 'Sat', sales: 7800, purchases: 4200 },
  { day: 'Sun', sales: 4500, purchases: 1500 },
];

export const monthlyTrend = [
  { month: 'Feb', value: 142000 },
  { month: 'Mar', value: 168000 },
  { month: 'Apr', value: 155000 },
  { month: 'May', value: 192000 },
  { month: 'Jun', value: 178000 },
  { month: 'Jul', value: 215000 },
  { month: 'Aug', value: 198000 },
];

export const pendingPOs = [
  { poNo: 'PO-2024-089', distributor: 'Sun Pharma Depot', items: 45, date: '01 Aug 2024', expected_delivery_date: '2024-08-05', placed_via: 'Manual' as const, status: 'Pending' as const, linked_bill_ids: [] },
  { poNo: 'PO-2024-092', distributor: 'Apollo Distributors', items: 12, date: '03 Aug 2024', expected_delivery_date: '2024-08-04', placed_via: 'WhatsApp' as const, status: 'Received' as const, linked_bill_ids: ['INV-2024-101'] },
  { poNo: 'PO-2024-093', distributor: 'Metro Medicals', items: 8, date: '04 Aug 2024', expected_delivery_date: '2024-08-06', placed_via: 'IVR call' as const, status: 'Partially Received' as const, linked_bill_ids: ['INV-2024-102'] },
];

export const suggestedPOs = [
  { id: 'spo1', item: 'Paracetamol 500mg', distributor: 'Sun Pharma Depot', suggestedQty: 500, stock: 50, minStock: 100 },
  { id: 'spo2', item: 'Amoxicillin 250mg', distributor: 'Apollo Distributors', suggestedQty: 200, stock: 20, minStock: 50 },
];

export function formatCurrency(n: number): string {
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export const purchaseReturns: PurchaseReturn[] = [
  { id: 'PR-2024-001', distributor: 'MediSupply Distributors', originalBillId: 'INV-2024-001', itemName: 'Paracetamol 500mg', batch: 'PC2401', returnQty: 20, reason: 'Damaged', returnPrice: 18, status: 'Sent', expectedCreditAmount: 360, createdDate: '2024-08-01' },
  { id: 'PR-2024-002', distributor: 'PharmaCorp India', itemName: 'Metformin 500mg', batch: 'MF2405', returnQty: 50, reason: 'Near-expiry', returnPrice: 30, status: 'Credit-note-pending', expectedCreditAmount: 1500, createdDate: '2024-08-02' },
  { id: 'PR-2024-003', distributor: 'Cipla Wholesale', originalBillId: 'INV-2024-002', itemName: 'Cetirizine 10mg', batch: 'CZ2403', returnQty: 10, reason: 'Wrong-item', returnPrice: 24, status: 'Settled', expectedCreditAmount: 240, actualCreditAmount: 240, createdDate: '2024-08-03', linkedReconciliationIssueId: 'ISS-001' },
  { id: 'PR-2024-004', distributor: 'Alkem Distributors', itemName: 'Ranitidine 150mg', batch: 'RN2406', returnQty: 30, reason: 'Non-moving', returnPrice: 22, status: 'Settled', expectedCreditAmount: 660, actualCreditAmount: 600, createdDate: '2024-08-04' },
];
