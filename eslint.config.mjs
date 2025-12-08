import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
export default defineConfig([
    {
        files: ["src/**/*.{js,mjs,cjs,ts,mts,cts}", "test/**/*.{js,mjs,cjs,ts,mts,cts}"],
        ignores: ["dist/**", "node_modules/**"],
        plugins: { js, "@typescript-eslint": tseslint.plugin },
        extends: ["js/recommended"],
        languageOptions: {
            globals: globals.node,
            parser: tseslint.parser
        }
    },
    tseslint.configs.recommended,
]);
//# sourceMappingURL=eslint.config.mjs.map