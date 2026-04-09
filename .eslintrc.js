// =============================================================================
// Akiba — Root ESLint Configuration
// =============================================================================
// Shared rules for the entire monorepo. Individual packages can extend or
// override these via their own config files.
//
// Uses ESLint 9 flat config format with typescript-eslint.
// =============================================================================

const { FlatCompat } = require("@eslint/eslintrc");
const js = require("@eslint/js");

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  // Base recommended rules from ESLint core
  js.configs.recommended,

  // TypeScript-specific rules
  ...compat.extends("plugin:@typescript-eslint/recommended"),

  // ---------------------------------------------------------------------------
  // Global settings
  // ---------------------------------------------------------------------------
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
    },
  },

  // ---------------------------------------------------------------------------
  // TypeScript files
  // ---------------------------------------------------------------------------
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      // -----------------------------------------------------------------------
      // Errors — things that are almost certainly bugs
      // -----------------------------------------------------------------------
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // -----------------------------------------------------------------------
      // Best practices
      // -----------------------------------------------------------------------
      "prefer-const": "error",
      "no-var": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      eqeqeq: ["error", "always", { null: "ignore" }],
      "no-duplicate-imports": "error",

      // -----------------------------------------------------------------------
      // TypeScript-specific relaxations
      // -----------------------------------------------------------------------
      // Allow explicit `any` sparingly — useful for third-party lib boundaries
      "@typescript-eslint/no-explicit-any": "warn",

      // Empty interfaces are fine for marker types or future extension
      "@typescript-eslint/no-empty-interface": "off",

      // Allow non-null assertions (!) — we prefer them over verbose guards
      // in places where the developer knows the value is defined
      "@typescript-eslint/no-non-null-assertion": "off",

      // Require return types only on exported functions to keep internal
      // code terse while maintaining public API contracts
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",

      // Allow require() in config files (jest.config, etc.)
      "@typescript-eslint/no-require-imports": "off",
    },
  },

  // ---------------------------------------------------------------------------
  // Test files — relaxed rules
  // ---------------------------------------------------------------------------
  {
    files: ["**/*.spec.ts", "**/*.test.ts", "**/*.e2e-spec.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
    },
  },

  // ---------------------------------------------------------------------------
  // Ignore patterns
  // ---------------------------------------------------------------------------
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/.next/**",
      "**/.turbo/**",
      "**/coverage/**",
    ],
  },
];
