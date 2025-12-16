"""
Админка для постов
"""
from django.contrib import admin
from .models import Post, Tag, Like, Bookmark, Comment


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'color', 'usage_count']
    search_fields = ['name']
    ordering = ['-usage_count']


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = [
        'filename',
        'author',
        'language',
        'is_public',
        'likes_count',
        'views',
        'created_at',
    ]
    list_filter = ['language', 'is_public', 'created_at']
    search_fields = ['title', 'filename', 'author__username', 'description']
    ordering = ['-created_at']
    filter_horizontal = ['tags']
    readonly_fields = ['views', 'likes_count', 'comments_count', 'bookmarks_count', 'forks_count']


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ['user', 'post', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'post__filename']


@admin.register(Bookmark)
class BookmarkAdmin(admin.ModelAdmin):
    list_display = ['user', 'post', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'post__filename']


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['author', 'post', 'content_preview', 'created_at']
    list_filter = ['created_at']
    search_fields = ['author__username', 'content']
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Содержание'
