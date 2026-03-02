import { Card, Typography, List, Avatar, Badge, Input, Button } from 'antd'
import { SendOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons'
const { Title, Text } = Typography

const chats = [
  { id: 1, name: 'Проект ДГ-2024-001', type: 'group', lastMessage: 'Калькуляцію оновлено', time: '10:30', unread: 3 },
  { id: 2, name: 'Проект ДГ-2024-003', type: 'group', lastMessage: 'Матеріали відправлено', time: '09:15', unread: 0 },
  { id: 3, name: 'Петренко Олег', type: 'individual', lastMessage: 'Лекала готові', time: 'Вчора', unread: 1 },
  { id: 4, name: 'Іванова Тетяна', type: 'individual', lastMessage: 'Рахунок оплачено', time: 'Вчора', unread: 0 },
]

function ChatPage() {
  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>Чат</Title>
      <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 280px)' }}>
        <Card style={{ width: 340, overflow: 'auto' }} title="Чати" bodyStyle={{ padding: 0 }}>
          <List dataSource={chats} renderItem={(chat) => (
            <List.Item style={{ padding: '12px 16px', cursor: 'pointer' }} onClick={() => {}}>
              <List.Item.Meta
                avatar={<Avatar icon={chat.type === 'group' ? <TeamOutlined /> : <UserOutlined />} style={{ backgroundColor: chat.type === 'group' ? '#1677ff' : '#52c41a' }} />}
                title={<div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{chat.name}</span><Text type="secondary" style={{ fontSize: 12 }}>{chat.time}</Text></div>}
                description={<div style={{ display: 'flex', justifyContent: 'space-between' }}><Text type="secondary" ellipsis>{chat.lastMessage}</Text>{chat.unread > 0 && <Badge count={chat.unread} />}</div>}
              />
            </List.Item>
          )} />
        </Card>
        <Card style={{ flex: 1, display: 'flex', flexDirection: 'column' }} title="Проект ДГ-2024-001" bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, padding: 16, background: '#f5f5f5', borderRadius: 8, marginBottom: 16, overflow: 'auto' }}>
            <div style={{ textAlign: 'center', color: '#8c8c8c', marginTop: '30%' }}>Виберіть чат для початку спілкування</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Input placeholder="Написати повідомлення..." style={{ flex: 1 }} />
            <Button type="primary" icon={<SendOutlined />}>Надіслати</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
export default ChatPage
