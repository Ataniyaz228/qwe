"""
OAuth Views for GitForum

Эти views обрабатывают OAuth callback и генерируют JWT токены.
"""

from django.conf import settings
from django.shortcuts import redirect
from django.views import View
from django.http import JsonResponse
from rest_framework_simplejwt.tokens import RefreshToken
from allauth.socialaccount.models import SocialAccount
from urllib.parse import urlencode
import json


class OAuthCallbackView(View):
    """
    Обрабатывает callback после OAuth авторизации.
    Генерирует JWT токены и редиректит на frontend.
    """
    
    def get(self, request, provider):
        user = request.user
        
        if not user.is_authenticated:
            # Ошибка авторизации
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
            return redirect(f"{frontend_url}/login?error=oauth_failed")
        
        # Генерируем JWT токены
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        # Редиректим на frontend с токенами
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        params = urlencode({
            'access': access_token,
            'refresh': refresh_token,
            'provider': provider,
        })
        
        return redirect(f"{frontend_url}/auth/callback?{params}")


class OAuthInitiateView(View):
    """
    API endpoint для получения URL OAuth авторизации.
    Frontend вызывает этот endpoint и редиректит пользователя.
    """
    
    def get(self, request, provider):
        # Возвращаем URL для редиректа
        if provider == 'google':
            oauth_url = '/api/auth/social/google/login/'
        elif provider == 'github':
            oauth_url = '/api/auth/social/github/login/'
        else:
            return JsonResponse({'error': 'Unknown provider'}, status=400)
        
        return JsonResponse({
            'url': f"{request.scheme}://{request.get_host()}{oauth_url}",
            'provider': provider
        })

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


class OAuthUserInfoView(APIView):
    """
    Получает информацию о связанных OAuth аккаунтах пользователя.
    Использует DRF с JWT аутентификацией.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        social_accounts = SocialAccount.objects.filter(user=request.user)
        accounts = []
        
        for account in social_accounts:
            accounts.append({
                'provider': account.provider,
                'uid': account.uid,
                'name': account.extra_data.get('name', '') or account.extra_data.get('login', ''),
                'email': account.extra_data.get('email', ''),
                'avatar': account.extra_data.get('avatar_url') or account.extra_data.get('picture', ''),
            })
        
        return Response({
            'connected_accounts': accounts,
            'providers': ['google', 'github']
        })
    
    def delete(self, request):
        """
        Отключает OAuth провайдер от аккаунта пользователя.
        Требует параметр provider в query string.
        """
        provider = request.query_params.get('provider')
        
        if not provider:
            return Response({'error': 'Provider is required'}, status=400)
        
        if provider not in ['google', 'github']:
            return Response({'error': 'Invalid provider'}, status=400)
        
        # Проверяем есть ли у пользователя пароль (чтобы он мог войти без OAuth)
        if not request.user.has_usable_password():
            # Проверяем сколько OAuth аккаунтов подключено
            social_count = SocialAccount.objects.filter(user=request.user).count()
            if social_count <= 1:
                return Response({
                    'error': 'Нельзя отключить единственный способ входа. Сначала установите пароль.'
                }, status=400)
        
        # Удаляем социальный аккаунт
        deleted, _ = SocialAccount.objects.filter(
            user=request.user,
            provider=provider
        ).delete()
        
        if deleted:
            return Response({'success': True, 'message': f'{provider.capitalize()} отключен'})
        else:
            return Response({'error': 'Аккаунт не найден'}, status=404)


