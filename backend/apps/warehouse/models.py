from django.db import models
from django.conf import settings


class Warehouse(models.Model):
    class WarehouseType(models.TextChoices):
        MAIN = 'main', 'Головний склад'
        PRODUCTION_UNIT = 'production_unit', 'Склад виробничого підрозділу'

    name = models.CharField('Назва', max_length=255)
    address = models.TextField('Адреса', blank=True)
    contact_info = models.TextField('Контактна інформація', blank=True)
    warehouse_type = models.CharField('Тип складу', max_length=30, choices=WarehouseType.choices)
    manager = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Завскладу', related_name='managed_warehouses')

    class Meta:
        verbose_name = 'Склад'
        verbose_name_plural = 'Склади'

    def __str__(self):
        return self.name


class FabricType(models.Model):
    """Тип тканини (бавовна, поліестер, шовк тощо)"""
    name = models.CharField('Назва', max_length=255, unique=True)
    description = models.TextField('Опис', blank=True)
    created_at = models.DateTimeField('Створено', auto_now_add=True)

    class Meta:
        verbose_name = 'Тип тканини'
        verbose_name_plural = 'Типи тканини'
        ordering = ['name']

    def __str__(self):
        return self.name


class FabricClass(models.Model):
    """Клас тканини (1-й клас, 2-й клас, люкс тощо)"""
    name = models.CharField('Назва', max_length=255, unique=True)
    description = models.TextField('Опис', blank=True)
    created_at = models.DateTimeField('Створено', auto_now_add=True)

    class Meta:
        verbose_name = 'Клас тканини'
        verbose_name_plural = 'Класи тканини'
        ordering = ['name']

    def __str__(self):
        return self.name


class Size(models.Model):
    """Розмір готових виробів"""
    name = models.CharField('Розмір', max_length=50, unique=True)
    description = models.TextField('Опис', blank=True)
    sort_order = models.PositiveIntegerField('Порядок сортування', default=0)
    created_at = models.DateTimeField('Створено', auto_now_add=True)

    class Meta:
        verbose_name = 'Розмір'
        verbose_name_plural = 'Розміри'
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name


class Material(models.Model):
    class Unit(models.TextChoices):
        RUNNING_METER = 'rm', 'м/п'
        PIECE = 'pcs', 'шт'
        KILOGRAM = 'kg', 'кг'
        LINEAR_METER = 'lm', 'км/п'

    article = models.CharField('Артикул/код', max_length=100, unique=True)
    name = models.CharField('Назва', max_length=255)
    material_type = models.CharField('Тип', max_length=100, blank=True)
    category = models.CharField('Категорія', max_length=100, blank=True)
    density = models.CharField('Щільність', max_length=100, blank=True)
    color = models.CharField('Колір', max_length=100, blank=True)
    is_available = models.BooleanField('Наявність', default=True)
    unit = models.CharField('Одиниці виміру', max_length=10, choices=Unit.choices, default=Unit.RUNNING_METER)
    quantity = models.DecimalField('Кількість на складі', max_digits=10, decimal_places=2, default=0)
    price_per_unit = models.DecimalField('Ціна за 1 одиницю', max_digits=10, decimal_places=2, default=0)
    currency = models.CharField('Валюта', max_length=10, default='UAH')
    total_price = models.DecimalField('Загальна ціна', max_digits=12, decimal_places=2, default=0)
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, verbose_name='Склад', related_name='materials')
    supplier = models.ForeignKey('procurement.Supplier', on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Постачальник', related_name='materials')
    ttn = models.CharField('ТТН', max_length=255, blank=True)
    order_date = models.DateField('Дата замовлення', null=True, blank=True)
    delivery_date = models.DateField('Дата поставки', null=True, blank=True)
    created_at = models.DateTimeField('Створено', auto_now_add=True)
    updated_at = models.DateTimeField('Оновлено', auto_now=True)

    class Meta:
        verbose_name = 'Матеріал'
        verbose_name_plural = 'Матеріали'

    def __str__(self):
        return f'{self.name} ({self.article})'


class Pattern(models.Model):
    class PatternType(models.TextChoices):
        MALE = 'male', 'Чоловіче'
        FEMALE = 'female', 'Жіноче'
        UNISEX = 'unisex', 'Унісекс'
        CHILD = 'child', 'Дитяче'

    name = models.CharField('Назва', max_length=255)
    category = models.CharField('Категорія', max_length=100, blank=True)
    pattern_type = models.CharField('Тип', max_length=20, choices=PatternType.choices)
    article = models.CharField('Артикул', max_length=100, unique=True)
    size_range = models.CharField('Розмірний ряд', max_length=255, blank=True)
    file = models.FileField('Файл викрійки', upload_to='patterns/', blank=True, null=True)
    created_at = models.DateTimeField('Створено', auto_now_add=True)
    updated_at = models.DateTimeField('Оновлено', auto_now=True)

    class Meta:
        verbose_name = 'Лекало'
        verbose_name_plural = 'Лекала'

    def __str__(self):
        return f'{self.name} ({self.article})'


class MaterialTransfer(models.Model):
    from_warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, verbose_name='Звідки', related_name='outgoing_material_transfers')
    to_warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, verbose_name='Куди', related_name='incoming_material_transfers')
    material = models.ForeignKey(Material, on_delete=models.CASCADE, verbose_name='Матеріал', related_name='transfers')
    quantity = models.DecimalField('Кількість', max_digits=10, decimal_places=2)
    date = models.DateField('Дата')
    comment = models.TextField('Коментар', blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, verbose_name='Створив', related_name='created_material_transfers')
    accepted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Прийняв', related_name='accepted_material_transfers')
    is_accepted = models.BooleanField('Прийнято', default=False)
    created_at = models.DateTimeField('Створено', auto_now_add=True)

    class Meta:
        verbose_name = 'Переміщення матеріалу'
        verbose_name_plural = 'Переміщення матеріалів'
        ordering = ['-date']

    def __str__(self):
        return f'{self.material} -> {self.to_warehouse} ({self.date})'


