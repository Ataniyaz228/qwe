"""
URL маршруты для постов
"""
from django.urls import path
from . import views

urlpatterns = [
    # Посты
    path('posts/', views.PostListCreateView.as_view(), name='post-list'),
    path('posts/<uuid:id>/', views.PostDetailView.as_view(), name='post-detail'),
    path('posts/<uuid:id>/like/', views.PostLikeView.as_view(), name='post-like'),
    path('posts/<uuid:id>/bookmark/', views.PostBookmarkView.as_view(), name='post-bookmark'),
    path('posts/<uuid:id>/comments/', views.PostCommentsView.as_view(), name='post-comments'),
    path('comments/<uuid:id>/', views.CommentDeleteView.as_view(), name='comment-delete'),
    path('posts/<uuid:id>/revisions/', views.PostRevisionsView.as_view(), name='post-revisions'),
    
    # Ревизии
    path('revisions/<uuid:id>/', views.PostRevisionDetailView.as_view(), name='revision-detail'),
    
    # Закладки текущего пользователя
    path('bookmarks/', views.UserBookmarksView.as_view(), name='user-bookmarks'),
    
    # Уведомления
    path('notifications/', views.NotificationListView.as_view(), name='notification-list'),
    path('notifications/read-all/', views.MarkNotificationsReadView.as_view(), name='notifications-read-all'),
    path('notifications/<uuid:id>/read/', views.MarkNotificationReadView.as_view(), name='notification-read'),
    
    # Посты пользователя
    path('users/<str:username>/posts/', views.UserPostsView.as_view(), name='user-posts'),
    
    # Трендовые и теги
    path('trending/', views.TrendingPostsView.as_view(), name='trending-posts'),
    path('tags/', views.TagListView.as_view(), name='tag-list'),
    path('tags/<str:name>/posts/', views.TagPostsView.as_view(), name='tag-posts'),
    
    # Статистика платформы
    path('stats/', views.PlatformStatsView.as_view(), name='platform-stats'),
]

