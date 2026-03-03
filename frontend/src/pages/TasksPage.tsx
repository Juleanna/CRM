import { useState, useMemo } from 'react'
import {
  Table, Tag, Button, Card, Typography, Tabs, Checkbox, List, Space, Progress,
  Modal, Form, Input, Select, DatePicker, Row, Col, Spin, Popconfirm, message,
  Descriptions, Badge,
} from 'antd'
import {
  PlusOutlined, CheckSquareOutlined, OrderedListOutlined,
  EyeOutlined, EditOutlined, DeleteOutlined, SearchOutlined, FilterOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTasks, createTask, updateTask, deleteTask, getChecklists, createChecklist, toggleChecklistItem } from '../api/tasks'
import { getUsers } from '../api/users'
import { getOrders } from '../api/orders'
import { getContracts } from '../api/contracts'
import type { Task, Checklist, ChecklistItem, PaginatedResponse, User, Order, Contract } from '../types'
import { useAuthStore } from '../store/authStore'
import dayjs from 'dayjs'

const { Title, Text } = Typography

const taskStatus: Record<string, { color: string; label: string }> = {
  new: { color: 'blue', label: 'Нове' },
  in_progress: { color: 'orange', label: 'В роботі' },
  completed: { color: 'green', label: 'Виконане' },
}

