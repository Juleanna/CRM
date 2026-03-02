import { useState } from 'react'
import { Table, Tag, Button, Space, Input, Select, Card, Typography, Row, Col, Modal, Descriptions, Badge } from 'antd'
import { PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined, FilterOutlined } from '@ant-design/icons'

const { Title } = Typography

const statusMap: Record<string, { color: string; label: string }> = {
  new: { color: 'blue', label: 'Нове' },
  document_collection: { color: 'orange', label: 'Збір документів' },
  bidding: { color: 'purple', label: 'В процесі торгів' },
  approved: { color: 'cyan', label: 'Погоджено' },
  won: { color: 'green', label: 'Перемога' },
  lost: { color: 'red', label: 'Програш' },
  frozen: { color: 'default', label: 'Заморожено' },
  rejected: { color: 'volcano', label: 'Відхилено' },
}

const priorityMap: Record<string, { color: string; label: string }> = {
  high: { color: 'red', label: 'Високий' },
  medium: { color: 'orange', label: 'Середній' },
  low: { color: 'green', label: 'Низький' },
}

const mockOrders = [
  { key: '1', id: 'ЗМ-2024-001', title: 'Тендер МО-2024-001', customer: 'Міноборонпром', status: 'new', priority: 'high', quantity: 50000, amount: 15000000, deadline: '2024-02-15', created: '2024-01-15' },
  { key: '2', id: 'ЗМ-2024-002', title: 'Замовлення КЛП-Ніка', customer: 'ООО Текстиль Контакт', status: 'bidding', priority: 'medium', quantity: 20000, amount: 8000000, deadline: '2024-03-01', created: '2024-01-14' },
  { key: '3', id: 'ЗМ-2024-003', title: 'Тендер ЗСУ-2024', customer: 'ЗСУ', status: 'won', priority: 'high', quantity: 100000, amount: 45000000, deadline: '2024-01-30', created: '2024-01-12' },
  { key: '4', id: 'ЗМ-2024-004', title: 'Замовлення ФБ куртки', customer: 'Фабрика Безпеки', status: 'document_collection', priority: 'low', quantity: 5000, amount: 3500000, deadline: '2024-04-15', created: '2024-01-10' },
  { key: '5', id: 'ЗМ-2024-005', title: 'Тендер НГУ-2024', customer: 'Нац. гвардія', status: 'approved', priority: 'high', quantity: 30000, amount: 22000000, deadline: '2024-02-28', created: '2024-01-08' },
  { key: '6', id: 'ЗМ-2024-006', title: 'Замовлення термобілизна', customer: 'ДП Укрспецпостач', status: 'frozen', priority: 'medium', quantity: 10000, amount: 5000000, deadline: '2024-03-20', created: '2024-01-05' },
]

function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 130 },
    { title: 'Назва', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: 'Замовник', dataIndex: 'customer', key: 'customer', ellipsis: true },
    {
      title: 'Статус', dataIndex: 'status', key: 'status', width: 150,
      render: (s: string) => { const st = statusMap[s]; return st ? <Tag color={st.color}>{st.label}</Tag> : s },
      filters: Object.entries(statusMap).map(([k, v]) => ({ text: v.label, value: k })),
      onFilter: (value: unknown, record: typeof mockOrders[0]) => record.status === value,
    },
    {
      title: 'Пріоритет', dataIndex: 'priority', key: 'priority', width: 110,
      render: (p: string) => { const pr = priorityMap[p]; return pr ? <Tag color={pr.color}>{pr.label}</Tag> : p },
    },
    {
      title: 'Кількість', dataIndex: 'quantity', key: 'quantity', width: 110,
      render: (q: number) => q.toLocaleString('uk-UA'),
    },
    {
      title: 'Сума', dataIndex: 'amount', key: 'amount', width: 140,
      render: (a: number) => `${(a / 1000000).toFixed(1)} млн грн`,
    },
    { title: 'Дедлайн', dataIndex: 'deadline', key: 'deadline', width: 110 },
    {
      title: 'Дії', key: 'actions', width: 100,
      render: (_: unknown, record: typeof mockOrders[0]) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => { setSelectedOrder(record); setDetailOpen(true) }} />
          <Button type="link" icon={<EditOutlined />} />
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Замовлення</Title>
        <Button type="primary" icon={<PlusOutlined />}>Нове замовлення</Button>
      </div>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Input placeholder="Пошук за назвою, замовником..." prefix={<SearchOutlined />} allowClear />
          </Col>
          <Col span={5}>
            <Select placeholder="Статус" allowClear style={{ width: '100%' }}
              options={Object.entries(statusMap).map(([k, v]) => ({ value: k, label: v.label }))} />
          </Col>
          <Col span={5}>
            <Select placeholder="Пріоритет" allowClear style={{ width: '100%' }}
              options={Object.entries(priorityMap).map(([k, v]) => ({ value: k, label: v.label }))} />
          </Col>
          <Col span={6} style={{ textAlign: 'right' }}>
            <Button icon={<FilterOutlined />}>Фільтрувати</Button>
          </Col>
        </Row>
      </Card>
      <Card>
        <Table columns={columns} dataSource={mockOrders} pagination={{ pageSize: 10, showTotal: (t) => `Всього: ${t}` }} />
      </Card>

      <Modal title="Деталі замовлення" open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={700}>
        {selectedOrder && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="ID">{selectedOrder.id}</Descriptions.Item>
            <Descriptions.Item label="Назва">{selectedOrder.title}</Descriptions.Item>
            <Descriptions.Item label="Замовник">{selectedOrder.customer}</Descriptions.Item>
            <Descriptions.Item label="Статус">
              <Badge status={selectedOrder.status === 'won' ? 'success' : 'processing'} text={statusMap[selectedOrder.status]?.label} />
            </Descriptions.Item>
            <Descriptions.Item label="Пріоритет"><Tag color={priorityMap[selectedOrder.priority]?.color}>{priorityMap[selectedOrder.priority]?.label}</Tag></Descriptions.Item>
            <Descriptions.Item label="Кількість">{selectedOrder.quantity.toLocaleString('uk-UA')} шт</Descriptions.Item>
            <Descriptions.Item label="Сума">{selectedOrder.amount.toLocaleString('uk-UA')} грн</Descriptions.Item>
            <Descriptions.Item label="Дедлайн">{selectedOrder.deadline}</Descriptions.Item>
            <Descriptions.Item label="Створено">{selectedOrder.created}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default OrdersPage
