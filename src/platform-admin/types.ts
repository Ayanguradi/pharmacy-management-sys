// Platform Admin Types — completely separate from tenant types

export type AdminRole = 'Super Admin' | 'Support Agent' | 'Sales' | 'Finance';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatar?: string;
  lastLogin?: string;
}

export type TenantStatus = 'Trial' | 'Active' | 'Past Due' | 'Suspended' | 'Churned';
export type HealthScore = 'Healthy' | 'At Risk' | 'Churning';
export type TicketStatus = 'Open' | 'In Progress' | 'Waiting on Tenant' | 'Resolved' | 'Closed';
export type TicketCategory = 'Billing' | 'Technical' | 'Feature Request' | 'Bug' | 'Onboarding';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type LeadStatus = 'New' | 'Contacted' | 'Demo Scheduled' | 'Trial Started' | 'Converted' | 'Lost';

export interface Tenant {
  id: string;
  pharmacyName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  plan: string;
  status: TenantStatus;
  healthScore: HealthScore;
  branchCount: number;
  staffCount: number;
  signupDate: string;
  lastActiveDate: string;
  city: string;
  state: string;
  gstin?: string;
  monthlyBillVolume: number;
  monthlySalesValue: number;
  trialEndsDate?: string;
  billingCycle: 'Monthly' | 'Annually';
  nextRenewalDate?: string;
  paymentMethodStatus: 'Active' | 'Failed' | 'None';
}

export interface PlanTier {
  id: string;
  name: string;
  price: number;
  billingCycle: 'Monthly' | 'Annually';
  maxBranches: number;
  maxStaff: number;
  maxBillsPerMonth: number;
  features: string[];
  isActive: boolean;
}

export interface Invoice {
  id: string;
  tenantId: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
  planName: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  usageLimit: number;
  usedCount: number;
  expiryDate: string;
  applicablePlans: string[];
  isActive: boolean;
}

export interface SupportTicket {
  id: string;
  tenantId: string;
  tenantName: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedAgentId?: string;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
  slaFirstResponseMins?: number;
  slaResolutionMins?: number;
}

export interface TicketMessage {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: string;
  isInternal: boolean; // internal note vs tenant-visible reply
  attachments?: string[];
}

export interface CannedResponse {
  id: string;
  title: string;
  content: string;
  category: TicketCategory;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  defaultStatePerPlan: Record<string, boolean>; // planId → enabled
  tenantOverrides: { tenantId: string; enabled: boolean }[];
  isNew: boolean; // controls "NEW" badge in tenant UI
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  adminId: string;
  adminName: string;
  actionType: 'Impersonation' | 'Plan Override' | 'Account Suspension' | 'Account Reactivation' | 'Feature Flag Change' | 'Refund Issued' | 'Coupon Created' | 'Ticket Action';
  targetTenantId?: string;
  targetTenantName?: string;
  details: string;
  reason?: string;
}

export interface Lead {
  id: string;
  pharmacyName: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  city: string;
  status: LeadStatus;
  source: 'Landing Page' | 'Referral' | 'Direct' | 'Ad Campaign';
  assignedTo?: string;
  notes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BackgroundJob {
  id: string;
  name: string;
  description: string;
  lastRunTime: string;
  lastRunStatus: 'Success' | 'Failed' | 'Running';
  frequency: string;
  affectedTenants: number;
}

export interface DataMigrationRequest {
  id: string;
  tenantId: string;
  tenantName: string;
  fileName: string;
  status: 'Queued' | 'Processing' | 'Completed' | 'Failed';
  submittedAt: string;
  completedAt?: string;
  errorMessage?: string;
  recordsProcessed?: number;
  recordsTotal?: number;
}
