import type {
  AdminUser, Tenant, PlanTier, Invoice, Coupon, SupportTicket,
  FeatureFlag, AuditLogEntry, Lead, BackgroundJob, DataMigrationRequest,
  CannedResponse
} from './types';

// ─── Admin Users ────────────────────────────────────────────────
export const adminUsers: AdminUser[] = [
  { id: 'adm-1', name: 'Vikram Mehta', email: 'vikram@medicore.io', role: 'Super Admin', lastLogin: '2026-08-15T10:30:00' },
  { id: 'adm-2', name: 'Priya Nair', email: 'priya@medicore.io', role: 'Support Agent', lastLogin: '2026-08-15T09:15:00' },
  { id: 'adm-3', name: 'Arjun Reddy', email: 'arjun@medicore.io', role: 'Sales', lastLogin: '2026-08-14T18:00:00' },
  { id: 'adm-4', name: 'Kavitha Iyer', email: 'kavitha@medicore.io', role: 'Finance', lastLogin: '2026-08-15T11:00:00' },
];

// ─── Tenants ────────────────────────────────────────────────────
export const tenants: Tenant[] = [
  { id: 't-1', pharmacyName: 'Apollo Pharmacy – Andheri', ownerName: 'Dr. Rajesh Gupta', ownerEmail: 'rajesh@apollopharmacy.in', ownerPhone: '9876543210', plan: 'Professional', status: 'Active', healthScore: 'Healthy', branchCount: 3, staffCount: 12, signupDate: '2025-06-15', lastActiveDate: '2026-08-15', city: 'Mumbai', state: 'Maharashtra', gstin: '27AABCU9603R1ZM', monthlyBillVolume: 4200, monthlySalesValue: 1850000, billingCycle: 'Monthly', nextRenewalDate: '2026-09-15', paymentMethodStatus: 'Active' },
  { id: 't-2', pharmacyName: 'MedPlus Pharmacy', ownerName: 'Suresh Kumar', ownerEmail: 'suresh@medplus.co', ownerPhone: '9876543211', plan: 'Starter', status: 'Active', healthScore: 'Healthy', branchCount: 1, staffCount: 4, signupDate: '2026-01-10', lastActiveDate: '2026-08-14', city: 'Hyderabad', state: 'Telangana', monthlyBillVolume: 950, monthlySalesValue: 420000, billingCycle: 'Annually', nextRenewalDate: '2027-01-10', paymentMethodStatus: 'Active' },
  { id: 't-3', pharmacyName: 'HealthFirst Medicals', ownerName: 'Meena Sharma', ownerEmail: 'meena@healthfirst.in', ownerPhone: '9876543212', plan: 'Professional', status: 'Past Due', healthScore: 'At Risk', branchCount: 2, staffCount: 7, signupDate: '2025-11-20', lastActiveDate: '2026-08-10', city: 'Bengaluru', state: 'Karnataka', monthlyBillVolume: 1800, monthlySalesValue: 780000, billingCycle: 'Monthly', nextRenewalDate: '2026-08-20', paymentMethodStatus: 'Failed' },
  { id: 't-4', pharmacyName: 'CureWell Pharmacy', ownerName: 'Amit Patel', ownerEmail: 'amit@curewell.com', ownerPhone: '9876543213', plan: 'Enterprise', status: 'Active', healthScore: 'Healthy', branchCount: 8, staffCount: 35, signupDate: '2025-03-01', lastActiveDate: '2026-08-15', city: 'Ahmedabad', state: 'Gujarat', gstin: '24AABCU9603R1ZQ', monthlyBillVolume: 12500, monthlySalesValue: 5600000, billingCycle: 'Annually', nextRenewalDate: '2026-03-01', paymentMethodStatus: 'Active' },
  { id: 't-5', pharmacyName: 'Sanjivani Medical Store', ownerName: 'Ravi Shankar', ownerEmail: 'ravi@sanjivani.in', ownerPhone: '9876543214', plan: 'Starter', status: 'Trial', healthScore: 'Healthy', branchCount: 1, staffCount: 2, signupDate: '2026-08-05', lastActiveDate: '2026-08-15', city: 'Jaipur', state: 'Rajasthan', monthlyBillVolume: 120, monthlySalesValue: 45000, billingCycle: 'Monthly', trialEndsDate: '2026-08-19', paymentMethodStatus: 'None' },
  { id: 't-6', pharmacyName: 'Om Pharma', ownerName: 'Deepak Verma', ownerEmail: 'deepak@ompharma.co', ownerPhone: '9876543215', plan: 'Professional', status: 'Churned', healthScore: 'Churning', branchCount: 2, staffCount: 0, signupDate: '2025-08-12', lastActiveDate: '2026-06-20', city: 'Delhi', state: 'Delhi', monthlyBillVolume: 0, monthlySalesValue: 0, billingCycle: 'Monthly', paymentMethodStatus: 'None' },
  { id: 't-7', pharmacyName: 'Ayush Wellness Pharmacy', ownerName: 'Priya Joshi', ownerEmail: 'priya@ayushwellness.in', ownerPhone: '9876543216', plan: 'Starter', status: 'Active', healthScore: 'At Risk', branchCount: 1, staffCount: 3, signupDate: '2026-04-01', lastActiveDate: '2026-08-08', city: 'Pune', state: 'Maharashtra', monthlyBillVolume: 380, monthlySalesValue: 165000, billingCycle: 'Monthly', nextRenewalDate: '2026-09-01', paymentMethodStatus: 'Active' },
  { id: 't-8', pharmacyName: 'LifeCare Medicals', ownerName: 'Karthik Menon', ownerEmail: 'karthik@lifecare.in', ownerPhone: '9876543217', plan: 'Professional', status: 'Suspended', healthScore: 'Churning', branchCount: 1, staffCount: 5, signupDate: '2025-09-15', lastActiveDate: '2026-07-15', city: 'Chennai', state: 'Tamil Nadu', monthlyBillVolume: 0, monthlySalesValue: 0, billingCycle: 'Monthly', paymentMethodStatus: 'Failed' },
];

