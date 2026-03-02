import { useState, useEffect } from 'react'
import {
  Table, Tag, Button, Card, Typography, Avatar, Input,
  Modal, Form, Select, Switch, Space, message, Popconfirm,
} from 'antd'
import {
  PlusOutlined, UserOutlined, SearchOutlined, EditOutlined, DeleteOutlined,
} from '@ant-design/icons'

const { Title } = Typography

/* ── Mock permission groups ─────────────────────────────────── */
const mockPermissionGroups = [
  { id: 1, name: 'Суперадмін' },
  { id: 2, name: 'Адмін' },
  { id: 3, name: 'Тендерний менеджер' },
  { id: 4, name: 'Технолог' },
  { id: 5, name: 'Завскладу' },
  { id: 6, name: 'Менеджер з закупівель' },
  { id: 7, name: 'Бухгалтер' },
]

const mockDepartments = [
  'Офіс',
  'Головний цех',
  'Головний склад',
  'Склад Ямпіль',
  'Бухгалтерія',
]

/* ── Color map for permission group tags ────────────────────── */
const groupColorMap: Record<string, string> = {
  'Суперадмін': 'red',
  'Адмін': 'volcano',
  'Тендерний менеджер': 'purple',
  'Технолог': 'blue',
  'Завскладу': 'cyan',
  'Менеджер з закупівель': 'green',
  'Бухгалтер': 'orange',
}

/* ── User type ──────────────────────────────────────────────── */
interface UserRecord {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  phone: string
  role: string
  permission_group: number | null
  permission_group_name: string | null
  department_name: string | null
  is_active: boolean
}

/* ── Mock users ─────────────────────────────────────────────── */
const initialUsers: UserRecord[] = [
  {
    id: 1, username: 'admin', first_name: 'Іван', last_name: 'Іванов',
    email: 'ivanov@fabryka.ua', phone: '+380501234567', role: 'superadmin',
    permission_group: 1, permission_group_name: 'Суперадмін',
    department_name: 'Офіс', is_active: true,
  },
  {
    id: 2, username: 'tender_mgr', first_name: 'Марія', last_name: 'Сидоренко',
    email: 'sidorenko@fabryka.ua', phone: '+380502345678', role: 'tender_manager',
    permission_group: 3, permission_group_name: 'Тендерний менеджер',
    department_name: 'Офіс', is_active: true,
  },
  {
    id: 3, username: 'tech_petro', first_name: 'Олег', last_name: 'Петренко',
    email: 'petrenko@fabryka.ua', phone: '+380503456789', role: 'technologist',
    permission_group: 4, permission_group_name: 'Технолог',
    department_name: 'Головний цех', is_active: true,
  },
  {
    id: 4, username: 'warehouse_koval', first_name: 'Андрій', last_name: 'Коваленко',
    email: 'kovalenko@fabryka.ua', phone: '+380504567890', role: 'warehouse_manager',
    permission_group: 5, permission_group_name: 'Завскладу',
    department_name: 'Головний склад', is_active: true,
  },
  {
    id: 5, username: 'buyer_shevch', first_name: 'Ірина', last_name: 'Шевченко',
    email: 'shevchenko@fabryka.ua', phone: '+380505678901', role: 'procurement_manager',
    permission_group: 6, permission_group_name: 'Менеджер з закупівель',
    department_name: 'Офіс', is_active: true,
  },
  {
    id: 6, username: 'acc_ivanova', first_name: 'Тетяна', last_name: 'Іванова',
    email: 't.ivanova@fabryka.ua', phone: '+380506789012', role: 'accountant',
    permission_group: 7, permission_group_name: 'Бухгалтер',
    department_name: 'Бухгалтерія', is_active: true,
  },
  {
    id: 7, username: 'wh_yampil', first_name: 'Василь', last_name: 'Мельник',
    email: 'melnyk@fabryka.ua', phone: '+380507890123', role: 'warehouse_manager',
    permission_group: 5, permission_group_name: 'Завскладу',
    department_name: 'Склад Ямпіль', is_active: false,
  },
]

