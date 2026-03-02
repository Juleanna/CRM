import { useState } from 'react'
import { Tabs, Table, Button, Card, Typography, Tag, Input, Modal, Form, Select, Space, message, Popconfirm } from 'antd'
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

const { Title } = Typography

// --- Mock Data ---

const customers = [
  { id: 1, company_name: 'ДП "Укроборонпром"', cooperation_form: 'tender', address: 'м. Київ, вул. Хрещатик, 10', phone: '+380441234567', email: 'info@ukroboronprom.com', contact_persons: [{ name: 'Петренко І.В.', phone: '+380501234567' }] },
  { id: 2, company_name: 'ТОВ "Форма-Плюс"', cooperation_form: 'direct_order', address: 'м. Львів, вул. Шевченка, 5', phone: '+380322345678', email: 'office@formaplus.ua', contact_persons: [{ name: 'Ковальчук А.М.', phone: '+380671234567' }] },
  { id: 3, company_name: 'МО України', cooperation_form: 'tender', address: 'м. Київ, вул. Грушевського, 30', phone: '+380443456789', email: 'procurement@mil.gov.ua', contact_persons: [] },
  { id: 4, company_name: 'ТОВ "СпецОдяг"', cooperation_form: 'agreement', address: 'м. Харків, вул. Пушкінська, 15', phone: '+380573456789', email: 'sales@specodyag.ua', contact_persons: [{ name: 'Мельник В.О.', phone: '+380931234567' }] },
  { id: 5, company_name: 'КП "Комунальник"', cooperation_form: 'direct_order', address: 'м. Одеса, вул. Дерибасівська, 12', phone: '+380484567890', email: 'info@komunalnik.od.ua', contact_persons: [] },
]

const suppliers = [
  { id: 1, company_name: 'ТОВ "Текстиль-Груп"', category: 'manufacturer', location: 'м. Дніпро', phone: '+380561234567', email: 'sales@textilegroup.ua', contact_person: 'Савченко О.П.', work_schedule: 'Пн-Пт 9:00-18:00' },
  { id: 2, company_name: 'ТОВ "Фурнітура.UA"', category: 'retailer', location: 'м. Київ', phone: '+380441234568', email: 'order@furnitura.ua', contact_person: 'Кравченко Л.М.', work_schedule: 'Пн-Сб 8:00-19:00' },
  { id: 3, company_name: 'ПП "Нитки і тканини"', category: 'both', location: 'м. Вінниця', phone: '+380434567890', email: 'info@nytky.ua', contact_person: 'Бондаренко Д.А.', work_schedule: 'Пн-Пт 8:30-17:30' },
  { id: 4, company_name: 'ТОВ "Бьорнер Україна"', category: 'manufacturer', location: 'м. Запоріжжя', phone: '+380614567890', email: 'ua@borner.com', contact_person: 'Шевченко Р.В.', work_schedule: 'Пн-Пт 9:00-17:00' },
]

const warehouses = [
  { id: 1, name: 'Головний склад', warehouse_type: 'main', address: 'м. Київ, вул. Промислова, 1', manager_name: 'Козак Н.І.', contact_info: '+380501112233' },
  { id: 2, name: 'Склад Цех №1', warehouse_type: 'production_unit', address: 'м. Київ, вул. Промислова, 1, корп. А', manager_name: 'Руденко М.П.', contact_info: '+380672223344' },
  { id: 3, name: 'Склад Цех №2', warehouse_type: 'production_unit', address: 'м. Бровари, вул. Фабрична, 8', manager_name: 'Ткаченко В.А.', contact_info: '+380933334455' },
]

const departments = [
  { id: 1, name: 'Цех №1 - Розкрійний', department_type: 'production_unit', address: 'м. Київ, вул. Промислова, 1, корп. А', users_count: 25 },
  { id: 2, name: 'Цех №2 - Швейний', department_type: 'production_unit', address: 'м. Бровари, вул. Фабрична, 8', users_count: 40 },
  { id: 3, name: 'Цех №3 - Оздоблення', department_type: 'production_unit', address: 'м. Київ, вул. Промислова, 1, корп. Б', users_count: 15 },
  { id: 4, name: 'Головний офіс', department_type: 'office', address: 'м. Київ, вул. Промислова, 1', users_count: 12 },
  { id: 5, name: 'Головний склад', department_type: 'main_warehouse', address: 'м. Київ, вул. Промислова, 1', users_count: 8 },
]

