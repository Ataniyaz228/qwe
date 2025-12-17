"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, usersAPI, setTokens, clearTokens, getAccessToken, type User } from '@/lib/api';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    setTokensAndLoad: (access: string, refresh: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Загружаем пользователя при инициализации
    const loadUser = useCallback(async () => {
        const token = getAccessToken();
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const userData = await authAPI.getCurrentUser();
            setUser(userData);
        } catch (error) {
            console.error('Ошибка загрузки пользователя:', error);
            clearTokens();
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    // Вход
    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            await authAPI.login({ email, password });
            const userData = await authAPI.getCurrentUser();
            setUser(userData);
        } finally {
            setIsLoading(false);
        }
    };

    // Регистрация
    const register = async (username: string, email: string, password: string) => {
        setIsLoading(true);
        try {
            await authAPI.register({
                username,
                email,
                password1: password,
                password2: password,
            });
            const userData = await authAPI.getCurrentUser();
            setUser(userData);
        } catch (error) {
            setIsLoading(false);
            throw error; // Re-throw so UI can handle it
        } finally {
            setIsLoading(false);
        }
    };

    // Выход
    const logout = async () => {
        try {
            await authAPI.logout();
        } finally {
            setUser(null);
        }
    };

    // Обновить данные пользователя
    const refreshUser = async () => {
        if (getAccessToken()) {
            try {
                const userData = await authAPI.getCurrentUser();
                setUser(userData);
            } catch {
                // Ignore errors
            }
        }
    };

    // Установить токены и загрузить пользователя (для OAuth)
    const setTokensAndLoad = async (access: string, refresh: string) => {
        setTokens({ access, refresh });
        setIsLoading(true);
        try {
            const userData = await authAPI.getCurrentUser();
            setUser(userData);
        } catch (error) {
            console.error('Ошибка загрузки пользователя после OAuth:', error);
            clearTokens();
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                refreshUser,
                setTokensAndLoad,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
