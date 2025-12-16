"""
Модели для постов (сниппетов кода)
"""
import uuid
from django.db import models
from django.conf import settings


class Tag(models.Model):
    """Тег для категоризации постов"""
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    name = models.CharField(
        max_length=50,
        unique=True,
        verbose_name='Название'
    )
    color = models.CharField(
        max_length=7,
        default='#3B82F6',
        verbose_name='Цвет (HEX)'
    )
    usage_count = models.PositiveIntegerField(
        default=0,
        verbose_name='Использований'
    )
    
    class Meta:
        verbose_name = 'Тег'
        verbose_name_plural = 'Теги'
        ordering = ['-usage_count', 'name']
    
    def __str__(self):
        return self.name


class Post(models.Model):
    """Пост с кодом (code snippet)"""
    
    # Доступные языки программирования
    LANGUAGE_CHOICES = [
        ('javascript', 'JavaScript'),
        ('typescript', 'TypeScript'),
        ('python', 'Python'),
        ('rust', 'Rust'),
        ('go', 'Go'),
        ('java', 'Java'),
        ('csharp', 'C#'),
        ('cpp', 'C++'),
        ('c', 'C'),
        ('html', 'HTML'),
        ('css', 'CSS'),
        ('sql', 'SQL'),
        ('shell', 'Shell/Bash'),
        ('ruby', 'Ruby'),
        ('php', 'PHP'),
        ('swift', 'Swift'),
        ('kotlin', 'Kotlin'),
        ('dart', 'Dart'),
        ('yaml', 'YAML'),
        ('json', 'JSON'),
        ('markdown', 'Markdown'),
        ('other', 'Другой'),
    ]
    
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='posts',
        verbose_name='Автор'
    )
    title = models.CharField(
        max_length=200,
        verbose_name='Заголовок'
    )
    filename = models.CharField(
        max_length=255,
        verbose_name='Имя файла'
    )
    language = models.CharField(
        max_length=50,
        choices=LANGUAGE_CHOICES,
        verbose_name='Язык'
    )
    code = models.TextField(
        verbose_name='Код'
    )
    description = models.TextField(
        blank=True,
        max_length=2000,
        verbose_name='Описание'
    )
    is_public = models.BooleanField(
        default=True,
        verbose_name='Публичный'
    )
    
    # Теги
    tags = models.ManyToManyField(
        Tag,
        blank=True,
        related_name='posts',
        verbose_name='Теги'
    )
    
    # Счётчики (денормализация для производительности)
    views = models.PositiveIntegerField(
        default=0,
        verbose_name='Просмотры'
    )
    likes_count = models.PositiveIntegerField(
        default=0,
        verbose_name='Лайки'
    )
    comments_count = models.PositiveIntegerField(
        default=0,
        verbose_name='Комментарии'
    )
    bookmarks_count = models.PositiveIntegerField(
        default=0,
        verbose_name='В закладках'
    )
    forks_count = models.PositiveIntegerField(
        default=0,
        verbose_name='Форки'
    )
    
    # Метаданные
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Создан'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Обновлён'
    )
    
    class Meta:
        verbose_name = 'Пост'
        verbose_name_plural = 'Посты'
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.filename} by {self.author.username}'
    
    def save(self, *args, **kwargs):
        """Обновляем счётчик постов у автора"""
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new:
            from users.models import User
            User.objects.filter(pk=self.author_id).update(
                posts_count=models.F('posts_count') + 1
            )


class Like(models.Model):
    """Лайк поста"""
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='likes',
        verbose_name='Пользователь'
    )
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='likes',
        verbose_name='Пост'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата'
    )
    
    class Meta:
        verbose_name = 'Лайк'
        verbose_name_plural = 'Лайки'
        unique_together = ['user', 'post']
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.user.username} -> {self.post.filename}'


class Bookmark(models.Model):
    """Закладка поста"""
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookmarks',
        verbose_name='Пользователь'
    )
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='bookmarks',
        verbose_name='Пост'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата'
    )
    
    class Meta:
        verbose_name = 'Закладка'
        verbose_name_plural = 'Закладки'
        unique_together = ['user', 'post']
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.user.username} -> {self.post.filename}'


