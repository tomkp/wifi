module.exports = {
    testEnvironment: 'node',
    transform: {
        '^.+\\.(js|jsx)$': 'babel-jest'
    },
    moduleFileExtensions: ['js', 'jsx'],
    testMatch: ['**/*.test.js'],
    moduleNameMapper: {
        '\\.(css|scss)$': '<rootDir>/__mocks__/styleMock.js'
    },
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'ui/**/*.js',
        'wifi.js',
        '!**/*.test.js'
    ]
};
