import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import WebApp from '@twa-dev/sdk';

interface InviteModalProps {
    onClose: () => void;
    inviteLink: string;
}

const InviteModal: React.FC<InviteModalProps> = ({ onClose, inviteLink }) => {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const copyToClipboard = async (text: string) => {
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(text);
                    return true;
                }
                throw new Error('Clipboard API unavailable');
            } catch (err) {
                try {
                    const textArea = document.createElement("textarea");
                    textArea.value = text;
                    textArea.style.position = "absolute";
                    textArea.style.left = "-9999px";
                    document.body.appendChild(textArea);
                    textArea.select();
                    const successful = document.execCommand('copy');
                    document.body.removeChild(textArea);
                    return successful;
                } catch (fallbackErr) {
                    return false;
                }
            }
        };

        copyToClipboard(inviteLink).then((success) => {
            if (success) {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                WebApp.HapticFeedback.notificationOccurred('success');
            } else {
                WebApp.HapticFeedback.notificationOccurred('error');
            }
        });
    };

    const handleShare = (platform: 'telegram' | 'whatsapp' | 'system') => {
        WebApp.HapticFeedback.impactOccurred('light');
        const message = t('invite_desc');

        const encodedUrl = encodeURIComponent(inviteLink);
        const encodedText = encodeURIComponent(message);

        if (platform === 'telegram') {
            const url = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
            WebApp.openTelegramLink(url);
        } else if (platform === 'whatsapp') {
            const url = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
            WebApp.openLink(url);
        } else if (platform === 'system') {
            if (navigator.share) {
                navigator.share({
                    title: 'Candle Wick',
                    text: message,
                    url: inviteLink,
                }).catch(console.error);
            } else {
                handleCopy();
            }
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-md p-6">
            <div className="absolute inset-0" onClick={onClose}></div>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-800 w-full max-w-sm rounded-2xl border border-slate-700 p-6 shadow-2xl relative z-10"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                    <i className='bx bx-x text-3xl'></i>
                </button>

                <h2 className="text-2xl font-black text-center text-white mb-2 tracking-tight">
                    {t('invite_title')}
                </h2>
                <p className="text-slate-400 text-center text-sm mb-6">
                    {t('invite_desc')}
                </p>

                <div className="flex gap-2 mb-6">
                    <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700 p-3 flex items-center overflow-hidden">
                        <span className="text-slate-300 text-sm font-mono truncate w-full opacity-70 select-all">
                            {inviteLink}
                        </span>
                    </div>
                    <button
                        onClick={handleCopy}
                        className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl border transition-all active:scale-95 ${copied
                            ? 'bg-green-500/20 border-green-500/50 text-green-400'
                            : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-white'
                            }`}
                    >
                        {copied ? <i className='bx bx-check text-2xl'></i> : <i className='bx bxs-copy text-xl'></i>}
                    </button>
                </div>
                {copied && (
                    <div className="w-full text-center -mt-4 mb-4">
                        <span className="text-green-400 text-xs font-bold animate-pulse">
                            {t('copied')}
                        </span>
                    </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                    <button
                        onClick={() => handleShare('telegram')}
                        className="flex flex-col items-center gap-2 p-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl transition-all active:scale-95"
                    >
                        <i className='bx bxl-telegram text-3xl text-blue-400'></i>
                        <span className="text-[10px] font-bold text-blue-200 uppercase">{t('share_telegram')}</span>
                    </button>

                    <button
                        onClick={() => handleShare('whatsapp')}
                        className="flex flex-col items-center gap-2 p-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-xl transition-all active:scale-95"
                    >
                        <i className='bx bxl-whatsapp text-3xl text-green-400'></i>
                        <span className="text-[10px] font-bold text-green-200 uppercase">{t('share_whatsapp')}</span>
                    </button>

                    <button
                        onClick={() => handleShare('system')}
                        className="flex flex-col items-center gap-2 p-3 bg-slate-700/50 hover:bg-slate-700/80 border border-slate-600 rounded-xl transition-all active:scale-95"
                    >
                        <i className='bx bxs-share-alt text-3xl text-slate-300'></i>
                        <span className="text-[10px] font-bold text-slate-300 uppercase">{t('share_more')}</span>
                    </button>
                </div>

            </motion.div>
        </div>
    );
};

export default InviteModal;
