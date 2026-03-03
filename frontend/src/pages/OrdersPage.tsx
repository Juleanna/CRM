import { useState, useMemo } from 'react'
import { useAuthStore } from '../store/authStore'
import {
  Table, Tag, Button, Space, Input, Select, Card, Typography, Row, Col,
  Modal, Descriptions, Badge, Form, InputNumber, DatePicker, Spin, Popconfirm, message,
} from 'antd'
import {
  PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined, FilterOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getOrders, createOrder, updateOrder, deleteOrder, getCustomers } from '../api/orders'
import type { Order, Customer, PaginatedResponse } from '../types'
import dayjs from 'dayjs'

const { Title } = Typography

const statusMap: Record<string, { color: string; label: string }> = {
  new: { color: 'blue', label: 'Нове' },
  document_collection: { color: 'orange', label: 'Збір документів' },
  bidding: { color: 'purple', label: 'В процесі торгів' },
  approved: { color: 'cyan', label: 'Погоджено' },
  won: { color: 'green', label: 'Перемога' },
  lost: { color: 'red', label: 'Програш' },
  frozen: { color: 'default', label: 'Заморожено' },
  rejected: { color: 'volcano', label: 'Відхилено' },
}

const priorityMap: Record<string, { color: string; label: string }> = {
  high: { color: 'red', label: 'Високий' },
  medium: { color: 'orange', label: 'Середній' },
  low: { color: 'green', label: 'Низький' },
}

