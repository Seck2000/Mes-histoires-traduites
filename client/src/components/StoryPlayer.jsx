import { Play, Volume2, VolumeX, Pause, ChevronRight, ChevronLeft, Eye, EyeOff, MessageCircle } from 'lucide-react';
import { useStorySpeech } from '../hooks/useStorySpeech';
import { useI18n } from '../i18n/I18nProvider';

/**
 * Lecteur plein écran d'une histoire (scènes, TTS, langue).
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

    if (!story) return null;

    if (!currentScene) {
        return (
            <div className="flex-1 flex items-center justify-center bg-white rounded-xl border border-[#EBE6DC] p-6 text-center shadow-sm">
                <div className="max-w-md">
                    <h2 className="text-2xl font-bold text-red-600 mb-3">{t('playerIncompleteTitle')}</h2>
                    <p className="text-gray-600 mb-6">
                        {t('playerIncompleteBody')}
                    </p>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-3 rounded-xl bg-[#8C5EB9] hover:bg-[#7a4fa8] text-white font-semibold transition"
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
        <div className="flex-1 flex flex-col items-center justify-center relative bg-white rounded-xl overflow-hidden shadow-2xl border border-[#EBE6DC]">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-[#EBE6DC] z-30">
                <div
                    className="h-full bg-[#8C5EB9] transition-all duration-300 ease-out"
                    style={{
                        width: `${((sceneIndex + 1) / story.scenes.length) * 100}%`,
                    }}
                />
            </div>

            <div className="w-full h-full relative z-10">
                <img
                    src={getImageUrl(currentSceneImage, story.id)}
                    alt={t('playerSceneAlt')}
                    className="w-full h-full object-cover"
                />

                <div className="absolute top-4 right-4 flex gap-2 z-30">
                    <div className="bg-black/60 px-3 py-2 rounded-full text-white text-xs md:text-sm font-medium backdrop-blur-sm shadow-md">
                        {t('playerScene')} {sceneIndex + 1} / {story.scenes.length}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-black/60 px-4 py-2 rounded-full text-white hover:bg-black/80 transition backdrop-blur-sm shadow-md text-xs md:text-sm font-bold"
                    >
                        {t('playerClose')}
                    </button>
                </div>
            </div>

            <div className="absolute bottom-0 w-full p-4 md:p-8 bg-gradient-to-t from-black/80 to-transparent z-20 flex flex-col md:flex-row items-center md:items-end gap-4">
                <button
                    type="button"
                    disabled={sceneIndex === 0}
                    onClick={() => setSceneIndex((i) => i - 1)}
                    className="hidden md:flex mb-4 shrink-0 w-12 h-12 items-center justify-center bg-black/60 text-white rounded-full hover:bg-black/80 hover:scale-110 disabled:opacity-30 disabled:hover:scale-100 transition shadow-lg border-2 border-white/20"
                    title={t('playerPrev')}
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="flex flex-row md:flex-col items-center gap-4 shrink-0 bg-black/40 md:bg-transparent p-2 md:p-0 rounded-2xl md:rounded-none backdrop-blur-sm md:backdrop-blur-none">
                    <button
                        type="button"
                        onClick={toggleLang}
                        className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-red-600 border-2 md:border-4 border-white shadow-lg flex items-center justify-center text-sm md:text-xl font-bold z-10 hover:scale-105 transition"
                        title={t('playerLang', { lang: currentLang.toUpperCase() })}
                    >
                        {currentLang.toUpperCase()}
                    </button>

                    <div className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-full md:rounded-xl overflow-hidden border-2 border-gray-300 shadow-lg relative md:-mt-8 z-0">
                        <img
                            src={getImageUrl(currentCharacterAvatar, story.id)}
                            alt={t('playerCharAlt')}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="flex gap-2 justify-center md:mt-1">
                        <button
                            type="button"
                            onClick={toggleAutoAudio}
                            className={`w-10 h-10 rounded-full flex items-center justify-center shadow text-white transition ${isAutoPlay ? 'bg-green-600 ring-2 ring-white' : 'bg-gray-600 hover:bg-gray-700'}`}
                            title={isAutoPlay ? t('playerAutoOn') : t('playerAutoOff')}
                        >
                            {isAutoPlay ? (
                                <Volume2 className="w-4 h-4" />
                            ) : (
                                <VolumeX className="w-4 h-4" />
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={togglePlayPause}
                            className={`w-10 h-10 rounded-full flex items-center justify-center shadow text-white transition ${isPlaying ? 'bg-amber-500 hover:bg-amber-600 animate-pulse' : 'bg-red-600 hover:bg-red-700'}`}
                            title={
                                isPlaying
                                    ? t('playerPause')
                                    : isPaused
                                      ? t('playerResume')
                                      : t('playerRead')
                            }
                        >
                            {isPlaying ? (
                                <Pause className="w-4 h-4" fill="white" />
                            ) : (
                                <Play className="w-4 h-4" fill="white" />
                            )}
                        </button>
                    </div>
                </div>

                {showText ? (
                    <div
                        className={`w-full md:flex-1 bg-blue-500/90 backdrop-blur-md p-4 md:p-6 rounded-2xl border-2 border-white text-base md:text-xl shadow-lg font-medium leading-relaxed min-h-[100px] md:min-h-[120px] text-white ${currentLang === 'ar' ? 'text-right' : 'text-left'} transition-opacity animate-in fade-in duration-300`}
                        dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
                    >
                        {currentSceneText || t('playerNoText')}
                    </div>
                ) : (
                    <div className="w-full md:flex-1 min-h-[100px] md:min-h-[120px] transition-all" />
                )}

                <div className="flex w-full md:w-auto justify-between md:flex-row md:justify-end md:shrink-0 md:mb-4 gap-2">
                    <button
                        type="button"
                        disabled={sceneIndex === 0}
                        onClick={() => setSceneIndex((i) => i - 1)}
                        className="md:hidden w-12 h-12 flex items-center justify-center bg-black/60 text-white rounded-full hover:bg-black/80 active:scale-95 disabled:opacity-30 transition shadow-lg border-2 border-white/20"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowText((v) => !v)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20 text-white transition hover:scale-105 active:scale-95 ${showText ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                        title={showText ? t('playerHideText') : t('playerShowText')}
                    >
                        {showText ? <Eye className="w-6 h-6" /> : <EyeOff className="w-6 h-6" />}
                    </button>

                    {isLastScene ? (
                        <button
                            type="button"
                            onClick={onStartChat}
                            className="h-12 px-4 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white rounded-full hover:scale-105 active:scale-95 transition shadow-lg border-2 border-white/20 text-sm font-semibold"
                            title={t('playerChatTitle')}
                        >
                            <MessageCircle className="w-5 h-5" />
                            <span className="hidden sm:inline">{t('playerChat')}</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setSceneIndex((i) => i + 1)}
                            className="w-12 h-12 flex items-center justify-center bg-black/60 text-white rounded-full hover:bg-black/80 hover:scale-110 active:scale-95 transition shadow-lg border-2 border-white/20"
                            title={t('playerNext')}
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
