declare module 'split' {
    import { Transform } from 'stream';
    function split(matcher?: RegExp | string): Transform;
    export = split;
}
