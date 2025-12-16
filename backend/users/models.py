"""
Модели пользователей для GitForum
"""
import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Кастомная модель пользователя с дополнительными полями
    """
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        verbose_name='ID'
    )
    
    # Основная информация
    display_name = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Отображаемое имя'
    )
    bio = models.TextField(
        blank=True,
        max_length=500,
        verbose_name='О себе'
    )
    avatar = models.CharField(
        max_length=500,
        blank=True,
        default='',
        verbose_name='Аватар URL'
    )
    
    # Контактная информация
    location = models.CharField(
        max_length=100,
        blank=True,
        verbose_name='Местоположение'
    )
    website = models.URLField(
        blank=True,
        verbose_name='Веб-сайт'
    )
    github_username = models.CharField(
        max_length=39,
        blank=True,
        verbose_name='GitHub'
    )
    twitter_username = models.CharField(
        max_length=15,
        blank=True,
        verbose_name='Twitter/X'
    )
    
    # Статус
    is_verified = models.BooleanField(
        default=False,
        verbose_name='Верифицирован'
    )
    
    # Счётчики (денормализация для быстрого доступа)
    followers_count = models.PositiveIntegerField(
        default=0,
        verbose_name='Подписчики'
    )
    following_count = models.PositiveIntegerField(
        default=0,
        verbose_name='Подписки'
    )
    posts_count = models.PositiveIntegerField(
        default=0,
        verbose_name='Посты'
    )
    
    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'
        ordering = ['-date_joined']
    
    def __str__(self):
        return self.username
    
    @property
    def name(self):
        """Возвращает display_name или username"""
        return self.display_name or self.username


class Follow(models.Model):
    """
    Модель подписок (follower -> following)
    """
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    follower = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='following_set',
        verbose_name='Подписчик'
    )
    following = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='followers_set',
        verbose_name='На кого подписан'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата подписки'
    )
    
    class Meta:
        verbose_name = 'Подписка'
        verbose_name_plural = 'Подписки'
        unique_together = ['follower', 'following']
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.follower.username} -> {self.following.username}'
    
    def save(self, *args, **kwargs):
        """Обновляем счётчики при сохранении"""
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new:
            # Увеличиваем счётчики
            User.objects.filter(pk=self.follower.pk).update(
                following_count=models.F('following_count') + 1
            )
            User.objects.filter(pk=self.following.pk).update(
                followers_count=models.F('followers_count') + 1
            )
    
    def delete(self, *args, **kwargs):
        """Обновляем счётчики при удалении"""
        follower_id = self.follower_id
        following_id = self.following_id
        super().delete(*args, **kwargs)
        
        # Уменьшаем счётчики
        User.objects.filter(pk=follower_id).update(
            following_count=models.F('following_count') - 1
        )
        User.objects.filter(pk=following_id).update(
            followers_count=models.F('followers_count') - 1
        )
