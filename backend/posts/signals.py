"""
Django signals для обновления счётчиков и создания уведомлений
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import F

from .models import Like, Bookmark, Comment, Post, PostView, Notification


# =============================
# Like signals
# =============================
@receiver(post_save, sender=Like)
def like_created(sender, instance, created, **kwargs):
    """Увеличиваем likes_count при создании лайка и создаём уведомление"""
    if created:
        Post.objects.filter(pk=instance.post_id).update(
            likes_count=F('likes_count') + 1
        )
        
        # Создаём уведомление (если лайк не от автора поста)
        post = instance.post
        if post.author != instance.user:
            Notification.objects.create(
                recipient=post.author,
                sender=instance.user,
                notification_type='like',
                post=post
            )

@receiver(post_delete, sender=Like)
def like_deleted(sender, instance, **kwargs):
    """Уменьшаем likes_count при удалении лайка"""
    Post.objects.filter(pk=instance.post_id, likes_count__gt=0).update(
        likes_count=F('likes_count') - 1
    )


# =============================
# Bookmark signals
# =============================
@receiver(post_save, sender=Bookmark)
def bookmark_created(sender, instance, created, **kwargs):
    """Увеличиваем bookmarks_count при создании закладки"""
    if created:
        Post.objects.filter(pk=instance.post_id).update(
            bookmarks_count=F('bookmarks_count') + 1
        )

@receiver(post_delete, sender=Bookmark)
def bookmark_deleted(sender, instance, **kwargs):
    """Уменьшаем bookmarks_count при удалении закладки"""
    Post.objects.filter(pk=instance.post_id, bookmarks_count__gt=0).update(
        bookmarks_count=F('bookmarks_count') - 1
    )


# =============================
# Comment signals
# =============================
@receiver(post_save, sender=Comment)
def comment_created(sender, instance, created, **kwargs):
    """Увеличиваем comments_count при создании комментария и создаём уведомления"""
    if created:
        Post.objects.filter(pk=instance.post_id).update(
            comments_count=F('comments_count') + 1
        )
        
        post = instance.post
        
        # Если это ответ на комментарий - уведомляем автора родительского комментария
        if instance.parent and instance.parent.author != instance.author:
            Notification.objects.create(
                recipient=instance.parent.author,
                sender=instance.author,
                notification_type='reply',
                post=post,
                comment=instance,
                message=instance.content[:100] if instance.content else ""
            )
        
        # Уведомляем автора поста (если комментарий не от автора поста и не ответ автору поста)
        if post.author != instance.author:
            # Не дублируем уведомление если автор поста — это автор родительского комментария
            if not instance.parent or instance.parent.author != post.author:
                Notification.objects.create(
                    recipient=post.author,
                    sender=instance.author,
                    notification_type='comment',
                    post=post,
                    comment=instance,
                    message=instance.content[:100] if instance.content else ""
                )

@receiver(post_delete, sender=Comment)
def comment_deleted(sender, instance, **kwargs):
    """Уменьшаем comments_count при удалении комментария"""
    Post.objects.filter(pk=instance.post_id, comments_count__gt=0).update(
        comments_count=F('comments_count') - 1
    )


# =============================
# PostView signals
# =============================
@receiver(post_save, sender=PostView)
def view_created(sender, instance, created, **kwargs):
    """Увеличиваем views при создании просмотра"""
    if created:
        Post.objects.filter(pk=instance.post_id).update(
            views=F('views') + 1
        )


# =============================
# Post creation signals - notify followers
# =============================
@receiver(post_save, sender=Post)
def post_created_notify_followers(sender, instance, created, **kwargs):
    """Уведомляем подписчиков о новом посте автора"""
    if created and instance.is_public:
        from users.models import Follow
        
        # Получаем всех подписчиков автора
        follower_ids = Follow.objects.filter(
            following=instance.author
        ).values_list('follower_id', flat=True)
        
        # Создаём уведомления для каждого подписчика
        notifications = [
            Notification(
                recipient_id=follower_id,
                sender=instance.author,
                notification_type='new_post',
                post=instance,
                message=f'Новый пост: {instance.title[:50]}'
            )
            for follower_id in follower_ids
        ]
        
        if notifications:
            Notification.objects.bulk_create(notifications)


# =============================
# Follow signals (в приложении users)
# =============================
# Примечание: сигналы для подписок находятся в users/signals.py

