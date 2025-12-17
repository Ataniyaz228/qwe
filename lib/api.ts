/**
 * API клиент для Django backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Типы для API
export interface User {
    id: string;
    username: string;
    email?: string;
    display_name: string;
    bio: string;
    avatar: string | null;
    location: string;
    website: string;
    github_username: string;
    twitter_username: string;
    is_verified: boolean;
    followers_count: number;
    following_count: number;
    posts_count: number;
    date_joined: string;
    is_following?: boolean;
}

export interface Tag {
    id: string;
    name: string;
    color: string;
    usage_count: number;
}

export interface Post {
    id: string;
    author: User;
    title: string;
    filename: string;
    language: string;
    code?: string;
    code_preview?: string;
    description: string;
    is_public: boolean;
    tags: Tag[];
    views: number;
    likes_count: number;
    comments_count: number;
    bookmarks_count: number;
    forks_count?: number;
    created_at: string;
    updated_at?: string;
    is_liked: boolean;
    is_bookmarked: boolean;
}

export interface Comment {
    id: string;
    author: User;
    parent: string | null;
    content: string;
    created_at: string;
    updated_at: string;
    replies_count: number;
    replies?: Comment[];
}

export interface PostRevision {
    id: string;
    author: User;
    revision_number: number;
    title: string;
    code: string;
    description: string;
    commit_message: string;
    created_at: string;
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password1: string;
    password2: string;
}

export interface AuthTokens {
    access: string;
    refresh: string;
}

// Хранилище токенов
let accessToken: string | null = null;
let refreshToken: string | null = null;

// Инициализация токенов из localStorage
if (typeof window !== 'undefined') {
    accessToken = localStorage.getItem('access_token');
    refreshToken = localStorage.getItem('refresh_token');
}

/**
 * Сохранить токены
 */
export function setTokens(tokens: AuthTokens): void {
    accessToken = tokens.access;
    refreshToken = tokens.refresh;
    if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
    }
}

/**
 * Очистить токены
 */
export function clearTokens(): void {
    accessToken = null;
    refreshToken = null;
    if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }
}

/**
 * Получить access token
 */
export function getAccessToken(): string | null {
    return accessToken;
}

/**
 * Базовый fetch с авторизацией
 */
async function fetchAPI<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Добавляем токен авторизации
    if (accessToken) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    // Если 401 - попробуем обновить токен
    if (response.status === 401 && refreshToken) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
            // Повторяем запрос с новым токеном
            (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
            const retryResponse = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers,
            });
            if (!retryResponse.ok) {
                throw new Error(await retryResponse.text());
            }
            // Для DELETE запросов может не быть тела
            if (retryResponse.status === 204) {
                return {} as T;
            }
            return retryResponse.json();
        }
    }

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error ${response.status}`);
    }

    // Для DELETE запросов может не быть тела
    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
}

/**
 * Обновить access token
 */
async function refreshAccessToken(): Promise<boolean> {
    try {
        const response = await fetch(`${API_URL}/auth/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (response.ok) {
            const data = await response.json();
            accessToken = data.access;
            if (typeof window !== 'undefined') {
                localStorage.setItem('access_token', data.access);
            }
            return true;
        }
    } catch {
        // Refresh token истёк
    }

    clearTokens();
    return false;
}

// ============================================
// AUTH API
// ============================================

export const authAPI = {
    /**
     * Регистрация
     */
    register: async (data: RegisterData): Promise<AuthTokens> => {
        const response = await fetchAPI<{ access: string; refresh: string; user: User }>(
            '/auth/registration/',
            {
                method: 'POST',
                body: JSON.stringify(data),
            }
        );
        setTokens({ access: response.access, refresh: response.refresh });
        return { access: response.access, refresh: response.refresh };
    },

    /**
     * Вход
     */
    login: async (credentials: LoginCredentials): Promise<AuthTokens> => {
        const response = await fetchAPI<{ access: string; refresh: string; user: User }>(
            '/auth/login/',
            {
                method: 'POST',
                body: JSON.stringify(credentials),
            }
        );
        setTokens({ access: response.access, refresh: response.refresh });
        return { access: response.access, refresh: response.refresh };
    },

    /**
     * Выход
     */
    logout: async (): Promise<void> => {
        try {
            await fetchAPI('/auth/logout/', { method: 'POST' });
        } finally {
            clearTokens();
        }
    },

    /**
     * Получить текущего пользователя
     */
    getCurrentUser: async (): Promise<User> => {
        return fetchAPI<User>('/auth/user/');
    },

    /**
     * Смена пароля
     */
    changePassword: async (oldPassword: string, newPassword1: string, newPassword2: string): Promise<void> => {
        await fetchAPI('/auth/password/change/', {
            method: 'POST',
            body: JSON.stringify({
                old_password: oldPassword,
                new_password1: newPassword1,
                new_password2: newPassword2,
            }),
        });
    },
};

