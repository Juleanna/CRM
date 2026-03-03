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

// =====================
// Orders
// =====================

export interface Customer {
  id: number
  company_name: string
  cooperation_form: 'tender' | 'direct_order' | 'agreement'
  address: string
  phone: string
  email: string
  contact_persons: unknown[]
  cooperation_history: string
}

export interface Order {
  id: number
  title: string
  customer: number
  customer_name: string
  source: string
  description: string
  quantity: number
  payment_amount: string | null
  notes: string
  deadline: string | null
  execution_period: string
  priority: 'high' | 'medium' | 'low'
  status: 'new' | 'document_collection' | 'bidding' | 'approved' | 'won' | 'lost' | 'frozen' | 'rejected'
  proposed_price: string | null
  proposed_term: string
  rejection_reason: string
  participants: number[]
  created_by: number | null
  created_by_name: string
  created_at: string
  updated_at: string
}

// =====================
// Contracts
// =====================

export interface Contract {
  id: number
  order: number
  order_title: string
  contract_number: string
  status: 'planning' | 'production' | 'completed' | 'frozen'
  start_date: string | null
  end_date: string | null
  total_quantity: number
  specification: string
  participants: number[]
  produced_count: number
  created_at: string
  updated_at: string
}

export interface ProductionPlan {
  id: number
  contract: number
  contract_number: string
  department: number
  department_name: string
  volume: number
  schedule_file: string | null
  created_at: string
}

export interface DailyProductionReport {
  id: number
  contract: number
  contract_number: string
  product_name: string
  department: number
  department_name: string
  quantity: number
  date: string
  created_by: number | null
  created_by_name: string
  created_at: string
}

export interface Shipment {
  id: number
  contract: number
  contract_number: string
  product_name: string
  quantity: number
  ship_date: string
  status: 'new' | 'in_transit' | 'paid' | 'completed'
  created_by: number | null
  created_by_name: string
  created_at: string
  updated_at: string
}

// =====================
// Warehouse
// =====================

export interface Material {
  id: number
  article: string
  name: string
  material_type: string
  category: string
  density: string
  color: string
  is_available: boolean
  unit: 'rm' | 'pcs' | 'kg' | 'lm'
  quantity: string
  price_per_unit: string
  currency: string
  total_price: string
  warehouse: number
  warehouse_name: string
  supplier: number | null
  supplier_name: string
  ttn: string
  order_date: string | null
  delivery_date: string | null
  created_at: string
  updated_at: string
}

export interface Pattern {
  id: number
  name: string
  category: string
  pattern_type: 'male' | 'female' | 'unisex' | 'child'
  article: string
  size_range: string
  file: string | null
  created_at: string
  updated_at: string
}

export interface MaterialTransfer {
  id: number
  from_warehouse: number
  from_warehouse_name: string
  to_warehouse: number
  to_warehouse_name: string
  material: number
  material_name: string
  quantity: string
  date: string
  comment: string
  created_by: number | null
  created_by_name: string
  accepted_by: number | null
  accepted_by_name: string
  is_accepted: boolean
  created_at: string
}

export interface ProductTransfer {
  id: number
  from_warehouse: number
  from_warehouse_name: string
  to_warehouse: number
  to_warehouse_name: string
  product_name: string
  contract: number
  contract_number: string
  quantity: number
  date: string
  comment: string
  created_by: number | null
  created_by_name: string
  accepted_by: number | null
  accepted_by_name: string
  is_accepted: boolean
  created_at: string
}

export interface Return {
  id: number
  return_type: 'material_to_supplier' | 'product_from_customer'
  material: number | null
  material_name: string
  product_name: string
  purchase_date: string | null
  quantity: string
  price_per_unit: string
  total_amount: string
  ttn_file: string | null
  payment_receipt: string | null
  reason: string
  created_by: number | null
  created_by_name: string
  created_at: string
}

// =====================
// Procurement
// =====================

export interface Supplier {
  id: number
  company_name: string
  category: 'manufacturer' | 'retailer' | 'both'
  details: string
  location: string
  work_schedule: string
  phone: string
  email: string
  contact_person: string
  contact_person_phone: string
  catalog_url: string
  comments: string
  created_at: string
  updated_at: string
}

export interface PurchaseItem {
  id: number
  purchase: number
  material_name: string
  material_type: string
  category: string
  article: string
  unit: string
  quantity: string
  price_per_unit: string
  total_price: string
}

export interface Purchase {
  id: number
  contract: number
  contract_number: string
  supplier: number
  supplier_name: string
  status: 'new' | 'confirmed' | 'in_transit' | 'received' | 'delayed'
  total_amount: string
  delivery_cost: string
  payment_status: 'not_paid' | 'partially_paid' | 'paid'
  expected_delivery_date: string | null
  actual_delivery_date: string | null
  items: PurchaseItem[]
  created_by: number | null
  created_by_name: string
  created_at: string
  updated_at: string
}

export interface DeliverySchedule {
  id: number
  purchase: number | null
  contract: number
  contract_number: string
  article: string
  material_name: string
  material_type: string
  category: string
  color: string
  supplier: number | null
  supplier_name: string
  ttn: string
  expected_date: string
  actual_date: string | null
  status: string
}

