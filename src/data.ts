import type {
  PurchaseBill, Distributor, SalesBill, InventoryItem, Offer, SalesRecord, PurchaseReturn, SalesReturn, Customer, StaffMember, Expense
} from '@/types';

export const customers: Customer[] = [
  { id: 'c1', name: 'Amit Kumar', mobile: '9876543210', city: 'Mumbai', whatsappConsent: true, doctors: ['Dr. Sharma'] },
  { id: 'c2', name: 'Sneha Sharma', mobile: '9876543211', city: 'Mumbai', whatsappConsent: false, familyGroupId: 'fg1', familyRelationship: 'Self' },
  { id: 'c3', name: 'Rahul Sharma', mobile: '9876543219', city: 'Mumbai', whatsappConsent: true, familyGroupId: 'fg1', familyRelationship: 'Spouse' },
  { id: 'c4', name: 'Ramesh Singh', mobile: '9876543212', city: 'Thane', whatsappConsent: true, doctors: ['Dr. Gupta'] },
  { id: 'c5', name: 'Kavita Patel', mobile: '9876543213', city: 'Navi Mumbai', whatsappConsent: true, familyGroupId: 'fg2', familyRelationship: 'Parent' },
];

export const staffMembers: StaffMember[] = [
  { 
    id: 's1', name: 'Rahul Sharma', role: 'Pharmacist', mobile: '9820012345', active: true,
    email: 'rahul@medicore.in', address: '12, MG Road, Mumbai', joiningDate: '2022-01-15',
    employmentStatus: 'Active',
    emergencyContact: { name: 'Priya Sharma', number: '9820012346' },
    bankDetails: { accountNumber: '1234567890', ifsc: 'HDFC0001234', holderName: 'Rahul Sharma' },
    leaveBalances: [
      { type: 'Casual', allotted: 12, used: 4 },
      { type: 'Sick', allotted: 8, used: 2 },
      { type: 'Earned', allotted: 15, used: 0 }
    ],
    salaryStructure: {
      basicPay: 25000,
      allowances: [{ name: 'HRA', amount: 5000 }, { name: 'Transport', amount: 2000 }],
      deductions: [{ name: 'PF', amount: 1500 }]
    },
    payrollHistory: [
      { id: 'pay-1', period: 'July 2026', computedPay: 30500, status: 'Paid', paidDate: '2026-08-01', paymentMode: 'Bank Transfer' },
      { id: 'pay-2', period: 'June 2026', computedPay: 30500, status: 'Paid', paidDate: '2026-07-01', paymentMode: 'Bank Transfer' }
    ],
    attendance: [
      { date: '2026-08-01', status: 'Present' },
      { date: '2026-08-02', status: 'Holiday' }, // Sunday
      { date: '2026-08-03', status: 'Present' },
      { date: '2026-08-04', status: 'Leave' },
    ]
  },
  { id: 's2', name: 'Priya Singh', role: 'Cashier', mobile: '9811122334', active: true, employmentStatus: 'Active', salaryStructure: { basicPay: 18000, allowances: [], deductions: [] } },
  { id: 's3', name: 'Amit Patel', role: 'Assistant', mobile: '9988776655', active: true, employmentStatus: 'On Leave', salaryStructure: { basicPay: 15000, allowances: [], deductions: [] } },
  { id: 's4', name: 'Ramesh K.', role: 'Admin', mobile: '9900112233', active: true, employmentStatus: 'Active', salaryStructure: { basicPay: 45000, allowances: [], deductions: [] } },
  { id: 's5', name: 'Dr. John', role: 'Owner', mobile: '9000000000', active: true, employmentStatus: 'Active' },
];

