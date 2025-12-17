"""
Django signals для пользователей - создание уведомлений о подписках и OAuth
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from allauth.account.signals import user_logged_in
from rest_framework_simplejwt.tokens import RefreshToken
import logging

from .models import Follow

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Follow)
def follow_created(sender, instance, created, **kwargs):
    """Создаём уведомление при подписке на пользователя"""
    if created:
        # Импортируем Notification здесь чтобы избежать циклического импорта
        from posts.models import Notification
        
        # Не создаём уведомление если пользователь подписывается сам на себя
        if instance.follower != instance.following:
            Notification.objects.create(
                recipient=instance.following,
                sender=instance.follower,
                notification_type='follow'
            )


@receiver(user_logged_in)
def handle_user_logged_in(request, user, **kwargs):
    """
    Обработчик входа пользователя через OAuth.
    Сохраняет JWT токены в сессии для последующего редиректа.
    """
    # Генерируем JWT токены
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)
    
    # Сохраняем в сессии
    request.session['oauth_access_token'] = access_token
    request.session['oauth_refresh_token'] = refresh_token
    request.session['oauth_login'] = True
    
    logger.info(f"User {user.username} logged in, JWT tokens generated and stored in session")

