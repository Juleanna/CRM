import apiClient from './client'

// Work Requests
export const getRequests = (params?: Record<string, unknown>) =>
  apiClient.get('/requests/requests/', { params })

export const createRequest = (data: Record<string, unknown>) =>
  apiClient.post('/requests/requests/', data)

export const updateRequest = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/requests/requests/${id}/`, data)

export const deleteRequest = (id: number) =>
  apiClient.delete(`/requests/requests/${id}/`)

// Request Responses
export const addRequestResponse = (id: number, data: Record<string, unknown>) =>
  apiClient.post(`/requests/requests/${id}/add-response/`, data)
