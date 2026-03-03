import apiClient from './client'

// Customers
export const getCustomers = (params?: Record<string, unknown>) =>
  apiClient.get('/orders/customers/', { params })

export const createCustomer = (data: Record<string, unknown>) =>
  apiClient.post('/orders/customers/', data)

export const updateCustomer = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/orders/customers/${id}/`, data)

export const deleteCustomer = (id: number) =>
  apiClient.delete(`/orders/customers/${id}/`)

// Warehouses
export const getWarehouses = (params?: Record<string, unknown>) =>
  apiClient.get('/warehouse/warehouses/', { params })

export const createWarehouse = (data: Record<string, unknown>) =>
  apiClient.post('/warehouse/warehouses/', data)

export const updateWarehouse = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/warehouse/warehouses/${id}/`, data)

export const deleteWarehouse = (id: number) =>
  apiClient.delete(`/warehouse/warehouses/${id}/`)

// Departments
export const getDepartments = (params?: Record<string, unknown>) =>
  apiClient.get('/accounts/departments/', { params })

export const createDepartment = (data: Record<string, unknown>) =>
  apiClient.post('/accounts/departments/', data)

export const updateDepartment = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/accounts/departments/${id}/`, data)

export const deleteDepartment = (id: number) =>
  apiClient.delete(`/accounts/departments/${id}/`)

// Sizes
export const getSizes = (params?: Record<string, unknown>) =>
  apiClient.get('/warehouse/sizes/', { params })

export const createSize = (data: Record<string, unknown>) =>
  apiClient.post('/warehouse/sizes/', data)

export const updateSize = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/warehouse/sizes/${id}/`, data)

export const deleteSize = (id: number) =>
  apiClient.delete(`/warehouse/sizes/${id}/`)

// Fabric Types
export const getFabricTypes = (params?: Record<string, unknown>) =>
  apiClient.get('/warehouse/fabric-types/', { params })

export const createFabricType = (data: Record<string, unknown>) =>
  apiClient.post('/warehouse/fabric-types/', data)

export const updateFabricType = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/warehouse/fabric-types/${id}/`, data)

export const deleteFabricType = (id: number) =>
  apiClient.delete(`/warehouse/fabric-types/${id}/`)

// Fabric Classes
export const getFabricClasses = (params?: Record<string, unknown>) =>
  apiClient.get('/warehouse/fabric-classes/', { params })

export const createFabricClass = (data: Record<string, unknown>) =>
  apiClient.post('/warehouse/fabric-classes/', data)

export const updateFabricClass = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/warehouse/fabric-classes/${id}/`, data)

export const deleteFabricClass = (id: number) =>
  apiClient.delete(`/warehouse/fabric-classes/${id}/`)
