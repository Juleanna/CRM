import apiClient from './client'

export const getChats = (params?: Record<string, unknown>) =>
  apiClient.get('/communications/chats/', { params })

export const getChat = (id: number) =>
  apiClient.get(`/communications/chats/${id}/`)

export const createChat = (data: Record<string, unknown>) =>
  apiClient.post('/communications/chats/', data)

export const getChatMessages = (chatId: number, params?: Record<string, unknown>) =>
  apiClient.get(`/communications/chats/${chatId}/messages/`, { params })

export const sendMessage = (chatId: number, text: string) =>
  apiClient.post(`/communications/chats/${chatId}/send-message/`, { text })
