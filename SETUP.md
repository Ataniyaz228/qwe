# GitForum - Инструкция по запуску

## Структура проекта

```
qwe/
├── backend/          # Django REST API
│   ├── gitforum/     # Настройки Django
│   ├── users/        # Модели пользователей
│   ├── posts/        # Модели постов
│   └── manage.py
│
├── app/              # Next.js Frontend страницы
├── components/       # React компоненты
├── contexts/         # React контексты (AuthContext)
├── hooks/            # React хуки (usePosts)
└── lib/              # Утилиты и API клиент
```

---

## Запуск Backend (Django)

### 1. Установка PostgreSQL

**Вариант A: Docker (рекомендуется)**
```bash
docker run -d --name gitforum-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=gitforum -p 5432:5432 postgres:15
```

**Вариант B: Локальная установка**
1. Скачайте PostgreSQL: https://www.postgresql.org/download/
2. Создайте базу данных `gitforum`

### 2. Настройка окружения

```bash
cd backend

# Создаём виртуальное окружение
python -m venv venv

# Активируем (Windows)
venv\Scripts\activate

# Устанавливаем зависимости
pip install -r requirements.txt
```

### 3. Создайте файл .env

Скопируйте `env.template` в `.env` и настройте:
```bash
copy env.template .env
```

### 4. Миграции и запуск

```bash
# Применяем миграции
python manage.py migrate

# Создаём админа
python manage.py createsuperuser

# Запускаем сервер
python manage.py runserver
```

Backend будет доступен на http://localhost:8000

---

## Запуск Frontend (Next.js)

### 1. Установка зависимостей

```bash
# В корневой папке проекта
pnpm install

# Если pnpm не установлен:
npm install -g pnpm
pnpm install
```

### 2. Настройка переменных окружения

Создайте файл `.env.local` в корневой папке:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 3. Запуск dev-сервера

```bash
pnpm dev
```

Frontend будет доступен на http://localhost:3000

---

## Тестирование API

### Регистрация пользователя
```bash
curl -X POST http://localhost:8000/api/auth/registration/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password1":"TestPass123!","password2":"TestPass123!"}'
```

### Вход
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'
```

### Создание поста (с токеном)
```bash
curl -X POST http://localhost:8000/api/posts/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"title":"Test","filename":"test.js","language":"javascript","code":"console.log(\"Hello\")"}'
```

---

## Админка Django

Доступна по адресу: http://localhost:8000/admin/

Используйте credentials суперпользователя, созданного ранее.

---

## Что сделано

### Backend ✅
- [x] Django проект с настройками
- [x] PostgreSQL подключение
- [x] Модели: User, Post, Comment, Like, Bookmark, Tag, Follow
- [x] REST API endpoints
- [x] JWT аутентификация
- [x] CORS настройка

### Frontend ✅
- [x] API клиент (`lib/api.ts`)
- [x] AuthContext для аутентификации
- [x] Хуки для постов (`hooks/usePosts.ts`)
- [x] Страница логина с API интеграцией
- [x] Страница регистрации с API интеграцией
- [x] Страница создания поста с API интеграцией
- [x] Navbar с меню пользователя

### Что осталось
- [ ] Выполнить миграции Django
- [ ] Настроить OAuth (Google, GitHub)
- [ ] Интегрировать Feed, Profile, Bookmarks, Settings страницы
- [ ] Добавить подсветку синтаксиса (Shiki)
- [ ] Добавить Monaco Editor
