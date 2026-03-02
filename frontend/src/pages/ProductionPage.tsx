import { Table, Tag, Card, Typography, Row, Col, Statistic, Progress, List, Button } from 'antd'
import { PlusOutlined, ToolOutlined } from '@ant-design/icons'
const { Title } = Typography

const products = [
  { key: '1', contract: 'ДГ-2024-001', name: 'Костюм КЛП Ніка', category: 'Костюм', type: 'Чоловіче', date: '2024-01-15', quantity: 500, department: 'Цех Ямпіль', transferred: true },
  { key: '2', contract: 'ДГ-2024-001', name: 'Костюм КЛП Ніка', category: 'Костюм', type: 'Чоловіче', date: '2024-01-14', quantity: 480, department: 'Цех Вінниця', transferred: true },
  { key: '3', contract: 'ДГ-2024-003', name: 'Куртка зимова ЗСУ', category: 'Куртка', type: 'Унісекс', date: '2024-01-15', quantity: 300, department: 'Головний цех', transferred: false },
  { key: '4', contract: 'ДГ-2024-003', name: 'Куртка зимова ЗСУ', category: 'Куртка', type: 'Унісекс', date: '2024-01-14', quantity: 350, department: 'Цех Ямпіль', transferred: true },
]
const dailySummary = [
  { department: 'Цех Ямпіль', today: 500, total: 18750 },
  { department: 'Цех Вінниця', today: 480, total: 12300 },
  { department: 'Головний цех', today: 300, total: 6450 },
]
const columns = [
  { title: 'Договір', dataIndex: 'contract', key: 'contract', width: 130 },
  { title: 'Виріб', dataIndex: 'name', key: 'name' },
  { title: 'Категорія', dataIndex: 'category', key: 'category', width: 100, render: (c: string) => <Tag>{c}</Tag> },
  { title: 'Дата', dataIndex: 'date', key: 'date', width: 110 },
  { title: 'Кількість', dataIndex: 'quantity', key: 'quantity', width: 100 },
  { title: 'Підрозділ', dataIndex: 'department', key: 'department', width: 140 },
  { title: 'Передано', key: 'transferred', width: 100, render: (_: unknown, r: typeof products[0]) => r.transferred ? <Tag color="green">Так</Tag> : <Tag color="orange">Ні</Tag> },
]
function ProductionPage() {
  const todayTotal = dailySummary.reduce((s, d) => s + d.today, 0)
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Виробництво</Title>
        <Button type="primary" icon={<PlusOutlined />}>Додати звіт</Button>
      </div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="Виготовлено сьогодні" value={todayTotal} suffix="шт" valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Активних підрозділів" value={dailySummary.length} prefix={<ToolOutlined />} /></Card></Col>
        <Col span={12}>
          <Card title="Виробництво по підрозділах">
            <List size="small" dataSource={dailySummary} renderItem={(item) => (
              <List.Item>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 500 }}>{item.department}</span>
                    <span>{item.today} шт сьогодні / {item.total.toLocaleString()} шт всього</span>
                  </div>
                  <Progress percent={Math.round((item.today / 600) * 100)} size="small" />
                </div>
              </List.Item>
            )} />
          </Card>
        </Col>
      </Row>
      <Card title="Готові вироби">
        <Table columns={columns} dataSource={products} size="middle" pagination={{ showTotal: (t) => `Всього: ${t}` }} />
      </Card>
    </div>
  )
}
export default ProductionPage
