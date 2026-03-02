import { Card, Typography, Row, Col, Statistic, Table, Tag, Progress, List } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined, ProjectOutlined, ToolOutlined } from '@ant-design/icons'
const { Title } = Typography

const projectStats = [
  { key: '1', project: 'ДГ-2024-001', product: 'Костюм КЛП Ніка', ordered: 50000, produced: 37500, deadline: '2024-06-30', status: 'production' },
  { key: '2', project: 'ДГ-2024-003', product: 'Куртка зимова ЗСУ', ordered: 100000, produced: 65000, deadline: '2024-04-30', status: 'production' },
  { key: '3', project: 'ДГ-2024-002', product: 'Штани польові', ordered: 20000, produced: 0, deadline: '2024-05-15', status: 'planning' },
]
const statusColors: Record<string, string> = { production: 'green', planning: 'blue', completed: 'default', frozen: 'red' }
const statusLabels: Record<string, string> = { production: 'Виробництво', planning: 'Планування', completed: 'Завершений', frozen: 'Заморожений' }
const columns = [
  { title: 'Проект', dataIndex: 'project', key: 'project', width: 130 },
  { title: 'Виріб', dataIndex: 'product', key: 'product' },
  { title: 'Статус', dataIndex: 'status', key: 'status', width: 130, render: (s: string) => <Tag color={statusColors[s]}>{statusLabels[s]}</Tag> },
  { title: 'Прогрес', key: 'progress', width: 180, render: (_: unknown, r: typeof projectStats[0]) => <Progress percent={Math.round((r.produced / r.ordered) * 100)} size="small" /> },
  { title: 'Виготовлено / Замовлено', key: 'counts', width: 190, render: (_: unknown, r: typeof projectStats[0]) => `${r.produced.toLocaleString()} / ${r.ordered.toLocaleString()}` },
  { title: 'Дедлайн', dataIndex: 'deadline', key: 'deadline', width: 110 },
]
function AnalyticsPage() {
  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>Аналітика</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}><Card><Statistic title="Дохід за місяць" value={2450000} suffix="грн" prefix={<ArrowUpOutlined />} valueStyle={{ color: '#3f8600' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Витрати за місяць" value={1180000} suffix="грн" prefix={<ArrowDownOutlined />} valueStyle={{ color: '#cf1322' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Виробів за місяць" value={12500} prefix={<ToolOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="Замовлень за місяць" value={8} prefix={<ProjectOutlined />} /></Card></Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card title="Проекти виробництва">
            <Table columns={columns} dataSource={projectStats} pagination={false} size="middle" />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Виробничі підрозділи" style={{ marginBottom: 16 }}>
            <List size="small" dataSource={[
              { name: 'Головний цех', projects: 3, capacity: 85 },
              { name: 'Цех Ямпіль', projects: 2, capacity: 60 },
              { name: 'Цех Вінниця', projects: 1, capacity: 40 },
            ]} renderItem={(item) => (
              <List.Item>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>{item.name}</span><span style={{ fontSize: 12, color: '#8c8c8c' }}>{item.projects} проекти</span></div>
                  <Progress percent={item.capacity} size="small" status={item.capacity > 80 ? 'exception' : 'active'} />
                </div>
              </List.Item>
            )} />
          </Card>
          <Card title="Закупівлі">
            <List size="small" dataSource={[
              { label: 'Всього закупівель', value: 15 },
              { label: 'В транзиті', value: 3 },
              { label: 'Затримуються', value: 1 },
              { label: 'Загальна сума', value: '556 000 грн' },
            ]} renderItem={(item) => (
              <List.Item><div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}><span>{item.label}</span><strong>{item.value}</strong></div></List.Item>
            )} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
export default AnalyticsPage
