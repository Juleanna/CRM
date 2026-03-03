import apiClient from './client'

// Suppliers
export const getSuppliers = (params?: Record<string, unknown>) =>
  apiClient.get('/procurement/suppliers/', { params })

export const createSupplier = (data: Record<string, unknown>) =>
  apiClient.post('/procurement/suppliers/', data)

export const updateSupplier = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/procurement/suppliers/${id}/`, data)

export const deleteSupplier = (id: number) =>
  apiClient.delete(`/procurement/suppliers/${id}/`)

// Purchases
export const getPurchases = (params?: Record<string, unknown>) =>
  apiClient.get('/procurement/purchases/', { params })

export const createPurchase = (data: Record<string, unknown>) =>
  apiClient.post('/procurement/purchases/', data)

export const updatePurchase = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/procurement/purchases/${id}/`, data)

export const deletePurchase = (id: number) =>
  apiClient.delete(`/procurement/purchases/${id}/`)

// Delivery Schedules
export const getDeliverySchedules = (params?: Record<string, unknown>) =>
  apiClient.get('/procurement/delivery-schedules/', { params })

export const createDeliverySchedule = (data: Record<string, unknown>) =>
  apiClient.post('/procurement/delivery-schedules/', data)

export const updateDeliverySchedule = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/procurement/delivery-schedules/${id}/`, data)