export const expenses: Expense[] = [
  { id: 'exp-1', category: 'Rent', amount: 45000, date: '2026-08-01', payee: 'Ravi Builders', paymentMode: 'Bank Transfer', isRecurring: true, recurringFrequency: 'Monthly', status: 'Finalized' },
  { id: 'exp-2', category: 'Electricity', amount: 8400, date: '2026-08-05', payee: 'Adani Power', paymentMode: 'UPI', isRecurring: false, status: 'Finalized' },
  { id: 'exp-3', category: 'Salaries', amount: 30500, date: '2026-08-01', payee: 'Rahul Sharma', paymentMode: 'Bank Transfer', isRecurring: false, status: 'Finalized' },
  { id: 'exp-4', category: 'Maintenance', amount: 2500, date: '2026-08-10', payee: 'Suresh Fix-it', paymentMode: 'Cash', isRecurring: false, status: 'Finalized' },
  { id: 'exp-draft-1', category: 'Rent', amount: 45000, date: '2026-09-01', payee: 'Ravi Builders', paymentMode: 'Bank Transfer', isRecurring: true, recurringFrequency: 'Monthly', status: 'Draft' },
];

export const distributors: Distributor[] = [
  { id: 'd1', name: 'MediSupply Distributors', gstin: '27ABCDE1234F1Z5', mobile: '9876543210', city: 'Mumbai', balance: 45200, totalBills: 128, totalPurchases: 1240000, returnPolicy: { returnWindowDays: 30, minShelfLifeDays: 90 } },
  { id: 'd2', name: 'PharmaCorp India', gstin: '29XYZAB5678G2Z3', mobile: '9811122233', city: 'Delhi', balance: -12500, totalBills: 95, totalPurchases: 890000, returnPolicy: { returnWindowDays: 45, minShelfLifeDays: 120 } },
  { id: 'd3', name: 'Cipla Wholesale', gstin: '07CIPLA9012H1Z1', mobile: '9988776655', city: 'Jaipur', balance: 7800, totalBills: 210, totalPurchases: 2100000 }, // No policy
  { id: 'd4', name: 'Sun Pharma Depot', gstin: '33SUNP3456K1Z9', mobile: '9001122334', city: 'Chennai', balance: 0, totalBills: 76, totalPurchases: 650000, returnPolicy: { returnWindowDays: 15, minShelfLifeDays: 60 } },
  { id: 'd5', name: 'Alkem Distributors', gstin: '36ALKE7890L1Z2', mobile: '9123456780', city: 'Hyderabad', balance: 23000, totalBills: 142, totalPurchases: 980000, returnPolicy: { returnWindowDays: 30, minShelfLifeDays: 90 } },
];

