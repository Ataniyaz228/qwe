"""
URL маршруты для пользователей
"""
from django.urls import path
from . import views
from .oauth_views import OAuthCallbackView, OAuthInitiateView, OAuthUserInfoView

urlpatterns = [
    # OAuth
    path('oauth/initiate/<str:provider>/', OAuthInitiateView.as_view(), name='oauth-initiate'),
    path('oauth/callback/<str:provider>/', OAuthCallbackView.as_view(), name='oauth-callback'),
    path('oauth/connected/', OAuthUserInfoView.as_view(), name='oauth-connected'),
    
    # Поиск пользователей (должен быть до username/)
    path('search/', views.UserSearchView.as_view(), name='user-search'),
    
    # Топ контрибьюторы (должен быть до username/)
    path('top-contributors/', views.TopContributorsView.as_view(), name='top-contributors'),
    
    # Текущий пользователь (должен быть до username/)
    path('me/', views.CurrentUserView.as_view(), name='current-user'),
    
    # Загрузка аватара (должен быть до username/)
    path('me/avatar/', views.AvatarUploadView.as_view(), name='avatar-upload'),
    
    # Профиль пользователя (ПОСЛЕ всех специфичных путей!)
    path('<str:username>/', views.UserProfileView.as_view(), name='user-profile'),
    
    # Подписки
    path('<str:username>/follow/', views.FollowUserView.as_view(), name='follow-user'),
    path('<str:username>/followers/', views.UserFollowersView.as_view(), name='user-followers'),
    path('<str:username>/following/', views.UserFollowingView.as_view(), name='user-following'),
]

