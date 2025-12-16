"""
Админка для пользователей
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Follow


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Кастомная админка для модели User"""
    list_display = [
        'username',
        'email',
        'display_name',
        'is_verified',
        'date_joined',
        'followers_count',
        'posts_count',
    ]
    list_filter = ['is_verified', 'is_staff', 'is_active', 'date_joined']
    search_fields = ['username', 'email', 'display_name']
    ordering = ['-date_joined']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Профиль', {
            'fields': (
                'display_name',
                'bio',
                'avatar',
                'location',
                'website',
            )
        }),
        ('Социальные сети', {
            'fields': (
                'github_username',
                'twitter_username',
            )
        }),
        ('Статистика', {
            'fields': (
                'is_verified',
                'followers_count',
                'following_count',
                'posts_count',
            )
        }),
    )


@admin.register(Follow)
class FollowAdmin(admin.ModelAdmin):
    """Админка для подписок"""
    list_display = ['follower', 'following', 'created_at']
    list_filter = ['created_at']
    search_fields = ['follower__username', 'following__username']
    ordering = ['-created_at']
