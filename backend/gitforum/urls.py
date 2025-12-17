"""
URL configuration for gitforum project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Админка Django
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/', include('posts.urls')),
    path('api/users/', include('users.urls')),
    
    # Аутентификация (dj-rest-auth)
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    
    # OAuth Social Login - включаем все allauth URLs
    path('api/auth/social/', include('allauth.socialaccount.urls')),
    path('accounts/', include('allauth.urls')),  # Нужно для провайдеров
]

# Для загрузки медиа файлов в режиме разработки
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
