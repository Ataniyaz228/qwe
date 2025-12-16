"""
Пересчёт счётчиков в постах
"""
from django.core.management.base import BaseCommand
from django.db.models import Count
from posts.models import Post


class Command(BaseCommand):
    help = 'Recalculates likes_count, comments_count, bookmarks_count for all posts'

    def handle(self, *args, **options):
        self.stdout.write('Recalculating post counts...')
        
        updated = 0
        # Перебираем все посты и обновляем счётчики вручную
        for post in Post.objects.all():
            real_likes = post.likes.count()
            real_comments = post.comments.count()
            real_bookmarks = post.bookmarks.count()
            real_views = post.post_views.count()
            
            changed = False
            
            if post.likes_count != real_likes:
                self.stdout.write(f'  {post.filename}: likes {post.likes_count} -> {real_likes}')
                post.likes_count = real_likes
                changed = True
                
            if post.comments_count != real_comments:
                self.stdout.write(f'  {post.filename}: comments {post.comments_count} -> {real_comments}')
                post.comments_count = real_comments
                changed = True
                
            if post.bookmarks_count != real_bookmarks:
                self.stdout.write(f'  {post.filename}: bookmarks {post.bookmarks_count} -> {real_bookmarks}')
                post.bookmarks_count = real_bookmarks
                changed = True
            
            if post.views != real_views:
                self.stdout.write(f'  {post.filename}: views {post.views} -> {real_views}')
                post.views = real_views
                changed = True
                
            if changed:
                post.save(update_fields=['likes_count', 'comments_count', 'bookmarks_count', 'views'])
                updated += 1
        
        self.stdout.write(self.style.SUCCESS(f'Done! Updated {updated} posts.'))
