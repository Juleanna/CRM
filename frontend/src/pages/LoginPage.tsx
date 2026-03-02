import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, Typography, Alert, Space } from 'antd'
import { UserOutlined, LockOutlined, ToolOutlined } from '@ant-design/icons'
import apiClient from '../api/client'
import { useAuthStore } from '../store/authStore'

const { Title, Text } = Typography

function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { setUser } = useAuthStore()

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true)
    setError('')
    try {
      const { data } = await apiClient.post('/auth/token/', values)
      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)
      try {
        const { data: profile } = await apiClient.get('/accounts/profile/')
        setUser(profile)
      } catch {
        setUser({ id: 0, username: values.username, email: '', role: '', first_name: '', last_name: '' })
      }
      navigate('/')
    } catch {
      setError('Невірний логін або пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <Card style={{ width: 400, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          <div>
            <ToolOutlined style={{ fontSize: 48, color: '#1677ff' }} />
            <Title level={2} style={{ marginTop: 8, marginBottom: 0 }}>Фабрика</Title>
            <Text type="secondary">Система управління виробництвом</Text>
          </div>
          {error && <Alert message={error} type="error" showIcon />}
          <Form layout="vertical" onFinish={onFinish} size="large">
            <Form.Item name="username" rules={[{ required: true, message: 'Введіть логін' }]}>
              <Input prefix={<UserOutlined />} placeholder="Логін" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: 'Введіть пароль' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="Пароль" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                Увійти
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  )
}

export default LoginPage
