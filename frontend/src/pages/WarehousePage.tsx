import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import {
  Table, Tabs, Tag, Button, Space, Card, Typography, Row, Col, Input, Select,
  Statistic, Modal, Form, InputNumber, message, Spin,
} from 'antd'
import {
  PlusOutlined, SearchOutlined, SwapOutlined, ImportOutlined, ExportOutlined,
  DatabaseOutlined, DownloadOutlined, CheckOutlined,
} from '@ant-design/icons'
import {
  getMaterials, createMaterial, updateMaterial, deleteMaterial,
  getPatterns, createPattern,
  getMaterialTransfers, createMaterialTransfer, acceptMaterialTransfer,
  getWarehouses,
} from '../api/warehouse'

const { Title } = Typography

// --- Types ---

interface Material {
  id: number
  article: string
  name: string
  material_type: string
  category: string
  color: string
  quantity: number
  unit: string
  price_per_unit: number
  warehouse_name: string
  supplier_name: string
  is_available: boolean
}

interface Pattern {
  id: number
  name: string
  category: string
  pattern_type: string
  article: string
  size_range: string
  file: string | null
}

interface MaterialTransfer {
  id: number
  from_warehouse_name: string
  to_warehouse_name: string
  material_name: string
  quantity: number
  date: string
  is_accepted: boolean
  created_by_name: string
  accepted_by_name: string | null
}

interface Warehouse {
  id: number
  name: string
}

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

