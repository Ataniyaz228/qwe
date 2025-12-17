"""
OAuth Middleware for GitForum

Перехватывает редирект после OAuth и перенаправляет на frontend с JWT токенами.
"""

from django.conf import settings
from django.shortcuts import redirect
from urllib.parse import urlencode


class OAuthRedirectMiddleware:
    """
    Middleware которая проверяет наличие JWT токенов в сессии
    и перенаправляет на frontend callback с токенами.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Проверяем есть ли OAuth токены в сессии и это редирект
        if (request.session.get('oauth_login') and 
            response.status_code in [301, 302] and
            request.session.get('oauth_access_token')):
            
            # Получаем токены из сессии
            access_token = request.session.pop('oauth_access_token', '')
            refresh_token = request.session.pop('oauth_refresh_token', '')
            request.session.pop('oauth_login', None)
            
            if access_token and refresh_token:
                # Формируем URL для frontend callback
                frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
                params = urlencode({
                    'access': access_token,
                    'refresh': refresh_token,
                    'provider': 'oauth',
                })
                
                return redirect(f"{frontend_url}/auth/callback?{params}")
        
        return response
