import { useState, useEffect } from 'react'
import { Card, Typography, Button, Table, Checkbox, Input, message, Popconfirm, Tag, Spin, Switch, Tabs } from 'antd'
import {
  SafetyOutlined, PlusOutlined, EditOutlined, DeleteOutlined, LockOutlined, TeamOutlined,
  DashboardOutlined, FileTextOutlined, ProjectOutlined, DatabaseOutlined,
  ShoppingCartOutlined, ToolOutlined, CheckSquareOutlined, SendOutlined,
  MessageOutlined, BellOutlined, BarChartOutlined, BookOutlined, FileProtectOutlined,
  EyeOutlined, AppstoreOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPermissionGroups,
  getPermissionGroup,
  createPermissionGroup,
  updatePermissionGroup,
  deletePermissionGroup,
} from '../api/permissions'
import type { PermissionGroup, PermissionGroupListItem, ModulePermission, PaginatedResponse } from '../types'
import { useAuthStore } from '../store/authStore'
import apiClient from '../api/client'

const { Title, Text } = Typography
const { TextArea } = Input

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MODULE_LABELS: Record<string, string> = {
  dashboard: 'Дашборд',
  orders: 'Замовлення',
  contracts: 'Договори',
  warehouse: 'Склад',
  procurement: 'Закупівлі',
  production: 'Виробництво',
  tasks: 'Завдання',
  requests: 'Запити',
  chat: 'Чат',
  notifications: 'Сповіщення',
  analytics: 'Аналітика',
  users: 'Користувачі',
  directories: 'Довідники',
  tech_specs: 'Тех. специфікації',
}

type PermAction = 'can_view' | 'can_create' | 'can_edit' | 'can_delete'

