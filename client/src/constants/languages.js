/** Noms natifs (endonymes) — toujours affichés ainsi dans les listes. */
export const LANGUAGES = [
    { code: 'fr', nativeName: 'Français', label: 'Français' },
    { code: 'en', nativeName: 'English', label: 'English' },
    { code: 'ar', nativeName: 'العربية', label: 'العربية' },
    { code: 'es', nativeName: 'Español', label: 'Español' },
    { code: 'de', nativeName: 'Deutsch', label: 'Deutsch' },
    { code: 'it', nativeName: 'Italiano', label: 'Italiano' },
    { code: 'pt', nativeName: 'Português', label: 'Português' },
];

/** Codes de niveau — libellés via i18n (`level_debutant`, …). */
export const LEVELS = [
    { code: 'debutant' },
    { code: 'intermediaire' },
    { code: 'avance' },
];

export const LANGUAGE_CODES = LANGUAGES.map((lang) => lang.code);

export function getLanguageNativeName(code) {
    return LANGUAGES.find((lang) => lang.code === code)?.nativeName || code;
}

export function isSupportedLocale(code) {
    return LANGUAGE_CODES.includes(code);
}
