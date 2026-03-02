import { Table, Tag, Button, Card, Typography, Row, Col, Input, Select } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
const { Title } = Typography
const typeMap: Record<string, { color: string; label: string }> = {
  warehouse: { color: 'blue', label: 'Запит на склад' }, patterns: { color: 'purple', label: 'Запит на лекала' },
  calculation: { color: 'orange', label: 'Запит на прорахунок' }, procurement: { color: 'green', label: 'Запит на закупівлю' },
}
const requests = [
  { key: '1', title: 'Перевірити наявність ріпстоп хакі', type: 'warehouse', status: 'open', assignee: 'Завскладу Коваленко', order: 'ЗМ-2024-001', deadline: '2024-01-17', created: '2024-01-15' },
  { key: '2', title: 'Лекала куртки зимової 44-60', type: 'patterns', status: 'closed', assignee: 'Технолог Петренко', order: 'ЗМ-2024-001', deadline: '2024-01-16', created: '2024-01-14' },
  { key: '3', title: 'Прорахунок матеріалів на партію 50000', type: 'calculation', status: 'open', assignee: 'Технолог Петренко', order: 'ЗМ-2024-003', deadline: '2024-01-20', created: '2024-01-16' },
  { key: '4', title: 'Замовити блискавки YKK 70см', type: 'procurement', status: 'open', assignee: 'Менеджер Сидоренко', order: 'ЗМ-2024-001', deadline: '2024-01-22', created: '2024-01-16' },
]
const columns = [
  { title: 'Назва', dataIndex: 'title', key: 'title' },
  { title: 'Тип', dataIndex: 'type', key: 'type', width: 160, render: (t: string) => { const tp = typeMap[t]; return tp ? <Tag color={tp.color}>{tp.label}</Tag> : t } },
  { title: 'Статус', dataIndex: 'status', key: 'status', width: 110, render: (s: string) => s === 'open' ? <Tag color="blue">Відкритий</Tag> : <Tag color="default">Закритий</Tag> },
  { title: 'Виконавець', dataIndex: 'assignee', key: 'assignee', width: 180 },
  { title: 'Замовлення', dataIndex: 'order', key: 'order', width: 130 },
  { title: 'Дедлайн', dataIndex: 'deadline', key: 'deadline', width: 110 },
]
function RequestsPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Запити</Title>
        <Button type="primary" icon={<PlusOutlined />}>Новий запит</Button>
      </div>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}><Input placeholder="Пошук..." prefix={<SearchOutlined />} allowClear /></Col>
          <Col span={5}><Select placeholder="Тип запиту" allowClear style={{ width: '100%' }} options={Object.entries(typeMap).map(([k, v]) => ({ value: k, label: v.label }))} /></Col>
          <Col span={5}><Select placeholder="Статус" allowClear style={{ width: '100%' }} options={[{ value: 'open', label: 'Відкритий' }, { value: 'closed', label: 'Закритий' }]} /></Col>
        </Row>
      </Card>
      <Card><Table columns={columns} dataSource={requests} size="middle" /></Card>
    </div>
  )
}
export default RequestsPage
