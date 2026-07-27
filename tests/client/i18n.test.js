import { describe, it, expect } from 'vitest';
import { getLanguageNativeName, LANGUAGES } from '../../client/src/constants/languages.js';
import { translate } from '../../client/src/i18n/messages.js';

describe('noms natifs des langues', () => {
    it('expose les 7 langues', () => {
        expect(LANGUAGES.map((l) => l.code)).toEqual(['fr', 'en', 'ar', 'es', 'de', 'it', 'pt']);
    });

    it('affiche English / العربية / Deutsch…', () => {
        expect(getLanguageNativeName('en')).toBe('English');
        expect(getLanguageNativeName('ar')).toBe('العربية');
        expect(getLanguageNativeName('de')).toBe('Deutsch');
        expect(getLanguageNativeName('fr')).toBe('Français');
    });
});

describe('translate', () => {
    it('traduit selon la locale', () => {
        expect(translate('fr', 'welcomeLogin')).toBe('Se connecter');
        expect(translate('en', 'welcomeLogin')).toBe('Log in');
        expect(translate('ar', 'profileSpokenLang')).toBe('اللغة الأم');
    });

    it('remplace les variables', () => {
        expect(translate('en', 'playerLang', { lang: 'ES' })).toContain('ES');
    });
});