// ─── Plans ──────────────────────────────────────────────────────
export const planTiers: PlanTier[] = [
  { id: 'plan-starter', name: 'Starter', price: 999, billingCycle: 'Monthly', maxBranches: 1, maxStaff: 5, maxBillsPerMonth: 1000, features: ['Sales & Billing', 'Inventory', 'Customers', 'Dashboard', 'Basic Reports'], isActive: true },
  { id: 'plan-pro', name: 'Professional', price: 2499, billingCycle: 'Monthly', maxBranches: 5, maxStaff: 20, maxBillsPerMonth: 5000, features: ['All Starter features', 'Purchase Orders', 'PO Reconciliation', 'Price Comparison', 'Branch Transfers', 'Stock Audit', 'Staff Management', 'Expenses', 'Advanced Reports', 'Offers'], isActive: true },
  { id: 'plan-enterprise', name: 'Enterprise', price: 4999, billingCycle: 'Monthly', maxBranches: -1, maxStaff: -1, maxBillsPerMonth: -1, features: ['All Professional features', 'Unlimited branches', 'Unlimited staff', 'Priority support', 'Custom reports', 'API access', 'Dedicated account manager'], isActive: true },
];

// ─── Invoices ───────────────────────────────────────────────────
export const invoices: Invoice[] = [
  { id: 'inv-1', tenantId: 't-1', amount: 2499, date: '2026-08-15', status: 'Paid', planName: 'Professional' },
  { id: 'inv-2', tenantId: 't-1', amount: 2499, date: '2026-07-15', status: 'Paid', planName: 'Professional' },
  { id: 'inv-3', tenantId: 't-2', amount: 9990, date: '2026-01-10', status: 'Paid', planName: 'Starter (Annual)' },
  { id: 'inv-4', tenantId: 't-3', amount: 2499, date: '2026-08-20', status: 'Failed', planName: 'Professional' },
  { id: 'inv-5', tenantId: 't-4', amount: 49990, date: '2025-03-01', status: 'Paid', planName: 'Enterprise (Annual)' },
  { id: 'inv-6', tenantId: 't-7', amount: 999, date: '2026-08-01', status: 'Paid', planName: 'Starter' },
];

// ─── Coupons ────────────────────────────────────────────────────
export const coupons: Coupon[] = [
  { id: 'cpn-1', code: 'LAUNCH50', discountPercent: 50, usageLimit: 100, usedCount: 42, expiryDate: '2026-12-31', applicablePlans: ['plan-starter', 'plan-pro'], isActive: true },
  { id: 'cpn-2', code: 'ANNUAL20', discountPercent: 20, usageLimit: -1, usedCount: 15, expiryDate: '2027-03-31', applicablePlans: ['plan-pro', 'plan-enterprise'], isActive: true },
];

