import apiClient from './client'

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