const sizes = [
  { id: 1, name: 'XS (42)', description: 'Обхват грудей 84 см', sort_order: 1 },
  { id: 2, name: 'S (44)', description: 'Обхват грудей 88 см', sort_order: 2 },
  { id: 3, name: 'M (46)', description: 'Обхват грудей 92 см', sort_order: 3 },
  { id: 4, name: 'L (48)', description: 'Обхват грудей 96 см', sort_order: 4 },
  { id: 5, name: 'XL (50)', description: 'Обхват грудей 100 см', sort_order: 5 },
  { id: 6, name: 'XXL (52)', description: 'Обхват грудей 104 см', sort_order: 6 },
  { id: 7, name: '3XL (54)', description: 'Обхват грудей 108 см', sort_order: 7 },
  { id: 8, name: '4XL (56)', description: 'Обхват грудей 112 см', sort_order: 8 },
  { id: 9, name: '5XL (58)', description: 'Обхват грудей 116 см', sort_order: 9 },
  { id: 10, name: '6XL (60)', description: 'Обхват грудей 120 см', sort_order: 10 },
]

const fabricTypes = [
  { id: 1, name: 'Бавовна', description: 'Натуральна тканина з бавовни' },
  { id: 2, name: 'Поліестер', description: 'Синтетична тканина' },
  { id: 3, name: 'Бавовна/Поліестер', description: 'Змішана тканина' },
  { id: 4, name: 'Нейлон', description: 'Синтетична тканина високої міцності' },
  { id: 5, name: 'Оксфорд', description: 'Тканина з переплетенням "рогожка"' },
  { id: 6, name: 'Рип-стоп', description: 'Тканина з армуючою ниткою' },
  { id: 7, name: 'Флісс', description: "М'яка синтетична тканина" },
  { id: 8, name: 'Мембрана', description: 'Водонепроникна тканина з паропроникністю' },
  { id: 9, name: 'Кордура', description: 'Надміцна тканина для спецвиробів' },
  { id: 10, name: 'Твіл', description: 'Тканина з діагональним переплетенням' },
]

const fabricClasses = [
  { id: 1, name: '1-й клас', description: 'Найвища якість, без дефектів' },
  { id: 2, name: '2-й клас', description: 'Допускаються незначні дефекти' },
  { id: 3, name: '3-й клас', description: 'Дефекти помітні, для неосновних виробів' },
  { id: 4, name: 'Люкс', description: 'Преміальна якість тканини' },
  { id: 5, name: 'Стандарт', description: 'Стандартна якість для масового виробництва' },
  { id: 6, name: 'Економ', description: 'Бюджетний клас тканини' },
]

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

// --- Component ---

