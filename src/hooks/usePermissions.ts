import { useMemo } from 'react';
import type { PermissionLevel, StaffMember } from '@/types';
import { roleTemplates } from '@/data';

export function usePermissions(currentUserRole: string, overrides?: Record<string, PermissionLevel>) {
  const permissions = useMemo(() => {
    const template = roleTemplates.find(rt => rt.role === currentUserRole);
    const basePermissions = template?.permissions || {};
    
    // Merge overrides
    return { ...basePermissions, ...overrides };
  }, [currentUserRole, overrides]);

  const getAccessLevel = (module: string): PermissionLevel => {
    // Owner and Admin always have Full Access to everything
    if (['Owner', 'Admin'].includes(currentUserRole)) {
      return 'Full Access';
    }
    
    // Map view ids/paths to module names
    let mappedModule = module;
    if (module.startsWith('purchase')) mappedModule = 'purchases';
    if (module.startsWith('sales')) mappedModule = 'sales';
    if (module === 'distributor-detail') mappedModule = 'distributors';
    if (module === 'customer-detail') mappedModule = 'customers';
    if (module === 'staff-detail') mappedModule = 'staff';
    
    // Default to No Access if not specified
    return permissions[mappedModule] || 'No Access';
  };

  const hasAccess = (module: string) => getAccessLevel(module) !== 'No Access';
  const hasFullAccess = (module: string) => getAccessLevel(module) === 'Full Access';

  return { getAccessLevel, hasAccess, hasFullAccess, permissions };
}
