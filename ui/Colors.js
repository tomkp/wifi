import hexToRgb from 'hex-rgb';
import rgbToHex from 'rgb-hex';

const bound = (value) => {
    if (value > 1) return 1;
    if (value < 0) return 0;
    return value;
};

const convert = (from, to, index, value) => {
    return Math.abs(
        parseInt(
            (from[index] + (
                (to[index] - from[index]) * bound(value))
            )
        )
    );
};

// (0.4, "ff00ff", "00ffff")
export default (value, from, to) => {
    return rgbToHex(
        convert(hexToRgb(from), hexToRgb(to), 0, value),
        convert(hexToRgb(from), hexToRgb(to), 1, value),
        convert(hexToRgb(from), hexToRgb(to), 2, value)
    );
};

