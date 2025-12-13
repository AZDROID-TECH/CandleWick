import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch } from '../../app/hooks';
import { resumeGame } from '../game/gameSlice';

const CountdownOverlay: React.FC = () => {
    const dispatch = useAppDispatch();
    const [count, setCount] = useState(3);

    useEffect(() => {
        const timer = setInterval(() => {
            setCount((prev) => {
                if (prev === 1) {
                    clearInterval(timer);
                    // Slight delay before GO finishes
                    setTimeout(() => {
                        dispatch(resumeGame());
                    }, 500);
                    return 0; // Show "GO!"
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [dispatch]);

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <AnimatePresence mode="wait">
                <motion.div
                    key={count}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 1 }}
                    exit={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="font-black text-white italic drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]"
                >
                    {count > 0 ? (
                        <span className="text-8xl">{count}</span>
                    ) : (
                        <span className="text-8xl text-green-400">GO!</span>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default CountdownOverlay;