// ─── Support Tickets ────────────────────────────────────────────
export const supportTickets: SupportTicket[] = [
  { id: 'tkt-1', tenantId: 't-1', tenantName: 'Apollo Pharmacy – Andheri', subject: 'Unable to generate GSTR-3B report', category: 'Technical', priority: 'High', status: 'Open', assignedAgentId: 'adm-2', createdAt: '2026-08-14T14:30:00', updatedAt: '2026-08-14T14:30:00', messages: [{ id: 'msg-1', authorId: 't-1', authorName: 'Dr. Rajesh Gupta', content: 'When I try to generate the GSTR-3B report for July, the page shows a blank table. This is urgent as we need to file by the 20th.', timestamp: '2026-08-14T14:30:00', isInternal: false }], slaFirstResponseMins: 120 },
  { id: 'tkt-2', tenantId: 't-3', tenantName: 'HealthFirst Medicals', subject: 'Payment failed but still showing active', category: 'Billing', priority: 'Medium', status: 'In Progress', assignedAgentId: 'adm-2', createdAt: '2026-08-12T10:00:00', updatedAt: '2026-08-13T11:00:00', messages: [{ id: 'msg-2', authorId: 't-3', authorName: 'Meena Sharma', content: 'My last payment failed but the subscription still shows active. What is the grace period?', timestamp: '2026-08-12T10:00:00', isInternal: false }, { id: 'msg-3', authorId: 'adm-2', authorName: 'Priya Nair', content: 'Looking into this. The grace period is 7 days after a failed payment.', timestamp: '2026-08-12T11:00:00', isInternal: false }, { id: 'msg-4', authorId: 'adm-2', authorName: 'Priya Nair', content: 'Internal: Confirmed Razorpay shows failed charge on Aug 10. Auto-retry is scheduled for Aug 17.', timestamp: '2026-08-13T11:00:00', isInternal: true }] },
  { id: 'tkt-3', tenantId: 't-5', tenantName: 'Sanjivani Medical Store', subject: 'How do I import existing inventory from Excel?', category: 'Onboarding', priority: 'Low', status: 'Waiting on Tenant', assignedAgentId: 'adm-3', createdAt: '2026-08-10T09:00:00', updatedAt: '2026-08-11T10:00:00', messages: [{ id: 'msg-5', authorId: 't-5', authorName: 'Ravi Shankar', content: 'I have an Excel sheet with 2000+ items. How can I upload it?', timestamp: '2026-08-10T09:00:00', isInternal: false }, { id: 'msg-6', authorId: 'adm-3', authorName: 'Arjun Reddy', content: 'You can use Settings → Data Migration to upload CSV/Excel files. I\'ve attached a template for the correct format.', timestamp: '2026-08-10T15:00:00', isInternal: false }] },
];

// ─── Canned Responses ───────────────────────────────────────────
export const cannedResponses: CannedResponse[] = [
  { id: 'canned-1', title: 'Payment Grace Period', content: 'Our grace period for failed payments is 7 days. During this time, your account remains fully functional. If payment is not resolved within 7 days, the account will be automatically suspended. You can update your payment method in Settings → Billing.', category: 'Billing' },
  { id: 'canned-2', title: 'Data Import Guide', content: 'To import your existing data:\n1. Go to Settings → Data Migration\n2. Download the template for the data type you want to import\n3. Fill in your data following the template format\n4. Upload the completed file\n\nWe support CSV and Excel (.xlsx) formats. Processing usually takes 5-10 minutes for files under 5,000 rows.', category: 'Onboarding' },
  { id: 'canned-3', title: 'GST Report Issue', content: 'We\'re aware of an intermittent issue with GSTR report generation for large datasets. Our engineering team is working on a fix. In the meantime, please try:\n1. Narrowing the date range\n2. Clearing your browser cache\n3. Using Chrome or Edge browser\n\nIf the issue persists, please share a screenshot and we\'ll escalate this.', category: 'Technical' },
];

