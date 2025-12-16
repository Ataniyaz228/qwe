# GitForum Backend

Django REST API для GitForum - платформы для обмена кодом.

## Требования

- Python 3.11+
- PostgreSQL 15+

## Быстрый старт

### 1. Создайте виртуальное окружение

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Установите зависимости

```bash
pip install -r requirements.txt
```

### 3. Настройте базу данных PostgreSQL

Вариант A: Через Docker
```bash
docker run -d --name gitforum-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=gitforum \
  -p 5432:5432 \
  postgres:15
```

Вариант B: Локально
1. Установите PostgreSQL
2. Создайте базу данных:
```sql
CREATE DATABASE gitforum;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE gitforum TO postgres;
```

### 4. Создайте файл .env

```bash
# Скопируйте шаблон
copy env.template .env

# Отредактируйте настройки в .env
```

### 5. Выполните миграции

```bash
python manage.py migrate
```

### 6. Создайте суперпользователя

```bash
python manage.py createsuperuser
```

### 7. Запустите сервер

```bash
python manage.py runserver
```

Сервер запустится на http://localhost:8000

## API Endpoints

### Аутентификация
- `POST /api/auth/registration/` - Регистрация
- `POST /api/auth/login/` - Вход
- `POST /api/auth/logout/` - Выход
- `GET /api/auth/user/` - Текущий пользователь
- `POST /api/auth/password/reset/` - Сброс пароля

### Посты
- `GET /api/posts/` - Список постов
- `POST /api/posts/` - Создать пост
- `GET /api/posts/{id}/` - Получить пост
- `PUT /api/posts/{id}/` - Обновить пост
- `DELETE /api/posts/{id}/` - Удалить пост
- `POST /api/posts/{id}/like/` - Лайкнуть
- `DELETE /api/posts/{id}/like/` - Убрать лайк
- `POST /api/posts/{id}/bookmark/` - В закладки
- `DELETE /api/posts/{id}/bookmark/` - Убрать из закладок
- `GET /api/posts/{id}/comments/` - Комментарии
- `POST /api/posts/{id}/comments/` - Добавить комментарий

### Пользователи
- `GET /api/users/me/` - Текущий пользователь
- `GET /api/users/{username}/` - Профиль
- `PUT /api/users/{username}/` - Обновить профиль
- `POST /api/users/{username}/follow/` - Подписаться
- `DELETE /api/users/{username}/follow/` - Отписаться
- `GET /api/users/{username}/followers/` - Подписчики
- `GET /api/users/{username}/following/` - Подписки

### Поиск и теги
- `GET /api/trending/` - Трендовые посты
- `GET /api/tags/` - Популярные теги
- `GET /api/tags/{name}/posts/` - Посты по тегу
- `GET /api/bookmarks/` - Закладки (требуется авторизация)

## Структура проекта

```
backend/
├── gitforum/          # Настройки Django
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── users/             # Пользователи и подписки
│   ├── models.py      # User, Follow
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
├── posts/             # Посты и комментарии
│   ├── models.py      # Post, Tag, Like, Bookmark, Comment
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
├── manage.py
└── requirements.txt
```

## Админка

Доступна по адресу http://localhost:8000/admin/
