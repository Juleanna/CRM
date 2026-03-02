import { useState } from 'react'
import { Table, Button, Card, Typography, Tag, Input, Modal, Form, Select, Space, message, Popconfirm, DatePicker, Upload, Descriptions } from 'antd'
import type { UploadFile } from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  FileTextOutlined,
  EyeOutlined,
  DownloadOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Title, Text } = Typography

// --- Mock Data ---

const affiliations = [
  { id: 1, name: 'Військова форма' },
  { id: 2, name: 'Спецодяг' },
  { id: 3, name: 'Захисне спорядження' },
  { id: 4, name: 'Камуфляж' },
  { id: 5, name: 'Аксесуари' },
]

const techSpecs = [
  {
    id: 1,
    title: 'ТС на куртку зимову польову',
    number: 'ТС-2025-001',
    affiliation: { id: 1, name: 'Військова форма' },
    affiliation_name: 'Військова форма',
    description: 'Технічна специфікація на виробництво зимової польової куртки з утеплювачем',
    effective_date: '2025-01-15',
    expiry_date: '2027-01-15',
    status: 'active',
    file: '/media/tech_specs/ts-2025-001.pdf',
    notes: 'Затверджено замовником',
    created_by_name: 'Петренко І.В.',
    created_at: '2025-01-10',
  },
  {
    id: 2,
    title: 'ТС на штани літні бойові',
    number: 'ТС-2025-002',
    affiliation: { id: 1, name: 'Військова форма' },
    affiliation_name: 'Військова форма',
    description: 'Технічна специфікація на літні бойові штани з посиленими колінами',
    effective_date: '2025-02-01',
    expiry_date: '2026-12-31',
    status: 'active',
    file: '/media/tech_specs/ts-2025-002.pdf',
    notes: '',
    created_by_name: 'Ковальчук А.М.',
    created_at: '2025-01-28',
  },
  {
    id: 3,
    title: 'ТС на костюм захисний',
    number: 'ТС-2025-003',
    affiliation: { id: 3, name: 'Захисне спорядження' },
    affiliation_name: 'Захисне спорядження',
    description: 'Технічна специфікація на захисний костюм для промислових підприємств',
    effective_date: '2025-03-01',
    expiry_date: null,
    status: 'draft',
    file: null,
    notes: 'На узгодженні з технологом',
    created_by_name: 'Мельник В.О.',
    created_at: '2025-02-15',
  },
  {
    id: 4,
    title: 'ТС на футболку (поло) форменну',
    number: 'ТС-2024-015',
    affiliation: { id: 2, name: 'Спецодяг' },
    affiliation_name: 'Спецодяг',
    description: 'Технічна специфікація на форменну футболку-поло з вишитим логотипом',
    effective_date: '2024-05-01',
    expiry_date: '2025-05-01',
    status: 'expired',
    file: '/media/tech_specs/ts-2024-015.pdf',
    notes: 'Потребує оновлення',
    created_by_name: 'Петренко І.В.',
    created_at: '2024-04-20',
  },
  {
    id: 5,
    title: 'ТС на бронежилет чохол',
    number: 'ТС-2025-004',
    affiliation: { id: 3, name: 'Захисне спорядження' },
    affiliation_name: 'Захисне спорядження',
    description: 'Технічна специфікація на чохол для бронежилета з системою MOLLE',
    effective_date: '2025-04-01',
    expiry_date: '2028-04-01',
    status: 'active',
    file: '/media/tech_specs/ts-2025-004.pdf',
    notes: '',
    created_by_name: 'Ковальчук А.М.',
    created_at: '2025-03-10',
  },
  {
    id: 6,
    title: 'ТС на рюкзак тактичний 45L',
    number: 'ТС-2025-005',
    affiliation: { id: 5, name: 'Аксесуари' },
    affiliation_name: 'Аксесуари',
    description: 'Технічна специфікація на тактичний рюкзак об`ємом 45 літрів',
    effective_date: null,
    expiry_date: null,
    status: 'draft',
    file: null,
    notes: 'В процесі розробки',
    created_by_name: 'Мельник В.О.',
    created_at: '2025-02-20',
  },
  {
    id: 7,
    title: 'ТС на камуфляж "Піксель" ЗСУ',
    number: 'ТС-2024-010',
    affiliation: { id: 4, name: 'Камуфляж' },
    affiliation_name: 'Камуфляж',
    description: 'Технічна специфікація на тканину камуфляжного забарвлення "Піксель" стандарту ЗСУ',
    effective_date: '2024-01-01',
    expiry_date: '2024-12-31',
    status: 'cancelled',
    file: '/media/tech_specs/ts-2024-010.pdf',
    notes: 'Замінено новою специфікацією',
    created_by_name: 'Петренко І.В.',
    created_at: '2023-12-01',
  },
]

