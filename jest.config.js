module.exports = {
    testEnvironment: 'node',
    preset: 'ts-jest',
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest'
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    testMatch: ['**/*.test.ts', '**/*.test.tsx'],
    moduleNameMapper: {
        '\\.(css|scss)$': '<rootDir>/__mocks__/styleMock.js'
    },
    coverageDirectory: 'coverage',
    collectCoverageFrom: ['ui/**/*.ts', 'ui/**/*.tsx', 'wifi.ts', '!**/*.test.ts', '!**/*.test.tsx']
};
