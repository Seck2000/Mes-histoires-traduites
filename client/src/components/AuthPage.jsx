import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { api, saveAuth } from '../api';
import { LANGUAGES, LEVELS } from '../constants/languages';
import { AGE_BANDS } from '../constants/ageBands';
import { useI18n } from '../i18n/I18nProvider';

const inputClass =
    'app-input font-welcome-body placeholder:text-white/35 [&>option]:bg-[#0A1228] [&>option]:text-white';

const labelClass = 'block text-sm font-medium text-white/70 mb-1.5 font-welcome-body';

export default function AuthPage({ mode, onSuccess, onSwitchMode, onBack }) {
    const { t } = useI18n();
    const isRegister = mode === 'register';

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [spokenLang, setSpokenLang] = useState('fr');
    const [learningLang, setLearningLang] = useState('en');
    const [level, setLevel] = useState('debutant');
    const [ageBand, setAgeBand] = useState('moyens');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isRegister) {
            if (!ageBand) {
                setError(t('authErrorAge'));
                return;
            }
            if (password !== passwordConfirm) {
                setError(t('authErrorPasswordMatch'));
                return;
            }
            if (spokenLang === learningLang) {
                setError(t('authErrorSameLang'));
                return;
            }
        }

        setLoading(true);

        try {
            const url = isRegister ? '/api/auth/register' : '/api/auth/login';
            const body = isRegister
                ? {
                      firstName,
                      lastName,
                      email,
                      spokenLang,
                      learningLang,
                      level,
                      ageBand,
                      password,
                      passwordConfirm,
                  }
                : { email, password };

            const { data } = await api.post(url, body);
            saveAuth(data.token, data.user);
            onSuccess(data.user);
        } catch (err) {
            const msg =
                err.response?.data?.error ||
                (isRegister ? t('authErrorRegister') : t('authErrorLogin'));
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="welcome-page relative isolate flex flex-1 items-center justify-center overflow-y-auto px-4 py-8">
            <div className="welcome-canvas pointer-events-none absolute inset-0" aria-hidden="true">
                <div className="welcome-silk" />
                <div className="welcome-grain" />
            </div>
            <div
                className={`app-panel relative z-10 w-full ${isRegister ? 'max-w-2xl' : 'max-w-md'} rounded-2xl p-6 md:p-8 my-4`}
            >
                <h1 className="font-welcome-display text-3xl md:text-4xl tracking-tight text-white mb-2">
                    {isRegister ? t('authRegisterTitle') : t('authLoginTitle')}
                </h1>
                <p className="text-white/60 text-sm mb-6 font-welcome-body">
                    {isRegister ? t('authRegisterHint') : t('authLoginHint')}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegister && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>{t('authFirstName')}</label>
                                    <input
                                        type="text"
                                        required
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className={inputClass}
                                        placeholder="Aissatou"
                                        autoComplete="given-name"
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>{t('authLastName')}</label>
                                    <input
                                        type="text"
                                        required
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className={inputClass}
                                        placeholder="Seck"
                                        autoComplete="family-name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>{t('authEmail')}</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={inputClass}
                                    placeholder="vous@exemple.com"
                                    autoComplete="email"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>{t('authSpokenLang')}</label>
                                    <select
                                        required
                                        value={spokenLang}
                                        onChange={(e) => setSpokenLang(e.target.value)}
                                        className={inputClass}
                                    >
                                        {LANGUAGES.map((l) => (
                                            <option key={l.code} value={l.code}>
                                                {l.nativeName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>{t('authLearningLang')}</label>
                                    <select
                                        required
                                        value={learningLang}
                                        onChange={(e) => setLearningLang(e.target.value)}
                                        className={inputClass}
                                    >
                                        {LANGUAGES.map((l) => (
                                            <option key={l.code} value={l.code}>
                                                {l.nativeName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>{t('authLevel')}</label>
                                    <select
                                        required
                                        value={level}
                                        onChange={(e) => setLevel(e.target.value)}
                                        className={inputClass}
                                    >
                                        {LEVELS.map((l) => (
                                            <option key={l.code} value={l.code}>
                                                {t(`level_${l.code}`)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>{t('authAgeBand')}</label>
                                    <select
                                        required
                                        value={ageBand}
                                        onChange={(e) => setAgeBand(e.target.value)}
                                        className={inputClass}
                                    >
                                        {AGE_BANDS.map((band) => (
                                            <option key={band.id} value={band.id}>
                                                {t(`age_${band.id}`)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>{t('authPassword')}</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={inputClass}
                                        placeholder={t('authPasswordPlaceholder')}
                                        autoComplete="new-password"
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>{t('authPasswordConfirm')}</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={passwordConfirm}
                                        onChange={(e) => setPasswordConfirm(e.target.value)}
                                        className={inputClass}
                                        placeholder={t('authPasswordConfirmPlaceholder')}
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {!isRegister && (
                        <>
                            <div>
                                <label className={labelClass}>{t('authEmailSimple')}</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={inputClass}
                                    placeholder="vous@exemple.com"
                                    autoComplete="email"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>{t('authPasswordSimple')}</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={inputClass}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                            </div>
                        </>
                    )}

                    {error && (
                        <p className="text-red-300 text-sm bg-red-500/10 border border-red-400/30 rounded-lg px-3 py-2 font-welcome-body">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="app-btn-primary w-full py-3 rounded-lg disabled:opacity-50 text-white font-welcome-body font-semibold flex items-center justify-center gap-2"
                    >
                        <span className="inline-flex w-5 h-5 items-center justify-center" aria-hidden="true">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                        </span>
                        <span>{isRegister ? t('authSubmitRegister') : t('authSubmitLogin')}</span>
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-white/55 space-y-2 font-welcome-body">
                    <button
                        type="button"
                        onClick={() => onSwitchMode(isRegister ? 'login' : 'register')}
                        className="text-[#6EA0FF] hover:underline"
                    >
                        {isRegister ? t('authSwitchToLogin') : t('authSwitchToRegister')}
                    </button>
                    <div>
                        <button
                            type="button"
                            onClick={onBack}
                            className="text-white/40 hover:text-white/80"
                        >
                            {t('authBackHome')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
