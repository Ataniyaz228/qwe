"""
API Views для постов
"""
from rest_framework import generics, status, permissions, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import F
from django_filters.rest_framework import DjangoFilterBackend

from .models import Post, Tag, Like, Bookmark, Comment, Notification
from .serializers import (
    PostListSerializer,
    PostDetailSerializer,
    PostCreateSerializer,
    PostUpdateSerializer,
    TagSerializer,
    CommentSerializer,
    NotificationSerializer,
)


class PostListCreateView(generics.ListCreateAPIView):
    """
    GET: Список постов с фильтрацией и поиском
    POST: Создать новый пост (требуется авторизация)
    """
    queryset = Post.objects.filter(is_public=True).select_related('author').prefetch_related('tags')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['language', 'author__username']
    search_fields = ['title', 'filename', 'description', 'code', 'tags__name']
    ordering_fields = ['created_at', 'likes_count', 'views', 'comments_count']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PostCreateSerializer
        return PostListSerializer
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Получить пост с кодом (увеличивает счётчик просмотров)
    PUT/PATCH: Обновить пост (только автор)
    DELETE: Удалить пост (только автор)
    """
    queryset = Post.objects.select_related('author').prefetch_related('tags')
    lookup_field = 'id'
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return PostUpdateSerializer
        return PostDetailSerializer
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Записываем уникальный просмотр
        from .models import PostView
        
        def get_client_ip(request):
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                return x_forwarded_for.split(',')[0]
            return request.META.get('REMOTE_ADDR')
        
        PostView.record_view(
            post=instance,
            user=request.user if request.user.is_authenticated else None,
            ip_address=get_client_ip(request),
            session_key=request.session.session_key if hasattr(request, 'session') else None
        )
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        post = self.get_object()
        if post.author != request.user:
            return Response(
                {'detail': 'Вы можете редактировать только свои посты'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        post = self.get_object()
        if post.author != request.user:
            return Response(
                {'detail': 'Вы можете удалять только свои посты'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)


class PostLikeView(APIView):
    """
    POST: Лайкнуть пост
    DELETE: Убрать лайк
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, id):
        post = get_object_or_404(Post, id=id)
        like, created = Like.objects.get_or_create(user=request.user, post=post)
        
        if not created:
            return Response(
                {'detail': 'Вы уже лайкнули этот пост'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Обновляем объект из БД для получения актуального likes_count
        post.refresh_from_db()
        return Response({
            'detail': 'Лайк добавлен',
            'likes_count': post.likes_count,
            'is_liked': True
        }, status=status.HTTP_201_CREATED)
    
    def delete(self, request, id):
        post = get_object_or_404(Post, id=id)
        try:
            like = Like.objects.get(user=request.user, post=post)
            like.delete()
            # Обновляем объект из БД для получения актуального likes_count
            post.refresh_from_db()
            return Response({
                'detail': 'Лайк убран',
                'likes_count': post.likes_count,
                'is_liked': False
            }, status=status.HTTP_200_OK)
        except Like.DoesNotExist:
            return Response(
                {'detail': 'Вы не лайкали этот пост'},
                status=status.HTTP_400_BAD_REQUEST
            )


class PostBookmarkView(APIView):
    """
    POST: Добавить в закладки
    DELETE: Убрать из закладок
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, id):
        post = get_object_or_404(Post, id=id)
        bookmark, created = Bookmark.objects.get_or_create(user=request.user, post=post)
        
        if not created:
            return Response(
                {'detail': 'Пост уже в закладках'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({'detail': 'Добавлено в закладки'}, status=status.HTTP_201_CREATED)
    
    def delete(self, request, id):
        post = get_object_or_404(Post, id=id)
        try:
            bookmark = Bookmark.objects.get(user=request.user, post=post)
            bookmark.delete()
            return Response({'detail': 'Убрано из закладок'}, status=status.HTTP_200_OK)
        except Bookmark.DoesNotExist:
            return Response(
                {'detail': 'Пост не был в закладках'},
                status=status.HTTP_400_BAD_REQUEST
            )


class PostCommentsView(generics.ListCreateAPIView):
    """
    GET: Список комментариев к посту
    POST: Добавить комментарий
    """
    serializer_class = CommentSerializer
    
    def get_queryset(self):
        post_id = self.kwargs['id']
        return Comment.objects.filter(post_id=post_id, parent=None).select_related('author')
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]
    
    def perform_create(self, serializer):
        post = get_object_or_404(Post, id=self.kwargs['id'])
        parent_id = self.request.data.get('parent')
        parent = None
        if parent_id:
            parent = get_object_or_404(Comment, id=parent_id, post=post)
        serializer.save(author=self.request.user, post=post, parent=parent)


class CommentDeleteView(generics.DestroyAPIView):
    """Удаление своего комментария"""
    permission_classes = [permissions.IsAuthenticated]
    queryset = Comment.objects.all()
    lookup_field = 'id'
    
    def get_queryset(self):
        # Пользователь может удалять только свои комментарии
        return Comment.objects.filter(author=self.request.user)


class UserBookmarksView(generics.ListAPIView):
    """Список закладок текущего пользователя"""
    serializer_class = PostListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        bookmark_ids = Bookmark.objects.filter(
            user=self.request.user
        ).values_list('post_id', flat=True)
        return Post.objects.filter(id__in=bookmark_ids).select_related('author').prefetch_related('tags')


class UserPostsView(generics.ListAPIView):
    """Список постов пользователя"""
    serializer_class = PostListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        username = self.kwargs['username']
        queryset = Post.objects.filter(
            author__username=username
        ).select_related('author').prefetch_related('tags')
        
        # Показываем приватные только автору
        if not self.request.user.is_authenticated or self.request.user.username != username:
            queryset = queryset.filter(is_public=True)
        
        return queryset


class TrendingPostsView(generics.ListAPIView):
    """Трендовые посты за период (последние 24ч/7 дней/30 дней)"""
    serializer_class = PostListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        from django.utils import timezone
        from datetime import timedelta
        
        # Получаем параметры из query params
        period = self.request.query_params.get('period', 'week')  # По умолчанию неделя
        widget = self.request.query_params.get('widget', 'false').lower() == 'true'
        
        now = timezone.now()
        
        # Относительные периоды (последние N часов/дней)
        if period == 'week':
            since = now - timedelta(days=7)
        elif period == 'month':
            since = now - timedelta(days=30)
        else:  # today = последние 24 часа
            since = now - timedelta(hours=24)
        
        queryset = Post.objects.filter(
            is_public=True,
            created_at__gte=since
        )
        
        # Для виджета - только посты с лайками, максимум 3
        if widget:
            queryset = queryset.filter(likes_count__gt=0)
            return queryset.select_related('author').prefetch_related('tags').order_by('-likes_count', '-views')[:3]
        
        return queryset.select_related('author').prefetch_related('tags').order_by('-likes_count', '-views', '-created_at')[:20]


class TagListView(generics.ListAPIView):
    """Список популярных тегов"""
    queryset = Tag.objects.all()[:50]
    serializer_class = TagSerializer
    permission_classes = [permissions.AllowAny]


class TagPostsView(generics.ListAPIView):
    """Посты по тегу"""
    serializer_class = PostListSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        tag_name = self.kwargs['name']
        return Post.objects.filter(
            is_public=True,
            tags__name=tag_name
        ).select_related('author').prefetch_related('tags')


class PostRevisionsView(generics.ListAPIView):
    """История изменений поста"""
    from .serializers import PostRevisionSerializer
    serializer_class = PostRevisionSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        from .models import PostRevision
        post_id = self.kwargs['id']
        return PostRevision.objects.filter(
            post_id=post_id
        ).select_related('author').order_by('-revision_number')


class PostRevisionDetailView(generics.RetrieveAPIView):
    """Детали одной ревизии поста"""
    from .serializers import PostRevisionSerializer
    from .models import PostRevision
    queryset = PostRevision.objects.select_related('author', 'post')
    serializer_class = PostRevisionSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'id'


class NotificationListView(generics.ListAPIView):
    """Список уведомлений текущего пользователя"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(
            recipient=self.request.user
        ).select_related('sender', 'post').order_by('-created_at')[:50]


class MarkNotificationsReadView(APIView):
    """Отметить все уведомления как прочитанные"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        Notification.objects.filter(
            recipient=request.user,
            is_read=False
        ).update(is_read=True)
        return Response({'status': 'ok'})


class MarkNotificationReadView(APIView):
    """Отметить одно уведомление как прочитанное"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, id):
        notification = get_object_or_404(
            Notification, 
            id=id, 
            recipient=request.user
        )
        notification.is_read = True
        notification.save()
        return Response({'status': 'ok'})


class PlatformStatsView(APIView):
    """Статистика платформы: лайки, комментарии, просмотры"""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        from django.db.models import Sum, Count
        from datetime import datetime, timedelta
        from django.utils import timezone
        
        # За сегодня
        today = timezone.now().date()
        today_start = timezone.make_aware(datetime.combine(today, datetime.min.time()))
        
        # Общие данные
        total_likes = Like.objects.count()
        total_comments = Comment.objects.count()
        total_views = Post.objects.aggregate(total=Sum('views'))['total'] or 0
        
        # За сегодня
        today_likes = Like.objects.filter(created_at__gte=today_start).count()
        today_comments = Comment.objects.filter(created_at__gte=today_start).count()
        
        # Посты и пользователи
        total_posts = Post.objects.filter(is_public=True).count()
        total_users = Post.objects.values('author').distinct().count()
        
        return Response({
            'total_likes': total_likes,
            'total_comments': total_comments,
            'total_views': total_views,
            'today_likes': today_likes,
            'today_comments': today_comments,
            'total_posts': total_posts,
            'total_users': total_users,
        })

