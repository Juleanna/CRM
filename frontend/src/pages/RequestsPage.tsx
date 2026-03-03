import { useState, useMemo } from 'react'
import {
  Table, Tag, Button, Card, Typography, Row, Col, Input, Select,
  Modal, Form, DatePicker, Spin, Space, Popconfirm, Descriptions, Badge, List, message,
} from 'antd'
import {
  PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined,
  FilterOutlined, MessageOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getRequests, createRequest, updateRequest, deleteRequest, addRequestResponse } from '../api/requests'
import { getUsers } from '../api/users'
import { getOrders } from '../api/orders'
import { getContracts } from '../api/contracts'
import type { WorkRequest, RequestResponse, PaginatedResponse, User, Order, Contract } from '../types'
import { useAuthStore } from '../store/authStore'
import dayjs from 'dayjs'

const { Title, Text } = Typography

const typeMap: Record<string, { color: string; label: string }> = {
  warehouse: { color: 'blue', label: 'Запит на склад' },
  patterns: { color: 'purple', label: 'Запит на лекала' },
  calculation: { color: 'orange', label: 'Запит на прорахунок' },
  procurement: { color: 'green', label: 'Запит на закупівлю' },
}

const statusMap: Record<string, { color: string; label: string }> = {
  open: { color: 'blue', label: 'Відкритий' },
  closed: { color: 'default', label: 'Закритий' },
}

