/* eslint-disable import/no-unresolved */
import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";
import unicorn from "eslint-plugin-unicorn";
import tseslint from "typescript-eslint";

const eslintConfig = defineConfig([
  // Base configurations
  js.configs.recommended,

  // TypeScript ESLint with type checking
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // Next.js configurations
  ...nextVitals,
  ...nextTs,

  // Global ignores
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    "dist/**",
    "coverage/**",
    ".turbo/**",
    "prisma/migrations/**",
  ]),

  // TypeScript parser configuration
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Disable type-checked rules for JS/MJS config files
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    ...tseslint.configs.disableTypeChecked,
  },

  // Import plugin configuration
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      "import/no-unresolved": "error",
      "import/named": "error",
      "import/default": "error",
      "import/namespace": "error",
      "import/no-absolute-path": "error",
      "import/no-dynamic-require": "warn",
      "import/no-self-import": "error",
      "import/no-cycle": "error",
      "import/no-useless-path-segments": "error",
      "import/no-duplicates": "error",
      "import/first": "error",
      "import/newline-after-import": "warn",
      "import/no-default-export": "off", // Next.js requires default exports for pages
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
            "type",
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
        node: true,
      },
    },
  },

  // JSX Accessibility rules (plugin already loaded by Next.js config)
  {
    rules: {
      ...jsxA11y.configs.recommended.rules,
      "jsx-a11y/no-autofocus": "off", // Allow autofocus in modals and forms
    },
  },

  // Unicorn plugin for modern best practices
  {
    plugins: {
      unicorn,
    },
    rules: {
      "unicorn/better-regex": "error",
      "unicorn/catch-error-name": "error",
      "unicorn/consistent-destructuring": "error",
      "unicorn/consistent-function-scoping": "warn", // Reduced to warning
      "unicorn/custom-error-definition": "error",
      "unicorn/error-message": "error",
      "unicorn/escape-case": "error",
      "unicorn/expiring-todo-comments": "warn",
      "unicorn/explicit-length-check": "error",
      "unicorn/filename-case": [
        "error",
        {
          cases: {
            camelCase: true,
            pascalCase: true,
            kebabCase: true,
          },
        },
      ],
      "unicorn/new-for-builtins": "error",
      "unicorn/no-abusive-eslint-disable": "error",
      "unicorn/no-array-callback-reference": "off", // Can be too strict
      "unicorn/no-array-for-each": "off", // forEach is acceptable
      "unicorn/no-array-reduce": "off", // Reduce is useful
      "unicorn/no-await-expression-member": "error",
      "unicorn/no-console-spaces": "error",
      "unicorn/no-for-loop": "error",
      "unicorn/no-instanceof-array": "error",
      "unicorn/no-invalid-remove-event-listener": "error",
      "unicorn/no-negated-condition": "warn",
      "unicorn/no-nested-ternary": "error",
      "unicorn/no-null": "off", // null is valid in many cases
      "unicorn/no-object-as-default-parameter": "error",
      "unicorn/no-static-only-class": "error",
      "unicorn/no-thenable": "error",
      "unicorn/no-this-assignment": "error",
      "unicorn/no-unnecessary-await": "error",
      "unicorn/no-useless-fallback-in-spread": "error",
      "unicorn/no-useless-length-check": "error",
      "unicorn/no-useless-promise-resolve-reject": "error",
      "unicorn/no-useless-spread": "error",
      "unicorn/no-useless-switch-case": "error",
      "unicorn/no-useless-undefined": "error",
      "unicorn/no-zero-fractions": "error",
      "unicorn/number-literal-case": "error",
      "unicorn/numeric-separators-style": "error",
      "unicorn/prefer-add-event-listener": "error",
      "unicorn/prefer-array-find": "error",
      "unicorn/prefer-array-flat-map": "error",
      "unicorn/prefer-array-index-of": "error",
      "unicorn/prefer-array-some": "error",
      "unicorn/prefer-at": "error",
      "unicorn/prefer-code-point": "error",
      "unicorn/prefer-date-now": "error",
      "unicorn/prefer-default-parameters": "error",
      "unicorn/prefer-dom-node-append": "error",
      "unicorn/prefer-dom-node-remove": "error",
      "unicorn/prefer-includes": "error",
      "unicorn/prefer-keyboard-event-key": "error",
      "unicorn/prefer-math-trunc": "error",
      "unicorn/prefer-modern-dom-apis": "error",
      "unicorn/prefer-modern-math-apis": "error",
      "unicorn/prefer-negative-index": "error",
      "unicorn/prefer-node-protocol": "error",
      "unicorn/prefer-number-properties": "error",
      "unicorn/prefer-object-from-entries": "error",
      "unicorn/prefer-optional-catch-binding": "error",
      "unicorn/prefer-prototype-methods": "error",
      "unicorn/prefer-query-selector": "error",
      "unicorn/prefer-reflect-apply": "error",
      "unicorn/prefer-regexp-test": "error",
      "unicorn/prefer-set-has": "error",
      "unicorn/prefer-spread": "error",
      "unicorn/prefer-string-replace-all": "error",
      "unicorn/prefer-string-slice": "error",
      "unicorn/prefer-string-starts-ends-with": "error",
      "unicorn/prefer-string-trim-start-end": "error",
      "unicorn/prefer-switch": "error",
      "unicorn/prefer-ternary": "warn",
      "unicorn/prefer-top-level-await": "error",
      "unicorn/prefer-type-error": "error",
      "unicorn/prevent-abbreviations": "off", // Too strict for common abbreviations
      "unicorn/relative-url-style": "error",
      "unicorn/require-array-join-separator": "error",
      "unicorn/require-number-to-fixed-digits-argument": "error",
      "unicorn/template-indent": "warn",
      "unicorn/throw-new-error": "error",
    },
  },

  // TypeScript-specific rules (only for TS files)
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],
      "@typescript-eslint/no-misused-promises": [
        "warn", // Reduced to warning - sometimes needed for event handlers
        {
          checksVoidReturn: {
            attributes: false,
          },
        },
      ],
      "@typescript-eslint/require-await": "warn",
      "@typescript-eslint/no-floating-promises": "warn", // Reduced to warning
      "@typescript-eslint/no-unsafe-enum-comparison": "off", // Disabled - often false positives with string enums
      "@typescript-eslint/no-unsafe-assignment": "off", // Disabled - too strict for practical use
      "@typescript-eslint/no-unsafe-return": "off", // Disabled - too strict for practical use
      "@typescript-eslint/no-unsafe-member-access": "off", // Disabled - too strict for practical use
      "@typescript-eslint/no-unsafe-call": "off", // Disabled - too strict for practical use
      "@typescript-eslint/no-unsafe-argument": "off", // Disabled - too strict for practical use
      "@typescript-eslint/prefer-nullish-coalescing": "warn", // Reduced to warning
    },
  },

  // General code quality rules (all files)
  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "always", { null: "ignore" }],
      curly: ["error", "all"],
      "object-shorthand": ["error", "always"],
      "prefer-template": "error",
      "prefer-arrow-callback": "error",
      "no-implicit-coercion": "error",
      "no-unneeded-ternary": "error",
      "no-nested-ternary": "error",
      "multiline-ternary": ["error", "always-multiline"],
      "operator-linebreak": ["error", "before", { overrides: { "=": "after" } }],
      "react/display-name": "off", // Allow anonymous components
    },
  },

  // Relaxed rules for UI component files
  {
    files: ["src/components/ui/**/*.tsx"],
    rules: {
      "react/display-name": "off", // Chakra UI components often use forwardRef
      "import/namespace": "off", // Chakra UI has some type export issues
      "@typescript-eslint/no-unsafe-assignment": "off", // Chakra UI internals use any
      "@typescript-eslint/no-unsafe-member-access": "off", // Chakra UI internals use any
      "@typescript-eslint/no-base-to-string": "off", // Chakra UI Token types
      "@typescript-eslint/restrict-template-expressions": "off", // Chakra UI Token types
      "@typescript-eslint/unbound-method": "off", // Chakra UI callback refs
      "@typescript-eslint/no-misused-promises": "off", // Chakra UI async handlers
      "@typescript-eslint/prefer-nullish-coalescing": "off", // Allow || in UI components for brevity
      "unicorn/prefer-add-event-listener": "off", // EventSource uses on* properties
    },
  },

  // Relaxed rules for dashboard chart components
  {
    files: ["src/components/dashboard/**/*.tsx"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off", // Chart libraries use any types
      "@typescript-eslint/no-unsafe-enum-comparison": "off", // Chart data comparisons
    },
  },

  // Prettier config must be last to override other formatting rules
  prettier,
]);

export default eslintConfig;
