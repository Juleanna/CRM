import { useState, useRef, useEffect } from 'react'
import {
  Card, Typography, List, Avatar, Badge, Input, Button, Spin, Modal, Form, Select, message, Empty,
} from 'antd'
import { SendOutlined, TeamOutlined, UserOutlined, PlusOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getChats, getChatMessages, sendMessage, createChat } from '../api/communications'
import { useAuthStore } from '../store/authStore'
import type { ChatListItem, ChatMessage, PaginatedResponse } from '../types'

const { Title, Text } = Typography

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffDays === 0) {
    return date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
  }
  if (diffDays === 1) return 'Вчора'
  return date.toLocaleDateString('uk-UA')
}

function ChatPage() {
  const { hasPermission } = useAuthStore()
  const canCreate = hasPermission('chat', 'can_create')

  const queryClient = useQueryClient()
  const [messageApi, contextHolder] = message.useMessage()
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [form] = Form.useForm()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch chat list
  const {
    data: chatsData,
    isLoading: chatsLoading,
  } = useQuery<PaginatedResponse<ChatListItem>>({
    queryKey: ['chats'],
    queryFn: () => getChats({ page_size: 100 }).then(r => r.data),
  })

  const chats = chatsData?.results ?? []

  // Find selected chat details
  const selectedChat = chats.find(c => c.id === selectedChatId) ?? null

  // Fetch messages for selected chat
  const {
    data: messagesData,
    isLoading: messagesLoading,
  } = useQuery<PaginatedResponse<ChatMessage>>({
    queryKey: ['chat-messages', selectedChatId],
    queryFn: () => getChatMessages(selectedChatId!, { page_size: 100 }).then(r => r.data),
    enabled: selectedChatId !== null,
    refetchInterval: 10000, // Poll every 10s for new messages
  })

  const messages = messagesData?.results ?? []

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: ({ chatId, text }: { chatId: number; text: string }) => sendMessage(chatId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', selectedChatId] })
      queryClient.invalidateQueries({ queryKey: ['chats'] })
      setInputValue('')
    },
    onError: () => {
      messageApi.error('Не вдалося надіслати повідомлення')
    },
  })

  // Create chat mutation
  const createChatMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => createChat(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] })
      messageApi.success('Чат створено')
      setCreateModalOpen(false)
      form.resetFields()
      // Select the newly created chat
      const newChat = response.data
      if (newChat?.id) {
        setSelectedChatId(newChat.id)
      }
    },
    onError: () => {
      messageApi.error('Не вдалося створити чат')
    },
  })

  const handleSend = () => {
    const text = inputValue.trim()
    if (!text || !selectedChatId) return
    sendMutation.mutate({ chatId: selectedChatId, text })
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleCreateChat = () => {
    form.validateFields().then((values) => {
      createChatMutation.mutate(values)
    })
  }

  return (
    <div>
      {contextHolder}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Чат</Title>
        {canCreate && <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
          Новий чат
        </Button>}
      </div>

      <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 280px)' }}>
        {/* Chat list */}
        <Card
          style={{ width: 340, overflow: 'auto' }}
          title="Чати"
          styles={{ body: { padding: 0 } }}
        >
          <Spin spinning={chatsLoading}>
            <List
              dataSource={chats}
              locale={{ emptyText: 'Немає чатів' }}
              renderItem={(chat) => (
                <List.Item
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    background: selectedChatId === chat.id ? '#e6f4ff' : 'transparent',
                  }}
                  onClick={() => setSelectedChatId(chat.id)}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={chat.chat_type === 'group' ? <TeamOutlined /> : <UserOutlined />}
                        style={{ backgroundColor: chat.chat_type === 'group' ? '#1677ff' : '#52c41a' }}
                      />
                    }
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{chat.name}</span>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {chat.last_message ? formatTime(chat.last_message.created_at) : ''}
                        </Text>
                      </div>
                    }
                    description={
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text type="secondary" ellipsis style={{ maxWidth: 200 }}>
                          {chat.last_message
                            ? `${chat.last_message.sender_name}: ${chat.last_message.text}`
                            : 'Немає повідомлень'}
                        </Text>
                        {chat.unread_count > 0 && <Badge count={chat.unread_count} />}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Spin>
        </Card>

        {/* Message area */}
        <Card
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          title={selectedChat ? selectedChat.name : 'Оберіть чат'}
          styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column' } }}
        >
          <div style={{ flex: 1, padding: 16, background: '#f5f5f5', borderRadius: 8, marginBottom: 16, overflow: 'auto' }}>
            {!selectedChatId ? (
              <div style={{ textAlign: 'center', color: '#8c8c8c', marginTop: '30%' }}>
                Виберіть чат для початку спілкування
              </div>
            ) : messagesLoading ? (
              <div style={{ textAlign: 'center', marginTop: '30%' }}>
                <Spin />
              </div>
            ) : messages.length === 0 ? (
              <Empty description="Немає повідомлень" style={{ marginTop: '20%' }} />
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      marginBottom: 12,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
                      <Text strong style={{ fontSize: 13 }}>{msg.sender_name}</Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {formatTime(msg.created_at)}
                      </Text>
                      {msg.is_edited && (
                        <Text type="secondary" style={{ fontSize: 11 }}>(редаговано)</Text>
                      )}
                    </div>
                    <div
                      style={{
                        background: '#fff',
                        padding: '8px 12px',
                        borderRadius: 8,
                        maxWidth: '70%',
                        wordWrap: 'break-word',
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Input
              placeholder="Написати повідомлення..."
              style={{ flex: 1 }}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={!selectedChatId}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              loading={sendMutation.isPending}
              disabled={!selectedChatId || !inputValue.trim()}
            >
              Надіслати
            </Button>
          </div>
        </Card>
      </div>

      {/* Create chat modal */}
      <Modal
        title="Новий чат"
        open={createModalOpen}
        onCancel={() => { setCreateModalOpen(false); form.resetFields() }}
        onOk={handleCreateChat}
        okText="Створити"
        cancelText="Скасувати"
        confirmLoading={createChatMutation.isPending}
        destroyOnHidden
        style={{ top: 20 }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Назва чату"
            rules={[{ required: true, message: 'Введіть назву чату' }]}
          >
            <Input placeholder="Назва чату" />
          </Form.Item>
          <Form.Item
            name="chat_type"
            label="Тип чату"
            initialValue="group"
            rules={[{ required: true, message: 'Оберіть тип чату' }]}
          >
            <Select
              options={[
                { value: 'group', label: 'Груповий' },
                { value: 'individual', label: 'Особистий' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ChatPage