function DirectoriesPage() {
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState('')
  const [editingRecord, setEditingRecord] = useState<Record<string, unknown> | null>(null)
  const [form] = Form.useForm()

  const openCreateModal = (type: string) => {
    setModalType(type)
    setEditingRecord(null)
    form.resetFields()
    setModalOpen(true)
  }

  const openEditModal = (type: string, record: Record<string, unknown>) => {
    setModalType(type)
    setEditingRecord(record)
    form.setFieldsValue(record)
    setModalOpen(true)
  }

  const handleSave = async () => {
    try {
      await form.validateFields()
      message.success(editingRecord ? 'Запис оновлено' : 'Запис створено')
      setModalOpen(false)
    } catch {
      // validation
    }
  }

  const handleDelete = () => {
    message.success('Запис видалено')
  }

  const actionColumn = (type: string) => ({
    title: 'Дії',
    key: 'actions',
    width: 100,
    render: (_: unknown, record: Record<string, unknown>) => (
      <Space>
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditModal(type, record)} />
        <Popconfirm title="Видалити запис?" onConfirm={handleDelete} okText="Так" cancelText="Ні">
          <Button type="link" size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    ),
  })

  const filterData = <T extends Record<string, unknown>>(data: T[], fields: string[]): T[] => {
    if (!search) return data
    const q = search.toLowerCase()
    return data.filter(item => fields.some(f => String(item[f] || '').toLowerCase().includes(q)))
  }

  const customerColumns = [
    { title: 'Назва', dataIndex: 'company_name', key: 'company_name', sorter: (a: typeof customers[0], b: typeof customers[0]) => a.company_name.localeCompare(b.company_name) },
    { title: 'Форма співпраці', dataIndex: 'cooperation_form', key: 'cooperation_form', render: (v: string) => <Tag color={cooperationFormMap[v]?.color}>{cooperationFormMap[v]?.label}</Tag> },
    { title: 'Адреса', dataIndex: 'address', key: 'address', ellipsis: true },
    { title: 'Телефон', dataIndex: 'phone', key: 'phone' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    actionColumn('customer'),
  ]

  const supplierColumns = [
    { title: 'Назва', dataIndex: 'company_name', key: 'company_name', sorter: (a: typeof suppliers[0], b: typeof suppliers[0]) => a.company_name.localeCompare(b.company_name) },
    { title: 'Категорія', dataIndex: 'category', key: 'category', render: (v: string) => <Tag color={supplierCategoryMap[v]?.color}>{supplierCategoryMap[v]?.label}</Tag> },
    { title: 'Локація', dataIndex: 'location', key: 'location' },
    { title: 'Телефон', dataIndex: 'phone', key: 'phone' },
    { title: 'Контактна особа', dataIndex: 'contact_person', key: 'contact_person' },
    { title: 'Графік', dataIndex: 'work_schedule', key: 'work_schedule' },
    actionColumn('supplier'),
  ]

  const warehouseColumns = [
    { title: 'Назва', dataIndex: 'name', key: 'name' },
    { title: 'Тип', dataIndex: 'warehouse_type', key: 'warehouse_type', render: (v: string) => <Tag color={warehouseTypeMap[v]?.color}>{warehouseTypeMap[v]?.label}</Tag> },
    { title: 'Адреса', dataIndex: 'address', key: 'address', ellipsis: true },
    { title: 'Завскладу', dataIndex: 'manager_name', key: 'manager_name' },
    { title: 'Контакти', dataIndex: 'contact_info', key: 'contact_info' },
    actionColumn('warehouse'),
  ]

  const departmentColumns = [
    { title: 'Назва', dataIndex: 'name', key: 'name' },
    { title: 'Тип', dataIndex: 'department_type', key: 'department_type', render: (v: string) => <Tag color={departmentTypeMap[v]?.color}>{departmentTypeMap[v]?.label}</Tag> },
    { title: 'Адреса', dataIndex: 'address', key: 'address', ellipsis: true },
    { title: 'Працівників', dataIndex: 'users_count', key: 'users_count', render: (v: number) => <Tag>{v}</Tag> },
    actionColumn('department'),
  ]

  const sizeColumns = [
    { title: '№', dataIndex: 'sort_order', key: 'sort_order', width: 60 },
    { title: 'Розмір', dataIndex: 'name', key: 'name' },
    { title: 'Опис', dataIndex: 'description', key: 'description' },
    actionColumn('size'),
  ]

  const fabricTypeColumns = [
    { title: 'Назва', dataIndex: 'name', key: 'name', sorter: (a: typeof fabricTypes[0], b: typeof fabricTypes[0]) => a.name.localeCompare(b.name) },
    { title: 'Опис', dataIndex: 'description', key: 'description' },
    actionColumn('fabricType'),
  ]

  const fabricClassColumns = [
    { title: 'Назва', dataIndex: 'name', key: 'name' },
    { title: 'Опис', dataIndex: 'description', key: 'description' },
    actionColumn('fabricClass'),
  ]

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
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreateModal('customer')}>Додати</Button>
                  </div>
                  <Table columns={customerColumns} dataSource={filterData(customers, ['company_name', 'address', 'email'])} rowKey="id" size="middle" pagination={{ pageSize: 10 }} />
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
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreateModal('supplier')}>Додати</Button>
                  </div>
                  <Table columns={supplierColumns} dataSource={filterData(suppliers, ['company_name', 'location', 'contact_person'])} rowKey="id" size="middle" pagination={{ pageSize: 10 }} />
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
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreateModal('warehouse')}>Додати</Button>
                  </div>
                  <Table columns={warehouseColumns} dataSource={filterData(warehouses, ['name', 'address'])} rowKey="id" size="middle" pagination={{ pageSize: 10 }} />
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
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreateModal('department')}>Додати</Button>
                  </div>
                  <Table columns={departmentColumns} dataSource={filterData(departments, ['name', 'address'])} rowKey="id" size="middle" pagination={{ pageSize: 10 }} />
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
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreateModal('size')}>Додати</Button>
                  </div>
                  <Table columns={sizeColumns} dataSource={filterData(sizes, ['name', 'description'])} rowKey="id" size="middle" pagination={{ pageSize: 15 }} />
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
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreateModal('fabricType')}>Додати</Button>
                  </div>
                  <Table columns={fabricTypeColumns} dataSource={filterData(fabricTypes, ['name', 'description'])} rowKey="id" size="middle" pagination={{ pageSize: 15 }} />
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
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreateModal('fabricClass')}>Додати</Button>
                  </div>
                  <Table columns={fabricClassColumns} dataSource={filterData(fabricClasses, ['name', 'description'])} rowKey="id" size="middle" pagination={{ pageSize: 15 }} />
                </>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={`${editingRecord ? 'Редагувати' : 'Створити'}: ${modalTitles[modalType] || ''}`}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        okText="Зберегти"
        cancelText="Скасувати"
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
