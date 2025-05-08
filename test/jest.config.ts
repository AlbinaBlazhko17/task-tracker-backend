import { pathsToModuleNameMapper } from 'ts-jest'

import { compilerOptions } from '../tsconfig.json'

export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '../',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  },
  testEnvironment: 'node',
  coverageDirectory: '../coverage',
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/src/main.ts',
    '!**/src/app.module.ts',
    '!**/src/core/**',
    '!**/src/config/**',
    '!**/src/migrations/**'
  ],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/'
  })
}
