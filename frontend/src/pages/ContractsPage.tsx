import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Table, Tag, Progress, Button, Card, Typography, Row, Col, Input, Select,
  Statistic, Modal, Form, DatePicker, InputNumber, message, Space, Spin,
} from 'antd'
import { PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons'
import { getContracts, createContract, updateContract, deleteContract } from '../api/contracts'
import dayjs from 'dayjs'

const { Title } = Typography

interface Contract {
  id: number
  order: number | null
  order_title: string
  contract_number: string
  status: string
  start_date: string
  end_date: string
  total_quantity: number
  produced_count: number
}

interface PaginatedResponse {
  count: number
  next: string | null
  previous: string | null
  results: Contract[]
}

const statusMap: Record<string, { color: string; label: string }> = {
  planning: { color: 'blue', label: 'Планування' },
  production: { color: 'green', label: 'Виробництво' },
  completed: { color: 'default', label: 'Завершений' },
  frozen: { color: 'red', label: 'Заморожений' },
}

function ContractsPage() {
  const { hasPermission } = useAuthStore()
  const canCreate = hasPermission('contracts', 'can_create')
  const canEdit = hasPermission('contracts', 'can_edit')
  const canDelete = hasPermission('contracts', 'can_delete')

  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingContract, setEditingContract] = useState<Contract | null>(null)
  const [form] = Form.useForm()

  // --- Queries ---

  const { data, isLoading } = useQuery<PaginatedResponse>({
    queryKey: ['contracts', { search, status: statusFilter, page, pageSize }],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, page_size: pageSize }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      const res = await getContracts(params)
      return res.data
    },
  })

  const contracts = data?.results ?? []
  const totalCount = data?.count ?? 0

  // --- Mutations ---

  const createMutation = useMutation({
    mutationFn: (values: Record<string, unknown>) => createContract(values),
    onSuccess: () => {
      message.success('Договір створено')
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      closeModal()
    },
    onError: () => {
      message.error('Помилка створення договору')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: Record<string, unknown> }) =>
      updateContract(id, values),
    onSuccess: () => {
      message.success('Договір оновлено')
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      closeModal()
    },
    onError: () => {
      message.error('Помилка оновлення договору')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteContract(id),
    onSuccess: () => {
      message.success('Договір видалено')
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
    },
    onError: () => {
      message.error('Помилка видалення договору')
    },
  })

  // --- Handlers ---

  const openCreateModal = () => {
    setEditingContract(null)
    form.resetFields()
    setModalOpen(true)
  }

  const openEditModal = (contract: Contract) => {
    setEditingContract(contract)
    form.setFieldsValue({
      contract_number: contract.contract_number,
      status: contract.status,
      total_quantity: contract.total_quantity,
      start_date: contract.start_date ? dayjs(contract.start_date) : null,
      end_date: contract.end_date ? dayjs(contract.end_date) : null,
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingContract(null)
    form.resetFields()
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const payload: Record<string, unknown> = {
        ...values,
        start_date: values.start_date ? values.start_date.format('YYYY-MM-DD') : null,
        end_date: values.end_date ? values.end_date.format('YYYY-MM-DD') : null,
      }

      if (editingContract) {
        updateMutation.mutate({ id: editingContract.id, values: payload })
      } else {
        createMutation.mutate(payload)
      }
    } catch {
      // form validation failed
    }
  }

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Видалити договір?',
      content: 'Ви впевнені, що хочете видалити цей договір? Цю дію неможливо скасувати.',
      okText: 'Видалити',
      okType: 'danger',
      cancelText: 'Скасувати',
      onOk: () => deleteMutation.mutate(id),
    })
  }

  // --- Stats ---

  const totalContracts = totalCount
  const inProduction = contracts.filter((c) => c.status === 'production').length
  const totalQuantity = contracts.reduce((sum, c) => sum + (c.total_quantity || 0), 0)
  const totalProduced = contracts.reduce((sum, c) => sum + (c.produced_count || 0), 0)

  // --- Columns ---

  const columns = [
    {
      title: 'Номер договору',
      dataIndex: 'contract_number',
      key: 'contract_number',
      width: 150,
    },
    {
      title: 'Замовлення',
      dataIndex: 'order_title',
      key: 'order_title',
      ellipsis: true,
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (s: string) => {
        const st = statusMap[s]
        return st ? <Tag color={st.color}>{st.label}</Tag> : s
      },
    },
    {
      title: 'Прогрес',
      key: 'progress',
      width: 200,
      render: (_: unknown, r: Contract) => {
        const pct = r.total_quantity > 0
          ? Math.round((r.produced_count / r.total_quantity) * 100)
          : 0
        return <Progress percent={pct} size="small" status={pct >= 100 ? 'success' : 'active'} />
      },
    },
    {
      title: 'Виготовлено',
      key: 'produced',
      width: 160,
      render: (_: unknown, r: Contract) =>
        `${(r.produced_count || 0).toLocaleString()} / ${(r.total_quantity || 0).toLocaleString()} шт`,
    },
    {
      title: 'Початок',
      dataIndex: 'start_date',
      key: 'start_date',
      width: 110,
    },
    {
      title: 'Кінцевий термін',
      dataIndex: 'end_date',
      key: 'end_date',
      width: 130,
    },
    {
      title: 'Дії',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: Contract) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => openEditModal(record)} />
          {canEdit && <Button type="link" icon={<EditOutlined />} onClick={() => openEditModal(record)} />}
          {canDelete && (
            <Button type="link" danger onClick={() => handleDelete(record.id)}>
              X
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Актуальні договори</Title>
        {canCreate && (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            Новий договір
          </Button>
        )}
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="Всього договорів" value={totalContracts} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="В виробництві"
              value={inProduction}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Замовлено виробів" value={totalQuantity} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Виготовлено"
              value={totalProduced}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={10}>
            <Input
              placeholder="Пошук за номером, замовленням..."
              prefix={<SearchOutlined />}
              allowClear
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="Статус"
              allowClear
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val)
                setPage(1)
              }}
              options={Object.entries(statusMap).map(([k, v]) => ({
                value: k,
                label: v.label,
              }))}
            />
          </Col>
        </Row>
      </Card>

      <Card>
        <Spin spinning={isLoading}>
          <Table
            columns={columns}
            dataSource={contracts}
            rowKey="id"
            pagination={{
              current: page,
              pageSize,
              total: totalCount,
              showTotal: (t) => `Всього: ${t}`,
              onChange: (p, ps) => {
                setPage(p)
                setPageSize(ps)
              },
            }}
          />
        </Spin>
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        title={editingContract ? 'Редагувати договір' : 'Новий договір'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText={editingContract ? 'Зберегти' : 'Створити'}
        cancelText="Скасувати"
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        style={{ top: 20 }}
        styles={{ body: { maxHeight: 'calc(100vh - 160px)', overflowY: 'auto', overflowX: 'hidden' } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="contract_number" label="Номер договору" rules={[{ required: true, message: 'Введіть номер' }]}>
                <Input placeholder="ДГ-2024-001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Статус" rules={[{ required: true, message: 'Оберіть статус' }]}>
                <Select placeholder="Статус" options={Object.entries(statusMap).map(([k, v]) => ({ value: k, label: v.label }))} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="total_quantity" label="Кількість">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="start_date" label="Дата початку">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="end_date" label="Кінцевий термін">
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}

export default ContractsPage
