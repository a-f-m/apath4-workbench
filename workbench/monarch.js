const tokenProvider = {

    operators: /[_?]+/,

    keywords: ['self', '_', 'and', 'or', 'not', 'if', 'def', 'as', 'nil', 'none', 'prop', 'match', 'func'],

    // Define tokenizer for your language
    tokenizer: {
        root: [


            // Operators
            [/@operators/, 'operator'],

            // function call
            [/(?!(self|_|and|or|not|if|def|func))\w+(?=\()/, 'call'],
            
            [/\w+\s*(?=\=[^\=])/, 'variable'],

            [/\@/, { token: 'bind', next: '@afterNodeVar' }],
            [/\bconst\b/, { token: 'keyword', next: '@afterNodeVar' }],
            [/\bfunc\b/, { token: 'keyword', next: '@afterDecl' }],

            // Numbers
            [/\b\d+\b/, 'number'],

            // dot
            [/\./, 'dot'],

            // Identifiers and keywords
            // [/(\s*\.)?\w+(\s*\.)?/, {
            // [/\w+/, {
            [/\b\w+\b/, {
                cases: {
                    '@keywords': 'keyword',
                    '@default': 'identifier-ap'
                }
            }],
            // [/[a-zA-Z_][a-zA-Z0-9_]*(\s*\.)?/

            // Whitespace
            { include: '@whitespace' },

            // Strings
            [/".*?"/, 'string'],
            [/'.*?'/, 'string'],
            [/`.*?`/, 'string'],
            [/\/.*?\//, 'string'],

            // variables
            [/(\$)([a-zA-Z_][\w]*)/, ['varRef', 'variable']],
        ],

        afterNodeVar: [
            [/([a-zA-Z_][\w]*)/, { token: 'variable', next: '@pop' }]
        ],
        afterDecl: [
            [/([a-zA-Z_][\w]*)/, { token: 'call', next: '@pop' }]
        ],
        whitespace: [
            [/[ \t\r\n]+/, 'white'],
            [/\/\*/, 'comment', '@comment'], // multiline comments
            [/\/\/.*$/, 'comment'], // single-line comments
        ],

        comment: [
            [/[^\/*]+/, 'comment'],
            [/\*\//, 'comment', '@pop'],
            [/[\/*]/, 'comment']
        ],
    },
}

const langConfig = {
    // wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\{\}\[\]\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
    // wordPattern: /(\s*\.)?[a-zA-Z_][a-zA-Z0-9_]*(\s*\.)?/g,
    comments: {
        lineComment: '//',
        blockComment: ['/*', '*/']
    },
    brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')']
    ],
    autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
        { open: "`", close: "`" }
    ],
    surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
        { open: "`", close: "`" }
    ]
}

const yellow = '#dcdcaa'
const dark_yellow = '#878769'
const light_yellow = '#f2f27c'
const light_blue = '#9cdcfe'
const light_light_blue = '#6b97ae'
const blue = '#569cd6'
const green = '#4ec9a4'
const dark_green = '#32713e'
const light_grey = '#d4d4d4'
const rules1 = [
    { token: 'dot', foreground: light_grey, fontStyle: 'bold' },
    { token: 'identifier-ap', foreground: yellow },
    { token: 'keyword', foreground: blue },
    { token: 'bind', foreground: light_light_blue },
    { token: 'operator', foreground: blue, fontStyle: 'bold' },
    // { token: 'operator', foreground: light_yellow, fontStyle: 'bold' },
    { token: 'call', foreground: light_blue },
    { token: 'variable', foreground: light_blue },
    { token: 'varRef', foreground: light_light_blue },
    // { token: 'variable', foreground: green },
    // { token: 'varRef', foreground: dark_green },
    { token: 'number', foreground: light_grey },
    { token: 'comment', foreground: dark_green }
]
const rules2 = [
    { token: 'identifier-ap', foreground: light_grey },
    { token: 'operator', foreground: yellow, fontStyle: 'bold' },
    { token: 'call', foreground: light_blue },
    { token: 'variable', foreground: green },
    { token: 'varRef', foreground: dark_green },
    { token: 'number', foreground: light_grey },
]
const theme = {
    base: 'vs-dark',
    inherit: true,
    "colors": {"editor.background": '#1e1e1e'},
    rules: rules1
}
