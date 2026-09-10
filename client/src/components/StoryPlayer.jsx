import { Play, Volume2, VolumeX, Pause, ChevronRight, ChevronLeft, Eye, EyeOff, MessageCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useStorySpeech } from '../hooks/useStorySpeech';
import { useI18n } from '../i18n/I18nProvider';

/**
 * Lecteur plein écran d'une histoire (scènes, TTS, langue).
 * Hauteur = viewport : image + boutons visibles sans défiler la page.
 */
export default function StoryPlayer({
    story,
    sceneIndex,
    setSceneIndex,
    currentLang,
    setCurrentLang,
    getImageUrl,
    onClose,
    onStartChat,
}) {
    const { t } = useI18n();
    const currentScene = story?.scenes?.[sceneIndex] || null;
    const {
        isAutoPlay,
        isPlaying,
        isPaused,
        showText,
        setShowText,
        toggleLang,
        toggleAutoAudio,
        togglePlayPause,
    } = useStorySpeech({
        enabled: Boolean(story && currentScene),
        story,
        sceneIndex,
        currentLang,
        setCurrentLang,
    });

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, []);

    if (!story) return null;

    if (!currentScene) {
        return (
            <div className="story-player-shell flex h-[100dvh] max-h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#0A1228] p-6 text-center">
                <div className="max-w-md">
                    <h2 className="mb-3 text-2xl font-bold text-red-600">{t('playerIncompleteTitle')}</h2>
                    <p className="mb-6 text-white/70">{t('playerIncompleteBody')}</p>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl bg-[#1A3FFF] px-5 py-3 font-semibold text-white transition hover:bg-[#1533cc]"
                    >
                        {t('playerBackLibrary')}
                    </button>
                </div>
            </div>
        );
    }

    const currentSceneText =
        currentScene?.text?.[currentLang] || currentScene?.text?.fr || '';
    const currentSceneImage = currentScene?.image || '';
    const currentCharacterAvatar =
        currentScene?.character?.avatar || currentSceneImage;
    const isLastScene = sceneIndex === story.scenes.length - 1;

    return (
        <div className="story-player-shell relative h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-[#0A1228]">
            <div className="absolute inset-0 z-0">
                <img
                    src={getImageUrl(currentSceneImage, story.id)}
                    alt={t('playerSceneAlt')}
                    className="h-full w-full object-cover"
                />
            </div>

            <div className="absolute left-0 top-0 z-30 h-1.5 w-full bg-[rgba(255,255,255,0.12)]">
                <div
                    className="h-full bg-[#1A3FFF] transition-all duration-300 ease-out"
                    style={{
                        width: `${((sceneIndex + 1) / story.scenes.length) * 100}%`,
                    }}
                />
            </div>

            <div className="absolute right-3 top-3 z-30 flex gap-2 sm:right-4 sm:top-4">
                <div className="rounded-full bg-black/60 px-3 py-2 text-xs font-medium text-white shadow-md backdrop-blur-sm md:text-sm">
                    {t('playerScene')} {sceneIndex + 1} / {story.scenes.length}
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full bg-black/60 px-4 py-2 text-xs font-bold text-white shadow-md backdrop-blur-sm transition hover:bg-black/80 md:text-sm"
                >
                    {t('playerClose')}
                </button>
            </div>

            <div className="absolute inset-x-0 bottom-0 z-20 flex max-h-[46vh] flex-col justify-end bg-gradient-to-t from-black/85 via-black/45 to-transparent px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-10 sm:px-4 md:max-h-[42vh] md:px-6 md:pb-5">
                <div className="flex min-h-0 w-full flex-col items-stretch gap-2.5 md:flex-row md:items-end md:gap-4">
                    <button
                        type="button"
                        disabled={sceneIndex === 0}
                        onClick={() => setSceneIndex((i) => i - 1)}
                        className="mb-1 hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-white/20 bg-black/60 text-white shadow-lg transition hover:scale-110 hover:bg-black/80 disabled:opacity-30 disabled:hover:scale-100 md:flex"
                        title={t('playerPrev')}
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>

                    <div className="flex shrink-0 flex-row items-center justify-center gap-2.5 rounded-2xl bg-black/40 p-2 backdrop-blur-sm md:flex-col md:bg-transparent md:p-0 md:backdrop-blur-none">
                        <button
                            type="button"
                            onClick={toggleLang}
                            className="z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-red-600 text-sm font-bold shadow-lg transition hover:scale-105 md:h-14 md:w-14 md:border-4 md:text-lg"
                            title={t('playerLang', { lang: currentLang.toUpperCase() })}
                        >
                            {currentLang.toUpperCase()}
                        </button>

                        <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-gray-300 bg-[#0A1228] shadow-lg md:h-20 md:w-20 md:rounded-xl">
                            <img
                                src={getImageUrl(currentCharacterAvatar, story.id)}
                                alt={t('playerCharAlt')}
                                className="h-full w-full object-cover"
                            />
                        </div>

                        <div className="flex justify-center gap-2">
                            <button
                                type="button"
                                onClick={toggleAutoAudio}
                                className={`flex h-10 w-10 items-center justify-center rounded-full text-white shadow transition ${
                                    isAutoPlay
                                        ? 'bg-green-600 ring-2 ring-white'
                                        : 'bg-gray-600 hover:bg-gray-700'
                                }`}
                                title={isAutoPlay ? t('playerAutoOn') : t('playerAutoOff')}
                            >
                                {isAutoPlay ? (
                                    <Volume2 className="h-4 w-4" />
                                ) : (
                                    <VolumeX className="h-4 w-4" />
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={togglePlayPause}
                                className={`flex h-10 w-10 items-center justify-center rounded-full text-white shadow transition ${
                                    isPlaying
                                        ? 'bg-amber-500 hover:bg-amber-600 animate-pulse'
                                        : 'bg-red-600 hover:bg-red-700'
                                }`}
                                title={
                                    isPlaying
                                        ? t('playerPause')
                                        : isPaused
                                          ? t('playerResume')
                                          : t('playerRead')
                                }
                            >
                                {isPlaying ? (
                                    <Pause className="h-4 w-4" fill="white" />
                                ) : (
                                    <Play className="h-4 w-4" fill="white" />
                                )}
                            </button>
                        </div>
                    </div>

                    {showText ? (
                        <div
                            className={`min-h-0 max-h-[18vh] w-full overflow-y-auto rounded-2xl border-2 border-white bg-blue-500/90 p-3 text-sm font-medium leading-relaxed text-white shadow-lg backdrop-blur-md transition-opacity animate-in fade-in duration-300 md:max-h-[22vh] md:flex-1 md:p-4 md:text-lg ${
                                currentLang === 'ar' ? 'text-right' : 'text-left'
                            }`}
                            dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
                        >
                            {currentSceneText || t('playerNoText')}
                        </div>
                    ) : (
                        <div className="hidden min-h-0 w-full md:block md:flex-1 md:min-h-[4rem]" />
                    )}

                    <div className="flex w-full shrink-0 items-center justify-between gap-2 md:mb-1 md:w-auto md:justify-end">
                        <button
                            type="button"
                            disabled={sceneIndex === 0}
                            onClick={() => setSceneIndex((i) => i - 1)}
                            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/20 bg-black/60 text-white shadow-lg transition hover:bg-black/80 active:scale-95 disabled:opacity-30 md:hidden"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowText((v) => !v)}
                            className={`flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/20 text-white shadow-lg transition hover:scale-105 active:scale-95 ${
                                showText
                                    ? 'bg-indigo-600 hover:bg-indigo-700'
                                    : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                            title={showText ? t('playerHideText') : t('playerShowText')}
                        >
                            {showText ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                        </button>

                        {isLastScene ? (
                            <button
                                type="button"
                                onClick={onStartChat}
                                className="flex h-11 items-center justify-center gap-2 rounded-full border-2 border-white/20 bg-teal-600 px-4 text-sm font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-teal-700 active:scale-95"
                                title={t('playerChatTitle')}
                            >
                                <MessageCircle className="h-5 w-5" />
                                <span className="hidden sm:inline">{t('playerChat')}</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setSceneIndex((i) => i + 1)}
                                className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/20 bg-black/60 text-white shadow-lg transition hover:scale-110 hover:bg-black/80 active:scale-95"
                                title={t('playerNext')}
                            >
                                <ChevronRight className="h-6 w-6" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