// ─── Feature Flags ──────────────────────────────────────────────
export const featureFlags: FeatureFlag[] = [
  { id: 'ff-1', name: 'PO Reconciliation', description: 'Automated matching of purchase orders vs received goods.', defaultStatePerPlan: { 'plan-starter': false, 'plan-pro': true, 'plan-enterprise': true }, tenantOverrides: [], isNew: false },
  { id: 'ff-2', name: 'Price Comparison', description: 'Compare distributor prices side by side.', defaultStatePerPlan: { 'plan-starter': false, 'plan-pro': true, 'plan-enterprise': true }, tenantOverrides: [{ tenantId: 't-5', enabled: true }], isNew: true },
  { id: 'ff-3', name: 'WhatsApp Refill Reminders', description: 'Automated WhatsApp messages for medication refills.', defaultStatePerPlan: { 'plan-starter': false, 'plan-pro': false, 'plan-enterprise': true }, tenantOverrides: [{ tenantId: 't-1', enabled: true }], isNew: true },
  { id: 'ff-4', name: 'Custom Report Builder', description: 'Build custom reports with drag-and-drop.', defaultStatePerPlan: { 'plan-starter': false, 'plan-pro': true, 'plan-enterprise': true }, tenantOverrides: [], isNew: false },
  { id: 'ff-5', name: 'Branch Transfers', description: 'Transfer stock between branches.', defaultStatePerPlan: { 'plan-starter': false, 'plan-pro': true, 'plan-enterprise': true }, tenantOverrides: [], isNew: false },
  { id: 'ff-6', name: 'AI-Powered Demand Forecasting', description: 'ML-based demand prediction for auto-ordering.', defaultStatePerPlan: { 'plan-starter': false, 'plan-pro': false, 'plan-enterprise': false }, tenantOverrides: [{ tenantId: 't-4', enabled: true }], isNew: true },
];

// ─── Audit Log ──────────────────────────────────────────────────
export const auditLog: AuditLogEntry[] = [
  { id: 'aud-1', timestamp: '2026-08-15T10:30:00', adminId: 'adm-1', adminName: 'Vikram Mehta', actionType: 'Impersonation', targetTenantId: 't-1', targetTenantName: 'Apollo Pharmacy – Andheri', details: 'Logged in as tenant to debug GSTR-3B report generation issue.', reason: 'Investigating ticket TKT-001' },
  { id: 'aud-2', timestamp: '2026-08-14T16:00:00', adminId: 'adm-1', adminName: 'Vikram Mehta', actionType: 'Feature Flag Change', details: 'Enabled "WhatsApp Refill Reminders" for Apollo Pharmacy – Andheri (tenant override).', reason: 'Beta testing request from tenant owner' },
  { id: 'aud-3', timestamp: '2026-08-12T14:00:00', adminId: 'adm-4', adminName: 'Kavitha Iyer', actionType: 'Refund Issued', targetTenantId: 't-6', targetTenantName: 'Om Pharma', details: 'Refunded ₹2,499 for invoice INV-006 (unused month after churn).', reason: 'Customer requested refund for unused period' },
  { id: 'aud-4', timestamp: '2026-08-10T09:00:00', adminId: 'adm-1', adminName: 'Vikram Mehta', actionType: 'Account Suspension', targetTenantId: 't-8', targetTenantName: 'LifeCare Medicals', details: 'Account suspended due to 45 days of non-payment.', reason: 'Multiple payment failures, no response to emails' },
  { id: 'aud-5', timestamp: '2026-08-08T11:30:00', adminId: 'adm-1', adminName: 'Vikram Mehta', actionType: 'Plan Override', targetTenantId: 't-5', targetTenantName: 'Sanjivani Medical Store', details: 'Extended trial by 7 days (from Aug 12 to Aug 19).', reason: 'Owner requested more time to evaluate before committing' },
  { id: 'aud-6', timestamp: '2026-08-05T10:00:00', adminId: 'adm-4', adminName: 'Kavitha Iyer', actionType: 'Coupon Created', details: 'Created coupon ANNUAL20 — 20% off annual plans, no usage limit, expires March 2027.' },
];

