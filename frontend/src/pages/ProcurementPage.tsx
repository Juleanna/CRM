import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import {
  Table, Tag, Button, Card, Typography, Row, Col, Input, Select, Statistic,
  Tabs, Modal, Form, Space, message, Popconfirm, DatePicker, InputNumber,
} from 'antd'
import {
  PlusOutlined, SearchOutlined, ShoppingCartOutlined, CalendarOutlined,
  EditOutlined, DeleteOutlined,
} from '@ant-design/icons'
import {
  getPurchases, createPurchase, updatePurchase, deletePurchase,
  getSuppliers, createSupplier, updateSupplier, deleteSupplier,
  getDeliverySchedules,
} from '../api/procurement'
import dayjs from 'dayjs'

const { Title } = Typography

const purchaseStatus: Record<string, { color: string; label: string }> = {
  new: { color: 'blue', label: 'Нове' },
  confirmed: { color: 'cyan', label: 'Підтверджено' },
  in_transit: { color: 'orange', label: 'В транзиті' },
  received: { color: 'green', label: 'Отримано' },
  delayed: { color: 'red', label: 'Затримується' },
}

const paymentStatusMap: Record<string, { color: string; label: string }> = {
  paid: { color: 'green', label: 'Оплачено' },
  partially_paid: { color: 'orange', label: 'Частково оплачено' },
  not_paid: { color: 'red', label: 'Не оплачено' },
}

const supplierCategoryMap: Record<string, { label: string; color: string }> = {
  manufacturer: { label: 'Виробник', color: 'blue' },
  retailer: { label: 'Рітейлер', color: 'orange' },
  both: { label: 'Виробник і рітейлер', color: 'green' },
}

const deliveryStatusMap: Record<string, { color: string; label: string }> = {
  pending: { color: 'blue', label: 'Очікується' },
  in_transit: { color: 'orange', label: 'В транзиті' },
  delivered: { color: 'green', label: 'Доставлено' },
  delayed: { color: 'red', label: 'Затримується' },
}

// ---- Types ----

interface Purchase {
  id: number
  contract: number
  contract_number: string
  supplier: number
  supplier_name: string
  status: string
  total_amount: number | string
  payment_status: string
  expected_delivery_date: string
  items: unknown[]
  created_by_name: string
}

interface Supplier {
  id: number
  company_name: string
  category: string
  location: string
  phone: string
  email: string
  contact_person: string
  work_schedule?: string
}

interface DeliverySchedule {
  id: number
  contract_number: string
  material_name: string
  supplier_name: string
  expected_date: string
  actual_date: string | null
  status: string
}

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// ---- Component ----

