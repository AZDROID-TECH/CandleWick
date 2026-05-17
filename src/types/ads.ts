export interface AdsgramController {
    show: () => Promise<void>;
}

export interface AdsgramGlobal {
    init: (params: { blockId: string; debug?: boolean }) => AdsgramController;
}

declare global {
    interface Window {
        Adsgram?: AdsgramGlobal;
        show_10324597?: () => Promise<void>;
    }
}

export {};
