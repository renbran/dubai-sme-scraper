module.exports = {
    "env": {
        "node": true,
        "es2021": true,
        "jest": true
    },
    "extends": [
        "@apify/eslint-config"
    ],
    "parserOptions": {
        "ecmaVersion": 12,
        "sourceType": "module"
    },
    "rules": {
        "no-console": "off",
        "prefer-const": "error",
        "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
        "no-trailing-spaces": "error",
        "indent": ["error", 4],
        "quotes": ["error", "single"],
        "semi": ["error", "always"],
        "comma-dangle": ["error", "never"],
        "object-curly-spacing": ["error", "always"],
        "array-bracket-spacing": ["error", "never"],
        "max-len": ["warn", { "code": 120 }],
        "no-multiple-empty-lines": ["error", { "max": 2 }],
        "eol-last": ["error", "always"]
    }
};