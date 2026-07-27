import { BookOpen, Globe, Sparkles, Loader2, LogIn, UserPlus } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

export default function WelcomePage({ onLogin, onRegister, loading = false }) {
    const { t } = useI18n();

    return (
        <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden py-10 px-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#8C5EB9]/15 rounded-full blur-3xl" />
                <div className="absolute top-1/3 -right-20 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl" />
                <div className="absolute -bottom-32 left-1/4 w-80 h-80 bg-teal-200/30 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-3xl text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F2E9FB] border border-[#8C5EB9]/40 text-[#8C5EB9] text-sm font-medium mb-6">
                    <Sparkles className="w-4 h-4" />
                    {t('welcomeBadge')}
                </div>

                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
                    <span className="text-gray-900">Story</span>
                    <span className="text-[#8C5EB9]">Translator</span>
                    <span className="text-gray-900">Web</span>
                </h1>

                <p className="text-lg md:text-xl text-gray-600 max-w-xl mx-auto mb-10 leading-relaxed">
                    {t('welcomeSubtitle')}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 text-left">
                    <div className="bg-white border border-[#EBE6DC] rounded-2xl p-5 hover:border-[#8C5EB9]/50 transition shadow-sm">
                        <BookOpen className="w-8 h-8 text-[#8C5EB9] mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-1">{t('welcomeFeatureStories')}</h3>
                        <p className="text-sm text-gray-500">{t('welcomeFeatureStoriesDesc')}</p>
                    </div>
                    <div className="bg-white border border-[#EBE6DC] rounded-2xl p-5 hover:border-[#8C5EB9]/50 transition shadow-sm">
                        <Globe className="w-8 h-8 text-amber-500 mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-1">{t('welcomeFeatureLangs')}</h3>
                        <p className="text-sm text-gray-500">{t('welcomeFeatureLangsDesc')}</p>
                    </div>
                    <div className="bg-white border border-[#EBE6DC] rounded-2xl p-5 hover:border-[#8C5EB9]/50 transition shadow-sm">
                        <Sparkles className="w-8 h-8 text-rose-400 mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-1">{t('welcomeFeatureSpace')}</h3>
                        <p className="text-sm text-gray-500">{t('welcomeFeatureSpaceDesc')}</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center gap-3 text-gray-500 py-4">
                        <Loader2 className="w-6 h-6 animate-spin text-[#8C5EB9]" />
                        <span>{t('welcomeCheckingSession')}</span>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            type="button"
                            onClick={onRegister}
                            className="w-full sm:w-auto min-w-[220px] flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[#8C5EB9] hover:bg-[#7a4fa8] text-white font-bold text-lg shadow-lg shadow-purple-200/60 transition hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <UserPlus className="w-5 h-5" />
                            {t('welcomeCreateAccount')}
                        </button>
                        <button
                            type="button"
                            onClick={onLogin}
                            className="w-full sm:w-auto min-w-[220px] flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-[#EBE6DC] bg-white hover:border-[#8C5EB9] text-gray-800 font-bold text-lg transition hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <LogIn className="w-5 h-5" />
                            {t('welcomeLogin')}
                        </button>
                    </div>
                )}

                <p className="mt-8 text-sm text-gray-500">
                    {t('welcomeNoAccountHint')}{' '}
                    <strong className="text-gray-700">{t('welcomeCreateAccount')}</strong>.
                </p>
            </div>
        </div>
    );
}
