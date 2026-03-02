// Common types for the Fabryka CRM

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: UserRole
  phone: string
  department: Department | null
  permission_group: number | null
  permission_group_detail?: PermissionGroup | null
}

export type UserRole =
  | 'superadmin'
  | 'admin'
  | 'tender_manager'
  | 'technologist'
  | 'warehouse_manager'
  | 'procurement_manager'
  | 'accountant'

export interface Department {
  id: number
  name: string
  address: string
  department_type: 'main_warehouse' | 'production_unit' | 'office'
}

export interface ModulePermission {
  id?: number
  module: string
  module_display: string
  can_view: boolean
  can_create: boolean
  can_edit: boolean
  can_delete: boolean
}

export interface PermissionGroup {
  id: number
  name: string
  description: string
  is_system: boolean
  users_count: number
  module_permissions: ModulePermission[]
  created_at: string
  updated_at?: string
}

export interface PermissionGroupListItem {
  id: number
  name: string
  description: string
  is_system: boolean
  users_count: number
  created_at: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
