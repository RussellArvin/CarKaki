import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
    dir: './',
});

const customJestConfig: Config = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    moduleDirectories: ['node_modules', '<rootDir>'],
    testEnvironment: 'node',
    moduleNameMapper: {
        '^~/(.*)$': '<rootDir>/src/$1',
        '^@/(.*)$': '<rootDir>/$1'
    },
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: 'tsconfig.test.json'
        }]
    },
    testMatch: [
        "**/tests/**/*.test.ts",
        "**/tests/**/*.test.tsx"
    ],
    roots: [
        "<rootDir>/src"
    ]
};

export default createJestConfig(customJestConfig);