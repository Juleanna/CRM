import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Badge, theme, Modal, Form, Input, Button, Tag, message, Tabs } from 'antd'
import {
  DashboardOutlined,
  FileTextOutlined,
  ProjectOutlined,
  DatabaseOutlined,
  ShoppingCartOutlined,
  ToolOutlined,
  CheckSquareOutlined,
  SendOutlined,
  MessageOutlined,
  BellOutlined,
  BarChartOutlined,
  TeamOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  EditOutlined,
  PhoneOutlined,
  MailOutlined,
  LockOutlined,
  SafetyOutlined,
  BookOutlined,
  FileProtectOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '../store/authStore'
import apiClient from '../api/client'

const { Header, Sider, Content } = Layout

const roleLabels: Record<string, { label: string; color: string }> = {
  superadmin: { label: 'Суперадмін', color: 'red' },
  admin: { label: 'Адмін', color: 'volcano' },
  tender_manager: { label: 'Тендерний менеджер', color: 'blue' },
  technologist: { label: 'Технолог', color: 'green' },
  warehouse_manager: { label: 'Завскладу', color: 'orange' },
  procurement_manager: { label: 'Менеджер з закупівель', color: 'purple' },
  accountant: { label: 'Бухгалтер', color: 'cyan' },
}

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: 'Дашборд' },
  { key: '/orders', icon: <FileTextOutlined />, label: 'Замовлення' },
  { key: '/contracts', icon: <ProjectOutlined />, label: 'Договори' },
  { key: '/warehouse', icon: <DatabaseOutlined />, label: 'Склад' },
  { key: '/procurement', icon: <ShoppingCartOutlined />, label: 'Закупівлі' },
  { key: '/production', icon: <ToolOutlined />, label: 'Виробництво' },
  { key: '/tasks', icon: <CheckSquareOutlined />, label: 'Завдання' },
  { key: '/requests', icon: <SendOutlined />, label: 'Запити' },
  { key: '/chat', icon: <MessageOutlined />, label: 'Чат' },
  { key: '/notifications', icon: <BellOutlined />, label: 'Сповіщення' },
  { key: '/analytics', icon: <BarChartOutlined />, label: 'Аналітика' },
  { key: '/users', icon: <TeamOutlined />, label: 'Користувачі' },
  { key: '/permissions', icon: <SafetyOutlined />, label: 'Права доступу' },
  { key: '/directories', icon: <BookOutlined />, label: 'Довідники' },
  { key: '/tech-specs', icon: <FileProtectOutlined />, label: 'Тех. специфікації' },
]

