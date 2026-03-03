import apiClient from './client'

export const getUsers = (params?: Record<string, unknown>) =>
  apiClient.get('/accounts/users/', { params })

export const createUser = (data: Record<string, unknown>) =>
  apiClient.post('/accounts/users/', data)

export const updateUser = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/accounts/users/${id}/`, data)

export const deleteUser = (id: number) =>
  apiClient.delete(`/accounts/users/${id}/`)
