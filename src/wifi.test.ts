import { describe, it, expect } from 'vitest';
import { parseSignalNoise, parseChannel, parseSystemProfilerData } from './wifi';

describe('wifi module', () => {
    describe('parseSignalNoise', () => {
        it('parses signal and noise values', () => {
            const result = parseSignalNoise('-61 dBm / -89 dBm');
            expect(result).toEqual({ rssi: -61, noise: -89 });
        });

        it('handles different spacing', () => {
            const result = parseSignalNoise('-50dBm/-90dBm');
            expect(result).toEqual({ rssi: -50, noise: -90 });
        });

        it('returns zeros for invalid input', () => {
            expect(parseSignalNoise('')).toEqual({ rssi: 0, noise: 0 });
            expect(parseSignalNoise('invalid')).toEqual({ rssi: 0, noise: 0 });
        });
    });

    describe('parseChannel', () => {
        it('extracts channel number from full string', () => {
            expect(parseChannel('100 (5GHz, 80MHz)')).toBe('100');
            expect(parseChannel('36 (5GHz, 80MHz)')).toBe('36');
            expect(parseChannel('6 (2GHz, 20MHz)')).toBe('6');
        });

        it('handles simple channel numbers', () => {
            expect(parseChannel('11')).toBe('11');
        });

        it('returns empty string for invalid input', () => {
            expect(parseChannel('')).toBe('');
            expect(parseChannel('invalid')).toBe('');
        });
    });

    describe('parseSystemProfilerData', () => {
        it('returns off status when no interfaces exist', () => {
            const result = parseSystemProfilerData({});
            expect(result).toEqual({ status: 'off' });
        });

        it('returns off status when interfaces array is empty', () => {
            const result = parseSystemProfilerData({
                SPAirPortDataType: [{ spairport_airport_interfaces: [] }]
            });
            expect(result).toEqual({ status: 'off' });
        });

        it('returns off status when wifi is off', () => {
            const result = parseSystemProfilerData({
                SPAirPortDataType: [
                    {
                        spairport_airport_interfaces: [
                            {
                                _name: 'en0',
                                spairport_status_information: 'spairport_status_off'
                            }
                        ]
                    }
                ]
            });
            expect(result).toEqual({ status: 'off' });
        });

        it('returns not-connected when no current network', () => {
            const result = parseSystemProfilerData({
                SPAirPortDataType: [
                    {
                        spairport_airport_interfaces: [
                            {
                                _name: 'en0',
                                spairport_status_information: 'spairport_status_connected'
                            }
                        ]
                    }
                ]
            });
            expect(result).toEqual({ status: 'not-connected' });
        });

        it('returns connected status with wifi data', () => {
            const result = parseSystemProfilerData({
                SPAirPortDataType: [
                    {
                        spairport_airport_interfaces: [
                            {
                                _name: 'en0',
                                spairport_status_information: 'spairport_status_connected',
                                spairport_current_network_information: {
                                    _name: 'MyNetwork',
                                    spairport_signal_noise: '-50 dBm / -90 dBm',
                                    spairport_network_channel: '36 (5GHz, 80MHz)'
                                }
                            }
                        ]
                    }
                ]
            });
            expect(result).toEqual({
                status: 'connected',
                ssid: 'MyNetwork',
                rssi: -50,
                noise: -90,
                channel: '36'
            });
        });

        it('ignores non-en0 interfaces', () => {
            const result = parseSystemProfilerData({
                SPAirPortDataType: [
                    {
                        spairport_airport_interfaces: [
                            {
                                _name: 'awdl0',
                                spairport_status_information: 'spairport_status_connected'
                            }
                        ]
                    }
                ]
            });
            expect(result).toEqual({ status: 'off' });
        });
    });
});
