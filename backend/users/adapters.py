"""
Social Account Adapter for GitForum

Этот адаптер обеспечивает:
1. Привязку OAuth аккаунтов к существующим по email
2. Автоматическое создание username для OAuth пользователей
"""

from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.account.utils import user_email
from django.contrib.auth import get_user_model
import random
import string

User = get_user_model()


class GitForumSocialAccountAdapter(DefaultSocialAccountAdapter):
    """
    Кастомный адаптер для социальной авторизации.
    Связывает OAuth аккаунты с существующими пользователями по email.
    """

    def pre_social_login(self, request, sociallogin):
        """
        Вызывается перед созданием нового аккаунта через OAuth.
        Если пользователь с таким email уже существует - связываем аккаунты.
        """
        # Если пользователь уже залогинен - просто связываем аккаунты
        if sociallogin.is_existing:
            return

        # Получаем email из социального аккаунта
        email = None
        if sociallogin.account.extra_data:
            email = sociallogin.account.extra_data.get('email')
        
        if not email:
            # Попробуем получить из email_addresses
            for email_addr in sociallogin.email_addresses:
                if email_addr.verified:
                    email = email_addr.email
                    break
            if not email and sociallogin.email_addresses:
                email = sociallogin.email_addresses[0].email

        if email:
            try:
                # Ищем существующего пользователя с таким email
                existing_user = User.objects.get(email__iexact=email)
                # Связываем социальный аккаунт с существующим пользователем
                sociallogin.connect(request, existing_user)
            except User.DoesNotExist:
                # Пользователя нет - создадим нового
                pass

    def populate_user(self, request, sociallogin, data):
        """
        Заполняет данные пользователя из социального аккаунта.
        """
        user = super().populate_user(request, sociallogin, data)
        
        # Генерируем уникальный username если его нет
        if not user.username:
            base_username = data.get('username') or data.get('name') or 'user'
            # Очищаем username от недопустимых символов
            base_username = ''.join(c for c in base_username if c.isalnum() or c == '_')
            base_username = base_username[:20] or 'user'
            
            username = base_username
            counter = 1
            while User.objects.filter(username__iexact=username).exists():
                suffix = ''.join(random.choices(string.digits, k=4))
                username = f"{base_username}_{suffix}"
                counter += 1
                if counter > 10:
                    username = f"user_{''.join(random.choices(string.ascii_lowercase + string.digits, k=8))}"
                    break
            
            user.username = username

        return user

    def get_connect_redirect_url(self, request, socialaccount):
        """
        URL для редиректа после привязки аккаунта.
        """
        return '/settings'

    def get_login_redirect_url(self, request):
        """
        Redirect URL after social login - generates JWT and redirects to frontend.
        """
        from rest_framework_simplejwt.tokens import RefreshToken
        from urllib.parse import urlencode
        from django.conf import settings
        
        user = request.user
        if user.is_authenticated:
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)
            
            # Build frontend callback URL with tokens
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
            params = urlencode({
                'access': access_token,
                'refresh': refresh_token,
                'provider': 'oauth',
            })
            
            return f"{frontend_url}/auth/callback?{params}"
        
        return super().get_login_redirect_url(request)


