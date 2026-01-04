import hexToRgb from 'hex-rgb';
import rgbToHex from 'rgb-hex';

export const bound = (value) => {
    if (value > 1) return 1;
    if (value < 0) return 0;
    return value;
};

const toArray = (rgb) => [rgb.red, rgb.green, rgb.blue];

export const convert = (from, to, index, value) => {
    return Math.abs(parseInt(from[index] + (to[index] - from[index]) * bound(value)));
};

// (0.4, "ff00ff", "00ffff")
export default (value, from, to) => {
    const fromRgb = toArray(hexToRgb(from));
    const toRgb = toArray(hexToRgb(to));
    return rgbToHex(
        convert(fromRgb, toRgb, 0, value),
        convert(fromRgb, toRgb, 1, value),
        convert(fromRgb, toRgb, 2, value)
    );
};
