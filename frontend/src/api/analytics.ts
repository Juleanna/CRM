import apiClient from './client'

export const getDashboardStats = () =>
  apiClient.get('/analytics/dashboard-stats/')

export const getAnalyticsOverview = () =>
  apiClient.get('/analytics/overview/')
