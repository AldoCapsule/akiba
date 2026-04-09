// =============================================================================
// Akiba API — Jest Configuration
// =============================================================================
// Uses ts-jest to run TypeScript tests without a separate build step.
// Path aliases mirror those in tsconfig.json so imports like `@/modules/...`
// resolve correctly in tests.
// =============================================================================

import type { Config } from "jest";

const config: Config = {
  // ---------------------------------------------------------------------------
  // Environment
  // ---------------------------------------------------------------------------
  testEnvironment: "node",

  // ---------------------------------------------------------------------------
  // TypeScript support via ts-jest
  // ---------------------------------------------------------------------------
  preset: "ts-jest",
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
        // Disable type-checking in tests for speed — rely on `tsc` in CI
        diagnostics: false,
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // Path aliases — must match tsconfig.json "paths"
  // ---------------------------------------------------------------------------
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  // ---------------------------------------------------------------------------
  // File discovery
  // ---------------------------------------------------------------------------
  rootDir: ".",
  testRegex: ".*\\.spec\\.ts$",
  moduleFileExtensions: ["ts", "js", "json"],

  // ---------------------------------------------------------------------------
  // Coverage
  // ---------------------------------------------------------------------------
  collectCoverageFrom: [
    "src/**/*.ts",
    // Exclude files that are mostly boilerplate or configuration
    "!src/main.ts",
    "!src/**/*.module.ts",
    "!src/**/*.dto.ts",
    "!src/**/*.entity.ts",
    "!src/**/*.interface.ts",
    "!src/**/index.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "text-summary", "lcov", "clover"],
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80,
    },
  },

  // ---------------------------------------------------------------------------
  // Performance
  // ---------------------------------------------------------------------------
  // Clear mocks between tests to avoid state leaking
  clearMocks: true,

  // Fail tests that take longer than 10 seconds
  testTimeout: 10000,
};

export default config;
