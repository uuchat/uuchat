module.exports = {
    "env": {
        "browser": true,
        "node": true,
        "es6": true
    },
    "extends": [
        "react-app",
        "eslint:recommended",
        "plugin:flowtype/recommended"
    ],
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "sourceType": "module"
    },
    "plugins": [
        "react",
        "flowtype",
        "import",
        "jsx-a11y"
    ],
    "rules": {
        "arrow-body-style": 0,
        "array-bracket-spacing": [2, "never"],
        "block-scoped-var": 0,
        "comma-dangle": 2,
        "consistent-return": 0,
        "eqeqeq": [2, "allow-null"],
        "func-names": 0,
        "func-style": 0,
        "key-spacing": [ 2, { "beforeColon": false, "afterColon": true } ],
        "keyword-spacing": 2,
        "max-depth": 0,
        "no-dupe-args": 2,
        "no-alert": 2,
        "no-array-constructor": 2,
        "no-console": 0,
        "no-dupe-keys": 2,
        "no-duplicate-case": 2,
        "no-extra-bind": "warn",
        "no-extra-semi": 2,
        "no-empty": 2,
        "no-func-assign": 2,
        "no-param-reassign": 0,
        "no-return-assign": 0,
        "no-redeclare": 0,
        "semi": 2,
        "yoda": [2, "never"],

        "react/display-name": 2,
        'react/no-danger': 0,

        "import/default": 2,
        "import/export": 2,
        "import/extensions": [ 0, "always" ],
        "import/first": 2,
        "import/named": 2,
        "import/namespace": 2,
        "import/newline-after-import": 2,
        "import/no-duplicates": 2,
        "import/no-unresolved": 2,
        "import/unambiguous": 2
    },
    "globals": {
        "lodash": true,
        "moment": true
    },
    "settings": {
        "import/resolver": {
            "node": {
                "moduleDirectory": ["node_modules", "src"],
            },
        },
        "import/ignore": [
            "node_modules",
            "\\.json$"
        ],
        "import/extensions": [
            ".js",
            ".jsx"
        ]
    }
}