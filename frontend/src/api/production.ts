import apiClient from './client'

// Finished Products
export const getFinishedProducts = (params?: Record<string, unknown>) =>
  apiClient.get('/production/finished-products/', { params })

export const createFinishedProduct = (data: Record<string, unknown>) =>
  apiClient.post('/production/finished-products/', data)

export const updateFinishedProduct = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/production/finished-products/${id}/`, data)

export const deleteFinishedProduct = (id: number) =>
  apiClient.delete(`/production/finished-products/${id}/`)

// Archived Projects
export const getArchivedProjects = (params?: Record<string, unknown>) =>
  apiClient.get('/production/archived-projects/', { params })