function TasksPage() {
  const { hasPermission } = useAuthStore()
  const canCreate = hasPermission('tasks', 'can_create')
  const canEdit = hasPermission('tasks', 'can_edit')
  const canDelete = hasPermission('tasks', 'can_delete')

  const queryClient = useQueryClient()
  const [messageApi, contextHolder] = message.useMessage()

  // Tab state
  const [activeTab, setActiveTab] = useState('tasks')

  // Tasks filter state
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [page, setPage] = useState(1)
  const pageSize = 10

  // Task modal state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [taskFormOpen, setTaskFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [taskForm] = Form.useForm()

  // Checklist modal state
  const [checklistFormOpen, setChecklistFormOpen] = useState(false)
  const [checklistForm] = Form.useForm()
  const [checklistItems, setChecklistItems] = useState<{ text: string; assignee?: number }[]>([{ text: '', assignee: undefined }])

  // Build task query params
  const taskQueryParams = useMemo(() => {
    const params: Record<string, unknown> = { page, page_size: pageSize }
    if (search) params.search = search
    if (statusFilter) params.status = statusFilter
    return params
  }, [search, statusFilter, page])

  // Fetch tasks
  const {
    data: tasksData,
    isLoading: tasksLoading,
    isError: tasksError,
  } = useQuery<PaginatedResponse<Task>>({
    queryKey: ['tasks', taskQueryParams],
    queryFn: () => getTasks(taskQueryParams).then(r => r.data),
  })

  // Fetch checklists
  const {
    data: checklistsData,
    isLoading: checklistsLoading,
    isError: checklistsError,
  } = useQuery<PaginatedResponse<Checklist>>({
    queryKey: ['checklists'],
    queryFn: () => getChecklists({ page_size: 100 }).then(r => r.data),
  })

  // Fetch users for assignee select
  const { data: usersData } = useQuery<PaginatedResponse<User>>({
    queryKey: ['users'],
    queryFn: () => getUsers({ page_size: 1000 }).then(r => r.data),
    enabled: taskFormOpen || checklistFormOpen,
  })

  // Fetch orders for order select
  const { data: ordersData } = useQuery<PaginatedResponse<Order>>({
    queryKey: ['orders-select'],
    queryFn: () => getOrders({ page_size: 1000 }).then(r => r.data),
    enabled: taskFormOpen || checklistFormOpen,
  })

  // Fetch contracts for contract select
  const { data: contractsData } = useQuery<PaginatedResponse<Contract>>({
    queryKey: ['contracts-select'],
    queryFn: () => getContracts({ page_size: 1000 }).then(r => r.data),
    enabled: taskFormOpen || checklistFormOpen,
  })

  const tasks = tasksData?.results ?? []
  const totalTasks = tasksData?.count ?? 0
  const checklists = checklistsData?.results ?? []
  const users = usersData?.results ?? []
  const orders = ordersData?.results ?? []
  const contracts = contractsData?.results ?? []

  // ========================
  // Task mutations
  // ========================

  const createTaskMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      messageApi.success('Завдання створено')
      closeTaskForm()
    },
    onError: () => {
      messageApi.error('Помилка при створенні завдання')
    },
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      messageApi.success('Завдання оновлено')
      closeTaskForm()
    },
    onError: () => {
      messageApi.error('Помилка при оновленні завдання')
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      messageApi.success('Завдання видалено')
    },
    onError: () => {
      messageApi.error('Помилка при видаленні завдання')
    },
  })

  // ========================
  // Checklist mutations
  // ========================

  const createChecklistMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => createChecklist(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] })
      messageApi.success('Чек-ліст створено')
      closeChecklistForm()
    },
    onError: () => {
      messageApi.error('Помилка при створенні чек-лісту')
    },
  })

  const toggleItemMutation = useMutation({
    mutationFn: (id: number) => toggleChecklistItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] })
    },
    onError: () => {
      messageApi.error('Помилка при оновленні елемента')
    },
  })

  // ========================
  // Task form helpers
  // ========================

  const openCreateTaskForm = () => {
    setEditingTask(null)
    taskForm.resetFields()
    setTaskFormOpen(true)
  }

  const openEditTaskForm = (task: Task) => {
    setEditingTask(task)
    taskForm.setFieldsValue({
      title: task.title,
      description: task.description,
      assignee: task.assignee,
      status: task.status,
      due_date: task.due_date ? dayjs(task.due_date) : null,
      order: task.order,
      contract: task.contract,
      comments: task.comments,
    })
    setTaskFormOpen(true)
  }

  const closeTaskForm = () => {
    setTaskFormOpen(false)
    setEditingTask(null)
    taskForm.resetFields()
  }

  const handleTaskFormSubmit = () => {
    taskForm.validateFields().then((values) => {
      const data: Record<string, unknown> = {
        ...values,
        due_date: values.due_date ? values.due_date.format('YYYY-MM-DD') : null,
      }
      if (editingTask) {
        updateTaskMutation.mutate({ id: editingTask.id, data })
      } else {
        createTaskMutation.mutate(data)
      }
    })
  }

  // ========================
  // Checklist form helpers
  // ========================

  const openChecklistForm = () => {
    checklistForm.resetFields()
    setChecklistItems([{ text: '', assignee: undefined }])
    setChecklistFormOpen(true)
  }

  const closeChecklistForm = () => {
    setChecklistFormOpen(false)
    checklistForm.resetFields()
    setChecklistItems([{ text: '', assignee: undefined }])
  }

  const handleChecklistFormSubmit = () => {
    checklistForm.validateFields().then((values) => {
      const validItems = checklistItems.filter(item => item.text.trim() !== '')
      if (validItems.length === 0) {
        messageApi.warning('Додайте хоча б один пункт')
        return
      }
      const data: Record<string, unknown> = {
        title: values.title,
        order: values.order || null,
        contract: values.contract || null,
        items: validItems,
      }
      createChecklistMutation.mutate(data)
    })
  }

  const addChecklistItemField = () => {
    setChecklistItems([...checklistItems, { text: '', assignee: undefined }])
  }

  const updateChecklistItemField = (index: number, field: string, value: unknown) => {
    const updated = [...checklistItems]
    updated[index] = { ...updated[index], [field]: value }
    setChecklistItems(updated)
  }

  const removeChecklistItemField = (index: number) => {
    if (checklistItems.length <= 1) return
    setChecklistItems(checklistItems.filter((_, i) => i !== index))
  }

  // ========================
  // Task columns
  // ========================

  const taskColumns = [
    {
      title: 'ID', dataIndex: 'id', key: 'id', width: 70,
    },
    { title: 'Завдання', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: 'Виконавець', dataIndex: 'assignee_name', key: 'assignee_name', width: 180 },
    {
      title: 'Статус', dataIndex: 'status', key: 'status', width: 120,
      render: (s: string) => {
        const st = taskStatus[s]
        return st ? <Tag color={st.color}>{st.label}</Tag> : s
      },
    },
    {
      title: 'Дедлайн', dataIndex: 'due_date', key: 'due_date', width: 110,
      render: (d: string | null) => d ? new Date(d).toLocaleDateString('uk-UA') : '—',
    },
    {
      title: 'Замовлення', dataIndex: 'order_title', key: 'order_title', width: 150,
      render: (t: string) => t || '—',
    },
    {
      title: 'Дії', key: 'actions', width: 130,
      render: (_: unknown, record: Task) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => { setSelectedTask(record); setDetailOpen(true) }} />
          {canEdit && <Button type="link" icon={<EditOutlined />} onClick={() => openEditTaskForm(record)} />}
          {canDelete && (
            <Popconfirm
              title="Видалити завдання?"
              description="Цю дію неможливо скасувати."
              onConfirm={() => deleteTaskMutation.mutate(record.id)}
              okText="Так"
              cancelText="Ні"
            >
              <Button type="link" danger icon={<DeleteOutlined />} loading={deleteTaskMutation.isPending} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      {contextHolder}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Завдання та чек-лісти</Title>
        <Space>
          {canCreate && <Button type="primary" icon={<PlusOutlined />} onClick={openCreateTaskForm}>Нове завдання</Button>}
          {canCreate && <Button icon={<OrderedListOutlined />} onClick={openChecklistForm}>Новий чек-ліст</Button>}
        </Space>
      </div>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'tasks',
              label: <span><CheckSquareOutlined /> Завдання ({totalTasks})</span>,
              children: (
                <>
                  <Card style={{ marginBottom: 16 }}>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Input
                          placeholder="Пошук..."
                          prefix={<SearchOutlined />}
                          allowClear
                          value={search}
                          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                        />
                      </Col>
                      <Col span={5}>
                        <Select
                          placeholder="Статус"
                          allowClear
                          style={{ width: '100%' }}
                          value={statusFilter}
                          onChange={(val) => { setStatusFilter(val); setPage(1) }}
                          options={Object.entries(taskStatus).map(([k, v]) => ({ value: k, label: v.label }))}
                        />
                      </Col>
                      <Col span={5} offset={6} style={{ textAlign: 'right' }}>
                        <Button
                          icon={<FilterOutlined />}
                          onClick={() => { setSearch(''); setStatusFilter(undefined); setPage(1) }}
                        >
                          Скинути фільтри
                        </Button>
                      </Col>
                    </Row>
                  </Card>
                  {tasksError ? (
                    <div style={{ textAlign: 'center', padding: 24, color: '#ff4d4f' }}>
                      Не вдалося завантажити завдання. Спробуйте оновити сторінку.
                    </div>
                  ) : (
                    <Table
                      columns={taskColumns}
                      dataSource={tasks}
                      rowKey="id"
                      size="middle"
                      loading={tasksLoading}
                      pagination={{
                        current: page,
                        pageSize,
                        total: totalTasks,
                        showTotal: (t) => `Всього: ${t}`,
                        onChange: (p) => setPage(p),
                      }}
                    />
                  )}
                </>
              ),
            },
            {
              key: 'checklists',
              label: <span><OrderedListOutlined /> Чек-лісти ({checklists.length})</span>,
              children: checklistsError ? (
                <div style={{ textAlign: 'center', padding: 24, color: '#ff4d4f' }}>
                  Не вдалося завантажити чек-лісти. Спробуйте оновити сторінку.
                </div>
              ) : checklistsLoading ? (
                <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>
              ) : (
                <List
                  dataSource={checklists}
                  locale={{ emptyText: 'Чек-лісти відсутні' }}
                  renderItem={(cl: Checklist) => {
                    const done = cl.progress?.done ?? cl.items.filter((i: ChecklistItem) => i.is_done).length
                    const total = cl.progress?.total ?? cl.items.length
                    return (
                      <Card
                        style={{ marginBottom: 16 }}
                        title={cl.title}
                        extra={<Text type="secondary">{done}/{total}</Text>}
                      >
                        <Progress
                          percent={total > 0 ? Math.round((done / total) * 100) : 0}
                          style={{ marginBottom: 12 }}
                        />
                        <List
                          size="small"
                          dataSource={cl.items}
                          renderItem={(item: ChecklistItem) => (
                            <List.Item>
                              <Checkbox
                                checked={item.is_done}
                                onChange={() => toggleItemMutation.mutate(item.id)}
                              >
                                <span style={{
                                  textDecoration: item.is_done ? 'line-through' : 'none',
                                  color: item.is_done ? '#8c8c8c' : undefined,
                                }}>
                                  {item.text}
                                </span>
                                {item.assignee_name && (
                                  <Text type="secondary" style={{ marginLeft: 8 }}>
                                    ({item.assignee_name})
                                  </Text>
                                )}
                              </Checkbox>
                            </List.Item>
                          )}
                        />
                      </Card>
                    )
                  }}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Task detail modal */}
      <Modal
        title="Деталі завдання"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={700}
        style={{ top: 20 }}
        styles={{ body: { maxHeight: 'calc(100vh - 160px)', overflowY: 'auto', overflowX: 'hidden' } }}
      >
        {selectedTask && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="ID">{selectedTask.id}</Descriptions.Item>
            <Descriptions.Item label="Назва">{selectedTask.title}</Descriptions.Item>
            <Descriptions.Item label="Виконавець">{selectedTask.assignee_name || '—'}</Descriptions.Item>
            <Descriptions.Item label="Статус">
              <Badge
                status={selectedTask.status === 'completed' ? 'success' : selectedTask.status === 'in_progress' ? 'processing' : 'default'}
                text={taskStatus[selectedTask.status]?.label ?? selectedTask.status}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Дедлайн">
              {selectedTask.due_date
                ? new Date(selectedTask.due_date).toLocaleDateString('uk-UA')
                : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Замовлення">{selectedTask.order_title || '—'}</Descriptions.Item>
            <Descriptions.Item label="Контракт">{selectedTask.contract_number || '—'}</Descriptions.Item>
            <Descriptions.Item label="Автор">{selectedTask.created_by_name || '—'}</Descriptions.Item>
            <Descriptions.Item label="Створено">
              {new Date(selectedTask.created_at).toLocaleDateString('uk-UA')}
            </Descriptions.Item>
            <Descriptions.Item label="Оновлено">
              {new Date(selectedTask.updated_at).toLocaleDateString('uk-UA')}
            </Descriptions.Item>
            {selectedTask.description && (
              <Descriptions.Item label="Опис" span={2}>{selectedTask.description}</Descriptions.Item>
            )}
            {selectedTask.comments && (
              <Descriptions.Item label="Коментарі" span={2}>{selectedTask.comments}</Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* Task create/edit modal */}
      <Modal
        title={editingTask ? 'Редагувати завдання' : 'Нове завдання'}
        open={taskFormOpen}
        onCancel={closeTaskForm}
        onOk={handleTaskFormSubmit}
        okText={editingTask ? 'Зберегти' : 'Створити'}
        cancelText="Скасувати"
        confirmLoading={createTaskMutation.isPending || updateTaskMutation.isPending}
        width={600}
        destroyOnHidden
        style={{ top: 20 }}
        styles={{ body: { maxHeight: 'calc(100vh - 160px)', overflowY: 'auto', overflowX: 'hidden' } }}
      >
        <Spin spinning={createTaskMutation.isPending || updateTaskMutation.isPending}>
          <Form form={taskForm} layout="vertical" style={{ marginTop: 8 }}>
            <Form.Item name="title" label="Назва" rules={[{ required: true, message: 'Введіть назву завдання' }]}>
              <Input placeholder="Назва завдання" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="assignee" label="Виконавець">
                  <Select placeholder="Виконавець" allowClear showSearch optionFilterProp="label"
                    options={users.map(u => ({ value: u.id, label: `${u.last_name} ${u.first_name}`.trim() || u.username }))} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="status" label="Статус" initialValue="new">
                  <Select options={Object.entries(taskStatus).map(([k, v]) => ({ value: k, label: v.label }))} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="due_date" label="Дедлайн">
                  <DatePicker style={{ width: '100%' }} placeholder="Дата" format="DD.MM.YYYY" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="order" label="Замовлення">
                  <Select placeholder="Замовлення" allowClear showSearch optionFilterProp="label"
                    options={orders.map(o => ({ value: o.id, label: o.title }))} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="contract" label="Контракт">
                  <Select placeholder="Контракт" allowClear showSearch optionFilterProp="label"
                    options={contracts.map(c => ({ value: c.id, label: c.contract_number }))} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="description" label="Опис">
              <Input.TextArea rows={2} placeholder="Опис завдання" />
            </Form.Item>

            <Form.Item name="comments" label="Коментарі" style={{ marginBottom: 0 }}>
              <Input.TextArea rows={2} placeholder="Коментарі" />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>

      {/* Checklist create modal */}
      <Modal
        title="Новий чек-ліст"
        open={checklistFormOpen}
        onCancel={closeChecklistForm}
        onOk={handleChecklistFormSubmit}
        okText="Створити"
        cancelText="Скасувати"
        confirmLoading={createChecklistMutation.isPending}
        width={650}
        destroyOnHidden
        style={{ top: 20 }}
        styles={{ body: { maxHeight: 'calc(100vh - 160px)', overflowY: 'auto', overflowX: 'hidden' } }}
      >
        <Spin spinning={createChecklistMutation.isPending}>
          <Form form={checklistForm} layout="vertical">
            <Form.Item
              name="title"
              label="Назва чек-лісту"
              rules={[{ required: true, message: 'Введіть назву чек-лісту' }]}
            >
              <Input placeholder="Назва чек-лісту" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="order" label="Замовлення">
                  <Select
                    placeholder="Оберіть замовлення"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    options={orders.map(o => ({ value: o.id, label: o.title }))}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="contract" label="Контракт">
                  <Select
                    placeholder="Оберіть контракт"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    options={contracts.map(c => ({ value: c.id, label: c.contract_number }))}
                  />
                </Form.Item>
              </Col>
            </Row>

            <div style={{ marginBottom: 8 }}>
              <Text strong>Пункти чек-лісту</Text>
            </div>
            {checklistItems.map((item, index) => (
              <Row key={index} gutter={8} style={{ marginBottom: 8 }}>
                <Col span={12}>
                  <Input
                    placeholder={`Пункт ${index + 1}`}
                    value={item.text}
                    onChange={(e) => updateChecklistItemField(index, 'text', e.target.value)}
                  />
                </Col>
                <Col span={9}>
                  <Select
                    placeholder="Виконавець"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    style={{ width: '100%' }}
                    value={item.assignee}
                    onChange={(val) => updateChecklistItemField(index, 'assignee', val)}
                    options={users.map(u => ({
                      value: u.id,
                      label: `${u.last_name} ${u.first_name}`.trim() || u.username,
                    }))}
                  />
                </Col>
                <Col span={3}>
                  <Button
                    danger
                    disabled={checklistItems.length <= 1}
                    onClick={() => removeChecklistItemField(index)}
                  >
                    X
                  </Button>
                </Col>
              </Row>
            ))}
            <Button type="dashed" onClick={addChecklistItemField} block icon={<PlusOutlined />}>
              Додати пункт
            </Button>
          </Form>
        </Spin>
      </Modal>
    </div>
  )
}

export default TasksPage