const statusMap: Record<string, { label: string; color: string }> = {
  draft: { label: 'Чернетка', color: 'default' },
  active: { label: 'Діючий', color: 'green' },
  expired: { label: 'Недіючий', color: 'orange' },
  cancelled: { label: 'Скасований', color: 'red' },
}

function TechSpecsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [affiliationFilter, setAffiliationFilter] = useState<number | ''>('')
  const [modalOpen, setModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<typeof techSpecs[0] | null>(null)
  const [viewingRecord, setViewingRecord] = useState<typeof techSpecs[0] | null>(null)
  const [affiliationModalOpen, setAffiliationModalOpen] = useState(false)
  const [affiliationForm] = Form.useForm()
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState<UploadFile[]>([])

  const openCreate = () => {
    setEditingRecord(null)
    form.resetFields()
    setFileList([])
    setModalOpen(true)
  }

  const openEdit = (record: typeof techSpecs[0]) => {
    setEditingRecord(record)
    form.setFieldsValue({
      ...record,
      affiliation_id: record.affiliation?.id,
      effective_date: record.effective_date ? dayjs(record.effective_date) : null,
      expiry_date: record.expiry_date ? dayjs(record.expiry_date) : null,
    })
    setFileList(record.file ? [{ uid: '-1', name: record.file.split('/').pop() || 'document.pdf', status: 'done', url: record.file }] : [])
    setModalOpen(true)
  }

  const handleSave = async () => {
    try {
      await form.validateFields()
      message.success(editingRecord ? 'Специфікацію оновлено' : 'Специфікацію створено')
      setModalOpen(false)
    } catch {
      // validation
    }
  }

  const handleDelete = () => {
    message.success('Специфікацію видалено')
  }

  const handleAffiliationSave = async () => {
    try {
      await affiliationForm.validateFields()
      message.success('Приналежність збережено')
      setAffiliationModalOpen(false)
      affiliationForm.resetFields()
    } catch {
      // validation
    }
  }

  const filtered = techSpecs.filter(item => {
    const q = search.toLowerCase()
    const matchSearch = !search || item.title.toLowerCase().includes(q) || item.number.toLowerCase().includes(q) || item.affiliation_name.toLowerCase().includes(q)
    const matchStatus = !statusFilter || item.status === statusFilter
    const matchAffiliation = !affiliationFilter || item.affiliation?.id === affiliationFilter
    return matchSearch && matchStatus && matchAffiliation
  })

  const columns = [
    {
      title: 'Номер',
      dataIndex: 'number',
      key: 'number',
      width: 150,
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: 'Назва',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      sorter: (a: typeof techSpecs[0], b: typeof techSpecs[0]) => a.title.localeCompare(b.title),
    },
    {
      title: 'Приналежність',
      dataIndex: 'affiliation_name',
      key: 'affiliation_name',
      width: 180,
      render: (v: string) => v ? <Tag color="blue">{v}</Tag> : <Text type="secondary">—</Text>,
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (v: string) => <Tag color={statusMap[v]?.color}>{statusMap[v]?.label}</Tag>,
    },
    {
      title: 'Дата введення',
      dataIndex: 'effective_date',
      key: 'effective_date',
      width: 140,
      render: (v: string | null) => v ? dayjs(v).format('DD.MM.YYYY') : '—',
      sorter: (a: typeof techSpecs[0], b: typeof techSpecs[0]) => (a.effective_date || '').localeCompare(b.effective_date || ''),
    },
    {
      title: 'Дата закінчення',
      dataIndex: 'expiry_date',
      key: 'expiry_date',
      width: 140,
      render: (v: string | null) => v ? dayjs(v).format('DD.MM.YYYY') : '—',
    },
    {
      title: 'Документ',
      dataIndex: 'file',
      key: 'file',
      width: 100,
      render: (v: string | null) => v
        ? <Button type="link" size="small" icon={<DownloadOutlined />}>Файл</Button>
        : <Text type="secondary">—</Text>,
    },
    {
      title: 'Створив',
      dataIndex: 'created_by_name',
      key: 'created_by_name',
      width: 150,
    },
    {
      title: 'Дії',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: typeof techSpecs[0]) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setViewingRecord(record); setDetailOpen(true) }} />
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="Видалити специфікацію?" onConfirm={handleDelete} okText="Так" cancelText="Ні">
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          <FileTextOutlined style={{ marginRight: 8 }} />
          Реєстр технічних специфікацій
        </Title>
        <Space>
          <Button onClick={() => setAffiliationModalOpen(true)}>Приналежності</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Створити</Button>
        </Space>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Пошук за назвою, номером..."
            style={{ width: 280 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
            allowClear
          />
          <Select
            placeholder="Статус"
            style={{ width: 160 }}
            value={statusFilter || undefined}
            onChange={v => setStatusFilter(v || '')}
            allowClear
            options={[
              { value: 'draft', label: 'Чернетка' },
              { value: 'active', label: 'Діючий' },
              { value: 'expired', label: 'Недіючий' },
              { value: 'cancelled', label: 'Скасований' },
            ]}
          />
          <Select
            placeholder="Приналежність"
            style={{ width: 200 }}
            value={affiliationFilter || undefined}
            onChange={v => setAffiliationFilter(v || '')}
            allowClear
            options={affiliations.map(a => ({ value: a.id, label: a.name }))}
          />
        </Space>
      </Card>

      <Card>
        <Table columns={columns} dataSource={filtered} rowKey="id" size="middle" pagination={{ pageSize: 10, showTotal: total => `Всього: ${total}` }} />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingRecord ? 'Редагувати специфікацію' : 'Створити специфікацію'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        okText="Зберегти"
        cancelText="Скасувати"
        width={640}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="Назва" rules={[{ required: true, message: 'Введіть назву' }]}>
            <Input placeholder="Назва технічної специфікації" />
          </Form.Item>
          <Form.Item name="number" label="Номер документа">
            <Input placeholder="ТС-2025-XXX" />
          </Form.Item>
          <Form.Item name="affiliation_id" label="Приналежність">
            <Select placeholder="Оберіть приналежність" allowClear options={affiliations.map(a => ({ value: a.id, label: a.name }))} />
          </Form.Item>
          <Form.Item name="description" label="Опис">
            <Input.TextArea rows={3} placeholder="Опис технічної специфікації" />
          </Form.Item>
          <Space style={{ width: '100%' }} size="large">
            <Form.Item name="effective_date" label="Дата введення в дію" style={{ flex: 1 }}>
              <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Оберіть дату" />
            </Form.Item>
            <Form.Item name="expiry_date" label="Дата закінчення дії" style={{ flex: 1 }}>
              <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Оберіть дату" />
            </Form.Item>
          </Space>
          <Form.Item name="status" label="Статус" initialValue="draft">
            <Select options={[
              { value: 'draft', label: 'Чернетка' },
              { value: 'active', label: 'Діючий' },
              { value: 'expired', label: 'Недіючий' },
              { value: 'cancelled', label: 'Скасований' },
            ]} />
          </Form.Item>
          <Form.Item label="Документ">
            <Upload
              fileList={fileList}
              onChange={({ fileList: fl }) => setFileList(fl)}
              beforeUpload={() => false}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Завантажити файл</Button>
            </Upload>
          </Form.Item>
          <Form.Item name="notes" label="Примітки">
            <Input.TextArea rows={2} placeholder="Додаткові примітки" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Деталі специфікації"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailOpen(false)}>Закрити</Button>,
          <Button key="edit" type="primary" icon={<EditOutlined />} onClick={() => { setDetailOpen(false); if (viewingRecord) openEdit(viewingRecord) }}>
            Редагувати
          </Button>,
        ]}
        width={640}
      >
        {viewingRecord && (
          <Descriptions column={2} bordered size="small" style={{ marginTop: 16 }}>
            <Descriptions.Item label="Номер" span={1}><Text strong>{viewingRecord.number}</Text></Descriptions.Item>
            <Descriptions.Item label="Статус" span={1}><Tag color={statusMap[viewingRecord.status]?.color}>{statusMap[viewingRecord.status]?.label}</Tag></Descriptions.Item>
            <Descriptions.Item label="Назва" span={2}>{viewingRecord.title}</Descriptions.Item>
            <Descriptions.Item label="Приналежність" span={2}>
              {viewingRecord.affiliation_name ? <Tag color="blue">{viewingRecord.affiliation_name}</Tag> : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Опис" span={2}>{viewingRecord.description || '—'}</Descriptions.Item>
            <Descriptions.Item label="Дата введення в дію" span={1}>
              <CalendarOutlined style={{ marginRight: 4 }} />
              {viewingRecord.effective_date ? dayjs(viewingRecord.effective_date).format('DD.MM.YYYY') : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Дата закінчення" span={1}>
              {viewingRecord.expiry_date ? dayjs(viewingRecord.expiry_date).format('DD.MM.YYYY') : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Документ" span={2}>
              {viewingRecord.file
                ? <Button type="link" icon={<DownloadOutlined />} style={{ padding: 0 }}>Завантажити файл</Button>
                : <Text type="secondary">Файл не завантажено</Text>}
            </Descriptions.Item>
            <Descriptions.Item label="Примітки" span={2}>{viewingRecord.notes || '—'}</Descriptions.Item>
            <Descriptions.Item label="Створив" span={1}>{viewingRecord.created_by_name}</Descriptions.Item>
            <Descriptions.Item label="Дата створення" span={1}>{dayjs(viewingRecord.created_at).format('DD.MM.YYYY')}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Affiliations Management Modal */}
      <Modal
        title="Довідник приналежностей"
        open={affiliationModalOpen}
        onCancel={() => setAffiliationModalOpen(false)}
        footer={null}
        width={500}
      >
        <div style={{ marginBottom: 16 }}>
          <Table
            dataSource={affiliations}
            rowKey="id"
            size="small"
            pagination={false}
            columns={[
              { title: 'Назва', dataIndex: 'name', key: 'name' },
              {
                title: 'Дії',
                key: 'actions',
                width: 80,
                render: () => (
                  <Space>
                    <Button type="link" size="small" icon={<EditOutlined />} />
                    <Popconfirm title="Видалити?" onConfirm={() => message.success('Видалено')} okText="Так" cancelText="Ні">
                      <Button type="link" size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </Space>
                ),
              },
            ]}
          />
        </div>
        <Form form={affiliationForm} layout="inline" style={{ display: 'flex', gap: 8 }}>
          <Form.Item name="name" rules={[{ required: true, message: 'Введіть назву' }]} style={{ flex: 1 }}>
            <Input placeholder="Нова приналежність" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAffiliationSave}>Додати</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default TechSpecsPage
