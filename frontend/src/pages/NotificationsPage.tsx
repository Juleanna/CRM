import { useState } from 'react'
import { List, Card, Typography, Button, Badge, Space, Tabs, Spin, message } from 'antd'
import {
  BellOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  FileTextOutlined,
  SwapOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getNotifications, markNotificationRead, markAllNotificationsRead, getUnreadCount } from '../api/notifications'
import type { Notification, PaginatedResponse } from '../types'

const { Title, Text } = Typography

const typeIcons: Record<string, React.ReactNode> = {
  task_created: <CheckCircleOutlined style={{ color: '#1677ff' }} />,
  delayed: <WarningOutlined style={{ color: '#f5222d' }} />,
  transfer: <SwapOutlined style={{ color: '#52c41a' }} />,
  reminder: <ClockCircleOutlined style={{ color: '#fa8c16' }} />,
  order: <FileTextOutlined style={{ color: '#722ed1' }} />,
  purchase: <ShoppingCartOutlined style={{ color: '#fa8c16' }} />,
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Щойно'
  if (diffMin < 60) return `${diffMin} хв тому`
  if (diffHours < 24) return `${diffHours} год тому`
  if (diffDays === 1) return 'Вчора'
  return date.toLocaleDateString('uk-UA')
}

function NotificationsPage() {
  const queryClient = useQueryClient()
  const [messageApi, contextHolder] = message.useMessage()
  const [activeTab, setActiveTab] = useState<string>('all')

  // Fetch notifications based on active tab
  const {
    data: notificationsData,
    isLoading,
    isError,
  } = useQuery<PaginatedResponse<Notification>>({
    queryKey: ['notifications', activeTab],
    queryFn: () => {
      const params: Record<string, unknown> = { page_size: 50 }
      if (activeTab === 'unread') params.is_read = false
      return getNotifications(params).then(r => r.data)
    },
  })

  // Fetch unread count separately for badge display
  const { data: unreadCountData } = useQuery<{ count: number }>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => getUnreadCount().then(r => r.data),
  })

  const notifications = notificationsData?.results ?? []
  const totalCount = notificationsData?.count ?? 0
  const unreadCount = unreadCountData?.count ?? 0

  // Mark single notification as read
  const markReadMutation = useMutation({
    mutationFn: (id: number) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: () => {
      messageApi.error('Не вдалося позначити сповіщення як прочитане')
    },
  })

  // Mark all notifications as read
  const markAllReadMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      messageApi.success('Всі сповіщення позначено як прочитані')
    },
    onError: () => {
      messageApi.error('Не вдалося позначити всі сповіщення як прочитані')
    },
  })

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markReadMutation.mutate(notification.id)
    }
    if (notification.link) {
      window.location.href = notification.link
    }
  }

  return (
    <div>
      {contextHolder}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          Сповіщення <Badge count={unreadCount} style={{ marginLeft: 8 }} />
        </Title>
        <Button
          onClick={() => markAllReadMutation.mutate()}
          loading={markAllReadMutation.isPending}
          disabled={unreadCount === 0}
        >
          Позначити все як прочитане
        </Button>
      </div>
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: 'all', label: `Всі (${activeTab === 'all' ? totalCount : '...'})` },
            { key: 'unread', label: `Непрочитані (${unreadCount})` },
          ]}
        />
        {isError ? (
          <div style={{ textAlign: 'center', padding: 24, color: '#ff4d4f' }}>
            Не вдалося завантажити сповіщення. Спробуйте оновити сторінку.
          </div>
        ) : (
          <Spin spinning={isLoading}>
            <List
              dataSource={notifications}
              locale={{ emptyText: activeTab === 'unread' ? 'Немає непрочитаних сповіщень' : 'Немає сповіщень' }}
              renderItem={(item) => (
                <List.Item
                  style={{
                    background: item.is_read ? 'transparent' : '#f0f5ff',
                    padding: '12px 16px',
                    borderRadius: 8,
                    marginBottom: 4,
                    cursor: 'pointer',
                  }}
                  onClick={() => handleNotificationClick(item)}
                >
                  <List.Item.Meta
                    avatar={typeIcons[item.notification_type] || <BellOutlined style={{ color: '#1677ff' }} />}
                    title={
                      <Space>
                        {item.title}
                        {!item.is_read && <Badge status="processing" />}
                      </Space>
                    }
                    description={
                      <>
                        <Text type="secondary">{item.message}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {formatTime(item.created_at)}
                        </Text>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Spin>
        )}
      </Card>
    </div>
  )
}

export default NotificationsPage
