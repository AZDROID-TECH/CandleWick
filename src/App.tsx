import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import WebApp from '@twa-dev/sdk';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { useAppSelector } from './app/hooks';
import Home from './features/ui/Home';
import GameScreen from './features/game/GameScreen';
import GameOverModal from './features/ui/GameOverModal';
import { useAuth } from './hooks/useAuth';

import { useScoreSync } from './hooks/useScoreSync';

// Wrapper component to use Redux hooks
const GameApp = () => {
    const { isPlaying, isGameOver } = useAppSelector(state => state.game);
    // Initialize Auth and Data Sync
    useAuth();
    useScoreSync();

    return (
        <>
            {!isPlaying && !isGameOver && <Home />}
            {isPlaying && <GameScreen />}
            {isGameOver && (
                <>
                    <GameScreen /> {/* Keep background visible */}
                    <GameOverModal />
                </>
            )}
        </>
    );
};

function App() {
    const { i18n } = useTranslation();

    useEffect(() => {
        const userLang = WebApp.initDataUnsafe.user?.language_code;
        if (userLang && (userLang === 'en' || userLang === 'az')) {
            i18n.changeLanguage(userLang);
        } else {
            i18n.changeLanguage('en');
        }

        // Expand to full screen
        WebApp.expand();
    }, [i18n]);

    return (
        <Provider store={store}>
            <GameApp />
        </Provider>
    )
}

export default App;
