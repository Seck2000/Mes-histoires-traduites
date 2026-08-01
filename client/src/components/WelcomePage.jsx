import { Loader2, LogIn, UserPlus } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

export default function WelcomePage({ onLogin, onRegister, loading = false }) {
    const { t } = useI18n();

    return (
        <section className="welcome-page relative isolate flex min-h-[100dvh] flex-1 flex-col overflow-hidden">
            <div className="welcome-sky pointer-events-none absolute inset-0" aria-hidden="true">
                <div className="welcome-glow welcome-glow-a" />
                <div className="welcome-glow welcome-glow-b" />
                <div className="welcome-stars" />
            </div>

            <div className="welcome-book-plane pointer-events-none absolute inset-x-0 bottom-0 h-[42%] min-h-[220px] md:h-[48%]" aria-hidden="true">
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
    );
}