class ProductTransfer(models.Model):
    from_warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, verbose_name='Звідки', related_name='outgoing_product_transfers')
    to_warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, verbose_name='Куди', related_name='incoming_product_transfers')
    product_name = models.CharField('Назва виробу', max_length=255)
    contract = models.ForeignKey('contracts.Contract', on_delete=models.CASCADE, verbose_name='Договір', related_name='product_transfers')
    quantity = models.PositiveIntegerField('Кількість')
    date = models.DateField('Дата')
    comment = models.TextField('Коментар', blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, verbose_name='Створив', related_name='created_product_transfers')
    accepted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Прийняв', related_name='accepted_product_transfers')
    is_accepted = models.BooleanField('Прийнято', default=False)
    created_at = models.DateTimeField('Створено', auto_now_add=True)

    class Meta:
        verbose_name = 'Переміщення виробів'
        verbose_name_plural = 'Переміщення виробів'
        ordering = ['-date']

    def __str__(self):
        return f'{self.product_name} -> {self.to_warehouse} ({self.date})'


class Return(models.Model):
    class ReturnType(models.TextChoices):
        MATERIAL_TO_SUPPLIER = 'material_to_supplier', 'Повернення матеріалу постачальнику'
        PRODUCT_FROM_CUSTOMER = 'product_from_customer', 'Повернення виробів від замовника'

    return_type = models.CharField('Тип повернення', max_length=30, choices=ReturnType.choices)
    material = models.ForeignKey(Material, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Матеріал', related_name='returns')
    product_name = models.CharField('Назва виробу', max_length=255, blank=True)
    purchase_date = models.DateField('Дата закупівлі', null=True, blank=True)
    quantity = models.DecimalField('Кількість', max_digits=10, decimal_places=2)
    price_per_unit = models.DecimalField('Ціна за одиницю', max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField('Загальна сума', max_digits=12, decimal_places=2, default=0)
    ttn_file = models.FileField('ТТН', upload_to='returns/ttn/', blank=True, null=True)
    payment_receipt = models.FileField('Квитанція про оплату', upload_to='returns/receipts/', blank=True, null=True)
    reason = models.TextField('Причина повернення')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, verbose_name='Створив')
    created_at = models.DateTimeField('Створено', auto_now_add=True)

    class Meta:
        verbose_name = 'Повернення'
        verbose_name_plural = 'Повернення'
        ordering = ['-created_at']

    def __str__(self):
        return f'Повернення: {self.material or self.product_name}'
