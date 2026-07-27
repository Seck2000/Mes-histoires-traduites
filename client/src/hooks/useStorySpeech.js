import { useCallback, useEffect, useState } from 'react';
import { LANGUAGES } from '../constants/languages';
import {
    SPEECH_LANG_MAP,
    isSpeechSynthesisSupported,
    stopSpeaking,
} from '../utils/speech';

const LANGUAGE_CODES = LANGUAGES.map((lang) => lang.code);

/**
 * Synthèse vocale + langue / texte masqué pour le lecteur d'histoire.
 */
export function useStorySpeech({
    enabled,
    story,
    sceneIndex,
    currentLang,
    setCurrentLang,
}) {
    const [isAutoPlay, setIsAutoPlay] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [showText, setShowText] = useState(true);

    const speakText = useCallback((text, lang) => {
        if (!text || !isSpeechSynthesisSupported()) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = SPEECH_LANG_MAP[lang] || 'fr-FR';
        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => {
            setIsPlaying(false);
            setIsPaused(false);
        };
        utterance.onerror = () => {
            setIsPlaying(false);
            setIsPaused(false);
        };
        window.speechSynthesis.speak(utterance);
    }, []);

    useEffect(() => {
        if (!enabled || !story) {
            stopSpeaking();
            setIsPlaying(false);
            setIsPaused(false);
            return undefined;
        }

        const scene = story.scenes?.[sceneIndex];
        const text = scene?.text?.[currentLang];

        if (isAutoPlay && text && !isPaused) {
            speakText(text, currentLang);
        }

        return () => {
            stopSpeaking();
            setIsPlaying(false);
            setIsPaused(false);
        };
        // isPaused volontairement hors deps : reprise manuelle via play/pause
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, story, sceneIndex, currentLang, isAutoPlay, speakText]);

    useEffect(() => {
        if (!enabled || !isAutoPlay || isPlaying || isPaused || !story) return;
        const text = story.scenes?.[sceneIndex]?.text?.[currentLang];
        if (text) speakText(text, currentLang);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAutoPlay]);

    const toggleLang = useCallback(() => {
        const currentIndex = Math.max(0, LANGUAGE_CODES.indexOf(currentLang));
        const nextIndex = (currentIndex + 1) % LANGUAGE_CODES.length;
        setCurrentLang(LANGUAGE_CODES[nextIndex]);
    }, [currentLang, setCurrentLang]);

    const toggleAutoAudio = useCallback(() => {
        setIsAutoPlay((prev) => {
            if (prev) stopSpeaking();
            return !prev;
        });
    }, []);

    const togglePlayPause = useCallback(() => {
        if (!isSpeechSynthesisSupported()) return;

        if (isPlaying) {
            window.speechSynthesis.pause();
            setIsPlaying(false);
            setIsPaused(true);
            return;
        }

        if (isPaused) {
            window.speechSynthesis.resume();
            setIsPlaying(true);
            setIsPaused(false);
            return;
        }

        const text = story?.scenes?.[sceneIndex]?.text?.[currentLang];
        if (text) speakText(text, currentLang);
    }, [isPlaying, isPaused, story, sceneIndex, currentLang, speakText]);

    const stop = useCallback(() => {
        stopSpeaking();
        setIsPlaying(false);
        setIsPaused(false);
    }, []);

    return {
        isAutoPlay,
        isPlaying,
        isPaused,
        showText,
        setShowText,
        toggleLang,
        toggleAutoAudio,
        togglePlayPause,
        stop,
    };
}
