"""
API Views для пользователей
"""
from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from .models import Follow
from .serializers import UserDetailSerializer, UserProfileUpdateSerializer, UserSerializer

User = get_user_model()


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    GET: Получить профиль пользователя по username
    PUT/PATCH: Обновить свой профиль
    """
    queryset = User.objects.all()
    lookup_field = 'username'
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserProfileUpdateSerializer
        return UserDetailSerializer
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]
    
    def update(self, request, *args, **kwargs):
        # Проверяем, что пользователь обновляет свой профиль
        user = self.get_object()
        if user != request.user:
            return Response(
                {'detail': 'Вы можете редактировать только свой профиль'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)


class UserFollowersView(generics.ListAPIView):
    """Список подписчиков пользователя"""
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        username = self.kwargs['username']
        user = get_object_or_404(User, username=username)
        follower_ids = Follow.objects.filter(following=user).values_list('follower_id', flat=True)
        return User.objects.filter(id__in=follower_ids)


class UserFollowingView(generics.ListAPIView):
    """Список подписок пользователя"""
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        username = self.kwargs['username']
        user = get_object_or_404(User, username=username)
        following_ids = Follow.objects.filter(follower=user).values_list('following_id', flat=True)
        return User.objects.filter(id__in=following_ids)


class FollowUserView(APIView):
    """
    POST: Подписаться на пользователя
    DELETE: Отписаться от пользователя
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, username):
        """Подписаться на пользователя"""
        user_to_follow = get_object_or_404(User, username=username)
        
        if request.user == user_to_follow:
            return Response(
                {'detail': 'Нельзя подписаться на себя'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            follow, created = Follow.objects.get_or_create(
                follower=request.user,
                following=user_to_follow
            )
            
            if not created:
                return Response(
                    {'detail': 'Вы уже подписаны на этого пользователя'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return Response(
                {'detail': f'Вы подписались на {username}'},
                status=status.HTTP_201_CREATED
            )
        except Exception:
            # IntegrityError or other - already following
            return Response(
                {'detail': 'Вы уже подписаны на этого пользователя'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def delete(self, request, username):
        """Отписаться от пользователя"""
        user_to_unfollow = get_object_or_404(User, username=username)
        
        try:
            follow = Follow.objects.get(
                follower=request.user,
                following=user_to_unfollow
            )
            follow.delete()
            return Response(
                {'detail': f'Вы отписались от {username}'},
                status=status.HTTP_200_OK
            )
        except Follow.DoesNotExist:
            return Response(
                {'detail': 'Вы не подписаны на этого пользователя'},
                status=status.HTTP_400_BAD_REQUEST
            )


class CurrentUserView(generics.RetrieveAPIView):
    """Получить данные текущего авторизованного пользователя"""
    serializer_class = UserDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class TopContributorsView(generics.ListAPIView):
    """Топ контрибьюторов по количеству постов"""
    permission_classes = [permissions.AllowAny]
    
    def get_serializer_class(self):
        from .serializers import TopContributorSerializer
        return TopContributorSerializer
    
    def get_queryset(self):
        from django.db.models import Count
        return User.objects.annotate(
            posts_count_calc=Count('posts')
        ).filter(
            posts_count_calc__gt=0
        ).order_by('-posts_count_calc')[:10]


class UserSearchView(generics.ListAPIView):
    """Поиск пользователей по username, display_name, bio"""
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        from django.db.models import Q
        
        query = self.request.query_params.get('q', '').strip()
        if not query:
            return User.objects.none()
        
        return User.objects.filter(
            Q(username__icontains=query) |
            Q(display_name__icontains=query) |
            Q(bio__icontains=query)
        ).order_by('-posts_count', '-followers_count')[:20]


class AvatarUploadView(APIView):
    """Загрузка аватара пользователя"""
    permission_classes = [permissions.IsAuthenticated]
    
    # Добавляем парсеры для загрузки файлов
    from rest_framework.parsers import MultiPartParser, FormParser
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request):
        print("FILES:", request.FILES)  # DEBUG
        print("DATA:", request.data)  # DEBUG
        
        if 'avatar' not in request.FILES:
            return Response(
                {'detail': 'Файл аватара не найден'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        avatar_file = request.FILES['avatar']
        
        # Проверяем тип файла
        allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if avatar_file.content_type not in allowed_types:
            return Response(
                {'detail': 'Неподдерживаемый формат. Используйте JPEG, PNG, GIF или WebP'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Проверяем размер (макс 5MB)
        if avatar_file.size > 5 * 1024 * 1024:
            return Response(
                {'detail': 'Файл слишком большой. Максимум 5MB'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Сохраняем аватар
        import os
        from django.core.files.storage import default_storage
        from django.core.files.base import ContentFile
        from django.conf import settings
        import uuid
        
        # Генерируем уникальное имя файла
        ext = os.path.splitext(avatar_file.name)[1].lower()
        filename = f"avatars/{request.user.id}_{uuid.uuid4().hex[:8]}{ext}"
        
        # Удаляем старый аватар если есть
        old_avatar = request.user.avatar
        if old_avatar and old_avatar not in ['/developer-avatar.png', '', None]:
            try:
                # Убираем /media/ префикс если есть
                old_path = old_avatar
                if old_path.startswith('/media/'):
                    old_path = old_path[7:]  # убираем '/media/'
                elif old_path.startswith('media/'):
                    old_path = old_path[6:]  # убираем 'media/'
                    
                if default_storage.exists(old_path):
                    default_storage.delete(old_path)
            except Exception as e:
                print(f"Error deleting old avatar: {e}")
        
        # Сохраняем новый файл
        path = default_storage.save(filename, ContentFile(avatar_file.read()))
        
        # Формируем полный URL для аватара (с хостом backend)
        # Получаем хост из request или используем настройки
        host = request.build_absolute_uri('/').rstrip('/')
        avatar_url = f"{host}{settings.MEDIA_URL}{path}"
        
        # Обновляем пользователя
        request.user.avatar = avatar_url
        request.user.save(update_fields=['avatar'])
        
        return Response({
            'avatar': avatar_url,
            'message': 'Аватар успешно обновлен'
        }, status=status.HTTP_200_OK)
