"""
Сериализаторы для пользователей
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Базовый сериализатор пользователя (для списков, комментариев и т.д.)"""
    
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'display_name',
            'avatar',
            'is_verified',
        ]
        read_only_fields = fields


class UserDetailSerializer(serializers.ModelSerializer):
    """Детальный сериализатор пользователя (для профиля)"""
    is_following = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'display_name',
            'bio',
            'avatar',
            'location',
            'website',
            'github_username',
            'twitter_username',
            'is_verified',
            'followers_count',
            'following_count',
            'posts_count',
            'date_joined',
            'is_following',
        ]
        read_only_fields = [
            'id',
            'username',
            'email',
            'is_verified',
            'followers_count',
            'following_count',
            'posts_count',
            'date_joined',
            'is_following',
        ]
    
    def get_is_following(self, obj):
        """Проверяем, подписан ли текущий пользователь"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from .models import Follow
            return Follow.objects.filter(
                follower=request.user,
                following=obj
            ).exists()
        return False


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Сериализатор для обновления профиля"""
    
    class Meta:
        model = User
        fields = [
            'display_name',
            'bio',
            'avatar',
            'location',
            'website',
            'github_username',
            'twitter_username',
        ]
    
    def validate_github_username(self, value):
        """Валидация GitHub username"""
        if value and len(value) > 39:
            raise serializers.ValidationError('GitHub username слишком длинный')
        return value
    
    def validate_twitter_username(self, value):
        """Валидация Twitter username"""
        if value and len(value) > 15:
            raise serializers.ValidationError('Twitter username слишком длинный')
        # Убираем @ если есть
        if value and value.startswith('@'):
            value = value[1:]
        return value


class TopContributorSerializer(serializers.ModelSerializer):
    """Сериализатор для топ контрибьюторов с количеством постов"""
    posts_count = serializers.IntegerField(source='posts_count_calc', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'display_name',
            'avatar',
            'posts_count',
        ]
        read_only_fields = fields
