import { createContext, useCallback, useContext, useMemo } from 'react';
import { isSupportedLocale } from '../constants/languages';
import { translate } from './messages';

const I18nContext = createContext({
    locale: 'fr',
    t: (key, vars) => translate('fr', key, vars),
    dir: 'ltr',
    setLocale: () => {},
});

export function I18nProvider({ locale, setLocale, children }) {
    const safeLocale = isSupportedLocale(locale) ? locale : 'fr';

    const t = useCallback(
        (key, vars) => translate(safeLocale, key, vars),
        [safeLocale]
    );

    const value = useMemo(
        () => ({
            locale: safeLocale,
            t,
            dir: safeLocale === 'ar' ? 'rtl' : 'ltr',
            setLocale,
        }),
        [safeLocale, t, setLocale]
    );

    return (
        <I18nContext.Provider value={value}>
            <div lang={safeLocale} dir={value.dir} className="min-h-full">
                {children}
            </div>
        </I18nContext.Provider>
    );
}

export function useI18n() {
    return useContext(I18nContext);
}
