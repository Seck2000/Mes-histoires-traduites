const DIGIT_PATTERN = /[0-9٠-٩۰-۹]/;

export function containsDigits(text) {
    return DIGIT_PATTERN.test(text || '');
}