function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileTab, setProfileTab] = useState('info')
  const [saving, setSaving] = useState(false)
  const { user, logout, setUser } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken()
  const [profileForm] = Form.useForm()
  const [passwordForm] = Form.useForm()

  useEffect(() => {
    if (profileOpen && user) {
      profileForm.setFieldsValue({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
      })
      passwordForm.resetFields()
    }
  }, [profileOpen, user, profileForm, passwordForm])

  const handleProfileSave = async () => {
    try {
      const values = await profileForm.validateFields()
      setSaving(true)
      try {
        const { data } = await apiClient.patch('/accounts/profile/', values)
        setUser({ ...user!, ...data })
        message.success('Профіль оновлено')
      } catch {
        message.error('Помилка збереження профілю')
      } finally {
        setSaving(false)
      }
    } catch {
      // validation errors
    }
  }

  const handlePasswordChange = async () => {
    try {
      const values = await passwordForm.validateFields()
      setSaving(true)
      try {
        await apiClient.post('/accounts/change-password/', {
          old_password: values.old_password,
          new_password: values.new_password,
        })
        message.success('Пароль змінено')
        passwordForm.resetFields()
      } catch {
        message.error('Помилка зміни пароля. Перевірте поточний пароль.')
      } finally {
        setSaving(false)
      }
    } catch {
      // validation errors
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Профіль', onClick: () => setProfileOpen(true) },
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Вийти', danger: true, onClick: handleLogout },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={256}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div className={`logo ${collapsed ? 'logo-collapsed' : ''}`}>
          <ToolOutlined style={{ fontSize: 22 }} />
          {!collapsed && <span>Фабрика</span>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 256, transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 18, cursor: 'pointer', padding: '0 8px' }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Badge count={3} size="small">
              <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} onClick={() => navigate('/notifications')} />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
                <span>{user?.first_name || user?.username || 'User'}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: 24 }}>
          <div
            style={{
              padding: 24,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              minHeight: 360,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>

      <Modal
        title={null}
        open={profileOpen}
        onCancel={() => setProfileOpen(false)}
        footer={null}
        width={560}
        destroyOnHidden
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Avatar
            size={80}
            icon={<UserOutlined />}
            style={{ backgroundColor: '#1677ff', marginBottom: 12 }}
          />
          <div style={{ fontSize: 20, fontWeight: 600 }}>
            {user?.first_name && user?.last_name
              ? `${user.first_name} ${user.last_name}`
              : user?.username || 'Користувач'}
          </div>
          <div style={{ marginTop: 4 }}>
            {user?.permission_group_detail ? (
              <Tag color="blue">{user.permission_group_detail.name}</Tag>
            ) : user?.role ? (
              <Tag color={roleLabels[user.role]?.color || 'default'}>
                {roleLabels[user.role]?.label || user.role}
              </Tag>
            ) : null}
          </div>
          <div style={{ color: '#888', marginTop: 4 }}>{user?.email}</div>
        </div>

        <Tabs
          activeKey={profileTab}
          onChange={setProfileTab}
          centered
          items={[
            {
              key: 'info',
              label: (
                <span><EditOutlined /> Особисті дані</span>
              ),
              children: (
                <Form form={profileForm} layout="vertical" style={{ marginTop: 16 }}>
                  <Form.Item
                    name="last_name"
                    label="Прізвище"
                    rules={[{ required: true, message: 'Введіть прізвище' }]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="Прізвище" />
                  </Form.Item>
                  <Form.Item
                    name="first_name"
                    label="Ім'я"
                    rules={[{ required: true, message: "Введіть ім'я" }]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="Ім'я" />
                  </Form.Item>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Введіть email' },
                      { type: 'email', message: 'Невірний формат email' },
                    ]}
                  >
                    <Input prefix={<MailOutlined />} placeholder="Email" />
                  </Form.Item>
                  <Form.Item name="phone" label="Телефон">
                    <Input prefix={<PhoneOutlined />} placeholder="+380..." />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" block loading={saving} onClick={handleProfileSave}>
                      Зберегти зміни
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: 'password',
              label: (
                <span><SafetyOutlined /> Зміна пароля</span>
              ),
              children: (
                <Form form={passwordForm} layout="vertical" style={{ marginTop: 16 }}>
                  <Form.Item
                    name="old_password"
                    label="Поточний пароль"
                    rules={[{ required: true, message: 'Введіть поточний пароль' }]}
                  >
                    <Input.Password prefix={<LockOutlined />} placeholder="Поточний пароль" />
                  </Form.Item>
                  <Form.Item
                    name="new_password"
                    label="Новий пароль"
                    rules={[
                      { required: true, message: 'Введіть новий пароль' },
                      { min: 8, message: 'Мінімум 8 символів' },
                    ]}
                  >
                    <Input.Password prefix={<LockOutlined />} placeholder="Новий пароль" />
                  </Form.Item>
                  <Form.Item
                    name="confirm_password"
                    label="Підтвердження пароля"
                    dependencies={['new_password']}
                    rules={[
                      { required: true, message: 'Підтвердіть пароль' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('new_password') === value) return Promise.resolve()
                          return Promise.reject(new Error('Паролі не збігаються'))
                        },
                      }),
                    ]}
                  >
                    <Input.Password prefix={<LockOutlined />} placeholder="Підтвердіть пароль" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" block loading={saving} onClick={handlePasswordChange}>
                      Змінити пароль
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />
      </Modal>
    </Layout>
  )
}

export default DashboardLayout
