import { useState, useEffect } from 'react'
import { Tabs, Table, Button, Card, Typography, Tag, Input, Modal, Form, Select, Space, message, Popconfirm, Spin } from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  BankOutlined,
  ShopOutlined,
  DatabaseOutlined,
  ToolOutlined,
  ColumnHeightOutlined,
  SkinOutlined,
  StarOutlined,
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCustomers, createCustomer, updateCustomer, deleteCustomer,
  getSuppliers, createSupplier, updateSupplier, deleteSupplier,
  getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse,
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getSizes, createSize, updateSize, deleteSize,
  getFabricTypes, createFabricType, updateFabricType, deleteFabricType,
  getFabricClasses, createFabricClass, updateFabricClass, deleteFabricClass,
} from '../api/directories'
import type { PaginatedResponse } from '../types'
import { useAuthStore } from '../store/authStore'

const { Title } = Typography

// --- Helpers ---

const cooperationFormMap: Record<string, { label: string; color: string }> = {
  tender: { label: 'Тендер', color: 'blue' },
  direct_order: { label: 'Пряме замовлення', color: 'green' },
  agreement: { label: 'Угода', color: 'purple' },
}

const supplierCategoryMap: Record<string, { label: string; color: string }> = {
  manufacturer: { label: 'Виробник', color: 'blue' },
  retailer: { label: 'Рітейлер', color: 'orange' },
  both: { label: 'Виробник і рітейлер', color: 'green' },
}

const warehouseTypeMap: Record<string, { label: string; color: string }> = {
  main: { label: 'Головний склад', color: 'blue' },
  production_unit: { label: 'Склад цеху', color: 'orange' },
}

const departmentTypeMap: Record<string, { label: string; color: string }> = {
  production_unit: { label: 'Виробничий цех', color: 'orange' },
  office: { label: 'Офіс', color: 'blue' },
  main_warehouse: { label: 'Головний склад', color: 'green' },
}

// --- API config per tab ---

type TabKey = 'customer' | 'supplier' | 'warehouse' | 'department' | 'size' | 'fabricType' | 'fabricClass'

const apiConfig: Record<TabKey, {
  queryKey: string
  getFn: (params?: Record<string, unknown>) => Promise<{ data: PaginatedResponse<Record<string, unknown>> }>
  createFn: (data: Record<string, unknown>) => Promise<unknown>
  updateFn: (id: number, data: Record<string, unknown>) => Promise<unknown>
  deleteFn: (id: number) => Promise<unknown>
}> = {
  customer: { queryKey: 'customers', getFn: getCustomers as never, createFn: createCustomer, updateFn: updateCustomer, deleteFn: deleteCustomer },
  supplier: { queryKey: 'suppliers', getFn: getSuppliers as never, createFn: createSupplier, updateFn: updateSupplier, deleteFn: deleteSupplier },
  warehouse: { queryKey: 'warehouses', getFn: getWarehouses as never, createFn: createWarehouse, updateFn: updateWarehouse, deleteFn: deleteWarehouse },
  department: { queryKey: 'departments', getFn: getDepartments as never, createFn: createDepartment, updateFn: updateDepartment, deleteFn: deleteDepartment },
  size: { queryKey: 'sizes', getFn: getSizes as never, createFn: createSize, updateFn: updateSize, deleteFn: deleteSize },
  fabricType: { queryKey: 'fabricTypes', getFn: getFabricTypes as never, createFn: createFabricType, updateFn: updateFabricType, deleteFn: deleteFabricType },
  fabricClass: { queryKey: 'fabricClasses', getFn: getFabricClasses as never, createFn: createFabricClass, updateFn: updateFabricClass, deleteFn: deleteFabricClass },
}

// --- Component ---

