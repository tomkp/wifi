import { bound, convert } from './Colors';
import fraction from './Colors';

type RGB = [number, number, number];

describe('Colors utility', () => {
    describe('bound', () => {
        it('returns 0 for negative values', () => {
            expect(bound(-1)).toBe(0);
            expect(bound(-0.5)).toBe(0);
        });

        it('returns 1 for values greater than 1', () => {
            expect(bound(2)).toBe(1);
            expect(bound(1.5)).toBe(1);
        });

        it('returns the value for values between 0 and 1', () => {
            expect(bound(0)).toBe(0);
            expect(bound(0.5)).toBe(0.5);
            expect(bound(1)).toBe(1);
        });
    });

    describe('convert', () => {
        it('converts color channel based on interpolation value', () => {
            const from: RGB = [255, 0, 0];
            const to: RGB = [0, 255, 0];

            expect(convert(from, to, 0, 0)).toBe(255);
            expect(convert(from, to, 0, 1)).toBe(0);
            expect(convert(from, to, 0, 0.5)).toBe(127);
        });

        it('handles second channel', () => {
            const from: RGB = [255, 0, 0];
            const to: RGB = [0, 255, 0];

            expect(convert(from, to, 1, 0)).toBe(0);
            expect(convert(from, to, 1, 1)).toBe(255);
        });
    });

    describe('fraction (default export)', () => {
        it('returns start color for value 0', () => {
            const result = fraction(0, 'ff0000', '00ff00');
            expect(result).toBe('ff0000');
        });

        it('returns end color for value 1', () => {
            const result = fraction(1, 'ff0000', '00ff00');
            expect(result).toBe('00ff00');
        });

        it('returns interpolated color for value 0.5', () => {
            const result = fraction(0.5, 'ff0000', '00ff00');
            expect(result).toMatch(/^[0-9a-f]{6}$/);
        });
    });
});