const MENU_GROUPS = [
  {
    label: 'Головне',
    items: [
      { module: 'dashboard', icon: <DashboardOutlined />, label: 'Дашборд' },
      { module: 'analytics', icon: <BarChartOutlined />, label: 'Аналітика' },
    ],
  },
  {
    label: 'Бізнес',
    items: [
      { module: 'orders', icon: <FileTextOutlined />, label: 'Замовлення' },
      { module: 'contracts', icon: <ProjectOutlined />, label: 'Договори' },
      { module: 'procurement', icon: <ShoppingCartOutlined />, label: 'Закупівлі' },
    ],
  },
  {
    label: 'Операції',
    items: [
      { module: 'warehouse', icon: <DatabaseOutlined />, label: 'Склад' },
      { module: 'production', icon: <ToolOutlined />, label: 'Виробництво' },
      { module: 'tech_specs', icon: <FileProtectOutlined />, label: 'Тех. специфікації' },
    ],
  },
  {
    label: 'Робочий процес',
    items: [
      { module: 'tasks', icon: <CheckSquareOutlined />, label: 'Завдання' },
      { module: 'requests', icon: <SendOutlined />, label: 'Запити' },
    ],
  },
  {
    label: 'Комунікації',
    items: [
      { module: 'chat', icon: <MessageOutlined />, label: 'Чат' },
      { module: 'notifications', icon: <BellOutlined />, label: 'Сповіщення' },
    ],
  },
  {
    label: 'Адміністрування',
    items: [
      { module: 'users', icon: <TeamOutlined />, label: 'Користувачі' },
      { module: 'directories', icon: <BookOutlined />, label: 'Довідники' },
    ],
  },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function PermissionsPage() {
  const queryClient = useQueryClient()
  const [messageApi, contextHolder] = message.useMessage()
  const { user, setUser } = useAuthStore()

  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editPermissions, setEditPermissions] = useState<ModulePermission[]>([])

  // ---- Queries -----------------------------------------------------------

  const { data: groupsData, isLoading: groupsLoading } = useQuery<PaginatedResponse<PermissionGroupListItem>>({
    queryKey: ['permissionGroups'],
    queryFn: () => getPermissionGroups({ page_size: 1000 }).then(r => r.data),
  })

  const groups = groupsData?.results ?? []

  // Auto-select first group when loaded
  useEffect(() => {
    if (groups.length > 0 && selectedGroupId === null && !isCreating) {
      setSelectedGroupId(groups[0].id)
    }
  }, [groups, selectedGroupId, isCreating])

  const { data: selectedGroupDetail, isLoading: detailLoading } = useQuery<PermissionGroup>({
    queryKey: ['permissionGroup', selectedGroupId],
    queryFn: () => getPermissionGroup(selectedGroupId!).then(r => r.data),
    enabled: selectedGroupId !== null && !isCreating,
  })

  // Sync edit state from fetched detail
  useEffect(() => {
    if (selectedGroupDetail && !isCreating) {
      setEditName(selectedGroupDetail.name)
      setEditDescription(selectedGroupDetail.description)
      setEditPermissions(
        selectedGroupDetail.module_permissions.map((p) => ({ ...p })),
      )
    }
  }, [selectedGroupDetail, isCreating])

  // ---- Mutations ---------------------------------------------------------

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => createPermissionGroup(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['permissionGroups'] })
      const newGroup = response.data
      setSelectedGroupId(newGroup.id)
      setIsCreating(false)
      messageApi.success(`Групу "${newGroup.name}" створено`)
    },
    onError: () => {
      messageApi.error('Помилка при створенні групи')
    },
  })

  const refreshProfile = () => {
    apiClient.get('/accounts/profile/').then(({ data }) => setUser(data)).catch(() => {})
  }

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      updatePermissionGroup(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissionGroups'] })
      queryClient.invalidateQueries({ queryKey: ['permissionGroup', selectedGroupId] })
      messageApi.success(`Групу "${editName.trim()}" збережено`)
      // Refresh current user's profile so menu updates immediately
      if (selectedGroupId === user?.permission_group) {
        refreshProfile()
      }
    },
    onError: () => {
      messageApi.error('Помилка при збереженні групи')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletePermissionGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissionGroups'] })
      messageApi.success('Групу видалено')
      // Select first remaining group
      const remaining = groups.filter((g) => g.id !== selectedGroupId)
      if (remaining.length > 0) {
        setSelectedGroupId(remaining[0].id)
      } else {
        startCreating()
      }
    },
    onError: () => {
      messageApi.error('Помилка при видаленні групи')
    },
  })

  // ---- derived ----------------------------------------------------------

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) ?? null

  // ---- handlers ---------------------------------------------------------

  const selectGroup = (group: PermissionGroupListItem) => {
    setSelectedGroupId(group.id)
    setIsCreating(false)
  }

  const buildDefaultPermissions = (): ModulePermission[] => {
    return Object.keys(MODULE_LABELS).map((m) => ({
      module: m,
      module_display: MODULE_LABELS[m] ?? m,
      can_view: false,
      can_create: false,
      can_edit: false,
      can_delete: false,
    }))
  }

  const startCreating = () => {
    setSelectedGroupId(null)
    setIsCreating(true)
    setEditName('')
    setEditDescription('')
    setEditPermissions(buildDefaultPermissions())
  }

  const togglePermission = (module: string, action: PermAction) => {
    setEditPermissions((prev) =>
      prev.map((p) => (p.module === module ? { ...p, [action]: !p[action] } : p)),
    )
  }

  const toggleColumnAll = (action: PermAction) => {
    const allChecked = editPermissions.every((p) => p[action])
    setEditPermissions((prev) => prev.map((p) => ({ ...p, [action]: !allChecked })))
  }

  const isColumnAllChecked = (action: PermAction) => editPermissions.every((p) => p[action])
  const isColumnIndeterminate = (action: PermAction) =>
    editPermissions.some((p) => p[action]) && !editPermissions.every((p) => p[action])

  const handleSave = () => {
    if (!editName.trim()) {
      messageApi.error('Назва групи не може бути порожньою')
      return
    }

    const payload = {
      name: editName.trim(),
      description: editDescription.trim(),
      module_permissions: editPermissions.map((p) => ({
        module: p.module,
        can_view: p.can_view,
        can_create: p.can_create,
        can_edit: p.can_edit,
        can_delete: p.can_delete,
      })),
    }

    if (isCreating) {
      createMutation.mutate(payload)
    } else if (selectedGroupId !== null) {
      updateMutation.mutate({ id: selectedGroupId, data: payload })
    }
  }

  const handleDelete = () => {
    if (!selectedGroupId || selectedGroup?.is_system) return
    deleteMutation.mutate(selectedGroupId)
  }

  // ---- table columns ----------------------------------------------------

  const matrixColumns = [
    {
      title: 'Модуль',
      dataIndex: 'module',
      key: 'module',
      width: 200,
      render: (mod: string, record: ModulePermission) => (
        <Text strong>{record.module_display || MODULE_LABELS[mod] || mod}</Text>
      ),
    },
    ...(['can_view', 'can_create', 'can_edit', 'can_delete'] as PermAction[]).map((action) => {
      const labels: Record<PermAction, string> = {
        can_view: 'Перегляд',
        can_create: 'Створення',
        can_edit: 'Редагування',
        can_delete: 'Видалення',
      }
      return {
        title: (
          <div style={{ textAlign: 'center' as const }}>
            <div>{labels[action]}</div>
            <Checkbox
              checked={isColumnAllChecked(action)}
              indeterminate={isColumnIndeterminate(action)}
              onChange={() => toggleColumnAll(action)}
            />
          </div>
        ),
        dataIndex: action,
        key: action,
        width: 120,
        align: 'center' as const,
        render: (_: boolean, record: ModulePermission) => (
          <Checkbox
            checked={record[action]}
            onChange={() => togglePermission(record.module, action)}
          />
        ),
      }
    }),
  ]

  // ---- render -----------------------------------------------------------

  return (
    <div>
      {contextHolder}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          <SafetyOutlined style={{ marginRight: 8 }} />
          Групи дозволів
        </Title>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* ---- Left panel ---- */}
        <div style={{ width: 280, flexShrink: 0 }}>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            block
            style={{ marginBottom: 12 }}
            onClick={startCreating}
          >
            Створити групу
          </Button>

          <Spin spinning={groupsLoading}>
            <div style={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}>
              {groups.map((group) => (
                <Card
                  key={group.id}
                  size="small"
                  hoverable
                  style={{
                    marginBottom: 8,
                    cursor: 'pointer',
                    borderColor: !isCreating && selectedGroupId === group.id ? '#1677ff' : undefined,
                    background: !isCreating && selectedGroupId === group.id ? '#e6f4ff' : undefined,
                  }}
                  onClick={() => selectGroup(group)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <Text strong style={{ fontSize: 14 }}>{group.name}</Text>
                        {group.is_system && (
                          <Tag
                            icon={<LockOutlined />}
                            color="gold"
                            style={{ marginRight: 0, fontSize: 11, lineHeight: '18px', padding: '0 4px' }}
                          >
                            system
                          </Tag>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#888', fontSize: 12 }}>
                        <TeamOutlined />
                        <span>{group.users_count} {group.users_count === 1 ? 'користувач' : 'користувачів'}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Spin>
        </div>

        {/* ---- Right panel ---- */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Spin spinning={detailLoading && !isCreating}>
            <Card
              title={
                <span>
                  <EditOutlined style={{ marginRight: 8 }} />
                  {isCreating ? 'Нова група дозволів' : `Редагування: ${editName || '—'}`}
                </span>
              }
            >
              {/* Form fields */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                <div style={{ flex: 1 }}>
                  <Text strong style={{ display: 'block', marginBottom: 4 }}>Назва</Text>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Введіть назву групи"
                  />
                </div>
                <div style={{ flex: 2 }}>
                  <Text strong style={{ display: 'block', marginBottom: 4 }}>Опис</Text>
                  <TextArea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Опис групи дозволів"
                    autoSize={{ minRows: 1, maxRows: 3 }}
                  />
                </div>
              </div>

              {/* Tabs: menu visibility + permission matrix */}
              <Tabs
                defaultActiveKey="menu"
                style={{ marginBottom: 24 }}
                items={[
                  {
                    key: 'menu',
                    label: <span><AppstoreOutlined /> Видимість меню</span>,
                    children: (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                        {MENU_GROUPS.map((group) => {
                          const groupPerms = group.items.map(item =>
                            editPermissions.find(p => p.module === item.module),
                          )
                          const allVisible = groupPerms.every(p => p?.can_view)
                          return (
                            <Card
                              key={group.label}
                              size="small"
                              title={
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Text strong style={{ fontSize: 13 }}>{group.label}</Text>
                                  <Switch
                                    size="small"
                                    checked={allVisible}
                                    onChange={(checked) => {
                                      setEditPermissions(prev =>
                                        prev.map(p => {
                                          const inGroup = group.items.some(i => i.module === p.module)
                                          return inGroup ? { ...p, can_view: checked } : p
                                        }),
                                      )
                                    }}
                                  />
                                </div>
                              }
                              style={{ borderColor: allVisible ? '#91caff' : undefined }}
                            >
                              {group.items.map(item => {
                                const perm = editPermissions.find(p => p.module === item.module)
                                return (
                                  <div
                                    key={item.module}
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      padding: '6px 0',
                                      borderBottom: '1px solid #f0f0f0',
                                      opacity: perm?.can_view ? 1 : 0.45,
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <span style={{ fontSize: 16, color: perm?.can_view ? '#1677ff' : '#bbb' }}>
                                        {item.icon}
                                      </span>
                                      <Text style={{ fontSize: 13 }}>{item.label}</Text>
                                    </div>
                                    <Switch
                                      size="small"
                                      checked={perm?.can_view ?? false}
                                      onChange={() => togglePermission(item.module, 'can_view')}
                                    />
                                  </div>
                                )
                              })}
                            </Card>
                          )
                        })}
                      </div>
                    ),
                  },
                  {
                    key: 'matrix',
                    label: <span><EyeOutlined /> Детальні права</span>,
                    children: (
                      <Table
                        dataSource={editPermissions}
                        columns={matrixColumns}
                        rowKey="module"
                        size="small"
                        pagination={false}
                        bordered
                        scroll={{ x: 'max-content' }}
                      />
                    ),
                  },
                ]}
              />

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                {!isCreating && selectedGroup && (
                  <Popconfirm
                    title="Видалити групу?"
                    description={`Ви впевнені, що хочете видалити групу "${selectedGroup.name}"?`}
                    onConfirm={handleDelete}
                    okText="Так, видалити"
                    cancelText="Скасувати"
                    okButtonProps={{ danger: true }}
                    disabled={selectedGroup.is_system}
                  >
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      disabled={selectedGroup.is_system}
                      loading={deleteMutation.isPending}
                    >
                      Видалити
                    </Button>
                  </Popconfirm>
                )}
                <Button
                  type="primary"
                  onClick={handleSave}
                  loading={createMutation.isPending || updateMutation.isPending}
                >
                  Зберегти
                </Button>
              </div>
            </Card>
          </Spin>
        </div>
      </div>
    </div>
  )
}

export default PermissionsPage
