import React, { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { endGame, incrementScore, collectCoin, triggerNews } from './gameSlice';
import WebApp from '@twa-dev/sdk';
import AZCashLogo from '../../assets/AZCash.logo.png';
import socialData from '../../data/social_posts.json';
// Oyun Parametrləri (Game Parameters)
const GRAVITY = 0.5;
const LIFT = -0.8;
const BASE_SCROLL_SPEED = 3;
const BASE_OBSTACLE_INTERVAL = 2000; // ms
const CANDLE_WIDTH = 20;
const CANDLE_HEIGHT = 40;

interface GameState {
    y: number;
    velocity: number;
    isHolding: boolean;
    obstacles: Obstacle[];
    items: Item[];
    trail: { x: number, y: number }[];
    score: number;
    obstaclesPassed: number;
    dailyEarnings: number;
    obstaclesSinceLastCoin: number;
    lastObstacleTime: number;
    difficulty: number;
}

interface Obstacle {
    x: number;
    y: number;
    width: number;
    height: number;
    passed: boolean;
}

interface Item {
    x: number;
    y: number;
    width: number;
    height: number;
    collected: boolean;
    id: number;
    type: 'coin' | 'big_bonus';
    value: number;
}

const GameCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const dispatch = useAppDispatch();
    const { isPlaying, isGameOver, dailyEarnings } = useAppSelector((state) => state.game);
    const bonusImageRef = useRef<HTMLImageElement>(new Image());

    const gameStateRef = useRef<GameState>({
        y: 200,
        velocity: 0,
        isHolding: false,
        obstacles: [] as Obstacle[],
        items: [] as Item[],
        trail: [] as { x: number, y: number }[],
        score: 0,
        obstaclesPassed: 0, // Keçilən maneə sayı (Obstacles passed count)
        dailyEarnings: 0,
        obstaclesSinceLastCoin: 0, // Bad Luck Protection için sayaç
        lastObstacleTime: 0,
        difficulty: 1,

    });

    const requestRef = useRef<number>();

    // Şəkillərin yüklənməsi (Load images)
    useEffect(() => {
        bonusImageRef.current.src = AZCashLogo;
    }, []);

    useEffect(() => {
        const handleTouchStart = () => { gameStateRef.current.isHolding = true; };
        const handleTouchEnd = () => { gameStateRef.current.isHolding = false; };
        const handleMouseDown = () => { gameStateRef.current.isHolding = true; };
        const handleMouseUp = () => { gameStateRef.current.isHolding = false; };

        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchend', handleTouchEnd);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    // Difficulty is now calculated by obstacles passed, not score.
    // useEffect for score removed to decouple logic.

    // Sync dailyEarnings to Ref
    useEffect(() => {
        gameStateRef.current.dailyEarnings = dailyEarnings;
    }, [dailyEarnings]);

    const update = (time: number) => {
        if (!isPlaying || isGameOver) return;

        const state = gameStateRef.current;
        const canvas = canvasRef.current;
        if (!canvas) return;

        // --- Fizika (Physics) ---
        if (state.isHolding) {
            state.velocity += LIFT;
        } else {
            state.velocity += GRAVITY;
        }
        state.velocity = Math.max(Math.min(state.velocity, 8), -8);
        state.y += state.velocity;

        // Sərhədlər (Boundaries)
        if (state.y < 0) { state.y = 0; state.velocity = 0; }
        if (state.y > canvas.height - CANDLE_HEIGHT) {
            dispatch(endGame());
            WebApp.HapticFeedback.notificationOccurred('error');
            return;
        }

        // --- Kritik Çətinlik Hesablamaları (Critical Difficulty Calculations) ---
        // Sürət: Hər səviyyədə 0.5 artır (Speed: +0.5 per level)
        const currentSpeed = BASE_SCROLL_SPEED + (state.difficulty - 1) * 0.5;

        // Maneə Aralığı: Hər səviyyədə 120ms azalır (Interval: -120ms per level)
        // Min 900ms-ə qədər düşür
        const currentInterval = Math.max(BASE_OBSTACLE_INTERVAL - (state.difficulty - 1) * 120, 900);

        // Boşluq Ölçüsü: Hər səviyyədə 10px azalır (Gap: -10px per level)
        // Min 130px-ə qədər düşür (çox dar)
        const GAP_SIZE = Math.max(250 - (state.difficulty - 1) * 10, 130);

        // --- Generator (Generator Logic) ---
        // --- Generator (Generator Logic) ---
        if (time - state.lastObstacleTime > currentInterval) {
            state.lastObstacleTime = time; // RESTORED: This fixed the infinite spawn bug

            const minHeight = 50;
            const availableHeight = canvas.height - GAP_SIZE;
            // Təsadüfi hündürlük (Random height)
            const topHeight = Math.random() * (availableHeight - minHeight * 2) + minHeight;
            const bottomY = topHeight + GAP_SIZE;
            const bottomHeight = canvas.height - bottomY;

            // Qoşa Maneələr (Dual Obstacles)
            state.obstacles.push({
                x: canvas.width,
                y: 0,
                width: 50,
                height: topHeight,
                passed: false
            });
            state.obstacles.push({
                x: canvas.width,
                y: bottomY,
                width: 50,
                height: bottomHeight,
                passed: false
            });

            // --- Bonus Sistemi (Bonus System) ---
            let coinSpawned = false;

            const isBelowLimit = state.dailyEarnings < 1000;
            const isLucky = Math.random() < 0.30;
            const isGuaranteed = state.obstaclesSinceLastCoin >= 3;

            if (isBelowLimit && (isLucky || isGuaranteed)) {
                // Reset counter because we spawned a coin
                state.obstaclesSinceLastCoin = 0;
                coinSpawned = true;

                // Konum: Boşluğun mərkəzində, bir az sağa-sola sürüşə bilər 
                // Dəyər Hesablanması (Level-based Value):
                let bonusValue = 0;

                if (state.difficulty === 1) {
                    bonusValue = Math.floor(Math.random() * 6) + 5;   // 5-10 AZC
                } else if (state.difficulty === 2) {
                    bonusValue = Math.floor(Math.random() * 10) + 11; // 11-20 AZC
                } else if (state.difficulty === 3) {
                    bonusValue = Math.floor(Math.random() * 10) + 21; // 21-30 AZC
                } else if (state.difficulty === 4) {
                    bonusValue = Math.floor(Math.random() * 10) + 31; // 31-40 AZC
                } else {
                    bonusValue = Math.floor(Math.random() * 10) + 41; // 41-50 AZC
                }

                state.items.push({
                    x: canvas.width + 25, // Obstacle ortası
                    y: topHeight + (GAP_SIZE / 2),
                    width: 30, // Logo size
                    height: 30,
                    collected: false,
                    id: Date.now(),
                    type: 'big_bonus',
                    value: bonusValue
                });
            } else {
                // Coin çıkmadıysa sayacı artır (Increment counter if no coin)
                state.obstaclesSinceLastCoin += 1;
            }

            // --- News Bubble Spawning ---
            // YALNIZ Coin yoksa ve şans varsa (25%)
            if (!coinSpawned && state.obstacles.length > 2 && Math.random() < 0.25) {
                const lastObstacleTop = state.obstacles[state.obstacles.length - 4]; // prev top
                const currentObstacleTop = state.obstacles[state.obstacles.length - 2]; // current top

                if (lastObstacleTop && currentObstacleTop) {
                    const oldGapY = lastObstacleTop.height;
                    const newGapY = currentObstacleTop.height;

                    let trend: 'neutral' | 'bullish' | 'bearish' = 'neutral';
                    // Check if current gap is HIGHER (smaller Y) or LOWER (larger Y) than previous
                    if (newGapY < oldGapY - 30) trend = 'bullish'; // Significantly Higher -> Bullish
                    else if (newGapY > oldGapY + 30) trend = 'bearish'; // Significantly Lower -> Bearish

                    // Filter posts
                    const relevantPosts = socialData.posts.filter(p => p.sentiment === trend);
                    // Fallback to neutral if no specific trend posts or just strict trend
                    const postsToUse = relevantPosts.length > 0 ? relevantPosts : socialData.posts.filter(p => p.sentiment === 'neutral');

                    if (postsToUse.length > 0) {
                        const randomPost = postsToUse[Math.floor(Math.random() * postsToUse.length)];
                        // Dispatch to Redux for UI overlay
                        dispatch(triggerNews({
                            id: randomPost.id,
                            text: randomPost.content,
                            author: randomPost.author,
                            avatar: randomPost.avatar,
                            platformId: randomPost.platformId,
                            sentiment: randomPost.sentiment as 'bullish' | 'bearish' | 'neutral'
                        }));
                    }
                }
            }
        }

        // --- Hərəkət və Təmizlik (Movement & Cleanup) ---
        state.obstacles.forEach(obs => obs.x -= currentSpeed);
        state.items.forEach(item => item.x -= currentSpeed);

        state.obstacles = state.obstacles.filter(obs => obs.x + obs.width > -100);
        state.items = state.items.filter(item => item.x > -100 && !item.collected);

        // --- Toqquşma və Xal (Collision & Scoring) ---
        const playerRect = { x: 100 - CANDLE_WIDTH / 2, y: state.y, w: CANDLE_WIDTH, h: CANDLE_HEIGHT };

        // Maneələr (Obstacles)
        state.obstacles.forEach(obs => {
            if (
                playerRect.x < obs.x + obs.width &&
                playerRect.x + playerRect.w > obs.x &&
                playerRect.y < obs.y + obs.height &&
                playerRect.y + playerRect.h > obs.y
            ) {
                dispatch(endGame());
                WebApp.HapticFeedback.notificationOccurred('error');
                return;
            }

            // Xal hesablama (Scoring)
            if (!obs.passed && playerRect.x > obs.x + obs.width && obs.y === 0) {
                obs.passed = true;
                state.obstaclesPassed += 1;

                // Çətinlik yeniləməsi: Hər 10 maneə = 1 Səviyyə
                // Update Difficulty: Every 10 obstacles = 1 Level
                state.difficulty = Math.min(Math.floor(state.obstaclesPassed / 10) + 1, 15);

                const points = 10;
                dispatch(incrementScore(points));
                state.score += points; // Local sync

                // Hər 10 maneədən (100 xal) sonra səs effekti
                if (state.obstaclesPassed % 10 === 0) {
                    WebApp.HapticFeedback.notificationOccurred('success');
                } else {
                    WebApp.HapticFeedback.impactOccurred('light');
                }
            }
        });

        // Bonuslar (Items)
        state.items.forEach(item => {
            const itemRadius = item.width / 2; // Sadə dairəvi toqquşma (Simple circular collision)
            const dx = (playerRect.x + playerRect.w / 2) - item.x;
            const dy = (playerRect.y + playerRect.h / 2) - item.y;

            // Toqquşma məsafəsi (Collision distance)
            if (dx * dx + dy * dy < (itemRadius + 20) * (itemRadius + 20)) {
                if (!item.collected) {
                    item.collected = true;
                    dispatch(collectCoin(item.value));
                    WebApp.HapticFeedback.notificationOccurred('success');
                }
            }
        });

        draw();
        requestRef.current = requestAnimationFrame(update);
    };

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const state = gameStateRef.current;

        // Təmizləmə (Clear)
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // --- Arxa Plan Grid (Background Grid) ---
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        const gridSize = 50;

        ctx.beginPath();
        for (let gy = 0; gy < canvas.height; gy += gridSize) {
            ctx.moveTo(0, gy);
            ctx.lineTo(canvas.width, gy);
        }
        for (let gx = 0; gx < canvas.width; gx += gridSize) {
            ctx.moveTo(gx, 0);
            ctx.lineTo(gx, canvas.height);
        }
        ctx.stroke();

        // --- Maneələr (Obstacles) ---
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#f59e0b';
        state.obstacles.forEach(obs => {
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            ctx.lineWidth = 2;
            ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

            ctx.fillStyle = 'rgba(245, 158, 11, 0.1)';
            ctx.fillRect(obs.x + 5, obs.y, obs.width - 10, obs.height);
            ctx.fillStyle = '#1e293b';
        });



        // --- Bonuslar (Items) ---
        state.items.forEach(item => {
            if (item.collected) return;

            // Logo şəkli (Logo Image)
            if (bonusImageRef.current.complete) {
                const imgSize = 40; // Biraz daha böyük görünüş
                ctx.drawImage(bonusImageRef.current, item.x - imgSize / 2, item.y - imgSize / 2, imgSize, imgSize);
            } else {
                // Fallback (Şəkil yüklənməyibsə)
                ctx.beginPath();
                ctx.arc(item.x, item.y, 15, 0, Math.PI * 2);
                ctx.fillStyle = '#f59e0b';
                ctx.fill();
            }

            // Dəyəri göstər (Show Value)
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px Ubuntu';
            ctx.textAlign = 'center';
            ctx.fillText(`+${item.value}`, item.x, item.y - 25);
        });

        // --- Oyunçu (Player: Candle) ---
        const x = 100 - CANDLE_WIDTH / 2;
        const y = state.y;
        const color = state.isHolding ? '#22c55e' : '#ef4444';

        // Fitil Elastikliyi (Wick Elasticity)
        const baseWick = 10;
        const stretch = Math.abs(state.velocity) * 4;

        let topWickLen = baseWick;
        let bottomWickLen = baseWick;

        if (state.velocity < 0) { // Yuxarı hərəkət (Moving UP) -> Aşağı fitili uzat (Stretch Bottom)
            bottomWickLen += stretch;
        } else if (state.velocity > 0) { // Aşağı hərəkət (Moving DOWN) -> Yuxarı fitili uzat (Stretch Top)
            topWickLen += stretch;
        }

        // Fitil Çəkimi (Draw Wick)
        ctx.beginPath();
        // Yuxarı fitil (Top wick)
        ctx.moveTo(100, y);
        ctx.lineTo(100, y - topWickLen);
        // Aşağı fitil (Bottom wick)
        ctx.moveTo(100, y + CANDLE_HEIGHT);
        ctx.lineTo(100, y + CANDLE_HEIGHT + bottomWickLen);

        ctx.strokeStyle = color;
        ctx.lineWidth = 1; // İncə fitil (Thin wick)
        ctx.stroke();

        // Bədən Çəkimi (Draw Body)
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.fillRect(x, y, CANDLE_WIDTH, CANDLE_HEIGHT);
        ctx.shadowBlur = 0;
    };

    useEffect(() => {
        if (isPlaying && !isGameOver) {
            requestRef.current = requestAnimationFrame(update);
        } else {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isPlaying, isGameOver]);

    // İlkin Çəkim (Initial Draw)
    useEffect(() => {
        draw();
    }, []);

    return (
        <canvas
            ref={canvasRef}
            width={window.innerWidth}
            height={window.innerHeight}
            className="block touch-none"
        />
    );
};

export default GameCanvas;
