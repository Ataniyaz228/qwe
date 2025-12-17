"""
Management command to setup OAuth SocialApp records in database.
Run with: python manage.py setup_oauth
"""

import os
from django.core.management.base import BaseCommand
from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp


class Command(BaseCommand):
    help = 'Setup OAuth SocialApp records for Google and GitHub'

    def handle(self, *args, **options):
        # Get or create site
        site, created = Site.objects.get_or_create(id=1)
        site.domain = 'localhost:8000'
        site.name = 'GitForum'
        site.save()
        self.stdout.write(f'Site: {site.domain}')

        # Google
        google_client_id = os.environ.get('GOOGLE_CLIENT_ID', '')
        google_secret = os.environ.get('GOOGLE_CLIENT_SECRET', '')
        
        if google_client_id:
            google_app, created = SocialApp.objects.update_or_create(
                provider='google',
                defaults={
                    'name': 'Google',
                    'client_id': google_client_id,
                    'secret': google_secret,
                }
            )
            google_app.sites.add(site)
            self.stdout.write(self.style.SUCCESS(f'Google app configured: {google_client_id[:20]}...'))
        else:
            self.stdout.write(self.style.WARNING('GOOGLE_CLIENT_ID not set'))

        # GitHub
        github_client_id = os.environ.get('GITHUB_CLIENT_ID', '')
        github_secret = os.environ.get('GITHUB_CLIENT_SECRET', '')
        
        if github_client_id:
            github_app, created = SocialApp.objects.update_or_create(
                provider='github',
                defaults={
                    'name': 'GitHub',
                    'client_id': github_client_id,
                    'secret': github_secret,
                }
            )
            github_app.sites.add(site)
            self.stdout.write(self.style.SUCCESS(f'GitHub app configured: {github_client_id[:20]}...'))
        else:
            self.stdout.write(self.style.WARNING('GITHUB_CLIENT_ID not set'))

        self.stdout.write(self.style.SUCCESS('OAuth setup complete!'))