function DirectoriesPage() {
  const queryClient = useQueryClient()
  const [messageApi, contextHolder] = message.useMessage()
  const { hasPermission } = useAuthStore()
  const canCreate = hasPermission('directories', 'can_create')
  const canEdit = hasPermission('directories', 'can_edit')
  const canDelete = hasPermission('directories', 'can_delete')

  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<TabKey>('customer')
  const [editingRecord, setEditingRecord] = useState<Record<string, unknown> | null>(null)
  const [form] = Form.useForm()

  /* ── Queries for all 7 tabs ─────────────────────────────── */
  const { data: customersData, isLoading: customersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => getCustomers({ page_size: 1000 }).then(r => r.data),
  })

  const { data: suppliersData, isLoading: suppliersLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => getSuppliers({ page_size: 1000 }).then(r => r.data),
  })

  const { data: warehousesData, isLoading: warehousesLoading } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => getWarehouses({ page_size: 1000 }).then(r => r.data),
  })

  const { data: departmentsData, isLoading: departmentsLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => getDepartments({ page_size: 1000 }).then(r => r.data),
  })

  const { data: sizesData, isLoading: sizesLoading } = useQuery({
    queryKey: ['sizes'],
    queryFn: () => getSizes({ page_size: 1000 }).then(r => r.data),
  })

  const { data: fabricTypesData, isLoading: fabricTypesLoading } = useQuery({
    queryKey: ['fabricTypes'],
    queryFn: () => getFabricTypes({ page_size: 1000 }).then(r => r.data),
  })

  const { data: fabricClassesData, isLoading: fabricClassesLoading } = useQuery({
    queryKey: ['fabricClasses'],
    queryFn: () => getFabricClasses({ page_size: 1000 }).then(r => r.data),
  })

  const customers = customersData?.results ?? []
  const suppliers = suppliersData?.results ?? []
  const warehouses = warehousesData?.results ?? []
  const departments = departmentsData?.results ?? []
  const sizes = sizesData?.results ?? []
  const fabricTypes = fabricTypesData?.results ?? []
  const fabricClasses = fabricClassesData?.results ?? []

  /* ── Generic mutation ───────────────────────────────────── */
  const createMutation = useMutation({
    mutationFn: ({ type, data }: { type: TabKey; data: Record<string, unknown> }) =>
      apiConfig[type].createFn(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [apiConfig[variables.type].queryKey] })
      messageApi.success('Запис створено')
      closeModal()
    },
    onError: () => {
      messageApi.error('Помилка при створенні запису')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ type, id, data }: { type: TabKey; id: number; data: Record<string, unknown> }) =>
      apiConfig[type].updateFn(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [apiConfig[variables.type].queryKey] })
      messageApi.success('Запис оновлено')
      closeModal()
    },
    onError: () => {
      messageApi.error('Помилка при оновленні запису')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: ({ type, id }: { type: TabKey; id: number }) =>
      apiConfig[type].deleteFn(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [apiConfig[variables.type].queryKey] })
      messageApi.success('Запис видалено')
    },
    onError: () => {
      messageApi.error('Помилка при видаленні запису')
    },
  })

  /* ── Modal handlers ─────────────────────────────────────── */
  const openCreateModal = (type: TabKey) => {
    setModalType(type)
    setEditingRecord(null)
    form.resetFields()
    setModalOpen(true)
  }

  const openEditModal = (type: TabKey, record: Record<string, unknown>) => {
    setModalType(type)
    setEditingRecord(record)
    setModalOpen(true)
  }

  useEffect(() => {
    if (!modalOpen) return
    if (editingRecord) {
      form.setFieldsValue(editingRecord)
    } else {
      form.resetFields()
    }
  }, [modalOpen, editingRecord, form])

  const closeModal = () => {
    setModalOpen(false)
    setEditingRecord(null)
    form.resetFields()
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      if (editingRecord) {
        updateMutation.mutate({ type: modalType, id: editingRecord.id as number, data: values })
      } else {
        createMutation.mutate({ type: modalType, data: values })
      }
    } catch {
      // validation
    }
  }

  const handleDelete = (type: TabKey, id: number) => {
    deleteMutation.mutate({ type, id })
  }

  /* ── Table helpers ──────────────────────────────────────── */
  const actionColumn = (type: TabKey) => (!canEdit && !canDelete) ? [] : [{
    title: 'Дії',
    key: 'actions',
    width: 100,
    render: (_: unknown, record: Record<string, unknown>) => (
      <Space>
        {canEdit && <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditModal(type, record)} />}
        {canDelete && (
          <Popconfirm title="Видалити запис?" onConfirm={() => handleDelete(type, record.id as number)} okText="Так" cancelText="Ні">
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        )}
      </Space>
    ),
  }]

  const filterData = <T extends Record<string, unknown>>(data: T[], fields: string[]): T[] => {
    if (!search) return data
    const q = search.toLowerCase()
    return data.filter(item => fields.some(f => String(item[f] || '').toLowerCase().includes(q)))
  }

  /* ── Column definitions ─────────────────────────────────── */
  const customerColumns = [
    { title: 'Назва', dataIndex: 'company_name', key: 'company_name', sorter: (a: Record<string, unknown>, b: Record<string, unknown>) => String(a.company_name).localeCompare(String(b.company_name)) },
    { title: 'Форма співпраці', dataIndex: 'cooperation_form', key: 'cooperation_form', render: (v: string) => <Tag color={cooperationFormMap[v]?.color}>{cooperationFormMap[v]?.label}</Tag> },
    { title: 'Адреса', dataIndex: 'address', key: 'address', ellipsis: true },
    { title: 'Телефон', dataIndex: 'phone', key: 'phone' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    ...actionColumn('customer'),
  ]

  const supplierColumns = [
    { title: 'Назва', dataIndex: 'company_name', key: 'company_name', sorter: (a: Record<string, unknown>, b: Record<string, unknown>) => String(a.company_name).localeCompare(String(b.company_name)) },
    { title: 'Категорія', dataIndex: 'category', key: 'category', render: (v: string) => <Tag color={supplierCategoryMap[v]?.color}>{supplierCategoryMap[v]?.label}</Tag> },
    { title: 'Локація', dataIndex: 'location', key: 'location' },
    { title: 'Телефон', dataIndex: 'phone', key: 'phone' },
    { title: 'Контактна особа', dataIndex: 'contact_person', key: 'contact_person' },
    { title: 'Графік', dataIndex: 'work_schedule', key: 'work_schedule' },
    ...actionColumn('supplier'),
  ]

  const warehouseColumns = [
    { title: 'Назва', dataIndex: 'name', key: 'name' },
    { title: 'Тип', dataIndex: 'warehouse_type', key: 'warehouse_type', render: (v: string) => <Tag color={warehouseTypeMap[v]?.color}>{warehouseTypeMap[v]?.label}</Tag> },
    { title: 'Адреса', dataIndex: 'address', key: 'address', ellipsis: true },
    { title: 'Завскладу', dataIndex: 'manager_name', key: 'manager_name' },
    { title: 'Контакти', dataIndex: 'contact_info', key: 'contact_info' },
    ...actionColumn('warehouse'),
  ]

  const departmentColumns = [
    { title: 'Назва', dataIndex: 'name', key: 'name' },
    { title: 'Тип', dataIndex: 'department_type', key: 'department_type', render: (v: string) => <Tag color={departmentTypeMap[v]?.color}>{departmentTypeMap[v]?.label}</Tag> },
    { title: 'Адреса', dataIndex: 'address', key: 'address', ellipsis: true },
    { title: 'Працівників', dataIndex: 'users_count', key: 'users_count', render: (v: number) => <Tag>{v}</Tag> },
    ...actionColumn('department'),
  ]

  const sizeColumns = [
    { title: '№', dataIndex: 'sort_order', key: 'sort_order', width: 60 },
    { title: 'Розмір', dataIndex: 'name', key: 'name' },
    { title: 'Опис', dataIndex: 'description', key: 'description' },
    ...actionColumn('size'),
  ]

  const fabricTypeColumns = [
    { title: 'Назва', dataIndex: 'name', key: 'name', sorter: (a: Record<string, unknown>, b: Record<string, unknown>) => String(a.name).localeCompare(String(b.name)) },
    { title: 'Опис', dataIndex: 'description', key: 'description' },
    ...actionColumn('fabricType'),
  ]

  const fabricClassColumns = [
    { title: 'Назва', dataIndex: 'name', key: 'name' },
    { title: 'Опис', dataIndex: 'description', key: 'description' },
    ...actionColumn('fabricClass'),
  ]

  /* ── Modal form fields ──────────────────────────────────── */
  const renderModalFields = () => {
    switch (modalType) {
      case 'customer':
        return (
          <>
            <Form.Item name="company_name" label="Назва підприємства" rules={[{ required: true, message: 'Обов\'язкове поле' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="cooperation_form" label="Форма співпраці" rules={[{ required: true }]}>
              <Select options={[{ value: 'tender', label: 'Тендер' }, { value: 'direct_order', label: 'Пряме замовлення' }, { value: 'agreement', label: 'Угода' }]} />
            </Form.Item>
            <Form.Item name="address" label="Адреса"><Input /></Form.Item>
            <Form.Item name="phone" label="Телефон"><Input /></Form.Item>
            <Form.Item name="email" label="Email"><Input type="email" /></Form.Item>
          </>
        )
      case 'supplier':
        return (
          <>
            <Form.Item name="company_name" label="Назва підприємства" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="category" label="Категорія" rules={[{ required: true }]}>
              <Select options={[{ value: 'manufacturer', label: 'Виробник' }, { value: 'retailer', label: 'Рітейлер' }, { value: 'both', label: 'Виробник і рітейлер' }]} />
            </Form.Item>
            <Form.Item name="location" label="Локація"><Input /></Form.Item>
            <Form.Item name="phone" label="Телефон"><Input /></Form.Item>
            <Form.Item name="email" label="Email"><Input type="email" /></Form.Item>
            <Form.Item name="contact_person" label="Контактна особа"><Input /></Form.Item>
            <Form.Item name="work_schedule" label="Графік роботи"><Input /></Form.Item>
          </>
        )
      case 'warehouse':
        return (
          <>
            <Form.Item name="name" label="Назва" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="warehouse_type" label="Тип складу" rules={[{ required: true }]}>
              <Select options={[{ value: 'main', label: 'Головний склад' }, { value: 'production_unit', label: 'Склад цеху' }]} />
            </Form.Item>
            <Form.Item name="address" label="Адреса"><Input /></Form.Item>
            <Form.Item name="contact_info" label="Контактна інформація"><Input /></Form.Item>
          </>
        )
      case 'department':
        return (
          <>
            <Form.Item name="name" label="Назва" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="department_type" label="Тип" rules={[{ required: true }]}>
              <Select options={[{ value: 'production_unit', label: 'Виробничий цех' }, { value: 'office', label: 'Офіс' }, { value: 'main_warehouse', label: 'Головний склад' }]} />
            </Form.Item>
            <Form.Item name="address" label="Адреса"><Input /></Form.Item>
          </>
        )
      case 'size':
        return (
          <>
            <Form.Item name="name" label="Розмір" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="description" label="Опис"><Input /></Form.Item>
            <Form.Item name="sort_order" label="Порядок сортування"><Input type="number" /></Form.Item>
          </>
        )
      case 'fabricType':
        return (
          <>
            <Form.Item name="name" label="Назва" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="description" label="Опис"><Input.TextArea rows={3} /></Form.Item>
          </>
        )
      case 'fabricClass':
        return (
          <>
            <Form.Item name="name" label="Назва" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="description" label="Опис"><Input.TextArea rows={3} /></Form.Item>
          </>
        )
      default:
        return null
    }
  }

  const modalTitles: Record<string, string> = {
    customer: 'Контрагент',
    supplier: 'Постачальник',
    warehouse: 'Склад',
    department: 'Цех / Підрозділ',
    size: 'Розмір',
    fabricType: 'Тип тканини',
    fabricClass: 'Клас тканини',
  }

  return (
    <div>
      {contextHolder}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Довідники</Title>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Пошук..."
          style={{ width: 300 }}
          value={search}
          onChange={e => setSearch(e.target.value)}
          allowClear
        />
      </div>

      <Card>
        <Tabs
          items={[
            {
              key: 'customers',
              label: <span><BankOutlined /> Контрагенти</span>,
              children: (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span style={{ color: '#888' }}>Замовники та клієнти підприємства</span>
                    {canCreate && <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreateModal('customer')}>Додати</Button>}
                  </div>
                  <Spin spinning={customersLoading}>
                    <Table columns={customerColumns} dataSource={filterData(customers, ['company_name', 'address', 'email'])} rowKey="id" size="middle" pagination={{ pageSize: 10 }} />
                  </Spin>
                </>
              ),
            },
            {
              key: 'suppliers',
              label: <span><ShopOutlined /> Постачальники</span>,
              children: (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span style={{ color: '#888' }}>Постачальники матеріалів та фурнітури</span>
                    {canCreate && <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreateModal('supplier')}>Додати</Button>}
                  </div>
                  <Spin spinning={suppliersLoading}>
                    <Table columns={supplierColumns} dataSource={filterData(suppliers, ['company_name', 'location', 'contact_person'])} rowKey="id" size="middle" pagination={{ pageSize: 10 }} />
                  </Spin>
                </>
              ),
            },
            {
              key: 'warehouses',
              label: <span><DatabaseOutlined /> Склади</span>,
              children: (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span style={{ color: '#888' }}>Складські приміщення підприємства</span>
                    {canCreate && <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreateModal('warehouse')}>Додати</Button>}
                  </div>
                  <Spin spinning={warehousesLoading}>
                    <Table columns={warehouseColumns} dataSource={filterData(warehouses, ['name', 'address'])} rowKey="id" size="middle" pagination={{ pageSize: 10 }} />
                  </Spin>
                </>
              ),
            },
            {
              key: 'departments',
              label: <span><ToolOutlined /> Цехи / Підрозділи</span>,
              children: (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span style={{ color: '#888' }}>Виробничі цехи та підрозділи</span>
                    {canCreate && <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreateModal('department')}>Додати</Button>}
                  </div>
                  <Spin spinning={departmentsLoading}>
                    <Table columns={departmentColumns} dataSource={filterData(departments, ['name', 'address'])} rowKey="id" size="middle" pagination={{ pageSize: 10 }} />
                  </Spin>
                </>
              ),
            },
            {
              key: 'sizes',
              label: <span><ColumnHeightOutlined /> Розміри</span>,
              children: (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span style={{ color: '#888' }}>Розміри готових виробів</span>
                    {canCreate && <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreateModal('size')}>Додати</Button>}
                  </div>
                  <Spin spinning={sizesLoading}>
                    <Table columns={sizeColumns} dataSource={filterData(sizes, ['name', 'description'])} rowKey="id" size="middle" pagination={{ pageSize: 15 }} />
                  </Spin>
                </>
              ),
            },
            {
              key: 'fabricTypes',
              label: <span><SkinOutlined /> Типи тканини</span>,
              children: (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span style={{ color: '#888' }}>Типи тканин для виробництва</span>
                    {canCreate && <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreateModal('fabricType')}>Додати</Button>}
                  </div>
                  <Spin spinning={fabricTypesLoading}>
                    <Table columns={fabricTypeColumns} dataSource={filterData(fabricTypes, ['name', 'description'])} rowKey="id" size="middle" pagination={{ pageSize: 15 }} />
                  </Spin>
                </>
              ),
            },
            {
              key: 'fabricClasses',
              label: <span><StarOutlined /> Класи тканини</span>,
              children: (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span style={{ color: '#888' }}>Класифікація якості тканин</span>
                    {canCreate && <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreateModal('fabricClass')}>Додати</Button>}
                  </div>
                  <Spin spinning={fabricClassesLoading}>
                    <Table columns={fabricClassColumns} dataSource={filterData(fabricClasses, ['name', 'description'])} rowKey="id" size="middle" pagination={{ pageSize: 15 }} />
                  </Spin>
                </>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={`${editingRecord ? 'Редагувати' : 'Створити'}: ${modalTitles[modalType] || ''}`}
        open={modalOpen}
        onCancel={closeModal}
        onOk={handleSave}
        okText="Зберегти"
        cancelText="Скасувати"
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          {renderModalFields()}
        </Form>
      </Modal>
    </div>
  )
}

export default DirectoriesPage
