import { Table, Tag, Button, Card, Typography, Tabs, Checkbox, List, Space, Progress } from 'antd'
import { PlusOutlined, CheckSquareOutlined, OrderedListOutlined } from '@ant-design/icons'
const { Title, Text } = Typography

const taskStatus: Record<string, { color: string; label: string }> = {
  new: { color: 'blue', label: 'Нове' }, in_progress: { color: 'orange', label: 'В роботі' }, completed: { color: 'green', label: 'Виконане' },
}
const tasks = [
  { key: '1', title: 'Підготувати калькуляцію виробу КЛП Ніка', assignee: 'Технолог Петренко', status: 'in_progress', due: '2024-01-18', order: 'ЗМ-2024-001' },
  { key: '2', title: 'Оплатити рахунок ЗК-003', assignee: 'Бухгалтер Іванова', status: 'new', due: '2024-01-17', order: 'ЗМ-2024-003' },
  { key: '3', title: 'Перевірити залишки тканини ріпстоп', assignee: 'Завскладу Коваленко', status: 'completed', due: '2024-01-15', order: 'ЗМ-2024-001' },
  { key: '4', title: 'Надіслати пробний зразок замовнику', assignee: 'Менеджер Сидоренко', status: 'in_progress', due: '2024-01-20', order: 'ЗМ-2024-002' },
]
const checklists = [
  { id: 1, title: 'Чек-ліст: Тендер МО-2024-001', items: [
    { text: 'Зібрати пакет документів', done: true }, { text: 'Підготувати калькуляцію', done: true },
    { text: 'Відшити пробний зразок', done: false }, { text: 'Надіслати пропозицію', done: false },
  ]},
  { id: 2, title: 'Чек-ліст: Запуск виробництва ДГ-2024-003', items: [
    { text: 'Перевірити наявність матеріалів', done: true }, { text: 'Розподілити між цехами', done: true },
    { text: 'Запустити виробництво', done: true }, { text: 'Налагодити щоденний звіт', done: false },
  ]},
]
const taskColumns = [
  { title: 'Завдання', dataIndex: 'title', key: 'title' },
  { title: 'Виконавець', dataIndex: 'assignee', key: 'assignee', width: 180 },
  { title: 'Статус', dataIndex: 'status', key: 'status', width: 120, render: (s: string) => { const st = taskStatus[s]; return st ? <Tag color={st.color}>{st.label}</Tag> : s } },
  { title: 'Дедлайн', dataIndex: 'due', key: 'due', width: 110 },
  { title: 'Замовлення', dataIndex: 'order', key: 'order', width: 130 },
]

function TasksPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Завдання та чек-лісти</Title>
        <Space><Button type="primary" icon={<PlusOutlined />}>Нове завдання</Button><Button icon={<OrderedListOutlined />}>Новий чек-ліст</Button></Space>
      </div>
      <Card>
        <Tabs items={[
          { key: 'tasks', label: <span><CheckSquareOutlined /> Завдання ({tasks.length})</span>, children: <Table columns={taskColumns} dataSource={tasks} size="middle" /> },
          { key: 'checklists', label: <span><OrderedListOutlined /> Чек-лісти ({checklists.length})</span>, children: (
            <List dataSource={checklists} renderItem={(cl) => {
              const done = cl.items.filter(i => i.done).length
              return (
                <Card style={{ marginBottom: 16 }} title={cl.title} extra={<Text type="secondary">{done}/{cl.items.length}</Text>}>
                  <Progress percent={Math.round((done / cl.items.length) * 100)} style={{ marginBottom: 12 }} />
                  <List size="small" dataSource={cl.items} renderItem={(item) => (
                    <List.Item><Checkbox checked={item.done}><span style={{ textDecoration: item.done ? 'line-through' : 'none', color: item.done ? '#8c8c8c' : undefined }}>{item.text}</span></Checkbox></List.Item>
                  )} />
                </Card>
              )
            }} />
          )},
        ]} />
      </Card>
    </div>
  )
}
export default TasksPage
