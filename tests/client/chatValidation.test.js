import { describe, it, expect } from 'vitest';
import { containsDigits } from '../../client/src/utils/chatValidation.js';
import { translate } from '../../client/src/i18n/messages.js';

describe('containsDigits', () => {
    it('détecte les chiffres occidentaux (0-9)', () => {
        expect(containsDigits('il y a 7 nains')).toBe(true);
        expect(containsDigits('42')).toBe(true);
    });

    it('détecte les chiffres arabes (٠-٩)', () => {
        expect(containsDigits('٧ أقزام')).toBe(true);
    });

    it('accepte les nombres écrits en lettres', () => {
        expect(containsDigits('il y a sept nains')).toBe(false);
        expect(containsDigits('quarante-deux')).toBe(false);
    });

    it('gère les textes vides ou absents', () => {
        expect(containsDigits('')).toBe(false);
        expect(containsDigits(null)).toBe(false);
        expect(containsDigits(undefined)).toBe(false);
    });
});

describe('messages d’erreur chiffres (i18n)', () => {
    it('expose un message non vide en FR et EN', () => {
        expect(translate('fr', 'chatDigitErrorText').length).toBeGreaterThan(0);
        expect(translate('en', 'chatDigitErrorText').length).toBeGreaterThan(0);
    });
});
