import apiClient from './client'

// Tasks
export const getTasks = (params?: Record<string, unknown>) =>
  apiClient.get('/tasks/tasks/', { params })

export const createTask = (data: Record<string, unknown>) =>
  apiClient.post('/tasks/tasks/', data)

export const updateTask = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/tasks/tasks/${id}/`, data)

export const deleteTask = (id: number) =>
  apiClient.delete(`/tasks/tasks/${id}/`)

// Checklists
export const getChecklists = (params?: Record<string, unknown>) =>
  apiClient.get('/tasks/checklists/', { params })

export const createChecklist = (data: Record<string, unknown>) =>
  apiClient.post('/tasks/checklists/', data)

export const updateChecklist = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/tasks/checklists/${id}/`, data)

export const deleteChecklist = (id: number) =>
  apiClient.delete(`/tasks/checklists/${id}/`)

// Checklist Items
export const toggleChecklistItem = (id: number) =>
  apiClient.post(`/tasks/checklist-items/${id}/toggle/`)
