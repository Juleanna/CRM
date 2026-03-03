import { Row, Col, Card, Statistic, Table, Tag, List, Progress, Typography, Spin, Alert } from 'antd'
import {
  FileTextOutlined,
  ProjectOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { getDashboardStats } from '../api/analytics'
import { getOrders } from '../api/orders'
import { getContracts } from '../api/contracts'
import { getNotifications } from '../api/notifications'
import { getPurchases } from '../api/procurement'
import type { DashboardStats, Order, Contract, Notification, Purchase, PaginatedResponse } from '../types'

const { Title } = Typography

const statusMap: Record<string, { color: string; label: string }> = {
  new: { color: 'blue', label: 'Нове' },
  document_collection: { color: 'orange', label: 'Збір документів' },
  bidding: { color: 'purple', label: 'Торги' },
  won: { color: 'green', label: 'Перемога' },
  frozen: { color: 'default', label: 'Заморожено' },
  approved: { color: 'cyan', label: 'Погоджено' },
  lost: { color: 'red', label: 'Програш' },
  rejected: { color: 'volcano', label: 'Відхилено' },
}

const priorityMap: Record<string, { color: string; label: string }> = {
  high: { color: 'red', label: 'Високий' },
  medium: { color: 'orange', label: 'Середній' },
  low: { color: 'green', label: 'Низький' },
}

const purchaseStatusMap: Record<string, { color: string; label: string }> = {
  new: { color: 'default', label: 'Нове' },
  confirmed: { color: 'green', label: 'Підтверджено' },
  in_transit: { color: 'blue', label: 'В транзиті' },
  received: { color: 'cyan', label: 'Отримано' },
  delayed: { color: 'red', label: 'Затримка' },
}

const orderColumns = [
  { title: 'Назва', dataIndex: 'title', key: 'title' },
  { title: 'Замовник', dataIndex: 'customer_name', key: 'customer_name' },
  {
    title: 'Статус', dataIndex: 'status', key: 'status',
    render: (status: string) => {
      const s = statusMap[status]
      return s ? <Tag color={s.color}>{s.label}</Tag> : status
    },
  },
  {
    title: 'Пріоритет', dataIndex: 'priority', key: 'priority',
    render: (priority: string) => {
      const p = priorityMap[priority]
      return p ? <Tag color={p.color}>{p.label}</Tag> : priority
    },
  },
  { title: 'Дата', dataIndex: 'created_at', key: 'created_at',
    render: (date: string) => date ? new Date(date).toLocaleDateString('uk-UA') : '—',
  },
]

function DashboardPage() {
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
  } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => getDashboardStats().then(r => r.data),
  })

  const {
    data: ordersData,
    isLoading: ordersLoading,
    isError: ordersError,
  } = useQuery<PaginatedResponse<Order>>({
    queryKey: ['orders', { page_size: 6 }],
    queryFn: () => getOrders({ page_size: 6 }).then(r => r.data),
  })

  const {
    data: contractsData,
    isLoading: contractsLoading,
    isError: contractsError,
  } = useQuery<PaginatedResponse<Contract>>({
    queryKey: ['contracts', { status: 'production', page_size: 5 }],
    queryFn: () => getContracts({ status: 'production', page_size: 5 }).then(r => r.data),
  })

  const {
    data: notificationsData,
    isLoading: notificationsLoading,
  } = useQuery<PaginatedResponse<Notification>>({
    queryKey: ['notifications', { page_size: 5 }],
    queryFn: () => getNotifications({ page_size: 5 }).then(r => r.data),
  })

  const {
    data: purchasesData,
    isLoading: purchasesLoading,
  } = useQuery<PaginatedResponse<Purchase>>({
    queryKey: ['purchases', { page_size: 5 }],
    queryFn: () => getPurchases({ page_size: 5 }).then(r => r.data),
  })

  const recentOrders = ordersData?.results ?? []
  const activeContracts = contractsData?.results ?? []
  const notifications = notificationsData?.results ?? []
  const purchases = purchasesData?.results ?? []

  const notificationIcon = (type: string) => {
    if (type === 'warning' || type === 'deadline')
      return <WarningOutlined style={{ color: '#f5222d' }} />
    if (type === 'reminder')
      return <ClockCircleOutlined style={{ color: '#fa8c16' }} />
    return <CheckCircleOutlined style={{ color: '#52c41a' }} />
  }

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>Дашборд</Title>

      <Spin spinning={statsLoading}>
        {statsError ? (
          <Alert message="Не вдалося завантажити статистику" type="error" showIcon style={{ marginBottom: 24 }} />
        ) : (
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable>
                <Statistic title="Активні замовлення" value={stats?.active_orders ?? 0} prefix={<FileTextOutlined style={{ color: '#1677ff' }} />} />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable>
                <Statistic title="Активні договори" value={stats?.contracts_in_production ?? 0} prefix={<ProjectOutlined style={{ color: '#52c41a' }} />} />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable>
                <Statistic title="Закупівлі в транзиті" value={stats?.pending_purchases ?? 0} prefix={<ShoppingCartOutlined style={{ color: '#fa8c16' }} />} />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card hoverable>
                <Statistic title="Завдання на сьогодні" value={stats?.open_tasks ?? 0} prefix={<CheckCircleOutlined style={{ color: '#722ed1' }} />} />
              </Card>
            </Col>
          </Row>
        )}
      </Spin>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="Останні замовлення" extra={<a href="/orders">Всі замовлення</a>}>
            {ordersError ? (
              <Alert message="Не вдалося завантажити замовлення" type="error" showIcon />
            ) : (
              <Table
                columns={orderColumns}
                dataSource={recentOrders}
                rowKey="id"
                pagination={false}
                size="small"
                loading={ordersLoading}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Активні договори">
            {contractsError ? (
              <Alert message="Не вдалося завантажити договори" type="error" showIcon />
            ) : (
              <Spin spinning={contractsLoading}>
                <List
                  dataSource={activeContracts}
                  locale={{ emptyText: 'Немає активних договорів' }}
                  renderItem={(item) => {
                    const progress = item.total_quantity > 0
                      ? Math.round((item.produced_count / item.total_quantity) * 100)
                      : 0
                    return (
                      <List.Item>
                        <div style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontWeight: 500 }}>{item.contract_number}</span>
                            <span style={{ color: '#8c8c8c', fontSize: 12 }}>{item.produced_count}/{item.total_quantity} шт</span>
                          </div>
                          <div style={{ fontSize: 13, color: '#595959', marginBottom: 6 }}>{item.order_title}</div>
                          <Progress percent={progress} size="small" status={progress >= 90 ? 'success' : 'active'} />
                        </div>
                      </List.Item>
                    )
                  }}
                />
              </Spin>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={8}>
          <Card title="Сповіщення" extra={<a href="/notifications">Всі</a>}>
            <Spin spinning={notificationsLoading}>
              <List size="small"
                dataSource={notifications}
                locale={{ emptyText: 'Немає сповіщень' }}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={notificationIcon(item.notification_type)}
                      description={item.message || item.title}
                    />
                  </List.Item>
                )}
              />
            </Spin>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Закупівлі">
            <Spin spinning={purchasesLoading}>
              <List size="small"
                dataSource={purchases}
                locale={{ emptyText: 'Немає закупівель' }}
                renderItem={(item) => {
                  const st = purchaseStatusMap[item.status]
                  return (
                    <List.Item>
                      <List.Item.Meta
                        title={item.contract_number}
                        description={item.supplier_name}
                      />
                      <Tag color={st?.color ?? 'default'}>{st?.label ?? item.status}</Tag>
                    </List.Item>
                  )
                }}
              />
            </Spin>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Виробничі підрозділи">
            <Spin spinning={contractsLoading}>
              <List size="small"
                dataSource={activeContracts}
                locale={{ emptyText: 'Немає виробництва' }}
                renderItem={(item) => {
                  const progress = item.total_quantity > 0
                    ? Math.round((item.produced_count / item.total_quantity) * 100)
                    : 0
                  return (
                    <List.Item>
                      <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontWeight: 500 }}>{item.contract_number}</span>
                          <span style={{ fontSize: 12, color: '#8c8c8c' }}>{item.order_title}</span>
                        </div>
                        <Progress percent={progress} size="small" status={progress > 80 ? 'exception' : 'active'} />
                      </div>
                    </List.Item>
                  )
                }}
              />
            </Spin>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default DashboardPage
