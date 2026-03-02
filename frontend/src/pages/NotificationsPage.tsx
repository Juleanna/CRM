import { List, Card, Typography, Button, Badge, Space, Tabs } from 'antd'
import { CheckCircleOutlined, ClockCircleOutlined, WarningOutlined, FileTextOutlined, SwapOutlined, ShoppingCartOutlined } from '@ant-design/icons'
const { Title, Text } = Typography

const notifications = [
  { id: 1, title: 'Створено нове завдання', message: 'Підготувати калькуляцію виробу КЛП Ніка. Дедлайн: 18.01.2024', type: 'task_created', read: false, time: '10 хв тому', icon: <CheckCircleOutlined style={{ color: '#1677ff' }} /> },
  { id: 2, title: 'Закупівля затримується', message: 'Закупівля ЗК-003 (Утеплювач UA) не доставлена в прогнозований термін', type: 'delayed', read: false, time: '30 хв тому', icon: <WarningOutlined style={{ color: '#f5222d' }} /> },
  { id: 3, title: 'Переміщення прийнято', message: 'Тканина ріпстоп 500 м/п прийнята на складі Ямпіль', type: 'transfer', read: false, time: '1 год тому', icon: <SwapOutlined style={{ color: '#52c41a' }} /> },
  { id: 4, title: 'Вкажіть к-ть виробів за сьогодні', message: 'Нагадування: внесіть дані по виробництву за 15.01.2024', type: 'reminder', read: true, time: '2 год тому', icon: <ClockCircleOutlined style={{ color: '#fa8c16' }} /> },
  { id: 5, title: 'Створено нове замовлення', message: 'Тендер НГУ-2024 додано в систему', type: 'order', read: true, time: '3 год тому', icon: <FileTextOutlined style={{ color: '#722ed1' }} /> },
  { id: 6, title: 'Підготуйте документацію для відправки', message: 'Проект ДГ-2024-001: необхідні ТТН та сертифікати', type: 'reminder', read: true, time: 'Вчора', icon: <ShoppingCartOutlined style={{ color: '#fa8c16' }} /> },
]

function NotificationsPage() {
  const unread = notifications.filter(n => !n.read).length
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Сповіщення <Badge count={unread} style={{ marginLeft: 8 }} /></Title>
        <Button>Позначити все як прочитане</Button>
      </div>
      <Card>
        <Tabs items={[
          { key: 'all', label: `Всі (${notifications.length})`, children: null },
          { key: 'unread', label: `Непрочитані (${unread})`, children: null },
        ]} />
        <List dataSource={notifications} renderItem={(item) => (
          <List.Item style={{ background: item.read ? 'transparent' : '#f0f5ff', padding: '12px 16px', borderRadius: 8, marginBottom: 4 }}>
            <List.Item.Meta avatar={item.icon} title={<Space>{item.title}{!item.read && <Badge status="processing" />}</Space>} description={<><Text type="secondary">{item.message}</Text><br /><Text type="secondary" style={{ fontSize: 12 }}>{item.time}</Text></>} />
          </List.Item>
        )} />
      </Card>
    </div>
  )
}
export default NotificationsPage