// ============================================
// POSTS API
// ============================================

export interface PostFilters {
    page?: number;
    language?: string;
    search?: string;
    ordering?: string;
    author__username?: string;
}

export interface CreatePostData {
    title: string;
    filename: string;
    language: string;
    code: string;
    description?: string;
    is_public?: boolean;
    tags?: string[];
}

export const postsAPI = {
    /**
     * Получить список постов
     */
    list: async (filters: PostFilters = {}): Promise<PaginatedResponse<Post>> => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, String(value));
            }
        });
        const query = params.toString();
        return fetchAPI<PaginatedResponse<Post>>(`/posts/${query ? `?${query}` : ''}`);
    },

    /**
     * Получить пост по ID
     */
    get: async (id: string): Promise<Post> => {
        return fetchAPI<Post>(`/posts/${id}/`);
    },

    /**
     * Создать пост
     */
    create: async (data: CreatePostData): Promise<Post> => {
        return fetchAPI<Post>('/posts/', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * Обновить пост
     */
    update: async (id: string, data: Partial<CreatePostData>): Promise<Post> => {
        return fetchAPI<Post>(`/posts/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },

    /**
     * Удалить пост
     */
    delete: async (id: string): Promise<void> => {
        await fetchAPI(`/posts/${id}/`, { method: 'DELETE' });
    },

    /**
     * Лайкнуть пост
     */
    like: async (id: string): Promise<{ likes_count: number; is_liked: boolean }> => {
        return fetchAPI(`/posts/${id}/like/`, { method: 'POST' });
    },

    /**
     * Убрать лайк
     */
    unlike: async (id: string): Promise<{ likes_count: number; is_liked: boolean }> => {
        return fetchAPI(`/posts/${id}/like/`, { method: 'DELETE' });
    },

    /**
     * Добавить в закладки
     */
    bookmark: async (id: string): Promise<void> => {
        await fetchAPI(`/posts/${id}/bookmark/`, { method: 'POST' });
    },

    /**
     * Убрать из закладок
     */
    unbookmark: async (id: string): Promise<void> => {
        await fetchAPI(`/posts/${id}/bookmark/`, { method: 'DELETE' });
    },

    /**
     * Получить комментарии поста
     */
    getComments: async (id: string): Promise<PaginatedResponse<Comment>> => {
        return fetchAPI<PaginatedResponse<Comment>>(`/posts/${id}/comments/`);
    },

    /**
     * Добавить комментарий
     */
    addComment: async (id: string, content: string, parentId?: string): Promise<Comment> => {
        return fetchAPI<Comment>(`/posts/${id}/comments/`, {
            method: 'POST',
            body: JSON.stringify({ content, parent: parentId }),
        });
    },

    /**
     * Удалить комментарий
     */
    deleteComment: async (commentId: string): Promise<void> => {
        await fetchAPI(`/comments/${commentId}/`, { method: 'DELETE' });
    },

    /**
     * Трендовые посты
     */
    trending: async (period: 'today' | 'week' | 'month' = 'week', widget: boolean = false): Promise<Post[]> => {
        const params = new URLSearchParams({ period });
        if (widget) params.append('widget', 'true');
        return fetchAPI<Post[]>(`/trending/?${params.toString()}`);
    },

    /**
     * Статистика платформы
     */
    stats: async (): Promise<{
        total_likes: number;
        total_comments: number;
        total_views: number;
        today_likes: number;
        today_comments: number;
        total_posts: number;
        total_users: number;
    }> => {
        return fetchAPI('/stats/');
    },

    /**
     * Закладки текущего пользователя
     */
    bookmarks: async (): Promise<PaginatedResponse<Post>> => {
        return fetchAPI<PaginatedResponse<Post>>('/bookmarks/');
    },

    /**
     * История изменений поста
     */
    getRevisions: async (id: string): Promise<PostRevision[]> => {
        const response = await fetchAPI<PostRevision[] | { results: PostRevision[] }>(`/posts/${id}/revisions/`);
        // Handle both array and paginated response
        if (Array.isArray(response)) {
            return response;
        }
        return response.results || [];
    },

    /**
     * Редактировать пост
     */
    edit: async (id: string, data: Partial<CreatePostData> & { commit_message?: string }): Promise<Post> => {
        return fetchAPI<Post>(`/posts/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },
};

// ============================================
// USERS API
// ============================================

export const usersAPI = {
    /**
     * Получить текущего пользователя
     */
    me: async (): Promise<User> => {
        return fetchAPI<User>('/users/me/');
    },

    /**
     * Получить профиль пользователя
     */
    getProfile: async (username: string): Promise<User> => {
        return fetchAPI<User>(`/users/${username}/`);
    },

    /**
     * Обновить профиль
     */
    updateProfile: async (username: string, data: Partial<User>): Promise<User> => {
        return fetchAPI<User>(`/users/${username}/`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },

    /**
     * Получить посты пользователя
     */
    getPosts: async (username: string): Promise<PaginatedResponse<Post>> => {
        return fetchAPI<PaginatedResponse<Post>>(`/users/${username}/posts/`);
    },

    /**
     * Подписаться
     */
    follow: async (username: string): Promise<void> => {
        await fetchAPI(`/users/${username}/follow/`, { method: 'POST' });
    },

    /**
     * Отписаться
     */
    unfollow: async (username: string): Promise<void> => {
        await fetchAPI(`/users/${username}/follow/`, { method: 'DELETE' });
    },

    /**
     * Получить подписчиков
     */
    getFollowers: async (username: string): Promise<PaginatedResponse<User>> => {
        return fetchAPI<PaginatedResponse<User>>(`/users/${username}/followers/`);
    },

    /**
     * Получить подписки
     */
    getFollowing: async (username: string): Promise<PaginatedResponse<User>> => {
        return fetchAPI<PaginatedResponse<User>>(`/users/${username}/following/`);
    },

    /**
     * Топ контрибьюторы
     */
    topContributors: async (): Promise<User[]> => {
        return fetchAPI<User[]>('/users/top-contributors/');
    },

    /**
     * Поиск пользователей
     */
    search: async (query: string): Promise<User[]> => {
        const response = await fetchAPI<User[] | { results: User[] }>(`/users/search/?q=${encodeURIComponent(query)}`);
        return Array.isArray(response) ? response : (response.results || []);
    },

    /**
     * Загрузить аватар
     */
    uploadAvatar: async (file: File): Promise<{ avatar: string; message: string }> => {
        const formData = new FormData();
        formData.append('avatar', file);

        const token = getAccessToken();
        if (!token) {
            throw new Error('Необходима авторизация');
        }

        const url = `${API_URL}/users/me/avatar/`;
        console.log('Upload avatar to:', url);  // DEBUG

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        // Проверяем Content-Type перед парсингом JSON
        const contentType = response.headers.get('content-type');

        if (!response.ok) {
            if (contentType && contentType.includes('application/json')) {
                const error = await response.json();
                throw new Error(error.detail || 'Ошибка загрузки аватара');
            } else {
                throw new Error(`Ошибка сервера: ${response.status}`);
            }
        }

        return response.json();
    },
};// ============================================
// TAGS API
// ============================================

export const tagsAPI = {
    /**
     * Получить популярные теги
     */
    list: async (): Promise<Tag[]> => {
        return fetchAPI<Tag[]>('/tags/');
    },

    /**
     * Получить посты по тегу
     */
    getPosts: async (name: string): Promise<PaginatedResponse<Post>> => {
        return fetchAPI<PaginatedResponse<Post>>(`/tags/${name}/posts/`);
    },
};

// ============================================
// NOTIFICATIONS API
// ============================================

export interface Notification {
    id: string;
    sender: User;
    notification_type: 'like' | 'comment' | 'follow' | 'mention';
    post_id: string | null;
    post_title: string | null;
    message: string;
    is_read: boolean;
    created_at: string;
}

export const notificationsAPI = {
    /**
     * Получить уведомления
     */
    list: async (): Promise<Notification[]> => {
        const response = await fetchAPI<Notification[] | { results: Notification[] }>('/notifications/');
        if (Array.isArray(response)) {
            return response;
        }
        return response.results || [];
    },

    /**
     * Отметить все как прочитанные
     */
    markAllRead: async (): Promise<void> => {
        await fetchAPI('/notifications/read-all/', { method: 'POST' });
    },

    /**
     * Отметить одно как прочитанное
     */
    markRead: async (id: string): Promise<void> => {
        await fetchAPI(`/notifications/${id}/read/`, { method: 'POST' });
    },
};