export const purchaseBills: PurchaseBill[] = [
  { id: 'p1', billNo: 'INV-2024-001', entryDate: '2024-08-01', billDate: '2024-07-31', entryBy: 'Rahul', distributor: 'MediSupply Distributors', amount: 24500, payments: [{ id: 'pay1', amount: 24500, date: '2024-08-01', mode: 'UPI', ref: 'UTR123456789', recorded_by: 'Rahul' }], status: 'Finalized', logs: [{ timestamp: '2024-08-01T10:00:00Z', user: 'Rahul', action: 'Bill created' }], items: [
    { id: 'i1', name: 'Paracetamol 500mg', batch: 'PC2401', expiry: '2026-06', mrp: 25, qty: 100, free: 10, discount: 5, purchasePrice: 18, gst: 12, amount: 2016 },
    { id: 'i2', name: 'Azithromycin 500mg', batch: 'AZ2402', expiry: '2025-11', mrp: 120, qty: 50, free: 5, discount: 10, purchasePrice: 90, gst: 12, amount: 5040 },
  ]},
  { id: 'p2', billNo: 'INV-2024-002', entryDate: '2024-08-02', billDate: '2024-08-01', entryBy: 'Priya', distributor: 'Cipla Wholesale', amount: 18200, payments: [{ id: 'pay-part', amount: 5000, date: '2024-08-02', mode: 'Cash', recorded_by: 'Priya' }], status: 'Finalized', logs: [{ timestamp: '2024-08-02T11:30:00Z', user: 'Priya', action: 'Bill created' }], items: [
    { id: 'i3', name: 'Cetirizine 10mg', batch: 'CZ2403', expiry: '2026-03', mrp: 35, qty: 200, free: 20, discount: 8, purchasePrice: 24, gst: 12, amount: 5376 },
  ]},
  { id: 'p3', billNo: 'INV-2024-003', entryDate: '2024-08-03', billDate: '2024-08-02', entryBy: 'Rahul', distributor: 'Sun Pharma Depot', amount: 9300, payments: [{ id: 'pay2', amount: 9300, date: '2024-08-03', mode: 'Cash', recorded_by: 'Rahul' }], status: 'Finalized', logs: [{ timestamp: '2024-08-03T09:15:00Z', user: 'Rahul', action: 'Bill created' }], items: [
    { id: 'i4', name: 'Omeprazole 20mg', batch: 'OM2404', expiry: '2025-09', mrp: 65, qty: 80, free: 0, discount: 5, purchasePrice: 48, gst: 12, amount: 4032 },
  ]},
  {
    id: 'B003', billNo: 'DRAFT-001', entryDate: '2024-07-25', billDate: '2024-07-24', entryBy: 'Ramesh K.', distributor: 'Cipla Stockist', amount: 12500, payments: [], status: 'Draft', logs: [{ timestamp: '2024-07-25T14:20:00Z', user: 'Ramesh K.', action: 'Draft created' }], items: [
      { id: '1', name: 'Montair LC', batch: 'MTC2401', expiry: '2025-11', mrp: 185, qty: 30, free: 0, discount: 10, purchasePrice: 120, gst: 12, amount: 4032 }
    ]
  },
  {
    id: 'B004', billNo: 'DRAFT-002', entryDate: '2024-08-06', billDate: '2024-08-05', entryBy: 'Suresh M.', distributor: 'Apollo Distributors', amount: 5400, payments: [], status: 'Draft', logs: [{ timestamp: '2024-08-06T16:05:00Z', user: 'Suresh M.', action: 'Draft created' }], items: [
      { id: '1', name: 'Dolo 650', batch: 'DL0824', expiry: '2026-01', mrp: 30, qty: 100, free: 10, discount: 5, purchasePrice: 20, gst: 12, amount: 2128 }
    ]
  },
  { id: 'p4', billNo: 'INV-2024-004', entryDate: '2024-08-03', billDate: '2024-08-02', entryBy: 'Amit', distributor: 'PharmaCorp India', amount: 31200, payments: [], status: 'Draft', logs: [{ timestamp: '2024-08-03T12:00:00Z', user: 'Amit', action: 'Draft created' }], items: [
    { id: 'i5', name: 'Metformin 500mg', batch: 'MF2405', expiry: '2026-08', mrp: 45, qty: 300, free: 30, discount: 12, purchasePrice: 30, gst: 12, amount: 10080 },
  ]},
  { id: 'p5', billNo: 'INV-2024-005', entryDate: '2024-08-04', billDate: '2024-08-03', entryBy: 'Priya', distributor: 'Alkem Distributors', amount: 15600, payments: [{ id: 'pay3', amount: 15600, date: '2024-08-04', mode: 'UPI', ref: 'UTR998877665', recorded_by: 'Priya' }], status: 'Finalized', logs: [{ timestamp: '2024-08-04T10:45:00Z', user: 'Priya', action: 'Bill created' }], items: [
    { id: 'i6', name: 'Ranitidine 150mg', batch: 'RN2406', expiry: '2025-12', mrp: 30, qty: 150, free: 15, discount: 6, purchasePrice: 22, gst: 12, amount: 3696 },
  ]},
  { id: 'p6', billNo: 'INV-2024-006', entryDate: '2024-08-04', billDate: '2024-08-03', entryBy: 'Rahul', distributor: 'MediSupply Distributors', amount: 8900, payments: [], status: 'Returned', logs: [{ timestamp: '2024-08-04T15:20:00Z', user: 'Rahul', action: 'Bill created' }], items: [] },
];

