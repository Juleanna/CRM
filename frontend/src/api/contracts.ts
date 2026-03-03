import apiClient from './client'

// Contracts
export const getContracts = (params?: Record<string, unknown>) =>
  apiClient.get('/contracts/contracts/', { params })

export const getContract = (id: number) =>
  apiClient.get(`/contracts/contracts/${id}/`)

export const createContract = (data: Record<string, unknown>) =>
  apiClient.post('/contracts/contracts/', data)

export const updateContract = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/contracts/contracts/${id}/`, data)

export const deleteContract = (id: number) =>
  apiClient.delete(`/contracts/contracts/${id}/`)

// Production Plans
export const getProductionPlans = (params?: Record<string, unknown>) =>
  apiClient.get('/contracts/production-plans/', { params })

export const createProductionPlan = (data: Record<string, unknown>) =>
  apiClient.post('/contracts/production-plans/', data)

export const updateProductionPlan = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/contracts/production-plans/${id}/`, data)

export const deleteProductionPlan = (id: number) =>
  apiClient.delete(`/contracts/production-plans/${id}/`)

// Daily Production Reports
export const getDailyReports = (params?: Record<string, unknown>) =>
  apiClient.get('/contracts/daily-reports/', { params })

export const createDailyReport = (data: Record<string, unknown>) =>
  apiClient.post('/contracts/daily-reports/', data)

export const updateDailyReport = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/contracts/daily-reports/${id}/`, data)

export const deleteDailyReport = (id: number) =>
  apiClient.delete(`/contracts/daily-reports/${id}/`)

// Shipments
export const getShipments = (params?: Record<string, unknown>) =>
  apiClient.get('/contracts/shipments/', { params })

export const createShipment = (data: Record<string, unknown>) =>
  apiClient.post('/contracts/shipments/', data)

export const updateShipment = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/contracts/shipments/${id}/`, data)

export const deleteShipment = (id: number) =>
  apiClient.delete(`/contracts/shipments/${id}/`)
