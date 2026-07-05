import WebApp from '@twa-dev/sdk';

export interface TelegramUserProfile {
    id: number;
    firstName: string;
    username?: string;
    languageCode?: string;
}

const toTelegramUserProfile = (value: unknown): TelegramUserProfile | null => {
    if (!value || typeof value !== 'object') {
        return null;
    }

    const raw = value as {
        id?: unknown;
        first_name?: unknown;
        username?: unknown;
        language_code?: unknown;
    };

    if (typeof raw.id !== 'number' || !Number.isFinite(raw.id)) {
        return null;
    }

    return {
        id: raw.id,
        firstName: typeof raw.first_name === 'string' && raw.first_name.trim().length > 0 ? raw.first_name : 'Anonymous',
        username: typeof raw.username === 'string' && raw.username.trim().length > 0 ? raw.username : undefined,
        languageCode: typeof raw.language_code === 'string' ? raw.language_code : undefined
    };
};

export const initializeTelegramApp = () => {
    try {
        WebApp.ready();
        WebApp.expand();
    } catch (error) {
        console.error('Telegram init xətası:', error);
    }
};

export const getTelegramUser = (): TelegramUserProfile | null => {
    return toTelegramUserProfile(WebApp.initDataUnsafe.user);
};

// Backend HMAC doğrulaması üçün xam initData string-i (initDataUnsafe deyil).
// Serverdə bot token ilə imza yoxlanılır; boş olarsa istemci anonim rejimə keçir.
export const getTelegramInitData = (): string => {
    return typeof WebApp.initData === 'string' ? WebApp.initData : '';
};

export const getTelegramStartParam = (): string | undefined => {
    const value = WebApp.initDataUnsafe.start_param;
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
};

export const getTelegramLanguage = (): 'az' | 'en' => {
    const lang = getTelegramUser()?.languageCode;
    return lang === 'az' ? 'az' : 'en';
};

