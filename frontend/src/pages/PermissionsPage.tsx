import { useState } from 'react'
import { Card, Typography, Button, Table, Checkbox, Input, message, Popconfirm, Tag } from 'antd'
import { SafetyOutlined, PlusOutlined, EditOutlined, DeleteOutlined, LockOutlined, TeamOutlined } from '@ant-design/icons'

const { Title, Text } = Typography
const { TextArea } = Input

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ModulePermission {
  module: string
  can_view: boolean
  can_create: boolean
  can_edit: boolean
  can_delete: boolean
}

interface PermissionGroup {
  id: string
  name: string
  description: string
  is_system: boolean
  user_count: number
  permissions: ModulePermission[]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MODULE_KEYS = [
  'dashboard',
  'orders',
  'contracts',
  'warehouse',
  'procurement',
  'production',
  'tasks',
  'requests',
  'chat',
  'notifications',
  'analytics',
  'users',
  'directories',
  'tech_specs',
] as const

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

// ---------------------------------------------------------------------------
// Helpers for building mock permissions
// ---------------------------------------------------------------------------

function allTrue(): ModulePermission[] {
  return MODULE_KEYS.map((m) => ({ module: m, can_view: true, can_create: true, can_edit: true, can_delete: true }))
}

function allFalse(): ModulePermission[] {
  return MODULE_KEYS.map((m) => ({ module: m, can_view: false, can_create: false, can_edit: false, can_delete: false }))
}

function buildPermissions(
  full: string[],
  viewOnly: string[],
  editOnly: string[] = [],
): ModulePermission[] {
  return MODULE_KEYS.map((m) => {
    if (full.includes(m)) return { module: m, can_view: true, can_create: true, can_edit: true, can_delete: true }
    if (editOnly.includes(m)) return { module: m, can_view: true, can_create: false, can_edit: true, can_delete: false }
    if (viewOnly.includes(m)) return { module: m, can_view: true, can_create: false, can_edit: false, can_delete: false }
    return { module: m, can_view: false, can_create: false, can_edit: false, can_delete: false }
  })
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const DEFAULT_GROUPS: PermissionGroup[] = [
  {
    id: '1',
    name: 'Суперадмін',
    description: 'Повний доступ до всіх модулів системи без обмежень',
    is_system: true,
    user_count: 1,
    permissions: allTrue(),
  },
  {
    id: '2',
    name: 'Адмін',
    description: 'Повний доступ до всіх модулів системи',
    is_system: true,
    user_count: 2,
    permissions: allTrue(),
  },
  {
    id: '3',
    name: 'Тендерний менеджер',
    description: 'Управління замовленнями, договорами та запитами',
    is_system: false,
    user_count: 3,
    permissions: buildPermissions(
      ['orders', 'contracts', 'requests'],
      ['dashboard', 'analytics', 'tasks'],
    ),
  },
  {
    id: '4',
    name: 'Технолог',
    description: 'Управління виробництвом та технічними специфікаціями',
    is_system: false,
    user_count: 2,
    permissions: buildPermissions(
      ['production', 'tech_specs'],
      ['dashboard', 'orders', 'warehouse'],
    ),
  },
  {
    id: '5',
    name: 'Завскладу',
    description: 'Управління складом та запитами на матеріали',
    is_system: false,
    user_count: 2,
    permissions: buildPermissions(
      ['warehouse', 'requests'],
      ['dashboard', 'production', 'procurement'],
    ),
  },
  {
    id: '6',
    name: 'Менеджер з закупівель',
    description: 'Управління закупівлями та запитами постачальникам',
    is_system: false,
    user_count: 1,
    permissions: buildPermissions(
      ['procurement', 'requests'],
      ['dashboard', 'warehouse', 'contracts'],
    ),
  },
  {
    id: '7',
    name: 'Бухгалтер',
    description: 'Доступ до аналітики та договорів',
    is_system: false,
    user_count: 1,
    permissions: buildPermissions(
      ['analytics'],
      ['dashboard', 'orders'],
      ['contracts'],
    ),
  },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function PermissionsPage() {
  const [groups, setGroups] = useState<PermissionGroup[]>(DEFAULT_GROUPS)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(DEFAULT_GROUPS[0].id)
  const [isCreating, setIsCreating] = useState(false)

  const [editName, setEditName] = useState(DEFAULT_GROUPS[0].name)
  const [editDescription, setEditDescription] = useState(DEFAULT_GROUPS[0].description)
  const [editPermissions, setEditPermissions] = useState<ModulePermission[]>(DEFAULT_GROUPS[0].permissions)

  // ---- derived ----------------------------------------------------------

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) ?? null

  // ---- handlers ---------------------------------------------------------

  const selectGroup = (group: PermissionGroup) => {
    setSelectedGroupId(group.id)
    setIsCreating(false)
    setEditName(group.name)
    setEditDescription(group.description)
    setEditPermissions(group.permissions.map((p) => ({ ...p })))
  }

  const startCreating = () => {
    setSelectedGroupId(null)
    setIsCreating(true)
    setEditName('')
    setEditDescription('')
    setEditPermissions(allFalse())
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
      message.error('Назва групи не може бути порожньою')
      return
    }

    if (isCreating) {
      const newGroup: PermissionGroup = {
        id: String(Date.now()),
        name: editName.trim(),
        description: editDescription.trim(),
        is_system: false,
        user_count: 0,
        permissions: editPermissions.map((p) => ({ ...p })),
      }
      setGroups((prev) => [...prev, newGroup])
      setSelectedGroupId(newGroup.id)
      setIsCreating(false)
      message.success(`Групу "${newGroup.name}" створено`)
    } else if (selectedGroup) {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === selectedGroup.id
            ? { ...g, name: editName.trim(), description: editDescription.trim(), permissions: editPermissions.map((p) => ({ ...p })) }
            : g,
        ),
      )
      message.success(`Групу "${editName.trim()}" збережено`)
    }
  }

  const handleDelete = () => {
    if (!selectedGroup || selectedGroup.is_system) return
    setGroups((prev) => prev.filter((g) => g.id !== selectedGroup.id))
    message.success(`Групу "${selectedGroup.name}" видалено`)
    const remaining = groups.filter((g) => g.id !== selectedGroup.id)
    if (remaining.length > 0) {
      selectGroup(remaining[0])
    } else {
      startCreating()
    }
  }

  // ---- table columns ----------------------------------------------------

  const matrixColumns = [
    {
      title: 'Модуль',
      dataIndex: 'module',
      key: 'module',
      width: 200,
      render: (mod: string) => (
        <Text strong>{MODULE_LABELS[mod] ?? mod}</Text>
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
                      <span>{group.user_count} {group.user_count === 1 ? 'користувач' : 'користувачів'}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* ---- Right panel ---- */}
        <div style={{ flex: 1, minWidth: 0 }}>
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

            {/* Permission matrix */}
            <Text strong style={{ display: 'block', marginBottom: 8, fontSize: 15 }}>
              Матриця дозволів
            </Text>
            <Table
              dataSource={editPermissions}
              columns={matrixColumns}
              rowKey="module"
              size="small"
              pagination={false}
              bordered
              scroll={{ x: 'max-content' }}
              style={{ marginBottom: 24 }}
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
                  >
                    Видалити
                  </Button>
                </Popconfirm>
              )}
              <Button type="primary" onClick={handleSave}>
                Зберегти
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default PermissionsPage
