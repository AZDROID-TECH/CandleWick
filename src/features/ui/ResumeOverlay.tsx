import React from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch } from '../../app/hooks';
import { resumeGame } from '../game/gameSlice';
import { useTranslation } from 'react-i18next';
import WebApp from '@twa-dev/sdk';

const ResumeOverlay: React.FC = () => {
    const dispatch = useAppDispatch();
    const { t } = useTranslation();

    const handleResume = () => {
        WebApp.HapticFeedback.notificationOccurred('success');
        dispatch(resumeGame());
    };

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-md">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center"
            >
                <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-10 drop-shadow-sm">
                    {t('ready_question')}
                </h2>

                <button
                    onClick={handleResume}
                    className="w-32 h-32 rounded-full bg-gradient-to-tr from-green-500 to-emerald-600 border-4 border-green-400/50 text-white text-2xl font-black shadow-[0_0_40px_rgba(34,197,94,0.4)] active:scale-95 transition-all transform hover:scale-105 flex items-center justify-center animate-pulse tracking-wider"
                >
                    {t('go_button')}
                </button>
            </motion.div>
        </div>
    );
};

export default ResumeOverlay;