export const salesBills: SalesBill[] = [
  {
    id: 'sb1',
    billNo: 'INV-2024-001',
    entryDate: '2024-08-01 10:15 AM',
    billDate: '2024-08-01',
    entryBy: 'Rahul',
    patient: 'Amit Kumar',
    mobile: '9876543210',
    amount: 850,
    due: 0,
    status: 'Finalized',
    paymentMode: 'Cash',
    deliveryMode: 'Self-pickup',
    payments: [{ id: 'p1', amount: 850, date: '2024-08-01 10:15 AM', mode: 'Cash', recorded_by: 'Rahul' }],
    logs: [{ timestamp: '2024-08-01 10:15 AM', user: 'Rahul', action: 'Created Bill' }],
    items: [
      { id: 'si1', name: 'Paracetamol 500mg', batch: 'PC2401', expiry: '2026-06', mrp: 25, qty: 10, discount: 5, amount: 237 }
    ]
  },
  {
    id: 'sb2',
    billNo: 'INV-2024-002',
    entryDate: '2024-08-02 02:30 PM',
    billDate: '2024-08-02',
    entryBy: 'Priya',
    patient: 'Sneha Sharma',
    mobile: '9876543211',
    amount: 1200,
    due: 500,
    status: 'Finalized',
    paymentMode: 'Split',
    deliveryMode: 'Self-pickup',
    payments: [{ id: 'p2', amount: 700, date: '2024-08-02 02:30 PM', mode: 'UPI', recorded_by: 'Priya' }],
    logs: [{ timestamp: '2024-08-02 02:30 PM', user: 'Priya', action: 'Created Bill' }],
    items: [
      { id: 'si2', name: 'Azithromycin 500mg', batch: 'AZ2402', expiry: '2025-11', mrp: 120, qty: 10, discount: 10, amount: 1080 },
      { id: 'si3', name: 'Vitamin C 1000mg', batch: 'VC2408', expiry: '2027-01', mrp: 50, qty: 2, discount: 0, amount: 100 }
    ]
  },
  {
    id: 'sb3',
    billNo: 'INV-2024-003',
    entryDate: '2024-08-03 11:45 AM',
    billDate: '2024-08-03',
    entryBy: 'Amit',
    patient: 'Ramesh Singh',
    mobile: '9876543212',
    amount: 450,
    due: 450,
    status: 'Finalized',
    paymentMode: 'Credit',
    deliveryMode: 'Third-party delivery',
    deliveryPartner: 'Dunzo',
    payments: [],
    logs: [{ timestamp: '2024-08-03 11:45 AM', user: 'Amit', action: 'Created Bill' }],
    items: [
      { id: 'si4', name: 'Metformin 500mg', batch: 'MF2405', expiry: '2026-08', mrp: 45, qty: 10, discount: 12, amount: 396 }
    ]
  },
  {
    id: 'sb4',
    billNo: 'DRAFT-004',
    entryDate: '2024-08-04 09:10 AM',
    billDate: '2024-08-04',
    entryBy: 'Rahul',
    patient: 'Kavita Patel',
    mobile: '9876543213',
    amount: 322,
    due: 322,
    status: 'Draft',
    payments: [],
    logs: [],
    items: [
      { id: 'si5', name: 'Cetirizine 10mg', batch: 'CZ2403', expiry: '2026-03', mrp: 35, qty: 10, discount: 8, amount: 322 }
    ]
  },
  {
    id: 'sb5',
    billNo: 'INV-2024-005',
    entryDate: '2024-08-04 04:20 PM',
    billDate: '2024-08-04',
    entryBy: 'Priya',
    patient: 'Sneha Sharma',
    mobile: '9876543211',
    amount: 60,
    due: 0,
    status: 'Finalized',
    paymentMode: 'UPI',
    payments: [{ id: 'p3', amount: 60, date: '2024-08-04 04:20 PM', mode: 'UPI', recorded_by: 'Priya' }],
    logs: [],
    items: [
      { id: 'si6', name: 'Ranitidine 150mg', batch: 'RN2406', expiry: '2025-12', mrp: 30, qty: 2, discount: 0, amount: 60 }
    ]
  }
];

export const salesReturns: SalesReturn[] = [
  {
    id: 'sr1',
    patient: 'Amit Kumar',
    originalBillId: 'sb1',
    itemName: 'Paracetamol 500mg',
    batch: 'PC2401',
    returnQty: 2,
    reason: 'Wrong Item',
    refundMethod: 'Cash Refund',
    refundAmount: 47.4,
    status: 'Saved',
    createdDate: '2024-08-05'
  }
];

