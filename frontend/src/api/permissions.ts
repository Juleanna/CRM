import apiClient from './client'

export const getPermissionGroups = (params?: Record<string, unknown>) =>
  apiClient.get('/accounts/permission-groups/', { params })

export const getPermissionGroup = (id: number) =>
  apiClient.get(`/accounts/permission-groups/${id}/`)

export const createPermissionGroup = (data: Record<string, unknown>) =>
  apiClient.post('/accounts/permission-groups/', data)

export const updatePermissionGroup = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/accounts/permission-groups/${id}/`, data)

export const deletePermissionGroup = (id: number) =>
  apiClient.delete(`/accounts/permission-groups/${id}/`)

export const getModules = () =>
  apiClient.get('/accounts/permission-groups/modules/')