function RequestsPage() {
  const { hasPermission } = useAuthStore()
  const canCreate = hasPermission('requests', 'can_create')
  const canEdit = hasPermission('requests', 'can_edit')
  const canDelete = hasPermission('requests', 'can_delete')

  const queryClient = useQueryClient()
  const [messageApi, contextHolder] = message.useMessage()

  // Filter state
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [page, setPage] = useState(1)
  const pageSize = 10

  // Modal state
  const [selectedRequest, setSelectedRequest] = useState<WorkRequest | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingRequest, setEditingRequest] = useState<WorkRequest | null>(null)
  const [form] = Form.useForm()

  // Response modal state
  const [responseOpen, setResponseOpen] = useState(false)
  const [responseRequest, setResponseRequest] = useState<WorkRequest | null>(null)
  const [responseForm] = Form.useForm()

  // Build query params
  const queryParams = useMemo(() => {
    const params: Record<string, unknown> = { page, page_size: pageSize }
    if (search) params.search = search
    if (typeFilter) params.request_type = typeFilter
    if (statusFilter) params.status = statusFilter
    return params
  }, [search, typeFilter, statusFilter, page])

  // Fetch requests
  const {
    data: requestsData,
    isLoading: requestsLoading,
    isError: requestsError,
  } = useQuery<PaginatedResponse<WorkRequest>>({
    queryKey: ['requests', queryParams],
    queryFn: () => getRequests(queryParams).then(r => r.data),
  })

  // Fetch users for assignee select
  const { data: usersData } = useQuery<PaginatedResponse<User>>({
    queryKey: ['users'],
    queryFn: () => getUsers({ page_size: 1000 }).then(r => r.data),
    enabled: formOpen,
  })

  // Fetch orders for order select
  const { data: ordersData } = useQuery<PaginatedResponse<Order>>({
    queryKey: ['orders-select'],
    queryFn: () => getOrders({ page_size: 1000 }).then(r => r.data),
    enabled: formOpen,
  })

  // Fetch contracts for contract select
  const { data: contractsData } = useQuery<PaginatedResponse<Contract>>({
    queryKey: ['contracts-select'],
    queryFn: () => getContracts({ page_size: 1000 }).then(r => r.data),
    enabled: formOpen,
  })

  const requests = requestsData?.results ?? []
  const totalRequests = requestsData?.count ?? 0
  const users = usersData?.results ?? []
  const orders = ordersData?.results ?? []
  const contracts = contractsData?.results ?? []

  // ========================
  // Mutations
  // ========================

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => createRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      messageApi.success('Запит створено')
      closeForm()
    },
    onError: () => {
      messageApi.error('Помилка при створенні запиту')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => updateRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      messageApi.success('Запит оновлено')
      closeForm()
    },
    onError: () => {
      messageApi.error('Помилка при оновленні запиту')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      messageApi.success('Запит видалено')
    },
    onError: () => {
      messageApi.error('Помилка при видаленні запиту')
    },
  })

  const addResponseMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => addRequestResponse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      messageApi.success('Відповідь додано')
      closeResponseModal()
    },
    onError: () => {
      messageApi.error('Помилка при додаванні відповіді')
    },
  })

  // ========================
  // Form helpers
  // ========================

  const openCreateForm = () => {
    setEditingRequest(null)
    form.resetFields()
    setFormOpen(true)
  }

  const openEditForm = (request: WorkRequest) => {
    setEditingRequest(request)
    form.setFieldsValue({
      title: request.title,
      request_type: request.request_type,
      description: request.description,
      assignee: request.assignee,
      status: request.status,
      deadline: request.deadline ? dayjs(request.deadline) : null,
      order: request.order,
      contract: request.contract,
    })
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingRequest(null)
    form.resetFields()
  }

  const handleFormSubmit = () => {
    form.validateFields().then((values) => {
      const data: Record<string, unknown> = {
        ...values,
        deadline: values.deadline ? values.deadline.format('YYYY-MM-DD') : null,
      }
      if (editingRequest) {
        updateMutation.mutate({ id: editingRequest.id, data })
      } else {
        createMutation.mutate(data)
      }
    })
  }

  // ========================
  // Response modal helpers
  // ========================

  const openResponseModal = (request: WorkRequest) => {
    setResponseRequest(request)
    responseForm.resetFields()
    setResponseOpen(true)
  }

  const closeResponseModal = () => {
    setResponseOpen(false)
    setResponseRequest(null)
    responseForm.resetFields()
  }

  const handleResponseSubmit = () => {
    responseForm.validateFields().then((values) => {
      if (responseRequest) {
        addResponseMutation.mutate({
          id: responseRequest.id,
          data: { response_text: values.response_text },
        })
      }
    })
  }

  // ========================
  // Columns
  // ========================

  const columns = [
    {
      title: 'ID', dataIndex: 'id', key: 'id', width: 70,
    },
    { title: 'Назва', dataIndex: 'title', key: 'title', ellipsis: true },
    {
      title: 'Тип', dataIndex: 'request_type', key: 'request_type', width: 180,
      render: (t: string) => {
        const tp = typeMap[t]
        return tp ? <Tag color={tp.color}>{tp.label}</Tag> : t
      },
    },
    {
      title: 'Статус', dataIndex: 'status', key: 'status', width: 120,
      render: (s: string) => {
        const st = statusMap[s]
        return st ? <Tag color={st.color}>{st.label}</Tag> : s
      },
    },
    {
      title: 'Виконавець', dataIndex: 'assignee_name', key: 'assignee_name', width: 180,
      render: (t: string) => t || '—',
    },
    {
      title: 'Замовлення', dataIndex: 'order_title', key: 'order_title', width: 150,
      render: (t: string) => t || '—',
    },
    {
      title: 'Дедлайн', dataIndex: 'deadline', key: 'deadline', width: 110,
      render: (d: string | null) => d ? new Date(d).toLocaleDateString('uk-UA') : '—',
    },
    {
      title: 'Дії', key: 'actions', width: 160,
      render: (_: unknown, record: WorkRequest) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => { setSelectedRequest(record); setDetailOpen(true) }} />
          <Button type="link" icon={<MessageOutlined />} onClick={() => openResponseModal(record)} />
          {canEdit && <Button type="link" icon={<EditOutlined />} onClick={() => openEditForm(record)} />}
          {canDelete && (
            <Popconfirm
              title="Видалити запит?"
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
        <Title level={3} style={{ margin: 0 }}>Запити</Title>
        {canCreate && <Button type="primary" icon={<PlusOutlined />} onClick={openCreateForm}>Новий запит</Button>}
      </div>

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
              placeholder="Тип запиту"
              allowClear
              style={{ width: '100%' }}
              value={typeFilter}
              onChange={(val) => { setTypeFilter(val); setPage(1) }}
              options={Object.entries(typeMap).map(([k, v]) => ({ value: k, label: v.label }))}
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
          <Col span={6} style={{ textAlign: 'right' }}>
            <Button
              icon={<FilterOutlined />}
              onClick={() => { setSearch(''); setTypeFilter(undefined); setStatusFilter(undefined); setPage(1) }}
            >
              Скинути фільтри
            </Button>
          </Col>
        </Row>
      </Card>

      <Card>
        {requestsError ? (
          <div style={{ textAlign: 'center', padding: 24, color: '#ff4d4f' }}>
            Не вдалося завантажити запити. Спробуйте оновити сторінку.
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={requests}
            rowKey="id"
            size="middle"
            loading={requestsLoading}
            pagination={{
              current: page,
              pageSize,
              total: totalRequests,
              showTotal: (t) => `Всього: ${t}`,
              onChange: (p) => setPage(p),
            }}
          />
        )}
      </Card>

      {/* Detail modal */}
      <Modal
        title="Деталі запиту"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={750}
        style={{ top: 20 }}
        styles={{ body: { maxHeight: 'calc(100vh - 160px)', overflowY: 'auto', overflowX: 'hidden' } }}
      >
        {selectedRequest && (
          <>
            <Descriptions bordered column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="ID">{selectedRequest.id}</Descriptions.Item>
              <Descriptions.Item label="Назва">{selectedRequest.title}</Descriptions.Item>
              <Descriptions.Item label="Тип">
                {typeMap[selectedRequest.request_type] ? (
                  <Tag color={typeMap[selectedRequest.request_type].color}>
                    {typeMap[selectedRequest.request_type].label}
                  </Tag>
                ) : selectedRequest.request_type}
              </Descriptions.Item>
              <Descriptions.Item label="Статус">
                <Badge
                  status={selectedRequest.status === 'open' ? 'processing' : 'default'}
                  text={statusMap[selectedRequest.status]?.label ?? selectedRequest.status}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Виконавець">{selectedRequest.assignee_name || '—'}</Descriptions.Item>
              <Descriptions.Item label="Замовлення">{selectedRequest.order_title || '—'}</Descriptions.Item>
              <Descriptions.Item label="Контракт">{selectedRequest.contract_number || '—'}</Descriptions.Item>
              <Descriptions.Item label="Дедлайн">
                {selectedRequest.deadline
                  ? new Date(selectedRequest.deadline).toLocaleDateString('uk-UA')
                  : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Автор">{selectedRequest.created_by_name || '—'}</Descriptions.Item>
              <Descriptions.Item label="Створено">
                {new Date(selectedRequest.created_at).toLocaleDateString('uk-UA')}
              </Descriptions.Item>
              {selectedRequest.description && (
                <Descriptions.Item label="Опис" span={2}>{selectedRequest.description}</Descriptions.Item>
              )}
            </Descriptions>

            {selectedRequest.responses && selectedRequest.responses.length > 0 && (
              <>
                <Title level={5}>Відповіді ({selectedRequest.responses.length})</Title>
                <List
                  dataSource={selectedRequest.responses}
                  renderItem={(resp: RequestResponse) => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <Space>
                            <Text strong>{resp.created_by_name || 'Невідомий'}</Text>
                            <Text type="secondary">
                              {new Date(resp.created_at).toLocaleString('uk-UA')}
                            </Text>
                          </Space>
                        }
                        description={resp.response_text}
                      />
                    </List.Item>
                  )}
                />
              </>
            )}
          </>
        )}
      </Modal>

      {/* Create / Edit modal */}
      <Modal
        title={editingRequest ? 'Редагувати запит' : 'Новий запит'}
        open={formOpen}
        onCancel={closeForm}
        onOk={handleFormSubmit}
        okText={editingRequest ? 'Зберегти' : 'Створити'}
        cancelText="Скасувати"
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={600}
        destroyOnHidden
        style={{ top: 20 }}
        styles={{ body: { maxHeight: 'calc(100vh - 160px)', overflowY: 'auto', overflowX: 'hidden' } }}
      >
        <Spin spinning={createMutation.isPending || updateMutation.isPending}>
          <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
            <Form.Item name="title" label="Назва" rules={[{ required: true, message: 'Введіть назву запиту' }]}>
              <Input placeholder="Назва запиту" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="request_type" label="Тип" rules={[{ required: true, message: 'Оберіть тип' }]}>
                  <Select placeholder="Тип" options={Object.entries(typeMap).map(([k, v]) => ({ value: k, label: v.label }))} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="status" label="Статус" initialValue="open">
                  <Select options={Object.entries(statusMap).map(([k, v]) => ({ value: k, label: v.label }))} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="deadline" label="Дедлайн">
                  <DatePicker style={{ width: '100%' }} placeholder="Дата" format="DD.MM.YYYY" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="assignee" label="Виконавець">
                  <Select placeholder="Виконавець" allowClear showSearch optionFilterProp="label"
                    options={users.map(u => ({ value: u.id, label: `${u.last_name} ${u.first_name}`.trim() || u.username }))} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="order" label="Замовлення">
                  <Select placeholder="Замовлення" allowClear showSearch optionFilterProp="label"
                    options={orders.map(o => ({ value: o.id, label: o.title }))} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="contract" label="Контракт">
              <Select placeholder="Контракт" allowClear showSearch optionFilterProp="label"
                options={contracts.map(c => ({ value: c.id, label: c.contract_number }))} />
            </Form.Item>

            <Form.Item name="description" label="Опис" style={{ marginBottom: 0 }}>
              <Input.TextArea rows={2} placeholder="Опис запиту" />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>

      {/* Add response modal */}
      <Modal
        title={`Додати відповідь: ${responseRequest?.title ?? ''}`}
        open={responseOpen}
        onCancel={closeResponseModal}
        onOk={handleResponseSubmit}
        okText="Додати"
        cancelText="Скасувати"
        confirmLoading={addResponseMutation.isPending}
        width={500}
        destroyOnHidden
        style={{ top: 20 }}
      >
        <Spin spinning={addResponseMutation.isPending}>
          <Form form={responseForm} layout="vertical">
            <Form.Item
              name="response_text"
              label="Текст відповіді"
              rules={[{ required: true, message: 'Введіть текст відповіді' }]}
            >
              <Input.TextArea rows={4} placeholder="Введіть відповідь на запит..." />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  )
}

export default RequestsPage
