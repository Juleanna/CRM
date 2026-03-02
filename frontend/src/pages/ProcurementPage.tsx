import { Table, Tag, Button, Card, Typography, Row, Col, Input, Select, Statistic, Tabs } from 'antd'
import { PlusOutlined, SearchOutlined, ShoppingCartOutlined, CalendarOutlined } from '@ant-design/icons'
const { Title } = Typography

const purchaseStatus: Record<string, { color: string; label: string }> = {
  new: { color: 'blue', label: 'Нове' }, confirmed: { color: 'cyan', label: 'Підтверджено' },
  in_transit: { color: 'orange', label: 'В транзиті' }, received: { color: 'green', label: 'Отримано' },
  delayed: { color: 'red', label: 'Затримується' },
}
const mockPurchases = [
  { key: '1', id: 'ЗК-001', contract: 'ДГ-2024-001', supplier: 'ООО Текстиль Контакт', status: 'in_transit', total: 125000, payment: 'paid', delivery: '2024-01-20', created: '2024-01-10' },
  { key: '2', id: 'ЗК-002', contract: 'ДГ-2024-001', supplier: 'Фурнітура+', status: 'confirmed', total: 45000, payment: 'not_paid', delivery: '2024-01-25', created: '2024-01-12' },
  { key: '3', id: 'ЗК-003', contract: 'ДГ-2024-003', supplier: 'Утеплювач UA', status: 'delayed', total: 89000, payment: 'paid', delivery: '2024-01-15', created: '2024-01-05' },
  { key: '4', id: 'ЗК-004', contract: 'ДГ-2024-002', supplier: 'ООО Текстиль Контакт', status: 'new', total: 230000, payment: 'not_paid', delivery: '2024-02-01', created: '2024-01-16' },
  { key: '5', id: 'ЗК-005', contract: 'ДГ-2024-003', supplier: 'Блискавки UA', status: 'received', total: 67000, payment: 'paid', delivery: '2024-01-12', created: '2024-01-03' },
]
const suppliers = [
  { key: '1', name: 'ООО Текстиль Контакт', category: 'Виробник', location: 'Київ', phone: '+380 44 123-45-67', email: 'info@textile.ua', contact: 'Іванов І.І.' },
  { key: '2', name: 'Фурнітура+', category: 'Рітейлер', location: 'Харків', phone: '+380 57 987-65-43', email: 'sales@furn.ua', contact: 'Петренко О.В.' },
  { key: '3', name: 'Утеплювач UA', category: 'Виробник', location: 'Вінниця', phone: '+380 43 111-22-33', email: 'order@warm.ua', contact: 'Сидоренко Т.М.' },
]

function ProcurementPage() {
  const totalAmount = mockPurchases.reduce((s, p) => s + p.total, 0)
  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 90 },
    { title: 'Договір', dataIndex: 'contract', key: 'contract', width: 130 },
    { title: 'Постачальник', dataIndex: 'supplier', key: 'supplier' },
    { title: 'Статус', dataIndex: 'status', key: 'status', width: 130, render: (s: string) => { const st = purchaseStatus[s]; return st ? <Tag color={st.color}>{st.label}</Tag> : s } },
    { title: 'Сума', dataIndex: 'total', key: 'total', width: 120, render: (v: number) => `${v.toLocaleString()} грн` },
    { title: 'Оплата', dataIndex: 'payment', key: 'payment', width: 120, render: (p: string) => p === 'paid' ? <Tag color="green">Оплачено</Tag> : <Tag color="orange">Не оплачено</Tag> },
    { title: 'Дата доставки', dataIndex: 'delivery', key: 'delivery', width: 120 },
  ]
  const supColumns = [
    { title: 'Назва', dataIndex: 'name', key: 'name' },
    { title: 'Категорія', dataIndex: 'category', key: 'category', width: 120, render: (c: string) => <Tag>{c}</Tag> },
    { title: 'Локація', dataIndex: 'location', key: 'location', width: 110 },
    { title: 'Телефон', dataIndex: 'phone', key: 'phone', width: 160 },
    { title: 'Email', dataIndex: 'email', key: 'email', width: 160 },
    { title: 'Контактна особа', dataIndex: 'contact', key: 'contact', width: 160 },
  ]
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Закупівлі</Title>
        <Button type="primary" icon={<PlusOutlined />}>Нова закупівля</Button>
      </div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="Всього закупівель" value={mockPurchases.length} prefix={<ShoppingCartOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Загальна сума" value={totalAmount} suffix="грн" /></Card></Col>
        <Col span={6}><Card><Statistic title="В транзиті" value={mockPurchases.filter(p => p.status === 'in_transit').length} valueStyle={{ color: '#fa8c16' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Затримується" value={mockPurchases.filter(p => p.status === 'delayed').length} valueStyle={{ color: '#f5222d' }} /></Card></Col>
      </Row>
      <Card>
        <Tabs items={[
          { key: 'purchases', label: <span><ShoppingCartOutlined /> Закупівлі</span>, children: (
            <>
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={8}><Input placeholder="Пошук..." prefix={<SearchOutlined />} allowClear /></Col>
                <Col span={4}><Select placeholder="Статус" allowClear style={{ width: '100%' }} options={Object.entries(purchaseStatus).map(([k, v]) => ({ value: k, label: v.label }))} /></Col>
              </Row>
              <Table columns={columns} dataSource={mockPurchases} size="middle" pagination={{ showTotal: (t) => `Всього: ${t}` }} />
            </>
          )},
          { key: 'suppliers', label: 'Постачальники', children: (
            <>
              <div style={{ marginBottom: 16, textAlign: 'right' }}><Button type="primary" icon={<PlusOutlined />}>Додати постачальника</Button></div>
              <Table columns={supColumns} dataSource={suppliers} size="middle" />
            </>
          )},
          { key: 'calendar', label: <span><CalendarOutlined /> Календар поставок</span>, children: <div style={{ textAlign: 'center', padding: 60, color: '#8c8c8c' }}>Календар поставок (в розробці)</div> },
        ]} />
      </Card>
    </div>
  )
}
export default ProcurementPage
