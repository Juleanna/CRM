import { Card, Typography, Row, Col, Statistic, Table, Tag, Progress, List, Spin } from 'antd'
import {
  ShoppingCartOutlined,
  FileTextOutlined,
  ProjectOutlined,
  ToolOutlined,
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { getDashboardStats, getAnalyticsOverview } from '../api/analytics'
import type { DashboardStats, AnalyticsOverview } from '../types'

const { Title } = Typography

const statusColors: Record<string, string> = {
  production: 'green',
  planning: 'blue',
  completed: 'default',
  frozen: 'red',
}
const statusLabels: Record<string, string> = {
  production: 'Виробництво',
  planning: 'Планування',
  completed: 'Завершений',
  frozen: 'Заморожений',
}

const orderStatusLabels: Record<string, string> = {
  new: 'Нове',
  document_collection: 'Збір документів',
  bidding: 'В процесі торгів',
  approved: 'Погоджено',
  won: 'Перемога',
  lost: 'Програш',
  frozen: 'Заморожено',
  rejected: 'Відхилено',
}

function AnalyticsPage() {
  // Fetch dashboard stats (cards at the top)
  const {
    data: stats,
    isLoading: statsLoading,
  } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => getDashboardStats().then(r => r.data),
  })

  // Fetch analytics overview (table, departments, orders by status)
  const {
    data: overview,
    isLoading: overviewLoading,
  } = useQuery<AnalyticsOverview>({
    queryKey: ['analytics-overview'],
    queryFn: () => getAnalyticsOverview().then(r => r.data),
  })

  const activeContracts = overview?.active_contracts ?? []
  const productionByDept = overview?.production_by_department ?? []
  const ordersByStatus = overview?.orders_by_status ?? []
  const materialsTotalValue = overview?.materials_total_value ?? 0

  const columns = [
    {
      title: 'Проект',
      dataIndex: 'contract_number',
      key: 'contract_number',
      width: 130,
    },
    {
      title: 'Виріб',
      dataIndex: 'order_title',
      key: 'order_title',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (s: string) => <Tag color={statusColors[s]}>{statusLabels[s] ?? s}</Tag>,
    },
    {
      title: 'Прогрес',
      key: 'progress',
      width: 180,
      render: (_: unknown, r: AnalyticsOverview['active_contracts'][0]) => {
        const percent = r.total_quantity > 0 ? Math.round((r.produced / r.total_quantity) * 100) : 0
        return <Progress percent={percent} size="small" />
      },
    },
    {
      title: 'Виготовлено / Замовлено',
      key: 'counts',
      width: 190,
      render: (_: unknown, r: AnalyticsOverview['active_contracts'][0]) =>
        `${r.produced.toLocaleString('uk-UA')} / ${r.total_quantity.toLocaleString('uk-UA')}`,
    },
  ]

  const isLoading = statsLoading || overviewLoading

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>Аналітика</Title>

      <Spin spinning={isLoading}>
        {/* Stats cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Активних замовлень"
                value={stats?.active_orders ?? 0}
                prefix={<ShoppingCartOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Контрактів у виробництві"
                value={stats?.contracts_in_production ?? 0}
                prefix={<ProjectOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Очікуваних закупівель"
                value={stats?.pending_purchases ?? 0}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Відкритих завдань"
                value={stats?.open_tasks ?? 0}
                prefix={<ToolOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          {/* Projects table */}
          <Col span={16}>
            <Card title="Проекти виробництва">
              <Table
                columns={columns}
                dataSource={activeContracts}
                rowKey="id"
                pagination={false}
                size="middle"
                locale={{ emptyText: 'Немає активних проектів' }}
              />
            </Card>
          </Col>

          <Col span={8}>
            {/* Production by department */}
            <Card title="Виробничі підрозділи" style={{ marginBottom: 16 }}>
              <List
                size="small"
                locale={{ emptyText: 'Немає даних' }}
                dataSource={productionByDept}
                renderItem={(item) => (
                  <List.Item>
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span>{item.department__name}</span>
                        <span style={{ fontSize: 12, color: '#8c8c8c' }}>{item.total.toLocaleString('uk-UA')} одиниць</span>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </Card>

            {/* Orders by status + materials value */}
            <Card title="Замовлення за статусами">
              <List
                size="small"
                locale={{ emptyText: 'Немає даних' }}
                dataSource={[
                  ...ordersByStatus.map(item => ({
                    label: orderStatusLabels[item.status] ?? item.status,
                    value: item.count,
                  })),
                  { label: 'Вартість матеріалів', value: `${materialsTotalValue.toLocaleString('uk-UA')} грн` },
                  { label: 'Непрочитаних сповіщень', value: stats?.unread_notifications ?? 0 },
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <span>{item.label}</span>
                      <strong>{typeof item.value === 'number' ? item.value.toLocaleString('uk-UA') : item.value}</strong>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  )
}

export default AnalyticsPage
