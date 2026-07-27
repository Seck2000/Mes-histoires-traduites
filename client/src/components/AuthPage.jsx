import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { api, saveAuth } from '../api';
import { LANGUAGES, LEVELS } from '../constants/languages';
import { AGE_BANDS } from '../constants/ageBands';
import { useI18n } from '../i18n/I18nProvider';

const inputClass =
    'w-full px-4 py-2.5 rounded-lg bg-white border border-[#EBE6DC] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8C5EB9] focus:border-transparent transition';

const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

export default function AuthPage({ mode, onSuccess, onSwitchMode, onBack, onUiLocaleChange }) {
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

    const handleSpokenChange = (code) => {
        setSpokenLang(code);
        onUiLocaleChange?.(code);
    };

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
        <div className="flex-1 flex items-center justify-center py-6 overflow-y-auto">
            <div
                className={`w-full ${isRegister ? 'max-w-2xl' : 'max-w-md'} bg-white border border-[#EBE6DC] rounded-2xl p-6 md:p-8 shadow-xl my-4`}
            >
                <h1 className="text-2xl md:text-3xl font-bold text-[#8C5EB9] mb-1">
                    {isRegister ? t('authRegisterTitle') : t('authLoginTitle')}
                </h1>
                <p className="text-gray-500 text-sm mb-6">
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
                                        onChange={(e) => handleSpokenChange(e.target.value)}
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
                        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-lg bg-[#8C5EB9] hover:bg-[#7a4fa8] disabled:bg-purple-300 text-white font-semibold flex items-center justify-center gap-2 transition shadow-lg shadow-purple-200/50"
                    >
                        <span className="inline-flex w-5 h-5 items-center justify-center" aria-hidden="true">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                        </span>
                        <span>{isRegister ? t('authSubmitRegister') : t('authSubmitLogin')}</span>
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500 space-y-2">
                    <button
                        type="button"
                        onClick={() => onSwitchMode(isRegister ? 'login' : 'register')}
                        className="text-[#8C5EB9] hover:underline"
                    >
                        {isRegister ? t('authSwitchToLogin') : t('authSwitchToRegister')}
                    </button>
                    <div>
                        <button
                            type="button"
                            onClick={onBack}
                            className="text-gray-400 hover:text-gray-700"
                        >
                            {t('authBackHome')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
