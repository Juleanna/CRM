import apiClient from './client'

// Materials
export const getMaterials = (params?: Record<string, unknown>) =>
  apiClient.get('/warehouse/materials/', { params })

export const createMaterial = (data: Record<string, unknown>) =>
  apiClient.post('/warehouse/materials/', data)

export const updateMaterial = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/warehouse/materials/${id}/`, data)

export const deleteMaterial = (id: number) =>
  apiClient.delete(`/warehouse/materials/${id}/`)

// Patterns
export const getPatterns = (params?: Record<string, unknown>) =>
  apiClient.get('/warehouse/patterns/', { params })

export const createPattern = (data: Record<string, unknown>) =>
  apiClient.post('/warehouse/patterns/', data)

export const updatePattern = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/warehouse/patterns/${id}/`, data)

export const deletePattern = (id: number) =>
  apiClient.delete(`/warehouse/patterns/${id}/`)

// Material Transfers
export const getMaterialTransfers = (params?: Record<string, unknown>) =>
  apiClient.get('/warehouse/material-transfers/', { params })

export const createMaterialTransfer = (data: Record<string, unknown>) =>
  apiClient.post('/warehouse/material-transfers/', data)

export const acceptMaterialTransfer = (id: number) =>
  apiClient.post(`/warehouse/material-transfers/${id}/accept/`)

// Product Transfers
export const getProductTransfers = (params?: Record<string, unknown>) =>
  apiClient.get('/warehouse/product-transfers/', { params })

export const createProductTransfer = (data: Record<string, unknown>) =>
  apiClient.post('/warehouse/product-transfers/', data)

export const acceptProductTransfer = (id: number) =>
  apiClient.post(`/warehouse/product-transfers/${id}/accept/`)

// Returns
export const getReturns = (params?: Record<string, unknown>) =>
  apiClient.get('/warehouse/returns/', { params })

export const createReturn = (data: Record<string, unknown>) =>
  apiClient.post('/warehouse/returns/', data)

// Warehouses
export const getWarehouses = (params?: Record<string, unknown>) =>
  apiClient.get('/warehouse/warehouses/', { params })

export const createWarehouse = (data: Record<string, unknown>) =>
  apiClient.post('/warehouse/warehouses/', data)

export const updateWarehouse = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/warehouse/warehouses/${id}/`, data)

export const deleteWarehouse = (id: number) =>
  apiClient.delete(`/warehouse/warehouses/${id}/`)
