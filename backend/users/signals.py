"""
Django signals для пользователей - создание уведомлений о подписках
"""
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Follow


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
