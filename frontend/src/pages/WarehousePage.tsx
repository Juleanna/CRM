import { Table, Tabs, Tag, Button, Space, Card, Typography, Row, Col, Input, Select, Statistic } from 'antd'
import { PlusOutlined, SearchOutlined, SwapOutlined, ImportOutlined, ExportOutlined, DatabaseOutlined } from '@ant-design/icons'

const { Title } = Typography

const materials = [
  { key: '1', article: 'TK-001', name: 'Тканина ріпстоп', type: 'Ріпстоп', category: 'Тканина', color: 'Хакі', quantity: 1500, unit: 'м/п', price: 85, warehouse: 'Головний склад' },
  { key: '2', article: 'TK-002', name: 'Оксфорд 600D', type: 'Оксфорд', category: 'Тканина', color: 'Чорний', quantity: 800, unit: 'м/п', price: 120, warehouse: 'Головний склад' },
  { key: '3', article: 'FR-001', name: 'Блискавка YKK 70см', type: 'YKK', category: 'Фурнітура', color: 'Чорний', quantity: 5000, unit: 'шт', price: 35, warehouse: 'Головний склад' },
  { key: '4', article: 'FR-002', name: 'Липучка 2.5 петля', type: 'Липучка', category: 'Фурнітура', color: 'Хакі', quantity: 3000, unit: 'м/п', price: 15, warehouse: 'Головний склад' },
  { key: '5', article: 'UT-001', name: 'Синтапон 150г', type: 'Синтапон', category: 'Утеплювач', color: 'Білий', quantity: 200, unit: 'м/п', price: 95, warehouse: 'Склад Ямпіль' },
  { key: '6', article: 'TK-003', name: 'Трикотаж камуфляж', type: 'Трикотаж', category: 'Тканина', color: 'Камуфляж', quantity: 0, unit: 'м/п', price: 110, warehouse: 'Головний склад' },
]

const patterns = [
  { key: '1', article: 'ЛК-001', name: 'Куртка зимова', category: 'Куртка', type: 'Чоловіче', sizes: '44-60', hasFile: true },
  { key: '2', article: 'ЛК-002', name: 'Штани польові', category: 'Штани', type: 'Унісекс', sizes: '44-58', hasFile: true },
  { key: '3', article: 'ЛК-003', name: 'Футболка базова', category: 'Футболка', type: 'Чоловіче', sizes: '44-56', hasFile: false },
]

const transfers = [
  { key: '1', date: '2024-01-15', material: 'Тканина ріпстоп', from: 'Головний склад', to: 'Цех Ямпіль', quantity: '500 м/п', accepted: true },
  { key: '2', date: '2024-01-14', material: 'Блискавка YKK', from: 'Головний склад', to: 'Цех Вінниця', quantity: '1000 шт', accepted: true },
  { key: '3', date: '2024-01-16', material: 'Синтапон 150г', from: 'Головний склад', to: 'Цех Ямпіль', quantity: '100 м/п', accepted: false },
]

const matColumns = [
  { title: 'Артикул', dataIndex: 'article', key: 'article', width: 100 },
  { title: 'Назва', dataIndex: 'name', key: 'name' },
  { title: 'Категорія', dataIndex: 'category', key: 'category', width: 110 },
  { title: 'Колір', dataIndex: 'color', key: 'color', width: 100 },
  {
    title: 'Кількість', key: 'qty', width: 120,
    render: (_: unknown, r: typeof materials[0]) => (
      <span style={{ color: r.quantity === 0 ? '#f5222d' : undefined, fontWeight: r.quantity === 0 ? 600 : undefined }}>
        {r.quantity} {r.unit}
      </span>
    ),
  },
  { title: 'Ціна/од', dataIndex: 'price', key: 'price', width: 90, render: (p: number) => `${p} грн` },
  { title: 'Склад', dataIndex: 'warehouse', key: 'warehouse', width: 140 },
  {
    title: 'Наявність', key: 'avail', width: 100,
    render: (_: unknown, r: typeof materials[0]) => r.quantity > 0 ? <Tag color="green">Є</Tag> : <Tag color="red">Немає</Tag>,
  },
]