function OrdersPage() {
  const { hasPermission } = useAuthStore()
  const canCreate = hasPermission('orders', 'can_create')
  const canEdit = hasPermission('orders', 'can_edit')
  const canDelete = hasPermission('orders', 'can_delete')

  const queryClient = useQueryClient()
  const [messageApi, contextHolder] = message.useMessage()

  // Filter state
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>(undefined)
  const [page, setPage] = useState(1)
  const pageSize = 10

  // Modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [form] = Form.useForm()

  // Build query params
  const queryParams = useMemo(() => {
    const params: Record<string, unknown> = { page, page_size: pageSize }
    if (search) params.search = search
    if (statusFilter) params.status = statusFilter
    if (priorityFilter) params.priority = priorityFilter
    return params
  }, [search, statusFilter, priorityFilter, page])

  // Fetch orders
  const {
    data: ordersData,
    isLoading: ordersLoading,
    isError: ordersError,
  } = useQuery<PaginatedResponse<Order>>({
    queryKey: ['orders', queryParams],
    queryFn: () => getOrders(queryParams).then(r => r.data),
  })

  // Fetch customers for select in form
  const { data: customersData } = useQuery<PaginatedResponse<Customer>>({
    queryKey: ['customers'],
    queryFn: () => getCustomers({ page_size: 1000 }).then(r => r.data),
    enabled: formOpen,
  })

  const orders = ordersData?.results ?? []
  const totalOrders = ordersData?.count ?? 0
  const customers = customersData?.results ?? []

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      messageApi.success('Замовлення створено')
      closeForm()
    },
    onError: () => {
      messageApi.error('Помилка при створенні замовлення')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => updateOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      messageApi.success('Замовлення оновлено')
      closeForm()
    },
    onError: () => {
      messageApi.error('Помилка при оновленні замовлення')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      messageApi.success('Замовлення видалено')
    },
    onError: () => {
      messageApi.error('Помилка при видаленні замовлення')
    },
  })

  // Form helpers
  const openCreateForm = () => {
    setEditingOrder(null)
    form.resetFields()
    setFormOpen(true)
  }

  const openEditForm = (order: Order) => {
    setEditingOrder(order)
    form.setFieldsValue({
      title: order.title,
      customer: order.customer,
      status: order.status,
      priority: order.priority,
      quantity: order.quantity,
      payment_amount: order.payment_amount ? Number(order.payment_amount) : null,
      deadline: order.deadline ? dayjs(order.deadline) : null,
      description: order.description,
      source: order.source,
    })
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingOrder(null)
    form.resetFields()
  }

  const handleFormSubmit = () => {
    form.validateFields().then((values) => {
      const data: Record<string, unknown> = {
        ...values,
        deadline: values.deadline ? values.deadline.format('YYYY-MM-DD') : null,
        payment_amount: values.payment_amount ? String(values.payment_amount) : null,
      }
      if (editingOrder) {
        updateMutation.mutate({ id: editingOrder.id, data })
      } else {
        createMutation.mutate(data)
      }
    })
  }

  const columns = [
    {
      title: 'ID', dataIndex: 'id', key: 'id', width: 70,
    },
    { title: 'Назва', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: 'Замовник', dataIndex: 'customer_name', key: 'customer_name', ellipsis: true },
    {
      title: 'Статус', dataIndex: 'status', key: 'status', width: 150,
      render: (s: string) => { const st = statusMap[s]; return st ? <Tag color={st.color}>{st.label}</Tag> : s },
    },
    {
      title: 'Пріоритет', dataIndex: 'priority', key: 'priority', width: 110,
      render: (p: string) => { const pr = priorityMap[p]; return pr ? <Tag color={pr.color}>{pr.label}</Tag> : p },
    },
    {
      title: 'Кількість', dataIndex: 'quantity', key: 'quantity', width: 110,
      render: (q: number) => q?.toLocaleString('uk-UA') ?? '—',
    },
    {
      title: 'Сума', dataIndex: 'payment_amount', key: 'payment_amount', width: 140,
      render: (a: string | null) => {
        if (!a) return '—'
        const num = Number(a)
        if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)} млн грн`
        if (num >= 1_000) return `${(num / 1_000).toFixed(0)} тис грн`
        return `${num} грн`
      },
    },
    {
      title: 'Дедлайн', dataIndex: 'deadline', key: 'deadline', width: 110,
      render: (d: string | null) => d ? new Date(d).toLocaleDateString('uk-UA') : '—',
    },
    {
      title: 'Дії', key: 'actions', width: 130,
      render: (_: unknown, record: Order) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => { setSelectedOrder(record); setDetailOpen(true) }} />
          {canEdit && <Button type="link" icon={<EditOutlined />} onClick={() => openEditForm(record)} />}
          {canDelete && (
            <Popconfirm
              title="Видалити замовлення?"
              description="Цю дію неможливо скасувати."
              onConfirm={() => deleteMutation.mutate(record.id)}
              okText="Так"
              cancelText="Ні"
            >
              <Button type="link" danger icon={<DeleteOutlined />} loading={deleteMutation.isPending} />
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
        <Title level={3} style={{ margin: 0 }}>Замовлення</Title>
        {canCreate && <Button type="primary" icon={<PlusOutlined />} onClick={openCreateForm}>Нове замовлення</Button>}
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Input
              placeholder="Пошук за назвою, замовником..."
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
              options={Object.entries(statusMap).map(([k, v]) => ({ value: k, label: v.label }))}
            />
          </Col>
          <Col span={5}>
            <Select
              placeholder="Пріоритет"
              allowClear
              style={{ width: '100%' }}
              value={priorityFilter}
              onChange={(val) => { setPriorityFilter(val); setPage(1) }}
              options={Object.entries(priorityMap).map(([k, v]) => ({ value: k, label: v.label }))}
            />
          </Col>
          <Col span={6} style={{ textAlign: 'right' }}>
            <Button
              icon={<FilterOutlined />}
              onClick={() => { setSearch(''); setStatusFilter(undefined); setPriorityFilter(undefined); setPage(1) }}
            >
              Скинути фільтри
            </Button>
          </Col>
        </Row>
      </Card>

      <Card>
        {ordersError ? (
          <div style={{ textAlign: 'center', padding: 24, color: '#ff4d4f' }}>
            Не вдалося завантажити замовлення. Спробуйте оновити сторінку.
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="id"
            loading={ordersLoading}
            pagination={{
              current: page,
              pageSize,
              total: totalOrders,
              showTotal: (t) => `Всього: ${t}`,
              onChange: (p) => setPage(p),
            }}
          />
        )}
      </Card>

      {/* Detail modal */}
      <Modal
        title="Деталі замовлення"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={700}
      >
        {selectedOrder && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="ID">{selectedOrder.id}</Descriptions.Item>
            <Descriptions.Item label="Назва">{selectedOrder.title}</Descriptions.Item>
            <Descriptions.Item label="Замовник">{selectedOrder.customer_name}</Descriptions.Item>
            <Descriptions.Item label="Статус">
              <Badge
                status={selectedOrder.status === 'won' ? 'success' : selectedOrder.status === 'lost' ? 'error' : 'processing'}
                text={statusMap[selectedOrder.status]?.label ?? selectedOrder.status}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Пріоритет">
              <Tag color={priorityMap[selectedOrder.priority]?.color}>
                {priorityMap[selectedOrder.priority]?.label ?? selectedOrder.priority}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Кількість">
              {selectedOrder.quantity?.toLocaleString('uk-UA')} шт
            </Descriptions.Item>
            <Descriptions.Item label="Сума">
              {selectedOrder.payment_amount
                ? `${Number(selectedOrder.payment_amount).toLocaleString('uk-UA')} грн`
                : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Дедлайн">
              {selectedOrder.deadline
                ? new Date(selectedOrder.deadline).toLocaleDateString('uk-UA')
                : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Створено">
              {new Date(selectedOrder.created_at).toLocaleDateString('uk-UA')}
            </Descriptions.Item>
            <Descriptions.Item label="Автор">{selectedOrder.created_by_name}</Descriptions.Item>
            {selectedOrder.description && (
              <Descriptions.Item label="Опис" span={2}>{selectedOrder.description}</Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* Create / Edit modal */}
      <Modal
        title={editingOrder ? 'Редагувати замовлення' : 'Нове замовлення'}
        open={formOpen}
        onCancel={closeForm}
        onOk={handleFormSubmit}
        okText={editingOrder ? 'Зберегти' : 'Створити'}
        cancelText="Скасувати"
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={600}
        destroyOnHidden
      >
        <Spin spinning={createMutation.isPending || updateMutation.isPending}>
          <Form form={form} layout="vertical">
            <Form.Item
              name="title"
              label="Назва"
              rules={[{ required: true, message: 'Введіть назву замовлення' }]}
            >
              <Input placeholder="Назва замовлення" />
            </Form.Item>

            <Form.Item
              name="customer"
              label="Замовник"
              rules={[{ required: true, message: 'Оберіть замовника' }]}
            >
              <Select
                placeholder="Оберіть замовника"
                showSearch
                optionFilterProp="label"
                options={customers.map(c => ({ value: c.id, label: c.company_name }))}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="Статус"
                  initialValue="new"
                >
                  <Select
                    options={Object.entries(statusMap).map(([k, v]) => ({ value: k, label: v.label }))}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="priority"
                  label="Пріоритет"
                  initialValue="medium"
                >
                  <Select
                    options={Object.entries(priorityMap).map(([k, v]) => ({ value: k, label: v.label }))}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="quantity" label="Кількість">
                  <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="payment_amount" label="Сума (грн)">
                  <InputNumber style={{ width: '100%' }} min={0} placeholder="0.00" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="deadline" label="Дедлайн">
              <DatePicker style={{ width: '100%' }} placeholder="Оберіть дату" format="DD.MM.YYYY" />
            </Form.Item>

            <Form.Item name="source" label="Джерело">
              <Input placeholder="Джерело замовлення" />
            </Form.Item>

            <Form.Item name="description" label="Опис">
              <Input.TextArea rows={3} placeholder="Опис замовлення" />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  )
}

export default OrdersPage