class Comment(models.Model):
    """Комментарий к посту"""
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='comments',
        verbose_name='Пост'
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='comments',
        verbose_name='Автор'
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies',
        verbose_name='Родительский комментарий'
    )
    content = models.TextField(
        max_length=2000,
        verbose_name='Содержание'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Обновлён'
    )
    
    class Meta:
        verbose_name = 'Комментарий'
        verbose_name_plural = 'Комментарии'
        ordering = ['created_at']
    
    def __str__(self):
        return f'{self.author.username}: {self.content[:50]}...'


class PostRevision(models.Model):
    """История изменений поста (как в GitHub)"""
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='revisions',
        verbose_name='Пост'
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='post_revisions',
        verbose_name='Автор изменения'
    )
    revision_number = models.PositiveIntegerField(
        verbose_name='Номер ревизии'
    )
    
    # Сохраняем предыдущее состояние
    title = models.CharField(
        max_length=200,
        verbose_name='Заголовок'
    )
    code = models.TextField(
        verbose_name='Код'
    )
    description = models.TextField(
        blank=True,
        max_length=2000,
        verbose_name='Описание'
    )
    
    # Комментарий к изменению
    commit_message = models.CharField(
        max_length=500,
        blank=True,
        verbose_name='Сообщение об изменении'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата изменения'
    )
    
    class Meta:
        verbose_name = 'Ревизия поста'
        verbose_name_plural = 'Ревизии постов'
        ordering = ['-revision_number']
        unique_together = ['post', 'revision_number']
    
    def __str__(self):
        return f'{self.post.filename} v{self.revision_number}'


class PostView(models.Model):
    """Просмотр поста (для уникальных просмотров)"""
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='post_views',
        verbose_name='Пост'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='post_views',
        verbose_name='Пользователь'
    )
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        verbose_name='IP адрес'
    )
    session_key = models.CharField(
        max_length=40,
        null=True,
        blank=True,
        verbose_name='Ключ сессии'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата просмотра'
    )
    
    class Meta:
        verbose_name = 'Просмотр поста'
        verbose_name_plural = 'Просмотры постов'
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.post.filename} - {self.user or self.ip_address}'
    
    @classmethod
    def record_view(cls, post, user=None, ip_address=None, session_key=None):
        """Записывает уникальный просмотр"""
        # Проверяем, есть ли уже просмотр от этого пользователя/IP
        if user and user.is_authenticated:
            if cls.objects.filter(post=post, user=user).exists():
                return False  # Уже просмотрен
            cls.objects.create(post=post, user=user)
        elif session_key:
            if cls.objects.filter(post=post, session_key=session_key).exists():
                return False
            cls.objects.create(post=post, session_key=session_key, ip_address=ip_address)
        elif ip_address:
            if cls.objects.filter(post=post, ip_address=ip_address).exists():
                return False
            cls.objects.create(post=post, ip_address=ip_address)
        else:
            return False
        
        # Сигнал post_save увеличит views автоматически
        return True


class Notification(models.Model):
    """Уведомление пользователя"""
    
    TYPE_CHOICES = [
        ('like', 'Лайк'),
        ('comment', 'Комментарий'),
        ('follow', 'Подписка'),
        ('reply', 'Ответ'),
        ('new_post', 'Новый пост'),
    ]
    
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name='Получатель'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_notifications',
        verbose_name='Отправитель'
    )
    notification_type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        verbose_name='Тип уведомления'
    )
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications',
        verbose_name='Пост'
    )
    comment = models.ForeignKey(
        'Comment',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications',
        verbose_name='Комментарий'
    )
    message = models.CharField(
        max_length=255,
        blank=True,
        verbose_name='Сообщение'
    )
    is_read = models.BooleanField(
        default=False,
        verbose_name='Прочитано'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Создано'
    )
    
    class Meta:
        verbose_name = 'Уведомление'
        verbose_name_plural = 'Уведомления'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.sender.username} -> {self.recipient.username}: {self.notification_type}"
