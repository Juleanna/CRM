import { useState, useEffect } from 'react'
import { Table, Button, Card, Typography, Tag, Input, Modal, Form, Select, Space, message, Popconfirm, DatePicker, Upload, Descriptions, Spin } from 'antd'
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTechSpecs, createTechSpec, updateTechSpec, deleteTechSpec,
  getAffiliations, createAffiliation, updateAffiliation, deleteAffiliation,
} from '../api/techSpecs'
import type { PaginatedResponse, TechnicalSpecification, Affiliation } from '../types'
import { useAuthStore } from '../store/authStore'
import dayjs from 'dayjs'

const { Title, Text } = Typography

const statusMap: Record<string, { label: string; color: string }> = {
  draft: { label: 'Чернетка', color: 'default' },
  active: { label: 'Діючий', color: 'green' },
  expired: { label: 'Недіючий', color: 'orange' },
  cancelled: { label: 'Скасований', color: 'red' },
}

function TechSpecsPage() {
  const { hasPermission } = useAuthStore()
  const canCreate = hasPermission('tech_specs', 'can_create')
  const canEdit = hasPermission('tech_specs', 'can_edit')
  const canDelete = hasPermission('tech_specs', 'can_delete')

  const queryClient = useQueryClient()
  const [messageApi, contextHolder] = message.useMessage()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [affiliationFilter, setAffiliationFilter] = useState<number | ''>('')
  const [modalOpen, setModalOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<TechnicalSpecification | null>(null)
  const [viewingRecord, setViewingRecord] = useState<TechnicalSpecification | null>(null)
  const [affiliationModalOpen, setAffiliationModalOpen] = useState(false)
  const [editingAffiliation, setEditingAffiliation] = useState<Affiliation | null>(null)
  const [affiliationForm] = Form.useForm()
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState<UploadFile[]>([])

  /* ── Queries ─────────────────────────────────────────────── */
  const queryParams: Record<string, unknown> = { page_size: 1000 }
  if (search) queryParams.search = search
  if (statusFilter) queryParams.status = statusFilter
  if (affiliationFilter) queryParams.affiliation = affiliationFilter

  const { data: techSpecsData, isLoading: specsLoading } = useQuery<PaginatedResponse<TechnicalSpecification>>({
    queryKey: ['techSpecs', search, statusFilter, affiliationFilter],
    queryFn: () => getTechSpecs(queryParams).then(r => r.data),
  })

  const { data: affiliationsData } = useQuery<PaginatedResponse<Affiliation>>({
    queryKey: ['affiliations'],
    queryFn: () => getAffiliations({ page_size: 1000 }).then(r => r.data),
  })

  const techSpecs = techSpecsData?.results ?? []
  const affiliations = affiliationsData?.results ?? []

  /* ── Tech Spec Mutations ────────────────────────────────── */
  const createSpecMutation = useMutation({
    mutationFn: (data: FormData | Record<string, unknown>) => createTechSpec(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['techSpecs'] })
      messageApi.success('Специфікацію створено')
      closeModal()
    },
    onError: () => {
      messageApi.error('Помилка при створенні специфікації')
    },
  })

  const updateSpecMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData | Record<string, unknown> }) =>
      updateTechSpec(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['techSpecs'] })
      messageApi.success('Специфікацію оновлено')
      closeModal()
    },
    onError: () => {
      messageApi.error('Помилка при оновленні специфікації')
    },
  })

  const deleteSpecMutation = useMutation({
    mutationFn: (id: number) => deleteTechSpec(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['techSpecs'] })
      messageApi.success('Специфікацію видалено')
    },
    onError: () => {
      messageApi.error('Помилка при видаленні специфікації')
    },
  })

  /* ── Affiliation Mutations ──────────────────────────────── */
  const createAffiliationMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => createAffiliation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliations'] })
      messageApi.success('Приналежність створено')
      affiliationForm.resetFields()
      setEditingAffiliation(null)
    },
    onError: () => {
      messageApi.error('Помилка при створенні приналежності')
    },
  })

  const updateAffiliationMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      updateAffiliation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliations'] })
      messageApi.success('Приналежність оновлено')
      affiliationForm.resetFields()
      setEditingAffiliation(null)
    },
    onError: () => {
      messageApi.error('Помилка при оновленні приналежності')
    },
  })

  const deleteAffiliationMutation = useMutation({
    mutationFn: (id: number) => deleteAffiliation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliations'] })
      messageApi.success('Приналежність видалено')
    },
    onError: () => {
      messageApi.error('Помилка при видаленні приналежності')
    },
  })

  /* ── Tech Spec Modal Handlers ───────────────────────────── */
  const openCreate = () => {
    setEditingRecord(null)
    form.resetFields()
    setFileList([])
    setModalOpen(true)
  }

  const openEdit = (record: TechnicalSpecification) => {
    setEditingRecord(record)
    setModalOpen(true)
  }

  useEffect(() => {
    if (!modalOpen) return
    if (editingRecord) {
      form.setFieldsValue({
        ...editingRecord,
        affiliation_id: editingRecord.affiliation,
        effective_date: editingRecord.effective_date ? dayjs(editingRecord.effective_date) : null,
        expiry_date: editingRecord.expiry_date ? dayjs(editingRecord.expiry_date) : null,
      })
      setFileList(editingRecord.file ? [{ uid: '-1', name: editingRecord.file.split('/').pop() || 'document.pdf', status: 'done', url: editingRecord.file }] : [])
    } else {
      form.resetFields()
      setFileList([])
    }
  }, [modalOpen, editingRecord, form])

  const closeModal = () => {
    setModalOpen(false)
    setEditingRecord(null)
    form.resetFields()
    setFileList([])
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()

      // Use FormData if there's a new file to upload
      const hasNewFile = fileList.length > 0 && fileList[0].originFileObj
      let payload: FormData | Record<string, unknown>

      if (hasNewFile) {
        const fd = new FormData()
        fd.append('title', values.title)
        if (values.number) fd.append('number', values.number)
        if (values.affiliation_id) fd.append('affiliation', String(values.affiliation_id))
        if (values.description) fd.append('description', values.description)
        if (values.effective_date) fd.append('effective_date', values.effective_date.format('YYYY-MM-DD'))
        if (values.expiry_date) fd.append('expiry_date', values.expiry_date.format('YYYY-MM-DD'))
        if (values.status) fd.append('status', values.status)
        if (values.notes) fd.append('notes', values.notes)
        fd.append('file', fileList[0].originFileObj as File)
        payload = fd
      } else {
        payload = {
          title: values.title,
          number: values.number || '',
          affiliation: values.affiliation_id || null,
          description: values.description || '',
          effective_date: values.effective_date ? values.effective_date.format('YYYY-MM-DD') : null,
          expiry_date: values.expiry_date ? values.expiry_date.format('YYYY-MM-DD') : null,
          status: values.status || 'draft',
          notes: values.notes || '',
        }
      }

      if (editingRecord) {
        updateSpecMutation.mutate({ id: editingRecord.id, data: payload })
      } else {
        createSpecMutation.mutate(payload)
      }
    } catch {
      // validation
    }
  }

  const handleDelete = (id: number) => {
    deleteSpecMutation.mutate(id)
  }

  /* ── Affiliation Handlers ───────────────────────────────── */
  const handleAffiliationSave = async () => {
    try {
      const values = await affiliationForm.validateFields()
      if (editingAffiliation) {
        updateAffiliationMutation.mutate({ id: editingAffiliation.id, data: values })
      } else {
        createAffiliationMutation.mutate(values)
      }
    } catch {
      // validation
    }
  }

  const startEditAffiliation = (record: Affiliation) => {
    setEditingAffiliation(record)
    affiliationForm.setFieldsValue({ name: record.name })
  }

  const handleDeleteAffiliation = (id: number) => {
    deleteAffiliationMutation.mutate(id)
  }

  /* ── Table columns ──────────────────────────────────────── */
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
      sorter: (a: TechnicalSpecification, b: TechnicalSpecification) => a.title.localeCompare(b.title),
    },
    {
      title: 'Приналежність',
      dataIndex: 'affiliation_name',
      key: 'affiliation_name',
      width: 180,
      render: (v: string) => v ? <Tag color="blue">{v}</Tag> : <Text type="secondary">--</Text>,
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
      render: (v: string | null) => v ? dayjs(v).format('DD.MM.YYYY') : '--',
      sorter: (a: TechnicalSpecification, b: TechnicalSpecification) => (a.effective_date || '').localeCompare(b.effective_date || ''),
    },
    {
      title: 'Дата закінчення',
      dataIndex: 'expiry_date',
      key: 'expiry_date',
      width: 140,
      render: (v: string | null) => v ? dayjs(v).format('DD.MM.YYYY') : '--',
    },
    {
      title: 'Документ',
      dataIndex: 'file',
      key: 'file',
      width: 100,
      render: (v: string | null) => v
        ? <Button type="link" size="small" icon={<DownloadOutlined />} href={v} target="_blank">Файл</Button>
        : <Text type="secondary">--</Text>,
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
      render: (_: unknown, record: TechnicalSpecification) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setViewingRecord(record); setDetailOpen(true) }} />
          {canEdit && <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />}
          {canDelete && <Popconfirm title="Видалити специфікацію?" onConfirm={() => handleDelete(record.id)} okText="Так" cancelText="Ні">
            <Button type="link" size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>}
        </Space>
      ),
    },
  ]

  return (
    <div>
      {contextHolder}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          <FileTextOutlined style={{ marginRight: 8 }} />
          Реєстр технічних специфікацій
        </Title>
        <Space>
          <Button onClick={() => { setEditingAffiliation(null); affiliationForm.resetFields(); setAffiliationModalOpen(true) }}>Приналежності</Button>
          {canCreate && <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Створити</Button>}
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
        <Spin spinning={specsLoading}>
          <Table columns={columns} dataSource={techSpecs} rowKey="id" size="middle" pagination={{ pageSize: 10, showTotal: total => `Всього: ${total}` }} />
        </Spin>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingRecord ? 'Редагувати специфікацію' : 'Створити специфікацію'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={handleSave}
        okText="Зберегти"
        cancelText="Скасувати"
        confirmLoading={createSpecMutation.isPending || updateSpecMutation.isPending}
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
          canEdit && <Button key="edit" type="primary" icon={<EditOutlined />} onClick={() => { setDetailOpen(false); if (viewingRecord) openEdit(viewingRecord) }}>
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
              {viewingRecord.affiliation_name ? <Tag color="blue">{viewingRecord.affiliation_name}</Tag> : '--'}
            </Descriptions.Item>
            <Descriptions.Item label="Опис" span={2}>{viewingRecord.description || '--'}</Descriptions.Item>
            <Descriptions.Item label="Дата введення в дію" span={1}>
              <CalendarOutlined style={{ marginRight: 4 }} />
              {viewingRecord.effective_date ? dayjs(viewingRecord.effective_date).format('DD.MM.YYYY') : '--'}
            </Descriptions.Item>
            <Descriptions.Item label="Дата закінчення" span={1}>
              {viewingRecord.expiry_date ? dayjs(viewingRecord.expiry_date).format('DD.MM.YYYY') : '--'}
            </Descriptions.Item>
            <Descriptions.Item label="Документ" span={2}>
              {viewingRecord.file
                ? <Button type="link" icon={<DownloadOutlined />} href={viewingRecord.file} target="_blank" style={{ padding: 0 }}>Завантажити файл</Button>
                : <Text type="secondary">Файл не завантажено</Text>}
            </Descriptions.Item>
            <Descriptions.Item label="Примітки" span={2}>{viewingRecord.notes || '--'}</Descriptions.Item>
            <Descriptions.Item label="Створив" span={1}>{viewingRecord.created_by_name}</Descriptions.Item>
            <Descriptions.Item label="Дата створення" span={1}>{dayjs(viewingRecord.created_at).format('DD.MM.YYYY')}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Affiliations Management Modal */}
      <Modal
        title="Довідник приналежностей"
        open={affiliationModalOpen}
        onCancel={() => { setAffiliationModalOpen(false); setEditingAffiliation(null); affiliationForm.resetFields() }}
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
                render: (_: unknown, record: Affiliation) => (
                  <Space>
                    {canEdit && <Button type="link" size="small" icon={<EditOutlined />} onClick={() => startEditAffiliation(record)} />}
                    {canDelete && <Popconfirm title="Видалити?" onConfirm={() => handleDeleteAffiliation(record.id)} okText="Так" cancelText="Ні">
                      <Button type="link" size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>}
                  </Space>
                ),
              },
            ]}
          />
        </div>
        {(canCreate || editingAffiliation) && <Form form={affiliationForm} layout="inline" style={{ display: 'flex', gap: 8 }}>
          <Form.Item name="name" rules={[{ required: true, message: 'Введіть назву' }]} style={{ flex: 1 }}>
            <Input placeholder={editingAffiliation ? 'Редагувати приналежність' : 'Нова приналежність'} />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAffiliationSave}
              loading={createAffiliationMutation.isPending || updateAffiliationMutation.isPending}
            >
              {editingAffiliation ? 'Зберегти' : 'Додати'}
            </Button>
          </Form.Item>
          {editingAffiliation && (
            <Form.Item>
              <Button onClick={() => { setEditingAffiliation(null); affiliationForm.resetFields() }}>
                Скасувати
              </Button>
            </Form.Item>
          )}
        </Form>}
      </Modal>
    </div>
  )
}

export default TechSpecsPage
