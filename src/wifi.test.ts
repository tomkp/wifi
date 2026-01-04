import { describe, it, expect } from 'vitest';
import { parseWifiHelperOutput } from './wifi';

describe('wifi module', () => {
    describe('parseWifiHelperOutput', () => {
        it('parses connected status with wifi data', () => {
            const output = JSON.stringify({
                status: 'connected',
                ssid: 'MyNetwork',
                rssi: -50,
                noise: -90,
                channel: 36
            });
            const result = parseWifiHelperOutput(output);
            expect(result).toEqual({
                status: 'connected',
                ssid: 'MyNetwork',
                rssi: -50,
                noise: -90,
                channel: '36'
            });
        });

        it('returns off status when status is off', () => {
            const output = JSON.stringify({ status: 'off' });
            const result = parseWifiHelperOutput(output);
            expect(result).toEqual({ status: 'off' });
        });

        it('returns off status when error is present', () => {
            const output = JSON.stringify({ error: 'No WiFi interface found' });
            const result = parseWifiHelperOutput(output);
            expect(result).toEqual({ status: 'off' });
        });

        it('returns not-connected status', () => {
            const output = JSON.stringify({ status: 'not-connected' });
            const result = parseWifiHelperOutput(output);
            expect(result).toEqual({ status: 'not-connected' });
        });

        it('returns off status for invalid JSON', () => {
            const result = parseWifiHelperOutput('invalid json');
            expect(result).toEqual({ status: 'off' });
        });

        it('returns off status for empty string', () => {
            const result = parseWifiHelperOutput('');
            expect(result).toEqual({ status: 'off' });
        });

        it('handles missing optional fields', () => {
            const output = JSON.stringify({ status: 'connected' });
            const result = parseWifiHelperOutput(output);
            expect(result).toEqual({
                status: 'connected',
                ssid: '',
                rssi: 0,
                noise: 0,
                channel: ''
            });
        });

        it('converts channel number to string', () => {
            const output = JSON.stringify({
                status: 'connected',
                ssid: 'Test',
                rssi: -60,
                noise: -85,
                channel: 112
            });
            const result = parseWifiHelperOutput(output);
            if (result.status === 'connected') {
                expect(result.channel).toBe('112');
                expect(typeof result.channel).toBe('string');
            }
        });
    });
});
