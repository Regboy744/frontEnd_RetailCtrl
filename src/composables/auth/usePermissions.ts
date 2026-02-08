import { computed } from 'vue'
import { useAuthStore, type UserRole } from '@/stores/auth'

/**
 * Role hierarchy (index = privilege level, higher is more privileged)
 * manager < admin < master
 */
const ROLE_HIERARCHY: UserRole[] = ['manager', 'admin', 'master']

/**
 * Permission definitions
 * Each permission maps to an array of roles that have that permission
 */
const PERMISSIONS: Record<string, readonly UserRole[]> = {
 // Company management
 'companies:read': ['master'],
 'companies:write': ['master'],
 'companies:delete': ['master'],

 // User management
 'users:read': ['master'],
 'users:write': ['master'],
 'users:delete': ['master'],

 // Location management
 'locations:read': ['master', 'admin', 'manager'],
 'locations:write': ['master', 'admin'],
 'locations:delete': ['master', 'admin'],

 // Supplier management
 'suppliers:read': ['master'],
 'suppliers:write': ['master'],
 'suppliers:delete': ['master'],

 // Product management
 'products:read': ['master', 'admin', 'manager'],
 'products:write': ['master'],
 'products:delete': ['master'],

 // Order management
 'orders:read': ['master', 'admin', 'manager'],
 'orders:write': ['master', 'admin', 'manager'],
 'orders:delete': ['master', 'admin'],

 // Price checking
 'price-check:read': ['master', 'admin', 'manager'],
 'price-check:write': ['master', 'admin', 'manager'],

 // Company settings
 'company-settings:read': ['master', 'admin'],
 'company-settings:write': ['master', 'admin'],

 // Location credentials
 'location-credentials:read': ['master', 'admin', 'manager'],
 'location-credentials:write': ['master', 'admin'],

 // Reports
 'reports:read': ['master', 'admin', 'manager'],
 'reports:export': ['master', 'admin'],

 // Admin features
 'admin:access': ['master', 'admin'],
 'admin:full': ['master'],
} as const

export type Permission = keyof typeof PERMISSIONS

/**
 * Composable for checking user permissions and roles
 */
export function usePermissions() {
 const authStore = useAuthStore()

 /**
  * Get the current user's role
  */
 const currentRole = computed<UserRole | null>(() => authStore.userRole)

 /**
  * Check if user has a specific permission
  */
 const hasPermission = (permission: Permission): boolean => {
  const role = authStore.userRole
  if (!role) return false

  const allowedRoles = PERMISSIONS[permission]
  if (!allowedRoles) return false
  return allowedRoles.includes(role)
 }

 /**
  * Check if user has a specific role
  */
 const hasRole = (role: UserRole): boolean => {
  return authStore.userRole === role
 }

 /**
  * Check if user has any of the specified roles
  */
 const hasAnyRole = (roles: UserRole[]): boolean => {
  const userRole = authStore.userRole
  if (!userRole) return false
  return roles.includes(userRole)
 }

 /**
  * Check if user has all of the specified roles (edge case, usually not needed)
  */
 const hasAllRoles = (roles: UserRole[]): boolean => {
  const userRole = authStore.userRole
  if (!userRole) return false
  // Since a user can only have one role, this checks if the array contains only that role
  return roles.length === 1 && roles[0] === userRole
 }

 /**
  * Check if user's role is at least as privileged as the specified role
  * Uses role hierarchy: manager < admin < master
  */
 const isAtLeastRole = (minRole: UserRole): boolean => {
  const userRole = authStore.userRole
  if (!userRole) return false

  const userRoleIndex = ROLE_HIERARCHY.indexOf(userRole)
  const minRoleIndex = ROLE_HIERARCHY.indexOf(minRole)

  return userRoleIndex >= minRoleIndex
 }

 /**
  * Check if user can perform an action on a resource
  * Convenience method combining action + resource into permission key
  */
 const can = (action: string, resource: string): boolean => {
  const permission = `${resource}:${action}` as Permission
  if (!(permission in PERMISSIONS)) {
   console.warn(`Unknown permission: ${permission}`)
   return false
  }
  return hasPermission(permission)
 }

 /**
  * Check if user is a master (highest privilege)
  */
 const isMaster = computed(() => hasRole('master'))

 /**
  * Check if user is an admin or higher
  */
 const isAdmin = computed(() => isAtLeastRole('admin'))

 /**
  * Check if user is a manager or higher
  */
 const isManager = computed(() => isAtLeastRole('manager'))

 /**
  * Get all permissions for the current user
  */
 const userPermissions = computed<Permission[]>(() => {
  const role = authStore.userRole
  if (!role) return []

  return (Object.keys(PERMISSIONS) as Permission[]).filter((permission) => {
   const allowedRoles = PERMISSIONS[permission]
   return allowedRoles?.includes(role) ?? false
  })
 })

 /**
  * Check multiple permissions at once (AND logic - all must be true)
  */
 const hasAllPermissions = (permissions: Permission[]): boolean => {
  return permissions.every((permission) => hasPermission(permission))
 }

 /**
  * Check multiple permissions at once (OR logic - at least one must be true)
  */
 const hasAnyPermission = (permissions: Permission[]): boolean => {
  return permissions.some((permission) => hasPermission(permission))
 }

 return {
  // Getters
  currentRole,
  isMaster,
  isAdmin,
  isManager,
  userPermissions,

  // Methods
  hasPermission,
  hasRole,
  hasAnyRole,
  hasAllRoles,
  isAtLeastRole,
  can,
  hasAllPermissions,
  hasAnyPermission,
 }
}

/**
 * Export permissions constant for use in route guards and other places
 */
export { PERMISSIONS, ROLE_HIERARCHY }
