import { useState, useEffect } from 'react'
import {
  Table, Tag, Button, Card, Typography, Avatar, Input, Row, Col,
  Modal, Form, Select, Switch, Space, message, Popconfirm, Spin,
} from 'antd'
import {
  PlusOutlined, UserOutlined, SearchOutlined, EditOutlined, DeleteOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUsers, createUser, updateUser, deleteUser } from '../api/users'
import { getPermissionGroups } from '../api/permissions'
import { getDepartments } from '../api/directories'
import { useAuthStore } from '../store/authStore'
import type { PaginatedResponse } from '../types'

const { Title } = Typography

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
  department: number | null
  department_name: string | null
  is_active: boolean
}

interface PermissionGroupOption {
  id: number
  name: string
}

interface DepartmentOption {
  id: number
  name: string
}

/* ── Component ──────────────────────────────────────────────── */
function UsersPage() {
  const { hasPermission } = useAuthStore()
  const canCreate = hasPermission('users', 'can_create')
  const canEdit = hasPermission('users', 'can_edit')
  const canDelete = hasPermission('users', 'can_delete')

  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null)
  const [form] = Form.useForm()
  const [messageApi, contextHolder] = message.useMessage()

  /* ── Queries ─────────────────────────────────────────────── */
  const { data: usersData, isLoading: usersLoading } = useQuery<PaginatedResponse<UserRecord>>({
    queryKey: ['users', search],
    queryFn: () => getUsers({ search: search || undefined, page_size: 1000 }).then(r => r.data),
  })

  const { data: permGroupsData } = useQuery<PaginatedResponse<PermissionGroupOption>>({
    queryKey: ['permissionGroups'],
    queryFn: () => getPermissionGroups({ page_size: 1000 }).then(r => r.data),
  })

  const { data: departmentsData } = useQuery<PaginatedResponse<DepartmentOption>>({
    queryKey: ['departments'],
    queryFn: () => getDepartments({ page_size: 1000 }).then(r => r.data),
  })

  const users = usersData?.results ?? []
  const permissionGroups = permGroupsData?.results ?? []
  const departments = departmentsData?.results ?? []

  /* ── Mutations ───────────────────────────────────────────── */
  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      messageApi.success('Користувача створено')
      closeModal()
    },
    onError: () => {
      messageApi.error('Помилка при створенні користувача')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      messageApi.success('Користувача оновлено')
      closeModal()
    },
    onError: () => {
      messageApi.error('Помилка при оновленні користувача')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      messageApi.success('Користувача видалено')
    },
    onError: () => {
      messageApi.error('Помилка при видаленні користувача')
    },
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
        department: editingUser.department,
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

      const payload: Record<string, unknown> = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone: values.phone ?? '',
        permission_group: values.permission_group ?? null,
        department: values.department ?? null,
        is_active: values.is_active ?? true,
      }

      if (editingUser) {
        updateMutation.mutate({ id: editingUser.id, data: payload })
      } else {
        payload.username = values.email.split('@')[0]
        createMutation.mutate(payload)
      }
    } catch {
      // validation failed
    }
  }

  /* ── Delete handler ─────────────────────────────────────── */
  const handleDelete = (userId: number) => {
    deleteMutation.mutate(userId)
  }

  /* ── Cancel modal ───────────────────────────────────────── */
  const closeModal = () => {
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
          {canEdit && <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />}
          {canDelete && <Popconfirm
            title="Видалити користувача?"
            description={`${record.first_name} ${record.last_name} буде видалено.`}
            onConfirm={() => handleDelete(record.id)}
            okText="Так"
            cancelText="Скасувати"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>}
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
        {canCreate && <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Додати користувача</Button>}
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
        <Spin spinning={usersLoading}>
          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            size="middle"
            pagination={{ showTotal: (t: number) => `Всього: ${t}` }}
          />
        </Spin>
      </Card>

      {/* Edit Modal */}
      <Modal
        title={editingUser ? 'Редагувати користувача' : 'Додати користувача'}
        open={editModalOpen}
        onOk={handleSave}
        onCancel={closeModal}
        okText="Зберегти"
        cancelText="Скасувати"
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnHidden
        width={520}
        style={{ top: 20 }}
        styles={{ body: { maxHeight: 'calc(100vh - 160px)', overflowY: 'auto', overflowX: 'hidden' } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="first_name" label="Ім'я" rules={[{ required: true, message: "Введіть ім'я" }]}>
                <Input placeholder="Ім'я" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="last_name" label="Прізвище" rules={[{ required: true, message: 'Введіть прізвище' }]}>
                <Input placeholder="Прізвище" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Введіть email' }, { type: 'email', message: 'Невірний формат' }]}>
                <Input placeholder="Email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Телефон">
                <Input placeholder="+380XXXXXXXXX" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="permission_group" label="Група дозволів">
                <Select placeholder="Група дозволів" allowClear options={permissionGroups.map((g) => ({ value: g.id, label: g.name }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="department" label="Підрозділ">
                <Select placeholder="Підрозділ" allowClear options={departments.map((d) => ({ value: d.id, label: d.name }))} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="is_active" label="Активний" valuePropName="checked" style={{ marginBottom: 0 }}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UsersPage
