import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

export default function WelcomePage({ onLogin, onRegister, loading = false }) {
    const { t } = useI18n();
    const [legalPanel, setLegalPanel] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const year = new Date().getFullYear();

    const legalTitle =
        legalPanel === 'privacy' ? t('footerPrivacyTitle') : t('footerTermsTitle');
    const legalBody =
        legalPanel === 'privacy' ? t('footerPrivacyBody') : t('footerTermsBody');

    const scrollToFooter = () => {
        setMenuOpen(false);
        document.getElementById('welcome-footer')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="welcome-page relative isolate flex min-h-[100dvh] flex-1 flex-col bg-[#05070F] text-[#F4F6FB]">
            <section className="welcome-hero relative flex min-h-[100dvh] flex-1 flex-col overflow-hidden">
                <div className="welcome-canvas pointer-events-none absolute inset-0" aria-hidden="true">
                    <div className="welcome-silk" />
                    <div className="welcome-grain" />
                </div>

                <header className="welcome-fade welcome-fade-1 relative z-20 flex items-center justify-between gap-4 px-5 pt-6 md:px-10 md:pt-8">
                    <p className="font-welcome-body text-lg font-extrabold tracking-tight md:text-xl">
                        StoryTranslator
                    </p>

                    <nav
                        className="hidden items-center gap-8 md:flex"
                        aria-label="Navigation principale"
                    >
                        <button type="button" className="welcome-nav-link font-welcome-body" onClick={scrollToFooter}>
                            {t('welcomeNavDiscover')}
                        </button>
                        <button
                            type="button"
                            className="welcome-nav-link font-welcome-body"
                            onClick={onRegister}
                            disabled={loading}
                        >
                            {t('welcomeNavStart')}
                        </button>
                        <button
                            type="button"
                            className="welcome-nav-link font-welcome-body"
                            onClick={() => setLegalPanel('privacy')}
                        >
                            {t('welcomeNavContact')}
                        </button>
                    </nav>

                    <button
                        type="button"
                        onClick={() => setMenuOpen((open) => !open)}
                        className="rounded-md bg-white px-4 py-2 font-welcome-body text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#05070F] transition hover:bg-[#E8EEFF]"
                    >
                        {t('welcomeMenu')}
                    </button>
                </header>

                {menuOpen && (
                    <div className="absolute right-5 top-20 z-30 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#0A1228]/95 p-2 shadow-2xl backdrop-blur-md md:right-10">
                        <button
                            type="button"
                            className="block w-full rounded-lg px-3 py-2.5 text-left font-welcome-body text-sm text-white/90 hover:bg-white/10"
                            onClick={scrollToFooter}
                        >
                            {t('welcomeNavDiscover')}
                        </button>
                        <button
                            type="button"
                            className="block w-full rounded-lg px-3 py-2.5 text-left font-welcome-body text-sm text-white/90 hover:bg-white/10 disabled:opacity-50"
                            onClick={() => {
                                setMenuOpen(false);
                                onRegister();
                            }}
                            disabled={loading}
                        >
                            {t('welcomeCreateAccount')}
                        </button>
                        <button
                            type="button"
                            className="block w-full rounded-lg px-3 py-2.5 text-left font-welcome-body text-sm text-white/90 hover:bg-white/10 disabled:opacity-50"
                            onClick={() => {
                                setMenuOpen(false);
                                onLogin();
                            }}
                            disabled={loading}
                        >
                            {t('welcomeLogin')}
                        </button>
                        <button
                            type="button"
                            className="block w-full rounded-lg px-3 py-2.5 text-left font-welcome-body text-sm text-white/90 hover:bg-white/10"
                            onClick={() => {
                                setMenuOpen(false);
                                setLegalPanel('privacy');
                            }}
                        >
                            {t('footerPrivacy')}
                        </button>
                    </div>
                )}

                <div className="relative z-10 flex flex-1 flex-col justify-center px-5 pb-28 pt-16 md:px-10 md:pb-32 md:pt-10">
                    <div className="relative mx-auto w-full max-w-6xl">
                        <h1 className="welcome-fade welcome-fade-2 max-w-5xl font-welcome-display text-[clamp(2.6rem,8vw,6.4rem)] leading-[0.95] tracking-[-0.02em] text-white">
                            {t('welcomeHeadline')}
                        </h1>

                        <div className="welcome-fade welcome-fade-3 mt-10 flex flex-col gap-8 md:mt-16 md:flex-row md:items-start md:justify-between md:gap-16">
                            <p className="max-w-md font-welcome-body text-sm leading-relaxed text-white/70 md:text-base">
                                {t('welcomeSubtitle')}
                            </p>
                            <p className="max-w-[15rem] font-welcome-body text-[10px] font-bold uppercase leading-relaxed tracking-[0.22em] text-white/45 md:max-w-[13rem] md:pt-1 md:text-right">
                                {t('welcomeEyebrow')}
                            </p>
                        </div>

                        {loading ? (
                            <div className="welcome-fade welcome-fade-4 mt-12 flex items-center gap-3 text-white/70">
                                <Loader2 className="h-5 w-5 animate-spin text-[#6EA0FF]" />
                                <span className="font-welcome-body text-sm">{t('welcomeCheckingSession')}</span>
                            </div>
                        ) : (
                            <div className="welcome-fade welcome-fade-4 relative mt-12 flex flex-col gap-4 sm:mt-16 sm:flex-row sm:items-end sm:gap-6">
                                <button
                                    type="button"
                                    onClick={onRegister}
                                    className="welcome-cta-motion inline-flex min-h-12 items-center justify-center bg-[#1A3FFF] px-7 py-3.5 font-welcome-body text-[11px] font-extrabold uppercase tracking-[0.2em] text-white transition hover:brightness-110"
                                >
                                    {t('welcomeCtaDiscover')}
                                </button>

                                <button
                                    type="button"
                                    onClick={onLogin}
                                    className="welcome-cta-ghost inline-flex min-h-12 items-center justify-center bg-white/10 px-7 py-3.5 font-welcome-body text-[11px] font-extrabold uppercase tracking-[0.2em] text-white backdrop-blur-sm transition hover:bg-white/16"
                                >
                                    {t('welcomeLogin')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <footer
                id="welcome-footer"
                className="relative z-20 border-t border-white/10 bg-[#03050C] text-white"
            >
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 py-7 md:flex-row md:items-center md:justify-between md:px-10 md:py-8">
                    <div className="font-welcome-body">
                        <p className="text-sm font-semibold text-white/90">StoryTranslator</p>
                        <p className="mt-1 text-xs text-white/40">
                            {t('footerCopyright', { year })}
                        </p>
                    </div>

                    <nav
                        aria-label="Pied de page"
                        className="flex flex-wrap gap-x-5 gap-y-2 font-welcome-body"
                    >
                        <button
                            type="button"
                            onClick={onLogin}
                            disabled={loading}
                            className="welcome-nav-link disabled:opacity-50"
                        >
                            {t('welcomeLogin')}
                        </button>
                        <button
                            type="button"
                            onClick={onRegister}
                            disabled={loading}
                            className="welcome-nav-link disabled:opacity-50"
                        >
                            {t('welcomeCreateAccount')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setLegalPanel('privacy')}
                            className="welcome-nav-link"
                        >
                            {t('footerPrivacy')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setLegalPanel('terms')}
                            className="welcome-nav-link"
                        >
                            {t('footerTerms')}
                        </button>
                    </nav>
                </div>
            </footer>

            {legalPanel && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
                    role="presentation"
                    onClick={() => setLegalPanel(null)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="welcome-legal-title"
                        className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#0A1228] p-6 text-white shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mb-4 flex items-start justify-between gap-4">
                            <h2
                                id="welcome-legal-title"
                                className="font-welcome-display text-3xl tracking-tight"
                            >
                                {legalTitle}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setLegalPanel(null)}
                                className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                                aria-label={t('footerClose')}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <p className="font-welcome-body text-sm leading-relaxed text-white/70">
                            {legalBody}
                        </p>
                        <button
                            type="button"
                            onClick={() => setLegalPanel(null)}
                            className="mt-6 inline-flex min-h-11 items-center justify-center bg-white px-5 py-2.5 font-welcome-body text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#05070F] transition hover:bg-[#E8EEFF]"
                        >
                            {t('footerClose')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
