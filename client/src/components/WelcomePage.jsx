import { useState } from 'react';
import {
    Facebook,
    Instagram,
    Loader2,
    Mail,
    MapPin,
    Phone,
    Youtube,
    X,
} from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';
import { SITE_CONTACT } from '../constants/siteContact';

const LEGAL_KEYS = {
    privacy: { title: 'footerPrivacyTitle', body: 'footerPrivacyBody' },
    terms: { title: 'footerTermsTitle', body: 'footerTermsBody' },
    cookies: { title: 'footerCookiesTitle', body: 'footerCookiesBody' },
    mentions: { title: 'footerMentionsTitle', body: 'footerMentionsBody' },
    sitemap: { title: 'footerSitemapTitle', body: 'footerSitemapBody' },
};

function XSocialIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.25 5.718 5.914-5.718Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}

export default function WelcomePage({ onLogin, onRegister, loading = false }) {
    const { t } = useI18n();
    const [legalPanel, setLegalPanel] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [newsletterMessage, setNewsletterMessage] = useState('');
    const [newsletterError, setNewsletterError] = useState('');
    const year = new Date().getFullYear();

    const legalMeta = legalPanel ? LEGAL_KEYS[legalPanel] : null;

    const scrollToTop = () => {
        setMenuOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const scrollToFooter = () => {
        setMenuOpen(false);
        document.getElementById('welcome-footer')?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToContact = () => {
        setMenuOpen(false);
        document.getElementById('footer-contact')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleNewsletterSubmit = (event) => {
        event.preventDefault();
        setNewsletterMessage('');
        setNewsletterError('');
        const email = newsletterEmail.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setNewsletterError(t('footerNewsletterError'));
            return;
        }
        setNewsletterMessage(t('footerNewsletterSuccess'));
        setNewsletterEmail('');
    };

    const footerLinkClass =
        'block text-left text-sm text-white/65 transition hover:text-white disabled:opacity-50';

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
                            onClick={scrollToContact}
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
                            onClick={scrollToTop}
                        >
                            {t('footerHome')}
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
                            onClick={scrollToContact}
                        >
                            {t('footerContactLink')}
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
                <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 md:grid-cols-2 md:px-10 lg:grid-cols-4 lg:gap-8 lg:py-14">
                    <div className="font-welcome-body">
                        <p className="text-sm font-bold uppercase tracking-[0.14em] text-white/40">
                            {t('footerNavTitle')}
                        </p>
                        <ul className="mt-4 space-y-2.5">
                            <li>
                                <button type="button" onClick={scrollToTop} className={footerLinkClass}>
                                    {t('footerHome')}
                                </button>
                            </li>
                            <li>
                                <button type="button" onClick={scrollToContact} className={footerLinkClass}>
                                    {t('footerContactLink')}
                                </button>
                            </li>
                            <li>
                                <button type="button" onClick={onLogin} disabled={loading} className={footerLinkClass}>
                                    {t('welcomeLogin')}
                                </button>
                            </li>
                            <li>
                                <button type="button" onClick={onRegister} disabled={loading} className={footerLinkClass}>
                                    {t('welcomeCreateAccount')}
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div className="font-welcome-body">
                        <p className="text-sm font-bold uppercase tracking-[0.14em] text-white/40">
                            {t('footerLegalTitle')}
                        </p>
                        <ul className="mt-4 space-y-2.5">
                            <li>
                                <button type="button" onClick={() => setLegalPanel('mentions')} className={footerLinkClass}>
                                    {t('footerMentions')}
                                </button>
                            </li>
                            <li>
                                <button type="button" onClick={() => setLegalPanel('privacy')} className={footerLinkClass}>
                                    {t('footerPrivacy')}
                                </button>
                            </li>
                            <li>
                                <button type="button" onClick={() => setLegalPanel('terms')} className={footerLinkClass}>
                                    {t('footerTerms')}
                                </button>
                            </li>
                            <li>
                                <button type="button" onClick={() => setLegalPanel('cookies')} className={footerLinkClass}>
                                    {t('footerCookies')}
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div id="footer-contact" className="font-welcome-body scroll-mt-8">
                        <p className="text-sm font-bold uppercase tracking-[0.14em] text-white/40">
                            {t('footerContactTitle')}
                        </p>
                        <ul className="mt-4 space-y-3 text-sm text-white/70">
                            <li className="flex items-start gap-2.5">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/45" />
                                <span>{SITE_CONTACT.address}</span>
                            </li>
                            <li>
                                <a
                                    href={SITE_CONTACT.phoneHref}
                                    className="inline-flex items-center gap-2.5 text-white/70 transition hover:text-white"
                                >
                                    <Phone className="h-4 w-4 shrink-0 text-white/45" />
                                    {SITE_CONTACT.phone}
                                </a>
                            </li>
                            <li>
                                <a
                                    href={`mailto:${SITE_CONTACT.email}`}
                                    className="inline-flex items-center gap-2.5 text-white/70 transition hover:text-white"
                                >
                                    <Mail className="h-4 w-4 shrink-0 text-white/45" />
                                    {SITE_CONTACT.email}
                                </a>
                            </li>
                        </ul>

                        <p className="mt-6 text-sm font-bold uppercase tracking-[0.14em] text-white/40">
                            {t('footerSocialLabel')}
                        </p>
                        <div className="mt-3 flex items-center gap-3">
                            <a
                                href={SITE_CONTACT.social.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Facebook"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-white/70 transition hover:border-white/35 hover:text-white"
                            >
                                <Facebook className="h-4 w-4" />
                            </a>
                            <a
                                href={SITE_CONTACT.social.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Instagram"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-white/70 transition hover:border-white/35 hover:text-white"
                            >
                                <Instagram className="h-4 w-4" />
                            </a>
                            <a
                                href={SITE_CONTACT.social.youtube}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="YouTube"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-white/70 transition hover:border-white/35 hover:text-white"
                            >
                                <Youtube className="h-4 w-4" />
                            </a>
                            <a
                                href={SITE_CONTACT.social.x}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="X"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 text-white/70 transition hover:border-white/35 hover:text-white"
                            >
                                <XSocialIcon className="h-3.5 w-3.5" />
                            </a>
                        </div>
                    </div>

                    <div className="font-welcome-body">
                        <p className="text-sm font-bold uppercase tracking-[0.14em] text-white/40">
                            {t('footerNewsletterTitle')}
                        </p>
                        <p className="mt-4 text-sm leading-relaxed text-white/60">
                            {t('footerNewsletterHint')}
                        </p>
                        <form onSubmit={handleNewsletterSubmit} className="mt-4 space-y-3">
                            <label className="sr-only" htmlFor="footer-newsletter-email">
                                {t('footerNewsletterPlaceholder')}
                            </label>
                            <input
                                id="footer-newsletter-email"
                                type="email"
                                value={newsletterEmail}
                                onChange={(event) => setNewsletterEmail(event.target.value)}
                                placeholder={t('footerNewsletterPlaceholder')}
                                className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-white/40"
                                autoComplete="email"
                            />
                            <button
                                type="submit"
                                className="inline-flex min-h-10 w-full items-center justify-center bg-white px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#05070F] transition hover:bg-[#E8EEFF]"
                            >
                                {t('footerNewsletterSubmit')}
                            </button>
                        </form>
                        {newsletterError && (
                            <p className="mt-2 text-xs text-red-300">{newsletterError}</p>
                        )}
                        {newsletterMessage && (
                            <p className="mt-2 text-xs text-emerald-300">{newsletterMessage}</p>
                        )}
                    </div>
                </div>

                <div className="border-t border-white/10">
                    <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-5 font-welcome-body text-xs text-white/40 md:flex-row md:items-center md:justify-between md:px-10">
                        <p>{t('footerCopyright', { year })}</p>
                        <p>{SITE_CONTACT.companyName}</p>
                    </div>
                </div>
            </footer>

            {legalMeta && (
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
                                {t(legalMeta.title)}
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
                            {t(legalMeta.body)}
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
