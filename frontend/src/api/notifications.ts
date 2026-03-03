import apiClient from './client'

export const getNotifications = (params?: Record<string, unknown>) =>
  apiClient.get('/notifications/notifications/', { params })

export const markNotificationRead = (id: number) =>
  apiClient.post(`/notifications/notifications/${id}/mark-read/`)

export const markAllNotificationsRead = () =>
  apiClient.post('/notifications/notifications/mark-all-read/')

export const getUnreadCount = () =>
  apiClient.get('/notifications/notifications/unread-count/')
