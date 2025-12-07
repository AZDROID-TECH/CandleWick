import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { clearNews } from '../game/gameSlice';
import WebApp from '@twa-dev/sdk';

// Avatars & Logos
import ppAzdroid from '../../assets/post_photo/pp_azdroid.png';
import ppElon from '../../assets/post_photo/pp_elonmusk.jpg';
import ppReddit from '../../assets/post_photo/pp_reddit.jpeg';
import ppZuck from '../../assets/post_photo/pp_zuck.jpeg';
import ppX from '../../assets/post_photo/pp_x.png';
import ppFacebook from '../../assets/post_photo/pp_facebook.png';
import ppCMC from '../../assets/post_photo/pp_coinmarketcap.png';

const avatarMap: Record<string, string> = {
    'azdroid': ppAzdroid,
    'elon': ppElon,
    'reddit': ppReddit,
    'zuck': ppZuck,
    'coinmarketcap': ppCMC
};

const platformLogoMap: Record<string, string> = {
    'x': ppX,
    'reddit': ppReddit,
    'facebook': ppFacebook,
    'coinmarketcap': ppCMC
};

const NewsToast: React.FC = () => {
    const { currentNews } = useAppSelector(state => state.game);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (currentNews) {
            // Play sound based on sentiment
            // Ideally use Web Audio API or simple HTML Audio, but Haptic is safe for now
            if (currentNews.sentiment === 'bullish') {
                WebApp.HapticFeedback.notificationOccurred('success');
            } else if (currentNews.sentiment === 'bearish') {
                WebApp.HapticFeedback.notificationOccurred('warning');
            } else {
                WebApp.HapticFeedback.impactOccurred('medium');
            }

            // Auto dismiss after 4 seconds
            const timer = setTimeout(() => {
                dispatch(clearNews());
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [currentNews, dispatch]);

    if (!currentNews) return null;

    const getPlatformColor = (id: string) => {
        switch (id) {
            case 'x': return 'bg-black';
            case 'reddit': return 'bg-[#FF4500]';
            case 'facebook': return 'bg-[#1877F2]';
            case 'coinmarketcap': return 'bg-[#3861FB]';
            default: return 'bg-slate-700';
        }
    };

    const logoSrc = (currentNews.avatar && avatarMap[currentNews.avatar])
        ? avatarMap[currentNews.avatar]
        : platformLogoMap[currentNews.platformId];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: -100, opacity: 0, x: '-50%' }}
                animate={{
                    y: 20,
                    opacity: 1,
                    x: '-50%',
                    rotate: [0, -1, 1, -1, 0], // Shake effect
                    transition: { type: 'spring', stiffness: 300, damping: 20 }
                }}
                exit={{ y: -100, opacity: 0 }}
                className="fixed top-0 left-1/2 z-50 w-[90%] max-w-sm pointer-events-none"
            >
                <div className={`${getPlatformColor(currentNews.platformId)} text-white p-4 rounded-2xl shadow-2xl border border-white/10 flex items-start gap-3`}>
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 overflow-hidden border border-white/10">
                        <img src={logoSrc} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm truncate">{currentNews.author}</span>
                            <span className="text-[10px] opacity-70 bg-white/20 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                                {currentNews.platformId}
                            </span>
                        </div>
                        <p className="text-sm font-medium leading-tight text-white/90">
                            {currentNews.text}
                        </p>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default NewsToast;
