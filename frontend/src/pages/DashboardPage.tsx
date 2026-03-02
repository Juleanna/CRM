import { Row, Col, Card, Statistic, Table, Tag, List, Progress, Typography } from 'antd'
import {
  FileTextOutlined,
  ProjectOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons'

const { Title } = Typography

const recentOrders = [
  { key: '1', title: 'Тендер МО-2024-001', customer: 'Міноборонпром', status: 'new', priority: 'high', date: '2024-01-15' },
  { key: '2', title: 'Замовлення КЛП-Ніка', customer: 'ООО Текстиль', status: 'bidding', priority: 'medium', date: '2024-01-14' },
  { key: '3', title: 'Тендер ЗСУ-2024-003', customer: 'ЗСУ', status: 'won', priority: 'high', date: '2024-01-12' },
  { key: '4', title: 'Замовлення ФБ-2024-004', customer: 'Фабрика Безпеки', status: 'document_collection', priority: 'low', date: '2024-01-10' },
]

const activeContracts = [
  { id: 'ДГ-2024-001', name: 'Костюм КЛП Ніка', progress: 75, quantity: 50000, produced: 37500 },
  { id: 'ДГ-2024-002', name: 'Куртка зимова ЗСУ', progress: 30, quantity: 20000, produced: 6000 },
  { id: 'ДГ-2024-003', name: 'Штани польові', progress: 90, quantity: 15000, produced: 13500 },
]

const statusMap: Record<string, { color: string; label: string }> = {
  new: { color: 'blue', label: 'Нове' },
  document_collection: { color: 'orange', label: 'Збір документів' },
  bidding: { color: 'purple', label: 'Торги' },
  won: { color: 'green', label: 'Перемога' },
  frozen: { color: 'default', label: 'Заморожено' },
}

const priorityMap: Record<string, { color: string; label: string }> = {
  high: { color: 'red', label: 'Високий' },
  medium: { color: 'orange', label: 'Середній' },
  low: { color: 'green', label: 'Низький' },
}

const orderColumns = [
  { title: 'Назва', dataIndex: 'title', key: 'title' },
  { title: 'Замовник', dataIndex: 'customer', key: 'customer' },
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
  { title: 'Дата', dataIndex: 'date', key: 'date' },
]

function DashboardPage() {
  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>Дашборд</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title="Активні замовлення" value={12} prefix={<FileTextOutlined style={{ color: '#1677ff' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title="Активні договори" value={5} prefix={<ProjectOutlined style={{ color: '#52c41a' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title="Закупівлі в транзиті" value={8} prefix={<ShoppingCartOutlined style={{ color: '#fa8c16' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title="Завдання на сьогодні" value={15} prefix={<CheckCircleOutlined style={{ color: '#722ed1' }} />} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="Останні замовлення" extra={<a href="/orders">Всі замовлення</a>}>
            <Table columns={orderColumns} dataSource={recentOrders} pagination={false} size="small" />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Активні договори">
            <List
              dataSource={activeContracts}
              renderItem={(item) => (
                <List.Item>
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 500 }}>{item.id}</span>
                      <span style={{ color: '#8c8c8c', fontSize: 12 }}>{item.produced}/{item.quantity} шт</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#595959', marginBottom: 6 }}>{item.name}</div>
                    <Progress percent={item.progress} size="small" status={item.progress >= 90 ? 'success' : 'active'} />
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={8}>
          <Card title="Сповіщення" extra={<a href="/notifications">Всі</a>}>
            <List size="small"
              dataSource={[
                { icon: <ClockCircleOutlined style={{ color: '#fa8c16' }} />, text: 'Нагадування: вкажіть к-ть виробів за сьогодні' },
                { icon: <WarningOutlined style={{ color: '#f5222d' }} />, text: 'Закупівля #45 затримується' },
                { icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />, text: 'Переміщення матеріалів прийнято' },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta avatar={item.icon} description={item.text} />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Закупівлі">
            <List size="small"
              dataSource={[
                { name: 'Тканина ріпстоп', supplier: 'ООО Текстиль', status: 'in_transit' },
                { name: 'Блискавка YKK', supplier: 'Фурнітура+', status: 'confirmed' },
                { name: 'Синтапон 150г', supplier: 'Утеплювач UA', status: 'new' },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta title={item.name} description={item.supplier} />
                  <Tag color={item.status === 'in_transit' ? 'blue' : item.status === 'confirmed' ? 'green' : 'default'}>
                    {item.status === 'in_transit' ? 'В транзиті' : item.status === 'confirmed' ? 'Підтверджено' : 'Нове'}
                  </Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Виробничі підрозділи">
            <List size="small"
              dataSource={[
                { name: 'Головний цех', projects: 3, load: 85 },
                { name: 'Цех Ямпіль', projects: 2, load: 60 },
                { name: 'Цех Вінниця', projects: 1, load: 40 },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 500 }}>{item.name}</span>
                      <span style={{ fontSize: 12, color: '#8c8c8c' }}>{item.projects} проекти</span>
                    </div>
                    <Progress percent={item.load} size="small" status={item.load > 80 ? 'exception' : 'active'} />
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default DashboardPage
