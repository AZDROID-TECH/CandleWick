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
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center"
            >
                <h2 className="text-3xl font-black text-white italic drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] mb-8">
                    {t('ready_question', { defaultValue: 'READY?' })}
                </h2>

                <button
                    onClick={handleResume}
                    className="w-32 h-32 rounded-full bg-green-500 border-4 border-green-400 text-white text-4xl font-black shadow-[0_0_30px_rgba(34,197,94,0.6)] active:scale-90 transition-transform flex items-center justify-center animate-pulse"
                >
                    GO!
                </button>
            </motion.div>
        </div>
    );
};

export default ResumeOverlay;
