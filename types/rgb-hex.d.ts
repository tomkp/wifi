declare module 'rgb-hex' {
    function rgbHex(red: number, green: number, blue: number, alpha?: number): string;
    function rgbHex(rgb: string): string;
    export = rgbHex;
}
