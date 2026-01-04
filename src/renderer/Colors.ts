import hexToRgb from 'hex-rgb';
import rgbToHex from 'rgb-hex';

type RGB = [number, number, number];

export const bound = (value: number): number => {
    if (value > 1) return 1;
    if (value < 0) return 0;
    return value;
};

const toArray = (rgb: { red: number; green: number; blue: number }): RGB => [
    rgb.red,
    rgb.green,
    rgb.blue
];

export const convert = (from: RGB, to: RGB, index: number, value: number): number => {
    return Math.abs(Math.floor(from[index] + (to[index] - from[index]) * bound(value)));
};

const fraction = (value: number, from: string, to: string): string => {
    const fromRgb = toArray(hexToRgb(from));
    const toRgb = toArray(hexToRgb(to));
    return rgbToHex(
        convert(fromRgb, toRgb, 0, value),
        convert(fromRgb, toRgb, 1, value),
        convert(fromRgb, toRgb, 2, value)
    );
};

export default fraction;
