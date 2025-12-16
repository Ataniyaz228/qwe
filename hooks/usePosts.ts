"use client";

import { useState, useEffect, useCallback } from 'react';
import { postsAPI, type Post, type PostFilters, type PaginatedResponse } from '@/lib/api';

interface UsePostsOptions extends PostFilters {
    enabled?: boolean;
}

interface UsePostsResult {
    posts: Post[];
    isLoading: boolean;
    error: Error | null;
    hasMore: boolean;
    loadMore: () => Promise<void>;
    refresh: () => Promise<void>;
}

/**
 * Хук для загрузки списка постов с пагинацией
 */
export function usePosts(options: UsePostsOptions = {}): UsePostsResult {
    const { enabled = true, ...filters } = options;
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchPosts = useCallback(async (pageNum: number, append = false) => {
        if (!enabled) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await postsAPI.list({ ...filters, page: pageNum });

            if (append) {
                setPosts(prev => [...prev, ...response.results]);
            } else {
                setPosts(response.results);
            }

            setHasMore(response.next !== null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Ошибка загрузки постов'));
        } finally {
            setIsLoading(false);
        }
    }, [enabled, JSON.stringify(filters)]);

    // Загружаем при монтировании и изменении фильтров
    useEffect(() => {
        setPage(1);
        fetchPosts(1, false);
    }, [fetchPosts]);

    // Загрузить ещё
    const loadMore = async () => {
        if (isLoading || !hasMore) return;
        const nextPage = page + 1;
        setPage(nextPage);
        await fetchPosts(nextPage, true);
    };

    // Обновить с начала
    const refresh = async () => {
        setPage(1);
        await fetchPosts(1, false);
    };

    return { posts, isLoading, error, hasMore, loadMore, refresh };
}

interface UsePostResult {
    post: Post | null;
    isLoading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
    like: () => Promise<void>;
    unlike: () => Promise<void>;
    bookmark: () => Promise<void>;
    unbookmark: () => Promise<void>;
}

/**
 * Хук для загрузки одного поста
 */
export function usePost(id: string | null): UsePostResult {
    const [post, setPost] = useState<Post | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchPost = useCallback(async () => {
        if (!id) {
            setPost(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const data = await postsAPI.get(id);
            setPost(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Ошибка загрузки поста'));
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchPost();
    }, [fetchPost]);

    const like = async () => {
        if (!id || !post) return;
        try {
            await postsAPI.like(id);
            // Рефетчим пост для получения актуальных данных
            const updatedPost = await postsAPI.get(id);
            setPost(updatedPost);
        } catch (err) {
            console.error('Like error:', err);
            throw err;
        }
    };

    const unlike = async () => {
        if (!id || !post) return;
        try {
            await postsAPI.unlike(id);
            // Рефетчим пост для получения актуальных данных
            const updatedPost = await postsAPI.get(id);
            setPost(updatedPost);
        } catch (err) {
            console.error('Unlike error:', err);
            throw err;
        }
    };

    const bookmark = async () => {
        if (!id || !post) return;
        await postsAPI.bookmark(id);
        setPost({ ...post, is_bookmarked: true, bookmarks_count: post.bookmarks_count + 1 });
    };

    const unbookmark = async () => {
        if (!id || !post) return;
        await postsAPI.unbookmark(id);
        setPost({ ...post, is_bookmarked: false, bookmarks_count: post.bookmarks_count - 1 });
    };

    return { post, isLoading, error, refresh: fetchPost, like, unlike, bookmark, unbookmark };
}

/**
 * Хук для трендовых постов
 */
export function useTrendingPosts() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchTrending = async () => {
            setIsLoading(true);
            try {
                const data = await postsAPI.trending();
                setPosts(data);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Ошибка загрузки'));
            } finally {
                setIsLoading(false);
            }
        };
        fetchTrending();
    }, []);

    return { posts, isLoading, error };
}

/**
 * Хук для закладок пользователя
 */
export function useBookmarks() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchBookmarks = async () => {
        setIsLoading(true);
        try {
            const data = await postsAPI.bookmarks();
            setPosts(data.results);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Ошибка загрузки закладок'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBookmarks();
    }, []);

    return { posts, isLoading, error, refresh: fetchBookmarks };
}
