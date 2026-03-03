import apiClient from './client'

export const getOrders = (params?: Record<string, unknown>) =>
  apiClient.get('/orders/orders/', { params })

export const getOrder = (id: number) =>
  apiClient.get(`/orders/orders/${id}/`)

export const createOrder = (data: Record<string, unknown>) =>
  apiClient.post('/orders/orders/', data)

export const updateOrder = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/orders/orders/${id}/`, data)

export const deleteOrder = (id: number) =>
  apiClient.delete(`/orders/orders/${id}/`)

export const getCustomers = (params?: Record<string, unknown>) =>
  apiClient.get('/orders/customers/', { params })

export const createCustomer = (data: Record<string, unknown>) =>
  apiClient.post('/orders/customers/', data)

export const updateCustomer = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/orders/customers/${id}/`, data)

export const deleteCustomer = (id: number) =>
  apiClient.delete(`/orders/customers/${id}/`)
