import { useState } from 'react';
import { Loader2, LogIn, UserPlus, X } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

export default function WelcomePage({ onLogin, onRegister, loading = false }) {
    const { t } = useI18n();
    const [legalPanel, setLegalPanel] = useState(null);
    const year = new Date().getFullYear();

    const legalTitle =
        legalPanel === 'privacy' ? t('footerPrivacyTitle') : t('footerTermsTitle');
    const legalBody =
        legalPanel === 'privacy' ? t('footerPrivacyBody') : t('footerTermsBody');

    return (
        <div className="welcome-page relative isolate flex min-h-[100dvh] flex-1 flex-col">
            <section className="relative flex min-h-[100dvh] flex-1 flex-col overflow-hidden">
                <div className="welcome-sky pointer-events-none absolute inset-0" aria-hidden="true">
                    <div className="welcome-glow welcome-glow-a" />
                    <div className="welcome-glow welcome-glow-b" />
                    <div className="welcome-stars" />
                </div>

                <div
                    className="welcome-book-plane pointer-events-none absolute inset-x-0 bottom-0 h-[42%] min-h-[220px] md:h-[48%]"
                    aria-hidden="true"
                >
                    <svg
                        className="welcome-book absolute inset-x-0 bottom-0 h-full w-full"
                        viewBox="0 0 1440 420"
                        preserveAspectRatio="xMidYMax slice"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            <linearGradient id="welcomePageLeft" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#F7F1E8" />
                                <stop offset="100%" stopColor="#E8D9C4" />
                            </linearGradient>
                            <linearGradient id="welcomePageRight" x1="1" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#F3EADF" />
                                <stop offset="100%" stopColor="#DCC9AE" />
                            </linearGradient>
                            <linearGradient id="welcomeSpine" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#6B3F8F" />
                                <stop offset="100%" stopColor="#4A2A68" />
                            </linearGradient>
                        </defs>
                        <path
                            d="M0 420 V180 C180 110 360 95 520 130 C600 150 680 200 720 230 V420 Z"
                            fill="url(#welcomePageLeft)"
                        />
                        <path
                            d="M1440 420 V180 C1260 110 1080 95 920 130 C840 150 760 200 720 230 V420 Z"
                            fill="url(#welcomePageRight)"
                        />
                        <path d="M708 228 C712 210 716 210 720 228 V420 H708 Z" fill="url(#welcomeSpine)" />
                        <g opacity="0.35" stroke="#8C5EB9" strokeWidth="3" strokeLinecap="round" fill="none">
                            <path d="M180 250 C260 220 340 220 420 250" />
                            <path d="M200 290 C280 260 360 260 440 290" />
                            <path d="M220 330 C300 300 380 300 460 330" />
                        </g>
                        <g opacity="0.3" stroke="#2F6F6A" strokeWidth="3" strokeLinecap="round" fill="none">
                            <path d="M1020 250 C1100 220 1180 220 1260 250" />
                            <path d="M1000 290 C1080 260 1160 260 1240 290" />
                            <path d="M980 330 C1060 300 1140 300 1220 330" />
                        </g>
                        <circle className="welcome-orb welcome-orb-1" cx="260" cy="200" r="10" fill="#F0B429" />
                        <circle className="welcome-orb welcome-orb-2" cx="1180" cy="190" r="8" fill="#8C5EB9" />
                        <circle className="welcome-orb welcome-orb-3" cx="980" cy="150" r="6" fill="#3BA99C" />
                    </svg>
                </div>

                <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 pb-[38vh] pt-16 text-center md:pb-[42vh] md:pt-20">
                    <p className="welcome-fade welcome-fade-1 font-welcome-display text-6xl leading-none tracking-tight text-[#2A2140] sm:text-7xl md:text-8xl">
                        <span className="block">Story</span>
                        <span className="block text-[#8C5EB9]">Translator</span>
                    </p>

                    <p className="welcome-fade welcome-fade-2 mt-6 max-w-md font-welcome-body text-base leading-relaxed text-[#3D3454]/90 sm:text-lg md:max-w-lg md:text-xl">
                        {t('welcomeSubtitle')}
                    </p>

                    {loading ? (
                        <div className="welcome-fade welcome-fade-3 mt-10 flex items-center justify-center gap-3 text-[#3D3454]/80">
                            <Loader2 className="h-6 w-6 animate-spin text-[#8C5EB9]" />
                            <span className="font-welcome-body text-base">{t('welcomeCheckingSession')}</span>
                        </div>
                    ) : (
                        <div className="welcome-fade welcome-fade-3 mt-10 flex w-full max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-4">
                            <button
                                type="button"
                                onClick={onRegister}
                                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#8C5EB9] px-8 py-4 font-welcome-body text-lg font-bold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#7a4fa8] active:translate-y-0"
                            >
                                <UserPlus className="h-5 w-5" />
                                {t('welcomeCreateAccount')}
                            </button>
                            <button
                                type="button"
                                onClick={onLogin}
                                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-[#2A2140]/15 bg-white/70 px-8 py-4 font-welcome-body text-lg font-bold text-[#2A2140] backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#8C5EB9]/50 hover:bg-white active:translate-y-0"
                            >
                                <LogIn className="h-5 w-5" />
                                {t('welcomeLogin')}
                            </button>
                        </div>
                    )}
                </div>
            </section>

            <footer className="relative z-20 border-t border-[#2A2140]/10 bg-[#2A2140] text-[#F7F1E8]">
                <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8 md:flex-row md:items-start md:justify-between md:gap-10">
                    <div className="max-w-sm text-left">
                        <p className="font-welcome-display text-2xl tracking-tight">
                            Story<span className="text-[#C9A6E8]">Translator</span>
                        </p>
                        <p className="mt-2 font-welcome-body text-sm leading-relaxed text-[#F7F1E8]/75">
                            {t('footerTagline')}
                        </p>
                    </div>

                    <nav
                        aria-label="Pied de page"
                        className="flex flex-col gap-3 font-welcome-body text-sm md:items-end"
                    >
                        <div className="flex flex-wrap gap-x-5 gap-y-2">
                            <button
                                type="button"
                                onClick={onLogin}
                                disabled={loading}
                                className="text-[#F7F1E8]/85 transition hover:text-white disabled:opacity-50"
                            >
                                {t('welcomeLogin')}
                            </button>
                            <button
                                type="button"
                                onClick={onRegister}
                                disabled={loading}
                                className="text-[#F7F1E8]/85 transition hover:text-white disabled:opacity-50"
                            >
                                {t('welcomeCreateAccount')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setLegalPanel('privacy')}
                                className="text-[#F7F1E8]/85 transition hover:text-white"
                            >
                                {t('footerPrivacy')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setLegalPanel('terms')}
                                className="text-[#F7F1E8]/85 transition hover:text-white"
                            >
                                {t('footerTerms')}
                            </button>
                        </div>
                        <p className="text-[#F7F1E8]/55">{t('footerCopyright', { year })}</p>
                    </nav>
                </div>
            </footer>

            {legalPanel && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-[#2A2140]/45 p-4 sm:items-center"
                    role="presentation"
                    onClick={() => setLegalPanel(null)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="welcome-legal-title"
                        className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-[#F7F1E8] p-6 text-[#2A2140] shadow-xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mb-4 flex items-start justify-between gap-4">
                            <h2
                                id="welcome-legal-title"
                                className="font-welcome-display text-2xl tracking-tight"
                            >
                                {legalTitle}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setLegalPanel(null)}
                                className="rounded-xl p-2 text-[#2A2140]/70 transition hover:bg-[#2A2140]/8 hover:text-[#2A2140]"
                                aria-label={t('footerClose')}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <p className="font-welcome-body text-sm leading-relaxed text-[#3D3454]">
                            {legalBody}
                        </p>
                        <button
                            type="button"
                            onClick={() => setLegalPanel(null)}
                            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#8C5EB9] px-5 py-2.5 font-welcome-body text-sm font-bold text-white transition hover:bg-[#7a4fa8]"
                        >
                            {t('footerClose')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
