import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { useAppSelector } from './app/hooks';
import Home from './features/ui/Home';
import GameScreen from './features/game/GameScreen';
import GameOverModal from './features/ui/GameOverModal';
import LoadingScreen from './features/ui/LoadingScreen';
import ResumeOverlay from './features/ui/ResumeOverlay';
import { useAuth } from './hooks/useAuth';

import { useScoreSync } from './hooks/useScoreSync';
import { getTelegramLanguage } from './utils/telegram';

const GameApp = () => {
    const { isPlaying, isGameOver, isLoading, isResuming } = useAppSelector(state => state.game);
    useAuth();
    useScoreSync();

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <>
            {!isPlaying && !isGameOver && !isResuming && <Home />}

            {(isPlaying || isResuming || isGameOver) && <GameScreen />}

            {isResuming && <ResumeOverlay />}

            {isGameOver && <GameOverModal />}
        </>
    );
};

function App() {
    const { i18n } = useTranslation();

    useEffect(() => {
        i18n.changeLanguage(getTelegramLanguage());
    }, [i18n]);

    return (
        <Provider store={store}>
            <GameApp />
        </Provider>
    )
}

export default App;