export const inventoryItems: InventoryItem[] = [
  { id: 'inv1', name: 'Paracetamol 500mg', category: 'Analgesic', batch: 'PC2401', stock: 90, mrp: 25, purchasePrice: 18, salePrice: 23, discount: 5, rack: 'A-01', location: 'Shelf A', generic: true, ownBrand: false, minStock: 50, maxStock: 200, expiry: '2026-06', composition: 'Paracetamol', manufacturer: 'Generic Pharma', form: 'Tablet', purchase_unit: 'Strip', pack_size: 10, sale_unit: 'Tablet' },
  { id: 'inv2', name: 'Azithromycin 500mg', category: 'Antibiotic', batch: 'AZ2402', stock: 45, mrp: 120, purchasePrice: 90, salePrice: 110, discount: 10, rack: 'B-03', location: 'Shelf B', generic: false, ownBrand: false, minStock: 30, maxStock: 100, expiry: '2025-11', composition: 'Azithromycin', manufacturer: 'Cipla', form: 'Tablet', purchase_unit: 'Strip', pack_size: 3, sale_unit: 'Tablet' },
  { id: 'inv3', name: 'Cetirizine 10mg', category: 'Antihistamine', batch: 'CZ2403', stock: 180, mrp: 35, purchasePrice: 24, salePrice: 32, discount: 8, rack: 'A-02', location: 'Shelf A', generic: true, ownBrand: false, minStock: 100, maxStock: 300, expiry: '2026-03', composition: 'Cetirizine Hydrochloride', manufacturer: 'Generic Pharma', form: 'Tablet', purchase_unit: 'Strip', pack_size: 10, sale_unit: 'Tablet' },
  { id: 'inv4', name: 'Omeprazole 20mg', category: 'PPI', batch: 'OM2404', stock: 12, mrp: 65, purchasePrice: 48, salePrice: 60, discount: 5, rack: 'C-05', location: 'Shelf C', generic: false, ownBrand: false, minStock: 40, maxStock: 120, expiry: '2025-09', composition: 'Omeprazole', manufacturer: 'Sun Pharma', form: 'Capsule', purchase_unit: 'Strip', pack_size: 15, sale_unit: 'Capsule' },
  { id: 'inv5', name: 'Metformin 500mg', category: 'Antidiabetic', batch: 'MF2405', stock: 270, mrp: 45, purchasePrice: 30, salePrice: 42, discount: 12, rack: 'D-01', location: 'Shelf D', generic: true, ownBrand: false, minStock: 100, maxStock: 400, expiry: '2026-08', composition: 'Metformin Hydrochloride', manufacturer: 'Mankind Pharma', form: 'Tablet', purchase_unit: 'Strip', pack_size: 10, sale_unit: 'Tablet' },
  { id: 'inv6', name: 'Ranitidine 150mg', category: 'Antacid', batch: 'RN2406', stock: 135, mrp: 30, purchasePrice: 22, salePrice: 28, discount: 6, rack: 'B-07', location: 'Shelf B', generic: true, ownBrand: false, minStock: 80, maxStock: 250, expiry: '2025-12', composition: 'Ranitidine', manufacturer: 'Generic Pharma', form: 'Tablet', purchase_unit: 'Strip', pack_size: 10, sale_unit: 'Tablet' },
  { id: 'inv7', name: 'Aspirin 75mg', category: 'Antiplatelet', batch: 'AS2407', stock: 8, mrp: 10, purchasePrice: 6, salePrice: 9, discount: 3, rack: 'A-04', location: 'Shelf A', generic: true, ownBrand: false, minStock: 50, maxStock: 200, expiry: '2026-05', composition: 'Aspirin', manufacturer: 'Generic Pharma', form: 'Tablet', purchase_unit: 'Strip', pack_size: 14, sale_unit: 'Tablet' },
  { id: 'inv8', name: 'Vitamin C 1000mg', category: 'Supplement', batch: 'VC2408', stock: 220, mrp: 50, purchasePrice: 35, salePrice: 48, discount: 4, rack: 'E-02', location: 'Shelf E', generic: false, ownBrand: true, minStock: 50, maxStock: 300, expiry: '2027-01', composition: 'Vitamin C', manufacturer: 'HealthPlus Pharmacy', form: 'Tablet', purchase_unit: 'Bottle', pack_size: 30, sale_unit: 'Tablet' },
  { id: 'inv9', name: 'Insulin Glargine', category: 'Hormone', batch: 'IN2409', stock: 25, mrp: 850, purchasePrice: 720, salePrice: 820, discount: 0, rack: 'F-01', location: 'Cold Storage', generic: false, ownBrand: false, minStock: 15, maxStock: 50, expiry: '2025-04', composition: 'Insulin Glargine', manufacturer: 'Sanofi', form: 'Injection', purchase_unit: 'Box', pack_size: 5, sale_unit: 'Vial' },
  { id: 'inv10', name: 'Amoxicillin 250mg', category: 'Antibiotic', batch: 'AM2410', stock: 60, mrp: 40, purchasePrice: 28, salePrice: 37, discount: 7, rack: 'B-02', location: 'Shelf B', generic: true, ownBrand: false, minStock: 40, maxStock: 150, expiry: '2025-08', composition: 'Amoxicillin', manufacturer: 'Generic Pharma', form: 'Capsule', purchase_unit: 'Strip', pack_size: 10, sale_unit: 'Capsule' },
  { id: 'inv11', name: 'Crocin 500mg', category: 'Analgesic', batch: 'CR2411', stock: 150, mrp: 35, purchasePrice: 28, salePrice: 33, discount: 5, rack: 'A-01', location: 'Shelf A', generic: false, ownBrand: false, minStock: 50, maxStock: 200, expiry: '2026-05', composition: 'Paracetamol', manufacturer: 'GSK', form: 'Tablet', purchase_unit: 'Strip', pack_size: 15, sale_unit: 'Tablet' },
  { id: 'inv12', name: 'Dolo 650', category: 'Analgesic', batch: 'DL2412', stock: 110, mrp: 30, purchasePrice: 22, salePrice: 28, discount: 5, rack: 'A-01', location: 'Shelf A', generic: false, ownBrand: false, minStock: 50, maxStock: 200, expiry: '2026-04', composition: 'Paracetamol', manufacturer: 'Micro Labs', form: 'Tablet', purchase_unit: 'Strip', pack_size: 15, sale_unit: 'Tablet' },
  { id: 'inv13', name: 'Azee 500', category: 'Antibiotic', batch: 'AZEE01', stock: 25, mrp: 130, purchasePrice: 100, salePrice: 120, discount: 5, rack: 'B-03', location: 'Shelf B', generic: false, ownBrand: false, minStock: 30, maxStock: 100, expiry: '2025-08', composition: 'Azithromycin', manufacturer: 'Cipla', form: 'Tablet', purchase_unit: 'Strip', pack_size: 5, sale_unit: 'Tablet' },
];

