"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Типы языков
export type Language = 'ru' | 'kk'

// Словарь переводов
export const translations = {
    ru: {
        // Навигация
        nav: {
            home: 'Главная',
            explore: 'Поиск',
            trending: 'Тренды',
            bookmarks: 'Закладки',
            notifications: 'Уведомления',
            profile: 'Профиль',
            settings: 'Настройки',
            create: 'Создать',
            login: 'Войти',
            register: 'Регистрация',
            logout: 'Выйти',
            search: 'Поиск...',
        },
        // Общие
        common: {
            loading: 'Загрузка...',
            error: 'Ошибка',
            save: 'Сохранить',
            cancel: 'Отмена',
            delete: 'Удалить',
            edit: 'Редактировать',
            share: 'Поделиться',
            copy: 'Копировать',
            copied: 'Скопировано!',
            viewAll: 'Смотреть все',
            showMore: 'Показать ещё',
            showLess: 'Скрыть',
            noResults: 'Ничего не найдено',
            posts: 'Постам',
            likes: 'Лайкам',
            views: 'Просмотрам',
            comments: 'Комментариям',
            recent: 'Недавние',
            popular: 'Популярные',
            all: 'Все',
            today: 'Сегодня',
            thisWeek: 'За неделю',
            thisMonth: 'За месяц',
            language: 'Язык',
        },
        // Авторизация
        auth: {
            welcomeBack: 'С возвращением!',
            loginSubtitle: 'Войдите в свой аккаунт GitForum',
            createAccount: 'Создать аккаунт',
            registerSubtitle: 'Присоединяйтесь к сообществу разработчиков',
            email: 'Email',
            password: 'Пароль',
            confirmPassword: 'Подтвердите пароль',
            username: 'Имя пользователя',
            displayName: 'Отображаемое имя',
            rememberMe: 'Запомнить меня',
            forgotPassword: 'Забыли пароль?',
            noAccount: 'Нет аккаунта?',
            hasAccount: 'Уже есть аккаунт?',
            signIn: 'Войти',
            signUp: 'Зарегистрироваться',
            orContinueWith: 'или войти через',
            termsAgree: 'Регистрируясь, вы соглашаетесь с',
            termsOfService: 'Условиями использования',
            and: 'и',
            privacyPolicy: 'Политикой конфиденциальности',
        },
        // Страница Explore
        explore: {
            title: 'Поиск',
            subtitle: 'Найдите лучшие сниппеты кода',
            searchPlaceholder: 'Поиск по названию, описанию, тегам...',
            allLanguages: 'Все языки',
            allTags: 'Все теги',
            sortBy: 'Сортировка',
            trending: 'Трендовые',
            newToday: 'Новые сегодня',
            thisWeekPosts: 'За неделю',
        },
        // Страница Tags
        tags: {
            title: 'Теги',
            subtitle: 'Исследуйте темы и технологии',
            searchPlaceholder: 'Поиск тегов...',
            popular: 'Популярные',
            alphabetical: 'По алфавиту',
            recentlyUsed: 'Недавно использованные',
            postsCount: 'постов',
        },
        // Страница Bookmarks
        bookmarks: {
            title: 'Закладки',
            subtitle: 'Сохранённые сниппеты',
            empty: 'Нет закладок',
            emptySubtitle: 'Сохраняйте интересные посты для быстрого доступа',
            explore: 'Найти сниппеты',
            remove: 'Удалить из закладок',
            removed: 'Удалено из закладок',
        },
        // Страница Trending
        trending: {
            title: 'Тренды',
            subtitle: 'Популярные сниппеты',
            hot: 'HOT',
            searchPlaceholder: 'Поиск в трендах...',
        },
        // Страница Notifications
        notifications: {
            title: 'Уведомления',
            allRead: 'Всё прочитано!',
            unread: 'непрочитанных',
            markAllRead: 'Прочитать все',
            empty: 'Нет уведомлений',
            emptySubtitle: 'Здесь будут появляться уведомления о лайках, комментариях и подписках',
            liked: 'лайкнул(-а) ваш пост',
            commented: 'прокомментировал(-а) ваш пост',
            followed: 'подписался(-ась) на вас',
            mentioned: 'упомянул(-а) вас',
        },
        // Страница Profile
        profile: {
            title: 'Профиль',
            editProfile: 'Редактировать',
            posts: 'Посты',
            followers: 'Подписчики',
            following: 'Подписки',
            joined: 'Присоединился',
            noPosts: 'Пока нет постов',
            createFirst: 'Создайте свой первый сниппет',
            createPost: 'Создать пост',
        },
        // Страница Settings
        settings: {
            title: 'Настройки',
            subtitle: 'Управление аккаунтом и предпочтениями',
            tabs: {
                profile: 'Профиль',
                appearance: 'Внешний вид',
                notifications: 'Уведомления',
                account: 'Аккаунт',
            },
            // Профиль
            profilePhoto: 'Фото профиля',
            photoHint: 'JPG, PNG или GIF. Максимум 2MB.',
            removePhoto: 'Удалить фото',
            displayName: 'Отображаемое имя',
            username: 'Имя пользователя',
            usernameHint: 'Имя пользователя изменить нельзя',
            emailHint: 'Email изменить нельзя',
            bio: 'О себе',
            bioPlaceholder: 'Расскажите о себе...',
            characters: 'символов',
            location: 'Местоположение',
            website: 'Веб-сайт',
            github: 'GitHub',
            profileSaved: 'Профиль сохранён!',
            // Внешний вид
            interfaceLanguage: 'Язык интерфейса',
            chooseLanguage: 'Выберите предпочитаемый язык',
            theme: 'Тема оформления',
            chooseTheme: 'Выберите цветовую схему',
            themeLight: 'Светлая',
            themeDark: 'Тёмная',
            themeSystem: 'Системная',
            codeTheme: 'Тема кода',
            codeThemeHint: 'Подсветка синтаксиса для блоков кода',
            codeFont: 'Шрифт кода',
            codeFontHint: 'Шрифт для отображения кода',
            fontSize: 'Размер шрифта',
            fontSizeHint: 'Размер шрифта в редакторе кода',
            preview: 'Предпросмотр',
            lineNumbers: 'Номера строк',
            lineNumbersHint: 'Показывать номера строк в коде',
            wordWrap: 'Перенос строк',
            wordWrapHint: 'Переносить длинные строки кода',
            compactMode: 'Компактный режим',
            compactModeHint: 'Уменьшить отступы для большего контента',
            saveSettings: 'Сохранить настройки',
            settingsSaved: 'Настройки сохранены!',
            // Уведомления
            emailNotifications: 'Email уведомления',
            pushNotifications: 'Push уведомления',
            enableAll: 'Вкл. все',
            disableAll: 'Выкл. все',
            notifyLikes: 'Лайки',
            notifyLikesHint: 'Когда кто-то лайкнул ваш пост',
            notifyComments: 'Комментарии',
            notifyCommentsHint: 'Когда кто-то оставил комментарий',
            notifyFollowers: 'Новые подписчики',
            notifyFollowersHint: 'Когда кто-то подписался на вас',
            notifyMentions: 'Упоминания',
            notifyMentionsHint: 'Когда вас упомянули',
            notifyDigest: 'Еженедельный дайджест',
            notifyDigestHint: 'Подборка лучших постов за неделю',
            notificationsSaved: 'Настройки уведомлений сохранены!',
            // Аккаунт
            changePassword: 'Смена пароля',
            currentPassword: 'Текущий пароль',
            newPassword: 'Новый пароль',
            confirmNewPassword: 'Подтвердите пароль',
            passwordsMatch: 'Пароли совпадают',
            passwordStrength: {
                weak: 'Слабый',
                fair: 'Средний',
                good: 'Хороший',
                strong: 'Сильный',
                veryStrong: 'Очень сильный',
            },
            passwordRequirements: {
                minLength: 'Минимум 8 символов',
                uppercase: 'Одна заглавная буква',
                lowercase: 'Одна строчная буква',
                number: 'Одна цифра',
                special: 'Один спецсимвол',
            },
            updatePassword: 'Сменить пароль',
            passwordUpdated: 'Пароль успешно изменён!',
            twoFactorAuth: 'Двухфакторная аутентификация',
            twoFactorHint: 'Добавьте дополнительный уровень безопасности к вашему аккаунту.',
            enable2FA: 'Включить 2FA',
            sessions: 'Сессии',
            logoutAll: 'Выйти со всех устройств',
            logoutAllHint: 'Выйти из аккаунта на всех устройствах.',
            exportData: 'Экспорт данных',
            exportDataHint: 'Скачайте копию ваших данных: профиль, закладки и посты.',
            exportButton: 'Экспорт данных',
            exported: 'Данные экспортированы!',
            dangerZone: 'Опасная зона',
            deleteAccount: 'Удаление аккаунта',
            deleteAccountHint: 'После удаления аккаунта все ваши данные будут безвозвратно удалены.',
            deleteAccountButton: 'Удалить аккаунт',
            deleteConfirmTitle: 'Вы уверены?',
            deleteConfirmText: 'Это действие нельзя отменить. Все ваши данные, посты и закладки будут удалены навсегда.',
        },
        // Widgets
        widgets: {
            trendingNow: 'Сейчас в тренде',
            topContributors: 'Лучшие авторы',
            viewProfile: 'Профиль',
        },
        // Пост
        post: {
            by: 'от',
            copyCode: 'Копировать код',
            codeCopied: 'Код скопирован!',
            comments: 'Комментарии',
            addComment: 'Написать комментарий...',
            sendComment: 'Отправить',
            noComments: 'Пока нет комментариев',
            beFirst: 'Будьте первым, кто оставит комментарий!',
            deleteComment: 'Удалить комментарий',
            editComment: 'Редактировать',
        },
        // Время
        time: {
            justNow: 'только что',
            minutesAgo: 'м назад',
            hoursAgo: 'ч назад',
            daysAgo: 'д назад',
        },
        // Начальная страница
        landing: {
            tagline: 'Делитесь кодом, а не скриншотами',
            heroTitle: 'Дом для',
            heroTitleHighlight: 'Кода разработчиков',
            heroDescription: 'Делитесь красивыми сниппетами кода, находите трендовые решения и общайтесь с разработчиками по всему миру. Никаких скриншотов — только чистый код с подсветкой синтаксиса.',
            getStarted: 'Начать бесплатно',
            features: {
                title: 'Всё для работы с кодом',
                subtitle: 'Создано разработчиками для разработчиков. Все инструменты в одном месте.',
                syntaxHighlighting: 'Подсветка синтаксиса',
                syntaxHighlightingDesc: 'Красивый рендеринг кода с темами VS Code для 10+ языков',
                trendingSnippets: 'Трендовые сниппеты',
                trendingSnippetsDesc: 'Находите самые популярные сниппеты в сообществе',
                smartTags: 'Умные теги',
                smartTagsDesc: 'Организуйте и ищите код по языку, фреймворку или теме',
                bookmarks: 'Закладки',
                bookmarksDesc: 'Сохраняйте любимые сниппеты для быстрого доступа',
                easySharing: 'Простой шеринг',
                easySharingDesc: 'Делитесь кодом одним кликом, без скриншотов',
                powerfulSearch: 'Мощный поиск',
                powerfulSearchDesc: 'Находите нужное с помощью продвинутого поиска',
            },
            howItWorks: {
                title: 'Как это работает',
                subtitle: 'Три простых шага для публикации кода',
                step1: 'Создайте',
                step1Desc: 'Напишите или вставьте код с полной подсветкой синтаксиса',
                step2: 'Поделитесь',
                step2Desc: 'Опубликуйте сниппет и поделитесь с сообществом',
                step3: 'Исследуйте',
                step3Desc: 'Изучайте тренды, учитесь у других и растите вместе',
            },
            stats: {
                developers: 'Разработчиков',
                snippets: 'Сниппетов кода',
                languages: 'Языков',
                linesShared: 'Строк опубликовано',
            },
            cta: {
                joinDevelopers: 'Присоединяйтесь к форуму разработчиков',
                readyToShare: 'Готовы делиться кодом?',
                signUpToday: 'Зарегистрируйтесь сегодня и начните публиковать красивые сниппеты.',
                createAccount: 'Создать бесплатный аккаунт',
            },
            footer: {
                about: 'О нас',
                privacy: 'Конфиденциальность',
                terms: 'Условия',
                contact: 'Контакты',
                copyright: '© 2025 GitForum. Все права защищены.',
            },
        },
    },
    kk: {
        // Навигация
        nav: {
            home: 'Басты бет',
            explore: 'Іздеу',
            trending: 'Трендтер',
            bookmarks: 'Бетбелгілер',
            notifications: 'Хабарламалар',
            profile: 'Профиль',
            settings: 'Баптаулар',
            create: 'Жасау',
            login: 'Кіру',
            register: 'Тіркелу',
            logout: 'Шығу',
            search: 'Іздеу...',
        },
        // Общие
        common: {
            loading: 'Жүктелуде...',
            error: 'Қате',
            save: 'Сақтау',
            cancel: 'Болдырмау',
            delete: 'Жою',
            edit: 'Өңдеу',
            share: 'Бөлісу',
            copy: 'Көшіру',
            copied: 'Көшірілді!',
            viewAll: 'Барлығын көру',
            showMore: 'Көбірек көрсету',
            showLess: 'Жасыру',
            noResults: 'Ештеңе табылмады',
            posts: 'Посттар',
            likes: 'Лайктар',
            views: 'Қаралымдар',
            comments: 'Пікірлер',
            recent: 'Соңғы',
            popular: 'Танымал',
            all: 'Барлығы',
            today: 'Бүгін',
            thisWeek: 'Осы апта',
            thisMonth: 'Осы ай',
            language: 'Тіл',
        },
        // Авторизация
        auth: {
            welcomeBack: 'Қош келдіңіз!',
            loginSubtitle: 'GitForum аккаунтыңызға кіріңіз',
            createAccount: 'Аккаунт жасау',
            registerSubtitle: 'Әзірлеушілер қауымдастығына қосылыңыз',
            email: 'Email',
            password: 'Құпия сөз',
            confirmPassword: 'Құпия сөзді растаңыз',
            username: 'Пайдаланушы аты',
            displayName: 'Көрсетілетін ат',
            rememberMe: 'Мені есте сақта',
            forgotPassword: 'Құпия сөзді ұмыттыңыз ба?',
            noAccount: 'Аккаунтыңыз жоқ па?',
            hasAccount: 'Аккаунтыңыз бар ма?',
            signIn: 'Кіру',
            signUp: 'Тіркелу',
            orContinueWith: 'немесе арқылы кіру',
            termsAgree: 'Тіркелу арқылы сіз келесілермен келісесіз:',
            termsOfService: 'Қызмет көрсету шарттары',
            and: 'және',
            privacyPolicy: 'Құпиялылық саясаты',
        },
        // Страница Explore
        explore: {
            title: 'Іздеу',
            subtitle: 'Ең жақсы код үзінділерін табыңыз',
            searchPlaceholder: 'Атауы, сипаттамасы, тегтері бойынша іздеу...',
            allLanguages: 'Барлық тілдер',
            allTags: 'Барлық тегтер',
            sortBy: 'Сұрыптау',
            trending: 'Трендтегі',
            newToday: 'Бүгінгі жаңалар',
            thisWeekPosts: 'Осы аптада',
        },
        // Страница Tags
        tags: {
            title: 'Тегтер',
            subtitle: 'Тақырыптар мен технологияларды зерттеңіз',
            searchPlaceholder: 'Тегтерді іздеу...',
            popular: 'Танымал',
            alphabetical: 'Әліпби бойынша',
            recentlyUsed: 'Жақында қолданылған',
            postsCount: 'пост',
        },
        // Страница Bookmarks
        bookmarks: {
            title: 'Бетбелгілер',
            subtitle: 'Сақталған үзінділер',
            empty: 'Бетбелгілер жоқ',
            emptySubtitle: 'Жылдам қол жеткізу үшін қызықты посттарды сақтаңыз',
            explore: 'Үзінділерді табу',
            remove: 'Бетбелгіден жою',
            removed: 'Бетбелгіден жойылды',
        },
        // Страница Trending
        trending: {
            title: 'Трендтер',
            subtitle: 'Танымал үзінділер',
            hot: 'HOT',
            searchPlaceholder: 'Трендтерден іздеу...',
        },
        // Страница Notifications
        notifications: {
            title: 'Хабарламалар',
            allRead: 'Барлығы оқылды!',
            unread: 'оқылмаған',
            markAllRead: 'Барлығын оқу',
            empty: 'Хабарламалар жоқ',
            emptySubtitle: 'Мұнда лайктар, пікірлер және жазылымдар туралы хабарламалар пайда болады',
            liked: 'постыңызды ұнатты',
            commented: 'постыңызға пікір қалдырды',
            followed: 'сізге жазылды',
            mentioned: 'сізді атап өтті',
        },
        // Страница Profile
        profile: {
            title: 'Профиль',
            editProfile: 'Өңдеу',
            posts: 'Посттар',
            followers: 'Жазылушылар',
            following: 'Жазылымдар',
            joined: 'Қосылды',
            noPosts: 'Әзірге посттар жоқ',
            createFirst: 'Алғашқы үзіндіңізді жасаңыз',
            createPost: 'Пост жасау',
        },
        // Страница Settings
        settings: {
            title: 'Баптаулар',
            subtitle: 'Аккаунт пен параметрлерді басқару',
            tabs: {
                profile: 'Профиль',
                appearance: 'Сыртқы көрініс',
                notifications: 'Хабарламалар',
                account: 'Аккаунт',
            },
            // Профиль
            profilePhoto: 'Профиль суреті',
            photoHint: 'JPG, PNG немесе GIF. Максимум 2MB.',
            removePhoto: 'Суретті жою',
            displayName: 'Көрсетілетін ат',
            username: 'Пайдаланушы аты',
            usernameHint: 'Пайдаланушы атын өзгерту мүмкін емес',
            emailHint: 'Email өзгерту мүмкін емес',
            bio: 'Өзіңіз туралы',
            bioPlaceholder: 'Өзіңіз туралы айтыңыз...',
            characters: 'таңба',
            location: 'Орналасқан жер',
            website: 'Веб-сайт',
            github: 'GitHub',
            profileSaved: 'Профиль сақталды!',
            // Внешний вид
            interfaceLanguage: 'Интерфейс тілі',
            chooseLanguage: 'Қалаған тілді таңдаңыз',
            theme: 'Безендіру тақырыбы',
            chooseTheme: 'Түс схемасын таңдаңыз',
            themeLight: 'Жарық',
            themeDark: 'Қараңғы',
            themeSystem: 'Жүйелік',
            codeTheme: 'Код тақырыбы',
            codeThemeHint: 'Код блоктары үшін синтаксис бөлектеу',
            codeFont: 'Код қаріпі',
            codeFontHint: 'Кодты көрсету қаріпі',
            fontSize: 'Қаріп өлшемі',
            fontSizeHint: 'Код редакторындағы қаріп өлшемі',
            preview: 'Алдын ала қарау',
            lineNumbers: 'Жол нөмірлері',
            lineNumbersHint: 'Кодта жол нөмірлерін көрсету',
            wordWrap: 'Жолды тасымалдау',
            wordWrapHint: 'Ұзын код жолдарын тасымалдау',
            compactMode: 'Ықшам режим',
            compactModeHint: 'Көбірек мазмұн үшін шегіністерді азайту',
            saveSettings: 'Баптауларды сақтау',
            settingsSaved: 'Баптаулар сақталды!',
            // Уведомления
            emailNotifications: 'Email хабарламалар',
            pushNotifications: 'Push хабарламалар',
            enableAll: 'Барлығын қосу',
            disableAll: 'Барлығын өшіру',
            notifyLikes: 'Лайктар',
            notifyLikesHint: 'Біреу постыңызды ұнатқанда',
            notifyComments: 'Пікірлер',
            notifyCommentsHint: 'Біреу пікір қалдырғанда',
            notifyFollowers: 'Жаңа жазылушылар',
            notifyFollowersHint: 'Біреу сізге жазылғанда',
            notifyMentions: 'Атап өтулер',
            notifyMentionsHint: 'Сізді атап өткенде',
            notifyDigest: 'Апталық дайджест',
            notifyDigestHint: 'Аптаның ең жақсы посттары',
            notificationsSaved: 'Хабарлама баптаулары сақталды!',
            // Аккаунт
            changePassword: 'Құпия сөзді өзгерту',
            currentPassword: 'Ағымдағы құпия сөз',
            newPassword: 'Жаңа құпия сөз',
            confirmNewPassword: 'Құпия сөзді растаңыз',
            passwordsMatch: 'Құпия сөздер сәйкес келеді',
            passwordStrength: {
                weak: 'Әлсіз',
                fair: 'Орташа',
                good: 'Жақсы',
                strong: 'Күшті',
                veryStrong: 'Өте күшті',
            },
            passwordRequirements: {
                minLength: 'Кемінде 8 таңба',
                uppercase: 'Бір бас әріп',
                lowercase: 'Бір кіші әріп',
                number: 'Бір сан',
                special: 'Бір арнайы таңба',
            },
            updatePassword: 'Құпия сөзді өзгерту',
            passwordUpdated: 'Құпия сөз сәтті өзгертілді!',
            twoFactorAuth: 'Екі факторлы аутентификация',
            twoFactorHint: 'Аккаунтыңызға қосымша қауіпсіздік деңгейін қосыңыз.',
            enable2FA: '2FA қосу',
            sessions: 'Сессиялар',
            logoutAll: 'Барлық құрылғылардан шығу',
            logoutAllHint: 'Барлық құрылғылардағы аккаунттан шығу.',
            exportData: 'Деректерді экспорттау',
            exportDataHint: 'Деректеріңіздің көшірмесін жүктеңіз: профиль, бетбелгілер және посттар.',
            exportButton: 'Деректерді экспорттау',
            exported: 'Деректер экспортталды!',
            dangerZone: 'Қауіпті аймақ',
            deleteAccount: 'Аккаунтты жою',
            deleteAccountHint: 'Аккаунтты жойғаннан кейін барлық деректеріңіз қайтымсыз жойылады.',
            deleteAccountButton: 'Аккаунтты жою',
            deleteConfirmTitle: 'Сенімдісіз бе?',
            deleteConfirmText: 'Бұл әрекетті қайтару мүмкін емес. Барлық деректеріңіз, посттарыңыз және бетбелгілеріңіз мәңгілікке жойылады.',
        },
        // Widgets
        widgets: {
            trendingNow: 'Қазір трендте',
            topContributors: 'Үздік авторлар',
            viewProfile: 'Профиль',
        },
        // Пост
        post: {
            by: 'авторы',
            copyCode: 'Кодты көшіру',
            codeCopied: 'Код көшірілді!',
            comments: 'Пікірлер',
            addComment: 'Пікір жазу...',
            sendComment: 'Жіберу',
            noComments: 'Әзірге пікірлер жоқ',
            beFirst: 'Пікір қалдырған алғашқы адам болыңыз!',
            deleteComment: 'Пікірді жою',
            editComment: 'Өңдеу',
        },
        // Время
        time: {
            justNow: 'қазір ғана',
            minutesAgo: 'м бұрын',
            hoursAgo: 'сағ бұрын',
            daysAgo: 'к бұрын',
        },
        // Басты бет
        landing: {
            tagline: 'Кодпен бөлісіңіз, скриншоттармен емес',
            heroTitle: 'Үй',
            heroTitleHighlight: 'Әзірлеушілер коды үшін',
            heroDescription: 'Әдемі код үзінділерімен бөлісіңіз, трендті шешімдерді табыңыз және бүкіл әлемдегі әзірлеушілермен байланысыңыз.',
            getStarted: 'Тегін бастау',
            features: {
                title: 'Кодпен жұмыс істеуге қажет барлығы',
                subtitle: 'Әзірлеушілер үшін әзірлеушілер жасаған. Барлық құралдар бір жерде.',
                syntaxHighlighting: 'Синтаксис бөлектеу',
                syntaxHighlightingDesc: 'VS Code тақырыптарымен 50+ тіл үшін әдемі код рендерингі',
                trendingSnippets: 'Трендті үзінділер',
                trendingSnippetsDesc: 'Қауымдастықтағы ең танымал үзінділерді табыңыз',
                smartTags: 'Ақылды тегтер',
                smartTagsDesc: 'Кодты тіл, фреймворк немесе тақырып бойынша ұйымдастырыңыз',
                bookmarks: 'Бетбелгілер',
                bookmarksDesc: 'Жылдам қол жеткізу үшін сүйікті үзінділерді сақтаңыз',
                easySharing: 'Оңай бөлісу',
                easySharingDesc: 'Бір басумен кодпен бөлісіңіз',
                powerfulSearch: 'Қуатты іздеу',
                powerfulSearchDesc: 'Жетілдірілген іздеу арқылы дәл қажетін табыңыз',
            },
            howItWorks: {
                title: 'Қалай жұмыс істейді',
                subtitle: 'Кодты жариялаудың үш қарапайым қадамы',
                step1: 'Жасаңыз',
                step1Desc: 'Толық синтаксис бөлектеуімен код жазыңыз немесе қойыңыз',
                step2: 'Бөлісіңіз',
                step2Desc: 'Үзіндіні жариялаңыз және қауымдастықпен бөлісіңіз',
                step3: 'Зерттеңіз',
                step3Desc: 'Трендтерді зерттеңіз, басқалардан үйреніңіз және бірге өсіңіз',
            },
            stats: {
                developers: 'Әзірлеушілер',
                snippets: 'Код үзінділері',
                languages: 'Тілдер',
                linesShared: 'Жариялаған жолдар',
            },
            cta: {
                joinDevelopers: '50 000+ әзірлеушіге қосылыңыз',
                readyToShare: 'Кодпен бөлісуге дайынсыз ба?',
                signUpToday: 'Бүгін тіркеліңіз және әдемі үзінділерді жариялай бастаңыз.',
                createAccount: 'Тегін аккаунт жасау',
            },
            footer: {
                about: 'Біз туралы',
                privacy: 'Құпиялылық',
                terms: 'Шарттар',
                contact: 'Байланыс',
                copyright: '© 2025 GitForum. Барлық құқықтар қорғалған.',
            },
        },
    },
}

// Типы для переводов
type TranslationKeys = typeof translations.ru

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: TranslationKeys
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
    children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
    const [language, setLanguageState] = useState<Language>('ru')

    useEffect(() => {
        // Загружаем сохранённый язык из localStorage
        const saved = localStorage.getItem('gitforum-language') as Language
        if (saved && (saved === 'ru' || saved === 'kk')) {
            setLanguageState(saved)
        }
    }, [])

    const setLanguage = (lang: Language) => {
        setLanguageState(lang)
        localStorage.setItem('gitforum-language', lang)
    }

    const t = translations[language]

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}
