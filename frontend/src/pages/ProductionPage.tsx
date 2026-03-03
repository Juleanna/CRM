import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Table, Tag, Card, Typography, Row, Col, Statistic, Progress, List, Button,
  Modal, Form, Input, Select, Space, message, Popconfirm, DatePicker, InputNumber, Checkbox,
} from 'antd'
import { PlusOutlined, ToolOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { getFinishedProducts, createFinishedProduct, updateFinishedProduct, deleteFinishedProduct } from '../api/production'
import { useAuthStore } from '../store/authStore'
import dayjs from 'dayjs'

const { Title } = Typography

// ---- Types ----

interface FinishedProduct {
  id: number
  contract_number: string
  name: string
  category: string
  product_type: string
  quantity: number
  department_name: string
  production_date: string
  transferred_to_main: boolean
}

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// ---- Component ----

function ProductionPage() {
  const { hasPermission } = useAuthStore()
  const canCreate = hasPermission('production', 'can_create')
  const canEdit = hasPermission('production', 'can_edit')
  const canDelete = hasPermission('production', 'can_delete')

  const queryClient = useQueryClient()

  // Filters
  const [contractFilter, setContractFilter] = useState<string | undefined>(undefined)
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined)
  const [departmentFilter, setDepartmentFilter] = useState<string | undefined>(undefined)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  // Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<FinishedProduct | null>(null)
  const [form] = Form.useForm()

  // ---- Query ----

  const { data: productsData, isLoading } = useQuery<PaginatedResponse<FinishedProduct>>({
    queryKey: ['finishedProducts', page, search, contractFilter, categoryFilter, departmentFilter],
    queryFn: () =>
      getFinishedProducts({
        page,
        search: search || undefined,
        contract_number: contractFilter,
        category: categoryFilter,
        department_name: departmentFilter,
      }).then(res => res.data),
  })

  const products = productsData?.results ?? []

  // ---- Mutations ----

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => createFinishedProduct(data),
    onSuccess: () => {
      message.success('Звіт створено')
      queryClient.invalidateQueries({ queryKey: ['finishedProducts'] })
      setModalOpen(false)
      form.resetFields()
    },
    onError: () => message.error('Помилка створення звіту'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => updateFinishedProduct(id, data),
    onSuccess: () => {
      message.success('Звіт оновлено')
      queryClient.invalidateQueries({ queryKey: ['finishedProducts'] })
      setModalOpen(false)
      setEditingProduct(null)
      form.resetFields()
    },
    onError: () => message.error('Помилка оновлення звіту'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteFinishedProduct(id),
    onSuccess: () => {
      message.success('Звіт видалено')
      queryClient.invalidateQueries({ queryKey: ['finishedProducts'] })
    },
    onError: () => message.error('Помилка видалення звіту'),
  })

  // ---- Computed stats ----

  const todayStr = dayjs().format('YYYY-MM-DD')

  const todayTotal = useMemo(
    () => products.filter(p => p.production_date === todayStr).reduce((s, p) => s + p.quantity, 0),
    [products, todayStr],
  )

  const departmentSummary = useMemo(() => {
    const map: Record<string, { today: number; total: number }> = {}
    for (const p of products) {
      if (!map[p.department_name]) {
        map[p.department_name] = { today: 0, total: 0 }
      }
      map[p.department_name].total += p.quantity
      if (p.production_date === todayStr) {
        map[p.department_name].today += p.quantity
      }
    }
    return Object.entries(map).map(([department, data]) => ({ department, ...data }))
  }, [products, todayStr])

  const uniqueContracts = useMemo(
    () => [...new Set(products.map(p => p.contract_number).filter(Boolean))],
    [products],
  )
  const uniqueCategories = useMemo(
    () => [...new Set(products.map(p => p.category).filter(Boolean))],
    [products],
  )
  const uniqueDepartments = useMemo(
    () => [...new Set(products.map(p => p.department_name).filter(Boolean))],
    [products],
  )

  const maxDailyProduction = useMemo(
    () => Math.max(...departmentSummary.map(d => d.today), 1),
    [departmentSummary],
  )

  // ---- Modal handlers ----

  const openCreate = () => {
    setEditingProduct(null)
    form.resetFields()
    setModalOpen(true)
  }

  const openEdit = (record: FinishedProduct) => {
    setEditingProduct(record)
    form.setFieldsValue({
      ...record,
      production_date: record.production_date ? dayjs(record.production_date) : undefined,
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      const data = {
        ...values,
        production_date: values.production_date ? values.production_date.format('YYYY-MM-DD') : undefined,
      }
      if (editingProduct) {
        updateMutation.mutate({ id: editingProduct.id, data })
      } else {
        createMutation.mutate(data)
      }
    } catch {
      // validation errors
    }
  }

  // ---- Columns ----

  const columns = [
    { title: 'Договір', dataIndex: 'contract_number', key: 'contract_number', width: 130 },
    { title: 'Виріб', dataIndex: 'name', key: 'name' },
    {
      title: 'Категорія', dataIndex: 'category', key: 'category', width: 120,
      render: (c: string) => <Tag>{c}</Tag>,
    },
    { title: 'Тип', dataIndex: 'product_type', key: 'product_type', width: 100 },
    { title: 'Дата', dataIndex: 'production_date', key: 'production_date', width: 110 },
    { title: 'Кількість', dataIndex: 'quantity', key: 'quantity', width: 100 },
    { title: 'Підрозділ', dataIndex: 'department_name', key: 'department_name', width: 150 },
    {
      title: 'Передано', key: 'transferred_to_main', width: 100,
      render: (_: unknown, r: FinishedProduct) =>
        r.transferred_to_main ? <Tag color="green">Так</Tag> : <Tag color="orange">Ні</Tag>,
    },
    {
      title: 'Дії', key: 'actions', width: 100,
      render: (_: unknown, record: FinishedProduct) => (
        <Space>
          {canEdit && <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />}
          {canDelete && (
            <Popconfirm title="Видалити запис?" onConfirm={() => deleteMutation.mutate(record.id)} okText="Так" cancelText="Ні">
              <Button type="link" size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Виробництво</Title>
        {canCreate && <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Додати звіт</Button>}
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="Виготовлено сьогодні" value={todayTotal} suffix="шт" valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Активних підрозділів" value={departmentSummary.length} prefix={<ToolOutlined />} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Виробництво по підрозділах">
            {departmentSummary.length > 0 ? (
              <List
                size="small"
                dataSource={departmentSummary}
                renderItem={(item) => (
                  <List.Item>
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontWeight: 500 }}>{item.department}</span>
                        <span>{item.today} шт сьогодні / {item.total.toLocaleString()} шт всього</span>
                      </div>
                      <Progress percent={Math.round((item.today / maxDailyProduction) * 100)} size="small" />
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: 20, color: '#8c8c8c' }}>Немає даних</div>
            )}
          </Card>
        </Col>
      </Row>

      <Card title="Готові вироби">
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Input
              placeholder="Пошук..."
              prefix={<SearchOutlined />}
              allowClear
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="Договір"
              allowClear
              style={{ width: '100%' }}
              value={contractFilter}
              onChange={v => { setContractFilter(v); setPage(1) }}
              options={uniqueContracts.map(c => ({ value: c, label: c }))}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="Категорія"
              allowClear
              style={{ width: '100%' }}
              value={categoryFilter}
              onChange={v => { setCategoryFilter(v); setPage(1) }}
              options={uniqueCategories.map(c => ({ value: c, label: c }))}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="Підрозділ"
              allowClear
              style={{ width: '100%' }}
              value={departmentFilter}
              onChange={v => { setDepartmentFilter(v); setPage(1) }}
              options={uniqueDepartments.map(d => ({ value: d, label: d }))}
            />
          </Col>
        </Row>
        <Table
          columns={columns}
          dataSource={products}
          rowKey="id"
          size="middle"
          loading={isLoading}
          pagination={{
            current: page,
            total: productsData?.count ?? 0,
            onChange: (p) => setPage(p),
            showTotal: (t) => `Всього: ${t}`,
          }}
        />
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        title={editingProduct ? 'Редагувати звіт' : 'Новий звіт виробництва'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingProduct(null); form.resetFields() }}
        onOk={handleSave}
        okText="Зберегти"
        cancelText="Скасувати"
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Назва виробу" rules={[{ required: true, message: "Обов'язкове поле" }]}>
            <Input placeholder="Костюм КЛП Ніка" />
          </Form.Item>
          <Form.Item name="contract_number" label="Номер договору">
            <Input placeholder="ДГ-2024-001" />
          </Form.Item>
          <Form.Item name="category" label="Категорія" rules={[{ required: true, message: 'Оберіть категорію' }]}>
            <Input placeholder="Костюм" />
          </Form.Item>
          <Form.Item name="product_type" label="Тип виробу">
            <Select
              placeholder="Оберіть тип"
              options={[
                { value: 'Чоловіче', label: 'Чоловіче' },
                { value: 'Жіноче', label: 'Жіноче' },
                { value: 'Унісекс', label: 'Унісекс' },
              ]}
            />
          </Form.Item>
          <Form.Item name="quantity" label="Кількість" rules={[{ required: true, message: 'Вкажіть кількість' }]}>
            <InputNumber style={{ width: '100%' }} min={1} placeholder="0" />
          </Form.Item>
          <Form.Item name="department_name" label="Підрозділ">
            <Input placeholder="Головний цех" />
          </Form.Item>
          <Form.Item name="production_date" label="Дата виробництва" rules={[{ required: true, message: 'Оберіть дату' }]}>
            <DatePicker style={{ width: '100%' }} placeholder="Оберіть дату" />
          </Form.Item>
          <Form.Item name="transferred_to_main" valuePropName="checked">
            <Checkbox>Передано на головний склад</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ProductionPage