// ─── Leads / Sales Pipeline ─────────────────────────────────────
export const leads: Lead[] = [
  { id: 'lead-1', pharmacyName: 'Wellness Pharmacy Chain', contactName: 'Rohit Agarwal', contactPhone: '9988776655', contactEmail: 'rohit@wellnesspharmacy.in', city: 'Kolkata', status: 'Demo Scheduled', source: 'Landing Page', assignedTo: 'adm-3', notes: ['Interested in multi-branch features', 'Demo scheduled for Aug 18 at 3 PM'], createdAt: '2026-08-10', updatedAt: '2026-08-14' },
  { id: 'lead-2', pharmacyName: 'City Medicals', contactName: 'Neha Kapoor', contactPhone: '9988776656', contactEmail: 'neha@citymedicals.com', city: 'Lucknow', status: 'Contacted', source: 'Ad Campaign', assignedTo: 'adm-3', notes: ['Called on Aug 12, interested but wants to see pricing'], createdAt: '2026-08-11', updatedAt: '2026-08-12' },
  { id: 'lead-3', pharmacyName: 'Shree Ganesh Pharmacy', contactName: 'Mahesh Patil', contactPhone: '9988776657', contactEmail: 'mahesh@sgpharmacy.in', city: 'Nagpur', status: 'New', source: 'Landing Page', notes: [], createdAt: '2026-08-15', updatedAt: '2026-08-15' },
  { id: 'lead-4', pharmacyName: 'Nirmala Medicals', contactName: 'Sunita Devi', contactPhone: '9988776658', contactEmail: 'sunita@nirmala.in', city: 'Patna', status: 'Trial Started', source: 'Referral', assignedTo: 'adm-3', notes: ['Referred by CureWell Pharmacy (t-4)', 'Started trial on Aug 3'], createdAt: '2026-07-28', updatedAt: '2026-08-03' },
  { id: 'lead-5', pharmacyName: 'Prime Pharmacy', contactName: 'Vijay Singh', contactPhone: '9988776659', contactEmail: 'vijay@primepharmacy.in', city: 'Chandigarh', status: 'Lost', source: 'Direct', notes: ['Chose a competitor product — cited lower pricing'], createdAt: '2026-07-01', updatedAt: '2026-07-15' },
];

// ─── Background Jobs ────────────────────────────────────────────
export const backgroundJobs: BackgroundJob[] = [
  { id: 'job-1', name: 'Recurring Expense Generator', description: 'Generates scheduled recurring expenses for all tenants.', lastRunTime: '2026-08-15T06:00:00', lastRunStatus: 'Success', frequency: 'Daily at 6 AM', affectedTenants: 5 },
  { id: 'job-2', name: 'WhatsApp Refill Reminders', description: 'Sends automated refill reminders via WhatsApp.', lastRunTime: '2026-08-15T09:00:00', lastRunStatus: 'Success', frequency: 'Daily at 9 AM', affectedTenants: 2 },
  { id: 'job-3', name: 'Auto-PO Suggestions', description: 'Generates purchase order suggestions based on stock levels.', lastRunTime: '2026-08-15T07:00:00', lastRunStatus: 'Failed', frequency: 'Daily at 7 AM', affectedTenants: 3 },
  { id: 'job-4', name: 'Scheduled Report Delivery', description: 'Sends scheduled reports via email.', lastRunTime: '2026-08-15T08:00:00', lastRunStatus: 'Success', frequency: 'Per schedule', affectedTenants: 4 },
  { id: 'job-5', name: 'Subscription Renewal Check', description: 'Checks for upcoming renewals and triggers charges.', lastRunTime: '2026-08-15T00:00:00', lastRunStatus: 'Success', frequency: 'Daily at midnight', affectedTenants: 8 },
  { id: 'job-6', name: 'Dunning Retry', description: 'Retries failed payment charges.', lastRunTime: '2026-08-14T12:00:00', lastRunStatus: 'Success', frequency: 'Every 3 days', affectedTenants: 2 },
];

// ─── Data Migration Requests ────────────────────────────────────
export const dataMigrationRequests: DataMigrationRequest[] = [
  { id: 'dm-1', tenantId: 't-5', tenantName: 'Sanjivani Medical Store', fileName: 'inventory_master.xlsx', status: 'Completed', submittedAt: '2026-08-12T10:00:00', completedAt: '2026-08-12T10:08:00', recordsProcessed: 2150, recordsTotal: 2150 },
  { id: 'dm-2', tenantId: 't-1', tenantName: 'Apollo Pharmacy – Andheri', fileName: 'customer_list.csv', status: 'Processing', submittedAt: '2026-08-15T11:30:00', recordsProcessed: 350, recordsTotal: 1200 },
  { id: 'dm-3', tenantId: 't-7', tenantName: 'Ayush Wellness Pharmacy', fileName: 'distributor_data.xlsx', status: 'Failed', submittedAt: '2026-08-14T14:00:00', errorMessage: 'Column "Distributor Name" is missing from row 45 onwards. Expected header not found.', recordsProcessed: 44, recordsTotal: 120 },
];
