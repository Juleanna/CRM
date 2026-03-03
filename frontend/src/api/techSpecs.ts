import apiClient from './client'

// Technical Specifications
export const getTechSpecs = (params?: Record<string, unknown>) =>
  apiClient.get('/documents/tech-specs/', { params })

export const getTechSpec = (id: number) =>
  apiClient.get(`/documents/tech-specs/${id}/`)

export const createTechSpec = (data: FormData | Record<string, unknown>) =>
  apiClient.post('/documents/tech-specs/', data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
  })

export const updateTechSpec = (id: number, data: FormData | Record<string, unknown>) =>
  apiClient.patch(`/documents/tech-specs/${id}/`, data, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
  })

export const deleteTechSpec = (id: number) =>
  apiClient.delete(`/documents/tech-specs/${id}/`)

// Affiliations
export const getAffiliations = (params?: Record<string, unknown>) =>
  apiClient.get('/documents/affiliations/', { params })

export const createAffiliation = (data: Record<string, unknown>) =>
  apiClient.post('/documents/affiliations/', data)

export const updateAffiliation = (id: number, data: Record<string, unknown>) =>
  apiClient.patch(`/documents/affiliations/${id}/`, data)

export const deleteAffiliation = (id: number) =>
  apiClient.delete(`/documents/affiliations/${id}/`)
