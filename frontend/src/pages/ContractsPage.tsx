import { Table, Tag, Progress, Button, Card, Typography, Row, Col, Input, Select, Statistic } from 'antd'
import { PlusOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons'

const { Title } = Typography

const statusMap: Record<string, { color: string; label: string }> = {
  planning: { color: 'blue', label: 'Планування' },
  production: { color: 'green', label: 'Виробництво' },
  completed: { color: 'default', label: 'Завершений' },
  frozen: { color: 'red', label: 'Заморожений' },
}

const mockContracts = [
  { key: '1', number: 'ДГ-2024-001', order: 'Тендер МО-2024-001', status: 'production', quantity: 50000, produced: 37500, start: '2024-01-20', end: '2024-06-30' },
  { key: '2', number: 'ДГ-2024-002', order: 'Замовлення КЛП-Ніка', status: 'planning', quantity: 20000, produced: 0, start: '2024-02-01', end: '2024-05-15' },
  { key: '3', number: 'ДГ-2024-003', order: 'Тендер ЗСУ-2024', status: 'production', quantity: 100000, produced: 65000, start: '2023-11-01', end: '2024-04-30' },
  { key: '4', number: 'ДГ-2023-015', order: 'Замовлення куртки НГУ', status: 'completed', quantity: 15000, produced: 15000, start: '2023-08-01', end: '2023-12-31' },
  { key: '5', number: 'ДГ-2024-004', order: 'Замовлення термобілизна', status: 'frozen', quantity: 10000, produced: 2000, start: '2024-01-15', end: '2024-07-01' },
]

function ContractsPage() {
  const columns = [
    { title: 'Номер договору', dataIndex: 'number', key: 'number', width: 150 },
    { title: 'Замовлення', dataIndex: 'order', key: 'order', ellipsis: true },
    {
      title: 'Статус', dataIndex: 'status', key: 'status', width: 140,
      render: (s: string) => { const st = statusMap[s]; return st ? <Tag color={st.color}>{st.label}</Tag> : s },
      filters: Object.entries(statusMap).map(([k, v]) => ({ text: v.label, value: k })),
      onFilter: (value: unknown, record: typeof mockContracts[0]) => record.status === value,
    },
    {
      title: 'Прогрес', key: 'progress', width: 200,
      render: (_: unknown, r: typeof mockContracts[0]) => {
        const pct = r.quantity > 0 ? Math.round((r.produced / r.quantity) * 100) : 0
        return <Progress percent={pct} size="small" status={pct >= 100 ? 'success' : 'active'} />
      },
    },
    {
      title: 'Виготовлено', key: 'produced', width: 160,
      render: (_: unknown, r: typeof mockContracts[0]) => `${r.produced.toLocaleString()} / ${r.quantity.toLocaleString()} шт`,
    },
    { title: 'Початок', dataIndex: 'start', key: 'start', width: 110 },
    { title: 'Кінцевий термін', dataIndex: 'end', key: 'end', width: 130 },
    {
      title: 'Дії', key: 'actions', width: 80,
      render: () => <Button type="link" icon={<EyeOutlined />} />,
    },
  ]

  const totalProduced = mockContracts.reduce((sum, c) => sum + c.produced, 0)
  const totalOrdered = mockContracts.reduce((sum, c) => sum + c.quantity, 0)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Актуальні договори</Title>
        <Button type="primary" icon={<PlusOutlined />}>Новий договір</Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="Всього договорів" value={mockContracts.length} /></Card></Col>
        <Col span={6}><Card><Statistic title="В виробництві" value={mockContracts.filter(c => c.status === 'production').length} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Замовлено виробів" value={totalOrdered} /></Card></Col>
        <Col span={6}><Card><Statistic title="Виготовлено" value={totalProduced} valueStyle={{ color: '#1677ff' }} /></Card></Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={10}><Input placeholder="Пошук за номером, замовленням..." prefix={<SearchOutlined />} allowClear /></Col>
          <Col span={6}><Select placeholder="Статус" allowClear style={{ width: '100%' }} options={Object.entries(statusMap).map(([k, v]) => ({ value: k, label: v.label }))} /></Col>
        </Row>
      </Card>

      <Card>
        <Table columns={columns} dataSource={mockContracts} pagination={{ pageSize: 10, showTotal: (t) => `Всього: ${t}` }} />
      </Card>
    </div>
  )
}

export default ContractsPage