// =====================
// Production
// =====================

export interface FinishedProduct {
  id: number
  contract: number
  contract_number: string
  name: string
  category: 'jacket' | 'tshirt' | 'pants' | 'suit' | 'other'
  product_type: 'male' | 'female' | 'unisex'
  price_per_unit: string
  currency: string
  production_date: string
  quantity: number
  department: number
  department_name: string
  transferred_to_main: boolean
  transfer_date: string | null
  created_by: number | null
  created_by_name: string
  created_at: string
}

export interface ArchivedProject {
  id: number
  contract: number
  contract_number: string
  status: 'completed' | 'cancelled' | 'frozen'
  duration_days: number
  total_cost: string
  total_produced: number
  archived_at: string
}

// =====================
// Tasks
// =====================

export interface Task {
  id: number
  title: string
  description: string
  assignee: number | null
  assignee_name: string
  due_date: string | null
  status: 'new' | 'in_progress' | 'completed'
  order: number | null
  order_title: string
  contract: number | null
  contract_number: string
  comments: string
  created_by: number | null
  created_by_name: string
  created_at: string
  updated_at: string
}

export interface ChecklistItem {
  id: number
  checklist: number
  text: string
  assignee: number | null
  assignee_name: string
  is_done: boolean
  completed_at: string | null
}

export interface Checklist {
  id: number
  title: string
  order: number | null
  contract: number | null
  items: ChecklistItem[]
  progress: { done: number; total: number }
  created_by: number | null
  created_by_name: string
  created_at: string
  updated_at: string
}

// =====================
// Requests
// =====================

export interface RequestResponse {
  id: number
  request: number
  response_text: string
  data: Record<string, unknown>
  created_by: number | null
  created_by_name: string
  created_at: string
}

export interface WorkRequest {
  id: number
  title: string
  request_type: 'warehouse' | 'patterns' | 'calculation' | 'procurement'
  description: string
  order: number | null
  order_title: string
  contract: number | null
  contract_number: string
  deadline: string | null
  status: 'open' | 'closed'
  assignee: number | null
  assignee_name: string
  responses: RequestResponse[]
  created_by: number | null
  created_by_name: string
  created_at: string
  updated_at: string
}

// =====================
// Communications
// =====================

export interface ChatMessage {
  id: number
  chat: number
  sender: number | null
  sender_name: string
  text: string
  is_edited: boolean
  created_at: string
  updated_at: string
}

export interface ChatListItem {
  id: number
  name: string
  chat_type: 'group' | 'individual'
  contract: number | null
  contract_number: string
  created_by: number | null
  participants_count: number
  last_message: { text: string; sender_name: string; created_at: string } | null
  unread_count: number
}

export interface ChatDetail {
  id: number
  name: string
  chat_type: 'group' | 'individual'
  contract: number | null
  participants: { id: number; user: number; user_name: string; joined_at: string }[]
  created_by: number | null
  created_at: string
}

// =====================
// Notifications
// =====================

export interface Notification {
  id: number
  recipient: number
  title: string
  message: string
  notification_type: string
  link: string
  is_read: boolean
  created_at: string
}

// =====================
// Proposals
// =====================

export interface Proposal {
  id: number
  order: number
  order_title: string
  status: 'draft' | 'ready' | 'sent' | 'accepted' | 'rejected'
  price: string | null
  sent_at: string | null
  created_by: number | null
  created_by_name: string
  created_at: string
  updated_at: string
}

// =====================
// Calculations
// =====================

export interface CalculationItem {
  id: number
  calculation: number
  material_name: string
  color: string
  unit: string
  consumption_per_unit: string
  multiplication_coefficient: string
  total_per_unit: string
  total_per_batch: string
  price_with_vat_unit: string
  price_with_vat_batch: string
  shipment_date: string | null
  comments: string
}

export interface Calculation {
  id: number
  order: number | null
  order_title: string
  contract: number | null
  contract_number: string
  file: string | null
  version: number
  items: CalculationItem[]
  created_by: number | null
  created_by_name: string
  created_at: string
  updated_at: string
}

// =====================
// Analytics
// =====================

export interface DashboardStats {
  active_orders: number
  contracts_in_production: number
  pending_purchases: number
  open_tasks: number
  unread_notifications: number
}

export interface AnalyticsOverview {
  production_by_department: { department__name: string; total: number }[]
  orders_by_status: { status: string; count: number }[]
  materials_total_value: number
  active_contracts: {
    id: number
    contract_number: string
    order_title: string
    total_quantity: number
    produced: number
    status: string
  }[]
}

// =====================
// Technical Specifications
// =====================

export interface Affiliation {
  id: number
  name: string
  description: string
  created_at: string
}

export interface TechnicalSpecification {
  id: number
  title: string
  number: string
  affiliation: number
  affiliation_name: string
  description: string
  effective_date: string | null
  expiry_date: string | null
  status: 'draft' | 'active' | 'expired' | 'cancelled'
  file: string | null
  notes: string
  created_by: number | null
  created_by_name: string
  created_at: string
}
