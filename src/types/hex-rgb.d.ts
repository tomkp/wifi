declare module 'hex-rgb' {
    interface RgbOutput {
        red: number;
        green: number;
        blue: number;
        alpha: number;
    }
    function hexRgb(
        hex: string,
        options?: { alpha?: number; format?: 'array' | 'css' | 'object' }
    ): RgbOutput;
    export = hexRgb;
}
