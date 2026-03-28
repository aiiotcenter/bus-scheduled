// ================================================================================
// Jest configurations 

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['<rootDir>/backend/**/*.test.ts'],
    modulePathIgnorePatterns: ['<rootDir>/frontend/', '<rootDir>/node_modules/'],
    // path alias for import 
    moduleNameMapper: {
        '^@src/(.*)$': '<rootDir>/backend/src/$1',
    },
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/backend/tsconfig.json',
        },
    },
    clearMocks: true,
    reporters: [
        "default",
      ["jest-html-reporters", {
        "publicPath": "./testReports",
        "filename": "report.html"
      }]
    ],
};

