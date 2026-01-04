import { parseLine, parseWifiData } from './wifi';

describe('wifi module', () => {
    describe('parseLine', () => {
        it('parses a valid key-value line', () => {
            const result = parseLine('        SSID: MyNetwork');
            expect(result).toEqual({ key: 'SSID', value: 'MyNetwork' });
        });

        it('parses a line with numeric value', () => {
            const result = parseLine('        agrCtlRSSI: -50');
            expect(result).toEqual({ key: 'agrCtlRSSI', value: '-50' });
        });

        it('returns null for invalid lines', () => {
            expect(parseLine('')).toBeNull();
            expect(parseLine('no colon here')).toBeNull();
            expect(parseLine('   ')).toBeNull();
        });

        it('handles lines with extra colons in value', () => {
            const result = parseLine('        key: value: with: colons');
            expect(result).toBeNull();
        });
    });

    describe('parseWifiData', () => {
        it('returns off status when AirPort is Off', () => {
            const result = parseWifiData({ AirPort: 'Off' });
            expect(result).toEqual({ status: 'off' });
        });

        it('returns not-connected status when SSID is missing', () => {
            const result = parseWifiData({ AirPort: 'On' });
            expect(result).toEqual({ status: 'not-connected' });
        });

        it('returns connected status with wifi data when connected', () => {
            const result = parseWifiData({
                SSID: 'MyNetwork',
                agrCtlRSSI: '-50',
                agrCtlNoise: '-90',
                channel: '36'
            });
            expect(result).toEqual({
                status: 'connected',
                ssid: 'MyNetwork',
                rssi: -50,
                noise: -90,
                channel: '36'
            });
        });

        it('converts rssi and noise to numbers', () => {
            const result = parseWifiData({
                SSID: 'Test',
                agrCtlRSSI: '-65',
                agrCtlNoise: '-85',
                channel: '1'
            });
            if (result.status === 'connected') {
                expect(typeof result.rssi).toBe('number');
                expect(typeof result.noise).toBe('number');
            }
        });
    });
});