function ProcurementPage() {
  const queryClient = useQueryClient()
  const { hasPermission } = useAuthStore()
  const canCreate = hasPermission('procurement', 'can_create')
  const canEdit = hasPermission('procurement', 'can_edit')
  const canDelete = hasPermission('procurement', 'can_delete')

  // Filters
  const [purchaseSearch, setPurchaseSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [paymentFilter, setPaymentFilter] = useState<string | undefined>(undefined)
  const [supplierSearch, setSupplierSearch] = useState('')

  // Pagination
  const [purchasePage, setPurchasePage] = useState(1)
  const [supplierPage, setSupplierPage] = useState(1)

  // Modals
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false)
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null)
  const [supplierModalOpen, setSupplierModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)

  const [purchaseForm] = Form.useForm()
  const [supplierForm] = Form.useForm()

  // ---- Queries ----

  const { data: purchasesData, isLoading: purchasesLoading } = useQuery<PaginatedResponse<Purchase>>({
    queryKey: ['purchases', purchasePage, purchaseSearch, statusFilter, paymentFilter],
    queryFn: () =>
      getPurchases({
        page: purchasePage,
        search: purchaseSearch || undefined,
        status: statusFilter,
        payment_status: paymentFilter,
      }).then(res => res.data),
  })

  const { data: suppliersData, isLoading: suppliersLoading } = useQuery<PaginatedResponse<Supplier>>({
    queryKey: ['suppliers', supplierPage, supplierSearch],
    queryFn: () =>
      getSuppliers({
        page: supplierPage,
        search: supplierSearch || undefined,
      }).then(res => res.data),
  })

  const { data: deliveriesData } = useQuery<PaginatedResponse<DeliverySchedule>>({
    queryKey: ['deliverySchedules'],
    queryFn: () => getDeliverySchedules().then(res => res.data),
  })

  // Also fetch all suppliers for the purchase form dropdown
  const { data: allSuppliersData } = useQuery<PaginatedResponse<Supplier>>({
    queryKey: ['suppliers', 'all'],
    queryFn: () => getSuppliers({ page_size: 1000 }).then(res => res.data),
  })

  const purchases = purchasesData?.results ?? []
  const suppliers = suppliersData?.results ?? []
  const deliveries = deliveriesData?.results ?? []
  const allSuppliers = allSuppliersData?.results ?? []

  // ---- Mutations ----

  const createPurchaseMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => createPurchase(data),
    onSuccess: () => {
      message.success('Закупівлю створено')
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
      setPurchaseModalOpen(false)
      purchaseForm.resetFields()
    },
    onError: () => message.error('Помилка створення закупівлі'),
  })

  const updatePurchaseMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => updatePurchase(id, data),
    onSuccess: () => {
      message.success('Закупівлю оновлено')
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
      setPurchaseModalOpen(false)
      setEditingPurchase(null)
      purchaseForm.resetFields()
    },
    onError: () => message.error('Помилка оновлення закупівлі'),
  })

  const deletePurchaseMutation = useMutation({
    mutationFn: (id: number) => deletePurchase(id),
    onSuccess: () => {
      message.success('Закупівлю видалено')
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
    },
    onError: () => message.error('Помилка видалення закупівлі'),
  })

  const createSupplierMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => createSupplier(data),
    onSuccess: () => {
      message.success('Постачальника створено')
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      setSupplierModalOpen(false)
      supplierForm.resetFields()
    },
    onError: () => message.error('Помилка створення постачальника'),
  })

  const updateSupplierMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => updateSupplier(id, data),
    onSuccess: () => {
      message.success('Постачальника оновлено')
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      setSupplierModalOpen(false)
      setEditingSupplier(null)
      supplierForm.resetFields()
    },
    onError: () => message.error('Помилка оновлення постачальника'),
  })

  const deleteSupplierMutation = useMutation({
    mutationFn: (id: number) => deleteSupplier(id),
    onSuccess: () => {
      message.success('Постачальника видалено')
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    },
    onError: () => message.error('Помилка видалення постачальника'),
  })

  // ---- Stats ----

  const totalAmount = purchases.reduce((s, p) => s + Number(p.total_amount || 0), 0)
  const inTransitCount = purchases.filter(p => p.status === 'in_transit').length
  const delayedCount = purchases.filter(p => p.status === 'delayed').length

  // ---- Purchase Modal Handlers ----

  const openCreatePurchase = () => {
    setEditingPurchase(null)
    purchaseForm.resetFields()
    setPurchaseModalOpen(true)
  }

  const openEditPurchase = (record: Purchase) => {
    setEditingPurchase(record)
    purchaseForm.setFieldsValue({
      ...record,
      expected_delivery_date: record.expected_delivery_date ? dayjs(record.expected_delivery_date) : undefined,
      total_amount: Number(record.total_amount),
    })
    setPurchaseModalOpen(true)
  }

  const handleSavePurchase = async () => {
    try {
      const values = await purchaseForm.validateFields()
      const data = {
        ...values,
        expected_delivery_date: values.expected_delivery_date
          ? values.expected_delivery_date.format('YYYY-MM-DD')
          : undefined,
      }
      if (editingPurchase) {
        updatePurchaseMutation.mutate({ id: editingPurchase.id, data })
      } else {
        createPurchaseMutation.mutate(data)
      }
    } catch {
      // validation errors
    }
  }

  // ---- Supplier Modal Handlers ----

  const openCreateSupplier = () => {
    setEditingSupplier(null)
    supplierForm.resetFields()
    setSupplierModalOpen(true)
  }

  const openEditSupplier = (record: Supplier) => {
    setEditingSupplier(record)
    supplierForm.setFieldsValue(record)
    setSupplierModalOpen(true)
  }

  const handleSaveSupplier = async () => {
    try {
      const values = await supplierForm.validateFields()
      if (editingSupplier) {
        updateSupplierMutation.mutate({ id: editingSupplier.id, data: values })
      } else {
        createSupplierMutation.mutate(values)
      }
    } catch {
      // validation errors
    }
  }

  // ---- Columns ----

  const purchaseColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70 },
    { title: 'Договір', dataIndex: 'contract_number', key: 'contract_number', width: 130 },
    { title: 'Постачальник', dataIndex: 'supplier_name', key: 'supplier_name' },
    {
      title: 'Статус', dataIndex: 'status', key: 'status', width: 130,
      render: (s: string) => {
        const st = purchaseStatus[s]
        return st ? <Tag color={st.color}>{st.label}</Tag> : s
      },
    },
    {
      title: 'Сума', dataIndex: 'total_amount', key: 'total_amount', width: 130,
      render: (v: number | string) => `${Number(v).toLocaleString()} грн`,
    },
    {
      title: 'Оплата', dataIndex: 'payment_status', key: 'payment_status', width: 140,
      render: (p: string) => {
        const ps = paymentStatusMap[p]
        return ps ? <Tag color={ps.color}>{ps.label}</Tag> : <Tag>{p}</Tag>
      },
    },
    { title: 'Дата доставки', dataIndex: 'expected_delivery_date', key: 'expected_delivery_date', width: 130 },
    {
      title: 'Дії', key: 'actions', width: 100,
      render: (_: unknown, record: Purchase) => (
        <Space>
          {canEdit && <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditPurchase(record)} />}
          {canDelete && <Popconfirm title="Видалити закупівлю?" onConfirm={() => deletePurchaseMutation.mutate(record.id)} okText="Так" cancelText="Ні">
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>}
        </Space>
      ),
    },
  ]

  const supplierColumns = [
    {
      title: 'Назва', dataIndex: 'company_name', key: 'company_name',
      sorter: (a: Supplier, b: Supplier) => a.company_name.localeCompare(b.company_name),
    },
    {
      title: 'Категорія', dataIndex: 'category', key: 'category', width: 160,
      render: (c: string) => {
        const cat = supplierCategoryMap[c]
        return cat ? <Tag color={cat.color}>{cat.label}</Tag> : <Tag>{c}</Tag>
      },
    },
    { title: 'Локація', dataIndex: 'location', key: 'location', width: 130 },
    { title: 'Телефон', dataIndex: 'phone', key: 'phone', width: 160 },
    { title: 'Email', dataIndex: 'email', key: 'email', width: 180 },
    { title: 'Контактна особа', dataIndex: 'contact_person', key: 'contact_person', width: 160 },
    {
      title: 'Дії', key: 'actions', width: 100,
      render: (_: unknown, record: Supplier) => (
        <Space>
          {canEdit && <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditSupplier(record)} />}
          {canDelete && <Popconfirm title="Видалити постачальника?" onConfirm={() => deleteSupplierMutation.mutate(record.id)} okText="Так" cancelText="Ні">
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>}
        </Space>
      ),
    },
  ]

  const deliveryColumns = [
    { title: 'Договір', dataIndex: 'contract_number', key: 'contract_number', width: 130 },
    { title: 'Матеріал', dataIndex: 'material_name', key: 'material_name' },
    { title: 'Постачальник', dataIndex: 'supplier_name', key: 'supplier_name' },
    { title: 'Очікувана дата', dataIndex: 'expected_date', key: 'expected_date', width: 130 },
    { title: 'Фактична дата', dataIndex: 'actual_date', key: 'actual_date', width: 130, render: (v: string | null) => v || '—' },
    {
      title: 'Статус', dataIndex: 'status', key: 'status', width: 130,
      render: (s: string) => {
        const st = deliveryStatusMap[s]
        return st ? <Tag color={st.color}>{st.label}</Tag> : <Tag>{s}</Tag>
      },
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Закупівлі</Title>
        {canCreate && <Button type="primary" icon={<PlusOutlined />} onClick={openCreatePurchase}>Нова закупівля</Button>}
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card><Statistic title="Всього закупівель" value={purchasesData?.count ?? 0} prefix={<ShoppingCartOutlined />} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="Загальна сума" value={totalAmount} suffix="грн" /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="В транзиті" value={inTransitCount} valueStyle={{ color: '#fa8c16' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="Затримується" value={delayedCount} valueStyle={{ color: '#f5222d' }} /></Card>
        </Col>
      </Row>

      <Card>
        <Tabs items={[
          {
            key: 'purchases',
            label: <span><ShoppingCartOutlined /> Закупівлі</span>,
            children: (
              <>
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={8}>
                    <Input
                      placeholder="Пошук..."
                      prefix={<SearchOutlined />}
                      allowClear
                      value={purchaseSearch}
                      onChange={e => { setPurchaseSearch(e.target.value); setPurchasePage(1) }}
                    />
                  </Col>
                  <Col span={4}>
                    <Select
                      placeholder="Статус"
                      allowClear
                      style={{ width: '100%' }}
                      value={statusFilter}
                      onChange={v => { setStatusFilter(v); setPurchasePage(1) }}
                      options={Object.entries(purchaseStatus).map(([k, v]) => ({ value: k, label: v.label }))}
                    />
                  </Col>
                  <Col span={4}>
                    <Select
                      placeholder="Оплата"
                      allowClear
                      style={{ width: '100%' }}
                      value={paymentFilter}
                      onChange={v => { setPaymentFilter(v); setPurchasePage(1) }}
                      options={Object.entries(paymentStatusMap).map(([k, v]) => ({ value: k, label: v.label }))}
                    />
                  </Col>
                </Row>
                <Table
                  columns={purchaseColumns}
                  dataSource={purchases}
                  rowKey="id"
                  size="middle"
                  loading={purchasesLoading}
                  pagination={{
                    current: purchasePage,
                    total: purchasesData?.count ?? 0,
                    onChange: (page) => setPurchasePage(page),
                    showTotal: (t) => `Всього: ${t}`,
                  }}
                />
              </>
            ),
          },
          {
            key: 'suppliers',
            label: 'Постачальники',
            children: (
              <>
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={8}>
                    <Input
                      placeholder="Пошук постачальника..."
                      prefix={<SearchOutlined />}
                      allowClear
                      value={supplierSearch}
                      onChange={e => { setSupplierSearch(e.target.value); setSupplierPage(1) }}
                    />
                  </Col>
                  <Col flex="auto" style={{ textAlign: 'right' }}>
                    {canCreate && <Button type="primary" icon={<PlusOutlined />} onClick={openCreateSupplier}>
                      Додати постачальника
                    </Button>}
                  </Col>
                </Row>
                <Table
                  columns={supplierColumns}
                  dataSource={suppliers}
                  rowKey="id"
                  size="middle"
                  loading={suppliersLoading}
                  pagination={{
                    current: supplierPage,
                    total: suppliersData?.count ?? 0,
                    onChange: (page) => setSupplierPage(page),
                    showTotal: (t) => `Всього: ${t}`,
                  }}
                />
              </>
            ),
          },
          {
            key: 'calendar',
            label: <span><CalendarOutlined /> Календар поставок</span>,
            children: (
              <Table
                columns={deliveryColumns}
                dataSource={deliveries}
                rowKey="id"
                size="middle"
                pagination={{ showTotal: (t) => `Всього: ${t}` }}
              />
            ),
          },
        ]} />
      </Card>

      {/* Purchase Modal */}
      <Modal
        title={editingPurchase ? 'Редагувати закупівлю' : 'Нова закупівля'}
        open={purchaseModalOpen}
        onCancel={() => { setPurchaseModalOpen(false); setEditingPurchase(null); purchaseForm.resetFields() }}
        onOk={handleSavePurchase}
        okText="Зберегти"
        cancelText="Скасувати"
        confirmLoading={createPurchaseMutation.isPending || updatePurchaseMutation.isPending}
        destroyOnHidden
        style={{ top: 20 }}
        styles={{ body: { maxHeight: 'calc(100vh - 160px)', overflowY: 'auto', overflowX: 'hidden' } }}
      >
        <Form form={purchaseForm} layout="vertical" style={{ marginTop: 8 }}>
          <Row gutter={16}>
            <Col span={14}>
              <Form.Item name="supplier" label="Постачальник" rules={[{ required: true, message: 'Оберіть постачальника' }]}>
                <Select placeholder="Постачальник" showSearch optionFilterProp="label"
                  options={allSuppliers.map(s => ({ value: s.id, label: s.company_name }))} />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="contract_number" label="Номер договору">
                <Input placeholder="ДГ-2024-001" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="status" label="Статус" rules={[{ required: true, message: 'Оберіть статус' }]}>
                <Select placeholder="Статус" options={Object.entries(purchaseStatus).map(([k, v]) => ({ value: k, label: v.label }))} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="payment_status" label="Оплата">
                <Select placeholder="Оплата" options={Object.entries(paymentStatusMap).map(([k, v]) => ({ value: k, label: v.label }))} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="total_amount" label="Сума (грн)">
                <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="expected_delivery_date" label="Очікувана дата доставки" style={{ marginBottom: 0 }}>
            <DatePicker style={{ width: '100%' }} placeholder="Оберіть дату" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Supplier Modal */}
      <Modal
        title={editingSupplier ? 'Редагувати постачальника' : 'Новий постачальник'}
        open={supplierModalOpen}
        onCancel={() => { setSupplierModalOpen(false); setEditingSupplier(null); supplierForm.resetFields() }}
        onOk={handleSaveSupplier}
        okText="Зберегти"
        cancelText="Скасувати"
        confirmLoading={createSupplierMutation.isPending || updateSupplierMutation.isPending}
        destroyOnHidden
        style={{ top: 20 }}
        styles={{ body: { maxHeight: 'calc(100vh - 160px)', overflowY: 'auto', overflowX: 'hidden' } }}
      >
        <Form form={supplierForm} layout="vertical" style={{ marginTop: 8 }}>
          <Row gutter={16}>
            <Col span={14}>
              <Form.Item name="company_name" label="Назва підприємства" rules={[{ required: true, message: "Обов'язкове поле" }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="category" label="Категорія" rules={[{ required: true, message: 'Оберіть категорію' }]}>
                <Select placeholder="Категорія" options={Object.entries(supplierCategoryMap).map(([k, v]) => ({ value: k, label: v.label }))} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="Телефон">
                <Input placeholder="+380 44 123-45-67" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email">
                <Input type="email" placeholder="info@example.ua" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="contact_person" label="Контактна особа">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="location" label="Локація">
                <Input placeholder="м. Київ" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="work_schedule" label="Графік роботи" style={{ marginBottom: 0 }}>
            <Input placeholder="Пн-Пт 9:00-18:00" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ProcurementPage