export const offers: Offer[] = [
  { id: 'o1', startDate: '2024-08-01', endDate: '2024-08-31', productId: 'inv1', productName: 'Paracetamol 500mg', originalPrice: 25, offerPrice: 20, status: 'Active', applicableCustomers: 'All Customers', redemptions: 42, revenue: 840, category: 'Analgesic' },
  { id: 'o2', startDate: '2024-08-05', endDate: '2024-08-20', productId: 'inv8', productName: 'Vitamin C 1000mg', originalPrice: 50, offerPrice: 39, status: 'Active', applicableCustomers: 'Regular Customers Only', redemptions: 15, revenue: 585, category: 'Supplement' },
  { id: 'o3', startDate: '2024-07-15', endDate: '2024-08-15', productId: 'inv2', productName: 'Azithromycin 500mg', originalPrice: 120, offerPrice: 99, status: 'Upcoming', applicableCustomers: 'New Customers Only', redemptions: 0, revenue: 0, category: 'Antibiotic' },
  { id: 'o4', startDate: '2024-06-01', endDate: '2024-06-30', productId: 'inv3', productName: 'Cetirizine 10mg', originalPrice: 35, offerPrice: 25, status: 'Expired', applicableCustomers: 'All Customers', redemptions: 89, revenue: 2225, category: 'Antihistamine' },
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
