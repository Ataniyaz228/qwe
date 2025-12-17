"""
Сериализаторы для постов
"""
from django.db import models
from rest_framework import serializers
from .models import Post, Tag, Like, Bookmark, Comment, Notification
from users.serializers import UserSerializer


class TagSerializer(serializers.ModelSerializer):
    """Сериализатор для тегов"""
    
    class Meta:
        model = Tag
        fields = ['id', 'name', 'color', 'usage_count']
        read_only_fields = ['id', 'usage_count']


class CommentSerializer(serializers.ModelSerializer):
    """Сериализатор для комментариев с рекурсивными ответами"""
    author = UserSerializer(read_only=True)
    replies_count = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = [
            'id',
            'author',
            'parent',
            'content',
            'created_at',
            'updated_at',
            'replies_count',
            'replies',
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']
    
    def get_replies_count(self, obj):
        return obj.replies.count()
    
    def get_replies(self, obj):
        # Ограничиваем глубину вложенности через контекст
        depth = self.context.get('depth', 0)
        max_depth = 5  # Максимальная глубина вложенности
        
        if depth >= max_depth:
            return []
        
        replies = obj.replies.select_related('author').order_by('created_at')[:20]
        # Передаём увеличенную глубину в дочерний сериализатор
        serializer = CommentSerializer(
            replies, 
            many=True, 
            context={**self.context, 'depth': depth + 1}
        )
        return serializer.data


class PostListSerializer(serializers.ModelSerializer):
    """Сериализатор для списка постов (краткая информация)"""
    author = UserSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    is_liked = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()
    code_preview = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            'id',
            'author',
            'title',
            'filename',
            'language',
            'description',
            'tags',
            'views',
            'likes_count',
            'comments_count',
            'bookmarks_count',
            'created_at',
            'is_liked',
            'is_bookmarked',
            'code_preview',
        ]
        read_only_fields = fields
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Like.objects.filter(user=request.user, post=obj).exists()
        return False
    
    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Bookmark.objects.filter(user=request.user, post=obj).exists()
        return False
    
    def get_code_preview(self, obj):
        """Возвращает первые 500 символов кода для превью"""
        if obj.code:
            return obj.code[:500]
        return ""


class PostDetailSerializer(serializers.ModelSerializer):
    """Детальный сериализатор поста (с кодом)"""
    author = UserSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    is_liked = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = [
            'id',
            'author',
            'title',
            'filename',
            'language',
            'code',
            'description',
            'is_public',
            'tags',
            'views',
            'likes_count',
            'comments_count',
            'bookmarks_count',
            'forks_count',
            'created_at',
            'updated_at',
            'is_liked',
            'is_bookmarked',
        ]
        read_only_fields = [
            'id',
            'author',
            'views',
            'likes_count',
            'comments_count',
            'bookmarks_count',
            'forks_count',
            'created_at',
            'updated_at',
        ]
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Like.objects.filter(user=request.user, post=obj).exists()
        return False
    
    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Bookmark.objects.filter(user=request.user, post=obj).exists()
        return False


class PostCreateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания поста"""
    tags = serializers.ListField(
        child=serializers.CharField(max_length=50),
        required=False,
        max_length=5,
        write_only=True
    )
    
    class Meta:
        model = Post
        fields = [
            'title',
            'filename',
            'language',
            'code',
            'description',
            'is_public',
            'tags',
        ]
    
    def create(self, validated_data):
        tag_names = validated_data.pop('tags', [])
        post = Post.objects.create(**validated_data)
        
        # Создаём или получаем теги
        for tag_name in tag_names:
            tag_name = tag_name.lower().strip()
            if tag_name:
                tag, created = Tag.objects.get_or_create(name=tag_name)
                # Увеличиваем счётчик использования
                Tag.objects.filter(pk=tag.pk).update(
                    usage_count=models.F('usage_count') + 1
                )
                post.tags.add(tag)
        
        return post
    
    def validate_code(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Код не может быть пустым')
        if len(value) > 50000:  # 50KB limit
            raise serializers.ValidationError('Код слишком длинный (макс. 50000 символов)')
        return value
    
    def validate_tags(self, value):
        if value and len(value) > 5:
            raise serializers.ValidationError('Максимум 5 тегов')
        return value


class PostUpdateSerializer(serializers.ModelSerializer):
    """Сериализатор для обновления поста"""
    commit_message = serializers.CharField(
        max_length=500,
        required=False,
        write_only=True,
        help_text='Сообщение об изменении'
    )
    
    class Meta:
        model = Post
        fields = [
            'title',
            'filename',
            'language',
            'code',
            'description',
            'is_public',
            'commit_message',
        ]
    
    def update(self, instance, validated_data):
        from .models import PostRevision
        
        commit_message = validated_data.pop('commit_message', '')
        
        # Сохраняем ревизию перед обновлением
        last_revision = instance.revisions.first()
        revision_number = (last_revision.revision_number + 1) if last_revision else 1
        
        PostRevision.objects.create(
            post=instance,
            author=self.context['request'].user,
            revision_number=revision_number,
            title=instance.title,
            code=instance.code,
            description=instance.description,
            commit_message=commit_message,
        )
        
        return super().update(instance, validated_data)


class PostRevisionSerializer(serializers.ModelSerializer):
    """Сериализатор для ревизий поста"""
    author = UserSerializer(read_only=True)
    
    class Meta:
        from .models import PostRevision
        model = PostRevision
        fields = [
            'id',
            'author',
            'revision_number',
            'title',
            'code',
            'description',
            'commit_message',
            'created_at',
        ]
        read_only_fields = fields


class NotificationSerializer(serializers.ModelSerializer):
    """Сериализатор для уведомлений"""
    sender = UserSerializer(read_only=True)
    post_title = serializers.SerializerMethodField()
    post_id = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'sender',
            'notification_type',
            'post_id',
            'post_title',
            'message',
            'is_read',
            'created_at',
        ]
        read_only_fields = ['id', 'sender', 'notification_type', 'post_id', 'post_title', 'created_at']
    
    def get_post_title(self, obj):
        if obj.post:
            return obj.post.filename or obj.post.title
        return None
    
    def get_post_id(self, obj):
        if obj.post:
            return str(obj.post.id)
        return None