/* ── Component ──────────────────────────────────────────────── */
function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>(initialUsers)
  const [search, setSearch] = useState('')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null)
  const [form] = Form.useForm()
  const [messageApi, contextHolder] = message.useMessage()

  /* ── Filtered data ──────────────────────────────────────── */
  const filteredUsers = users.filter((u) => {
    if (!search) return true
    const q = search.toLowerCase()
    const fullName = `${u.first_name} ${u.last_name}`.toLowerCase()
    return (
      fullName.includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.permission_group_name ?? '').toLowerCase().includes(q)
    )
  })

  /* ── Set form values after modal opens (Form is mounted) ── */
  useEffect(() => {
    if (!editModalOpen) return
    if (editingUser) {
      form.setFieldsValue({
        first_name: editingUser.first_name,
        last_name: editingUser.last_name,
        email: editingUser.email,
        phone: editingUser.phone,
        permission_group: editingUser.permission_group,
        department_name: editingUser.department_name,
        is_active: editingUser.is_active,
      })
    } else {
      form.resetFields()
      form.setFieldsValue({ is_active: true })
    }
  }, [editModalOpen, editingUser, form])

  /* ── Add handler ────────────────────────────────────────── */
  const handleAdd = () => {
    setEditingUser(null)
    setEditModalOpen(true)
  }

  /* ── Edit handler ───────────────────────────────────────── */
  const handleEdit = (user: UserRecord) => {
    setEditingUser(user)
    setEditModalOpen(true)
  }

  /* ── Save handler ───────────────────────────────────────── */
  const handleSave = async () => {
    try {
      const values = await form.validateFields()

      const selectedGroup = mockPermissionGroups.find(
        (g) => g.id === values.permission_group,
      )

      if (editingUser) {
        const updatedUser: UserRecord = {
          ...editingUser,
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          phone: values.phone ?? '',
          permission_group: values.permission_group ?? null,
          permission_group_name: selectedGroup?.name ?? null,
          department_name: values.department_name ?? null,
          is_active: values.is_active ?? true,
        }
        setUsers((prev) =>
          prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
        )
        messageApi.success('Користувача оновлено')
      } else {
        const newUser: UserRecord = {
          id: Math.max(...users.map(u => u.id), 0) + 1,
          username: values.email.split('@')[0],
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          phone: values.phone ?? '',
          role: '',
          permission_group: values.permission_group ?? null,
          permission_group_name: selectedGroup?.name ?? null,
          department_name: values.department_name ?? null,
          is_active: values.is_active ?? true,
        }
        setUsers((prev) => [...prev, newUser])
        messageApi.success('Користувача створено')
      }

      setEditModalOpen(false)
      setEditingUser(null)
      form.resetFields()
    } catch {
      // validation failed
    }
  }

  /* ── Delete handler ─────────────────────────────────────── */
  const handleDelete = (userId: number) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId))
    messageApi.success('Користувача видалено')
  }

  /* ── Cancel modal ───────────────────────────────────────── */
  const handleCancel = () => {
    setEditModalOpen(false)
    setEditingUser(null)
    form.resetFields()
  }

  /* ── Table columns ──────────────────────────────────────── */
  const columns = [
    {
      title: '',
      key: 'avatar',
      width: 50,
      render: () => <Avatar icon={<UserOutlined />} />,
    },
    {
      title: "Ім'я",
      key: 'name',
      render: (_: unknown, record: UserRecord) =>
        `${record.first_name} ${record.last_name}`,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Група дозволів',
      dataIndex: 'permission_group_name',
      key: 'permission_group_name',
      width: 200,
      render: (name: string | null) => {
        if (!name) return <Tag>Не призначено</Tag>
        const color = groupColorMap[name] ?? 'default'
        return <Tag color={color}>{name}</Tag>
      },
    },
    {
      title: 'Підрозділ',
      dataIndex: 'department_name',
      key: 'department_name',
      width: 160,
    },
    {
      title: 'Статус',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 110,
      render: (active: boolean) =>
        active ? (
          <Tag color="green">Активний</Tag>
        ) : (
          <Tag color="default">Неактивний</Tag>
        ),
    },
    {
      title: 'Дії',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: UserRecord) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Видалити користувача?"
            description={`${record.first_name} ${record.last_name} буде видалено.`}
            onConfirm={() => handleDelete(record.id)}
            okText="Так"
            cancelText="Скасувати"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div>
      {contextHolder}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Користувачі</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Додати користувача</Button>
      </div>

      {/* Search */}
      <Card style={{ marginBottom: 16 }}>
        <Input
          placeholder="Пошук за ім'ям, email..."
          prefix={<SearchOutlined />}
          allowClear
          style={{ maxWidth: 400 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          size="middle"
          pagination={{ showTotal: (t: number) => `Всього: ${t}` }}
        />
      </Card>

      {/* Edit Modal */}
      <Modal
        title={editingUser ? 'Редагувати користувача' : 'Додати користувача'}
        open={editModalOpen}
        onOk={handleSave}
        onCancel={handleCancel}
        okText="Зберегти"
        cancelText="Скасувати"
        destroyOnHidden
        width={520}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="first_name"
            label="Ім'я"
            rules={[{ required: true, message: "Введіть ім'я" }]}
          >
            <Input placeholder="Ім'я" />
          </Form.Item>

          <Form.Item
            name="last_name"
            label="Прізвище"
            rules={[{ required: true, message: 'Введіть прізвище' }]}
          >
            <Input placeholder="Прізвище" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Введіть email' },
              { type: 'email', message: 'Невірний формат email' },
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Телефон"
          >
            <Input placeholder="+380XXXXXXXXX" />
          </Form.Item>

          <Form.Item
            name="permission_group"
            label="Група дозволів"
          >
            <Select
              placeholder="Оберіть групу дозволів"
              allowClear
              options={mockPermissionGroups.map((g) => ({
                value: g.id,
                label: g.name,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="department_name"
            label="Підрозділ"
          >
            <Select
              placeholder="Оберіть підрозділ"
              allowClear
              options={mockDepartments.map((d) => ({
                value: d,
                label: d,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Активний"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UsersPage