const patColumns = [
  { title: 'Артикул', dataIndex: 'article', key: 'article', width: 100 },
  { title: 'Назва', dataIndex: 'name', key: 'name' },
  { title: 'Категорія', dataIndex: 'category', key: 'category', width: 120 },
  { title: 'Тип', dataIndex: 'type', key: 'type', width: 100 },
  { title: 'Розмірний ряд', dataIndex: 'sizes', key: 'sizes', width: 130 },
  {
    title: 'Файл', key: 'file', width: 80,
    render: (_: unknown, r: typeof patterns[0]) => r.hasFile ? <Tag color="green">Є</Tag> : <Tag color="orange">Немає</Tag>,
  },
]

const trColumns = [
  { title: 'Дата', dataIndex: 'date', key: 'date', width: 110 },
  { title: 'Матеріал', dataIndex: 'material', key: 'material' },
  { title: 'Звідки', dataIndex: 'from', key: 'from', width: 150 },
  { title: 'Куди', dataIndex: 'to', key: 'to', width: 150 },
  { title: 'Кількість', dataIndex: 'quantity', key: 'quantity', width: 120 },
  {
    title: 'Статус', key: 'status', width: 120,
    render: (_: unknown, r: typeof transfers[0]) => r.accepted ? <Tag color="green">Прийнято</Tag> : <Tag color="orange">Очікує</Tag>,
  },
]

function WarehousePage() {
  const totalMaterials = materials.length
  const outOfStock = materials.filter(m => m.quantity === 0).length
  const totalValue = materials.reduce((sum, m) => sum + m.price * m.quantity, 0)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Склад</Title>
        <Space>
          <Button icon={<ImportOutlined />}>Імпорт</Button>
          <Button icon={<ExportOutlined />}>Експорт</Button>
          <Button type="primary" icon={<PlusOutlined />}>Додати матеріал</Button>
        </Space>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="Всього позицій" value={totalMaterials} prefix={<DatabaseOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Немає в наявності" value={outOfStock} valueStyle={{ color: outOfStock > 0 ? '#f5222d' : '#52c41a' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Загальна вартість" value={totalValue} suffix="грн" /></Card></Col>
        <Col span={6}><Card><Statistic title="Лекала" value={patterns.length} /></Card></Col>
      </Row>

      <Card>
        <Tabs defaultActiveKey="materials" items={[
          {
            key: 'materials',
            label: <span><DatabaseOutlined /> Матеріали ({materials.length})</span>,
            children: (
              <>
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={8}><Input placeholder="Пошук по назві, артикулу..." prefix={<SearchOutlined />} allowClear /></Col>
                  <Col span={4}><Select placeholder="Категорія" allowClear style={{ width: '100%' }} options={[{ value: 'fabric', label: 'Тканина' }, { value: 'accessory', label: 'Фурнітура' }, { value: 'insulation', label: 'Утеплювач' }]} /></Col>
                  <Col span={4}><Select placeholder="Склад" allowClear style={{ width: '100%' }} options={[{ value: 'main', label: 'Головний' }, { value: 'yampil', label: 'Ямпіль' }]} /></Col>
                </Row>
                <Table columns={matColumns} dataSource={materials} size="middle" pagination={{ pageSize: 10, showTotal: (t) => `Всього: ${t}` }} />
              </>
            ),
          },
          {
            key: 'patterns',
            label: <span>Лекала ({patterns.length})</span>,
            children: <Table columns={patColumns} dataSource={patterns} size="middle" />,
          },
          {
            key: 'transfers',
            label: <span><SwapOutlined /> Переміщення ({transfers.length})</span>,
            children: (
              <>
                <div style={{ marginBottom: 16, textAlign: 'right' }}>
                  <Button type="primary" icon={<SwapOutlined />}>Нове переміщення</Button>
                </div>
                <Table columns={trColumns} dataSource={transfers} size="middle" />
              </>
            ),
          },
        ]} />
      </Card>
    </div>
  )
}

export default WarehousePage