function WarehousePage() {
  const queryClient = useQueryClient()
  const { hasPermission } = useAuthStore()
  const canCreate = hasPermission('warehouse', 'can_create')
  const canEdit = hasPermission('warehouse', 'can_edit')
  const canDelete = hasPermission('warehouse', 'can_delete')

  // --- Materials state ---
  const [matSearch, setMatSearch] = useState('')
  const [matCategory, setMatCategory] = useState<string | undefined>(undefined)
  const [matWarehouse, setMatWarehouse] = useState<string | undefined>(undefined)
  const [matPage, setMatPage] = useState(1)
  const [matPageSize, setMatPageSize] = useState(10)
  const [matModalOpen, setMatModalOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [matForm] = Form.useForm()

  // --- Patterns state ---
  const [patPage, setPatPage] = useState(1)
  const [patPageSize, setPatPageSize] = useState(10)
  const [patModalOpen, setPatModalOpen] = useState(false)
  const [patForm] = Form.useForm()

  // --- Transfers state ---
  const [trPage, setTrPage] = useState(1)
  const [trPageSize, setTrPageSize] = useState(10)
  const [trModalOpen, setTrModalOpen] = useState(false)
  const [trForm] = Form.useForm()

  // ===================
  //  QUERIES
  // ===================

  const { data: matData, isLoading: matLoading } = useQuery<PaginatedResponse<Material>>({
    queryKey: ['materials', { search: matSearch, category: matCategory, warehouse: matWarehouse, page: matPage, pageSize: matPageSize }],
    queryFn: async () => {
      const params: Record<string, unknown> = { page: matPage, page_size: matPageSize }
      if (matSearch) params.search = matSearch
      if (matCategory) params.category = matCategory
      if (matWarehouse) params.warehouse = matWarehouse
      const res = await getMaterials(params)
      return res.data
    },
  })

  const materialsList = matData?.results ?? []
  const materialsTotal = matData?.count ?? 0

  const { data: patData, isLoading: patLoading } = useQuery<PaginatedResponse<Pattern>>({
    queryKey: ['patterns', { page: patPage, pageSize: patPageSize }],
    queryFn: async () => {
      const params: Record<string, unknown> = { page: patPage, page_size: patPageSize }
      const res = await getPatterns(params)
      return res.data
    },
  })

  const patternsList = patData?.results ?? []
  const patternsTotal = patData?.count ?? 0

  const { data: trData, isLoading: trLoading } = useQuery<PaginatedResponse<MaterialTransfer>>({
    queryKey: ['materialTransfers', { page: trPage, pageSize: trPageSize }],
    queryFn: async () => {
      const params: Record<string, unknown> = { page: trPage, page_size: trPageSize }
      const res = await getMaterialTransfers(params)
      return res.data
    },
  })

  const transfersList = trData?.results ?? []
  const transfersTotal = trData?.count ?? 0

  const { data: warehousesData } = useQuery<PaginatedResponse<Warehouse>>({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const res = await getWarehouses()
      return res.data
    },
  })

  const warehousesList = warehousesData?.results ?? []

  // ===================
  //  MUTATIONS
  // ===================

  // --- Material mutations ---

  const createMaterialMut = useMutation({
    mutationFn: (values: Record<string, unknown>) => createMaterial(values),
    onSuccess: () => {
      message.success('Матеріал додано')
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      closeMatModal()
    },
    onError: () => {
      message.error('Помилка додавання матеріалу')
    },
  })

  const updateMaterialMut = useMutation({
    mutationFn: ({ id, values }: { id: number; values: Record<string, unknown> }) =>
      updateMaterial(id, values),
    onSuccess: () => {
      message.success('Матеріал оновлено')
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      closeMatModal()
    },
    onError: () => {
      message.error('Помилка оновлення матеріалу')
    },
  })

  const deleteMaterialMut = useMutation({
    mutationFn: (id: number) => deleteMaterial(id),
    onSuccess: () => {
      message.success('Матеріал видалено')
      queryClient.invalidateQueries({ queryKey: ['materials'] })
    },
    onError: () => {
      message.error('Помилка видалення матеріалу')
    },
  })

  // --- Pattern mutation ---

  const createPatternMut = useMutation({
    mutationFn: (values: Record<string, unknown>) => createPattern(values),
    onSuccess: () => {
      message.success('Лекало додано')
      queryClient.invalidateQueries({ queryKey: ['patterns'] })
      closePatModal()
    },
    onError: () => {
      message.error('Помилка додавання лекала')
    },
  })

  // --- Transfer mutations ---

  const createTransferMut = useMutation({
    mutationFn: (values: Record<string, unknown>) => createMaterialTransfer(values),
    onSuccess: () => {
      message.success('Переміщення створено')
      queryClient.invalidateQueries({ queryKey: ['materialTransfers'] })
      closeTrModal()
    },
    onError: () => {
      message.error('Помилка створення переміщення')
    },
  })

  const acceptTransferMut = useMutation({
    mutationFn: (id: number) => acceptMaterialTransfer(id),
    onSuccess: () => {
      message.success('Переміщення прийнято')
      queryClient.invalidateQueries({ queryKey: ['materialTransfers'] })
    },
    onError: () => {
      message.error('Помилка прийняття переміщення')
    },
  })

  // ===================
  //  MODAL HANDLERS
  // ===================

  // Materials
  const openCreateMatModal = () => {
    setEditingMaterial(null)
    matForm.resetFields()
    setMatModalOpen(true)
  }

  const openEditMatModal = (material: Material) => {
    setEditingMaterial(material)
    matForm.setFieldsValue({
      article: material.article,
      name: material.name,
      material_type: material.material_type,
      category: material.category,
      color: material.color,
      quantity: material.quantity,
      unit: material.unit,
      price_per_unit: material.price_per_unit,
    })
    setMatModalOpen(true)
  }

  const closeMatModal = () => {
    setMatModalOpen(false)
    setEditingMaterial(null)
    matForm.resetFields()
  }

  const handleMatSubmit = async () => {
    try {
      const values = await matForm.validateFields()
      if (editingMaterial) {
        updateMaterialMut.mutate({ id: editingMaterial.id, values })
      } else {
        createMaterialMut.mutate(values)
      }
    } catch {
      // validation failed
    }
  }

  const handleMatDelete = (id: number) => {
    Modal.confirm({
      title: 'Видалити матеріал?',
      content: 'Ви впевнені, що хочете видалити цей матеріал?',
      okText: 'Видалити',
      okType: 'danger',
      cancelText: 'Скасувати',
      onOk: () => deleteMaterialMut.mutate(id),
    })
  }

  // Patterns
  const closePatModal = () => {
    setPatModalOpen(false)
    patForm.resetFields()
  }

  const handlePatSubmit = async () => {
    try {
      const values = await patForm.validateFields()
      createPatternMut.mutate(values)
    } catch {
      // validation failed
    }
  }

  // Transfers
  const closeTrModal = () => {
    setTrModalOpen(false)
    trForm.resetFields()
  }

  const handleTrSubmit = async () => {
    try {
      const values = await trForm.validateFields()
      createTransferMut.mutate(values)
    } catch {
      // validation failed
    }
  }

  // ===================
  //  STATS
  // ===================

  const totalMaterials = materialsTotal
  const outOfStock = materialsList.filter((m) => !m.is_available).length
  const totalValue = materialsList.reduce((sum, m) => sum + (m.price_per_unit || 0) * (m.quantity || 0), 0)

  // ===================
  //  COLUMNS
  // ===================

  const matColumns = [
    { title: 'Артикул', dataIndex: 'article', key: 'article', width: 100 },
    { title: 'Назва', dataIndex: 'name', key: 'name' },
    { title: 'Категорія', dataIndex: 'category', key: 'category', width: 110 },
    { title: 'Колір', dataIndex: 'color', key: 'color', width: 100 },
    {
      title: 'Кількість',
      key: 'qty',
      width: 120,
      render: (_: unknown, r: Material) => (
        <span
          style={{
            color: r.quantity === 0 ? '#f5222d' : undefined,
            fontWeight: r.quantity === 0 ? 600 : undefined,
          }}
        >
          {r.quantity} {r.unit}
        </span>
      ),
    },
    {
      title: 'Ціна/од',
      dataIndex: 'price_per_unit',
      key: 'price_per_unit',
      width: 90,
      render: (p: number) => `${p} грн`,
    },
    { title: 'Склад', dataIndex: 'warehouse_name', key: 'warehouse_name', width: 140 },
    {
      title: 'Наявність',
      key: 'avail',
      width: 100,
      render: (_: unknown, r: Material) =>
        r.is_available ? <Tag color="green">Є</Tag> : <Tag color="red">Немає</Tag>,
    },
    {
      title: 'Дії',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: Material) => (
        <Space>
          {canEdit && <Button type="link" size="small" onClick={() => openEditMatModal(record)}>
            Ред.
          </Button>}
          {canDelete && <Button type="link" size="small" danger onClick={() => handleMatDelete(record.id)}>
            X
          </Button>}
        </Space>
      ),
    },
  ]

  const patColumns = [
    { title: 'Артикул', dataIndex: 'article', key: 'article', width: 100 },
    { title: 'Назва', dataIndex: 'name', key: 'name' },
    { title: 'Категорія', dataIndex: 'category', key: 'category', width: 120 },
    { title: 'Тип', dataIndex: 'pattern_type', key: 'pattern_type', width: 100 },
    { title: 'Розмірний ряд', dataIndex: 'size_range', key: 'size_range', width: 130 },
    {
      title: 'Файл',
      key: 'file',
      width: 100,
      render: (_: unknown, r: Pattern) =>
        r.file ? (
          <a href={r.file} target="_blank" rel="noopener noreferrer">
            <Button type="link" size="small" icon={<DownloadOutlined />}>
              Завантажити
            </Button>
          </a>
        ) : (
          <Tag color="orange">Немає</Tag>
        ),
    },
  ]

  const trColumns = [
    { title: 'Дата', dataIndex: 'date', key: 'date', width: 110 },
    { title: 'Матеріал', dataIndex: 'material_name', key: 'material_name' },
    { title: 'Звідки', dataIndex: 'from_warehouse_name', key: 'from_warehouse_name', width: 150 },
    { title: 'Куди', dataIndex: 'to_warehouse_name', key: 'to_warehouse_name', width: 150 },
    {
      title: 'Кількість',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
    },
    {
      title: 'Створив',
      dataIndex: 'created_by_name',
      key: 'created_by_name',
      width: 140,
    },
    {
      title: 'Статус',
      key: 'status',
      width: 140,
      render: (_: unknown, r: MaterialTransfer) =>
        r.is_accepted ? (
          <Tag color="green">Прийнято</Tag>
        ) : (
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            loading={acceptTransferMut.isPending}
            onClick={() => acceptTransferMut.mutate(r.id)}
          >
            Прийняти
          </Button>
        ),
    },
  ]

  // ===================
  //  RENDER
  // ===================

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Склад</Title>
        <Space>
          <Button icon={<ImportOutlined />}>Імпорт</Button>
          <Button icon={<ExportOutlined />}>Експорт</Button>
          {canCreate && <Button type="primary" icon={<PlusOutlined />} onClick={openCreateMatModal}>
            Додати матеріал
          </Button>}
        </Space>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="Всього позицій" value={totalMaterials} prefix={<DatabaseOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Немає в наявності"
              value={outOfStock}
              valueStyle={{ color: outOfStock > 0 ? '#f5222d' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Загальна вартість" value={totalValue} suffix="грн" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Лекала" value={patternsTotal} />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs
          defaultActiveKey="materials"
          items={[
            {
              key: 'materials',
              label: (
                <span>
                  <DatabaseOutlined /> Матеріали ({materialsTotal})
                </span>
              ),
              children: (
                <>
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={8}>
                      <Input
                        placeholder="Пошук по назві, артикулу..."
                        prefix={<SearchOutlined />}
                        allowClear
                        value={matSearch}
                        onChange={(e) => {
                          setMatSearch(e.target.value)
                          setMatPage(1)
                        }}
                      />
                    </Col>
                    <Col span={4}>
                      <Select
                        placeholder="Категорія"
                        allowClear
                        style={{ width: '100%' }}
                        value={matCategory}
                        onChange={(val) => {
                          setMatCategory(val)
                          setMatPage(1)
                        }}
                        options={[
                          { value: 'fabric', label: 'Тканина' },
                          { value: 'accessory', label: 'Фурнітура' },
                          { value: 'insulation', label: 'Утеплювач' },
                        ]}
                      />
                    </Col>
                    <Col span={4}>
                      <Select
                        placeholder="Склад"
                        allowClear
                        style={{ width: '100%' }}
                        value={matWarehouse}
                        onChange={(val) => {
                          setMatWarehouse(val)
                          setMatPage(1)
                        }}
                        options={warehousesList.map((w) => ({
                          value: String(w.id),
                          label: w.name,
                        }))}
                      />
                    </Col>
                  </Row>
                  <Spin spinning={matLoading}>
                    <Table
                      columns={matColumns}
                      dataSource={materialsList}
                      rowKey="id"
                      size="middle"
                      pagination={{
                        current: matPage,
                        pageSize: matPageSize,
                        total: materialsTotal,
                        showTotal: (t) => `Всього: ${t}`,
                        onChange: (p, ps) => {
                          setMatPage(p)
                          setMatPageSize(ps)
                        },
                      }}
                    />
                  </Spin>
                </>
              ),
            },
            {
              key: 'patterns',
              label: <span>Лекала ({patternsTotal})</span>,
              children: (
                <>
                  <div style={{ marginBottom: 16, textAlign: 'right' }}>
                    {canCreate && <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        patForm.resetFields()
                        setPatModalOpen(true)
                      }}
                    >
                      Додати лекало
                    </Button>}
                  </div>
                  <Spin spinning={patLoading}>
                    <Table
                      columns={patColumns}
                      dataSource={patternsList}
                      rowKey="id"
                      size="middle"
                      pagination={{
                        current: patPage,
                        pageSize: patPageSize,
                        total: patternsTotal,
                        showTotal: (t) => `Всього: ${t}`,
                        onChange: (p, ps) => {
                          setPatPage(p)
                          setPatPageSize(ps)
                        },
                      }}
                    />
                  </Spin>
                </>
              ),
            },
            {
              key: 'transfers',
              label: (
                <span>
                  <SwapOutlined /> Переміщення ({transfersTotal})
                </span>
              ),
              children: (
                <>
                  <div style={{ marginBottom: 16, textAlign: 'right' }}>
                    {canCreate && <Button
                      type="primary"
                      icon={<SwapOutlined />}
                      onClick={() => {
                        trForm.resetFields()
                        setTrModalOpen(true)
                      }}
                    >
                      Нове переміщення
                    </Button>}
                  </div>
                  <Spin spinning={trLoading}>
                    <Table
                      columns={trColumns}
                      dataSource={transfersList}
                      rowKey="id"
                      size="middle"
                      pagination={{
                        current: trPage,
                        pageSize: trPageSize,
                        total: transfersTotal,
                        showTotal: (t) => `Всього: ${t}`,
                        onChange: (p, ps) => {
                          setTrPage(p)
                          setTrPageSize(ps)
                        },
                      }}
                    />
                  </Spin>
                </>
              ),
            },
          ]}
        />
      </Card>

      {/* Material Create/Edit Modal */}
      <Modal
        title={editingMaterial ? 'Редагувати матеріал' : 'Додати матеріал'}
        open={matModalOpen}
        onCancel={closeMatModal}
        onOk={handleMatSubmit}
        okText={editingMaterial ? 'Зберегти' : 'Додати'}
        cancelText="Скасувати"
        confirmLoading={createMaterialMut.isPending || updateMaterialMut.isPending}
      >
        <Form form={matForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="article"
                label="Артикул"
                rules={[{ required: true, message: 'Введіть артикул' }]}
              >
                <Input placeholder="TK-001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Назва"
                rules={[{ required: true, message: 'Введіть назву' }]}
              >
                <Input placeholder="Тканина ріпстоп" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="material_type" label="Тип матеріалу">
                <Input placeholder="Ріпстоп" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Категорія"
                rules={[{ required: true, message: 'Оберіть категорію' }]}
              >
                <Select
                  placeholder="Оберіть категорію"
                  options={[
                    { value: 'fabric', label: 'Тканина' },
                    { value: 'accessory', label: 'Фурнітура' },
                    { value: 'insulation', label: 'Утеплювач' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="color" label="Колір">
                <Input placeholder="Хакі" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="quantity" label="Кількість">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="unit" label="Од. вимір.">
                <Select
                  placeholder="Од."
                  options={[
                    { value: 'м/п', label: 'м/п' },
                    { value: 'шт', label: 'шт' },
                    { value: 'кг', label: 'кг' },
                    { value: 'рул', label: 'рул' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="price_per_unit" label="Ціна за одиницю (грн)">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Pattern Create Modal */}
      <Modal
        title="Додати лекало"
        open={patModalOpen}
        onCancel={closePatModal}
        onOk={handlePatSubmit}
        okText="Додати"
        cancelText="Скасувати"
        confirmLoading={createPatternMut.isPending}
      >
        <Form form={patForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="article"
                label="Артикул"
                rules={[{ required: true, message: 'Введіть артикул' }]}
              >
                <Input placeholder="ЛК-001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Назва"
                rules={[{ required: true, message: 'Введіть назву' }]}
              >
                <Input placeholder="Куртка зимова" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label="Категорія">
                <Input placeholder="Куртка" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="pattern_type" label="Тип">
                <Input placeholder="Чоловіче" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="size_range" label="Розмірний ряд">
            <Input placeholder="44-60" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Transfer Create Modal */}
      <Modal
        title="Нове переміщення"
        open={trModalOpen}
        onCancel={closeTrModal}
        onOk={handleTrSubmit}
        okText="Створити"
        cancelText="Скасувати"
        confirmLoading={createTransferMut.isPending}
      >
        <Form form={trForm} layout="vertical">
          <Form.Item
            name="material"
            label="Матеріал"
            rules={[{ required: true, message: 'Оберіть матеріал' }]}
          >
            <Select
              placeholder="Оберіть матеріал"
              showSearch
              optionFilterProp="label"
              options={materialsList.map((m) => ({
                value: m.id,
                label: `${m.article} - ${m.name}`,
              }))}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="from_warehouse"
                label="Звідки"
                rules={[{ required: true, message: 'Оберіть склад' }]}
              >
                <Select
                  placeholder="Склад відправки"
                  options={warehousesList.map((w) => ({
                    value: w.id,
                    label: w.name,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="to_warehouse"
                label="Куди"
                rules={[{ required: true, message: 'Оберіть склад' }]}
              >
                <Select
                  placeholder="Склад призначення"
                  options={warehousesList.map((w) => ({
                    value: w.id,
                    label: w.name,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="quantity"
            label="Кількість"
            rules={[{ required: true, message: 'Введіть кількість' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="0" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default WarehousePage
