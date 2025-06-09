const completion = {
    // triggerCharacters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~ '.split(''),
    triggerCharacters: '#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~ '.split(''),
    // triggerCharacters: ['.'],
    provideCompletionItems: (model, position, token, context) => {
        
        // const e = determ_func_expr(position)
        // console.log('---')
        // console.log('token: ', token)
        
        // console.log(e?.type)

        // if (context.triggerKind !== monaco.languages.CompletionTriggerKind.Invoke) {
        //     return
        // }
        
        const word = model.getWordUntilPosition(position)
        // console.log('word: ', word)
        
        const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
        }
        
        // only for short tests - overwritten by getSuggs
        let suggestions = [
            {
                label: 'funktion hallo()',
                kind: monaco.languages.CompletionItemKind.Function,
                insertText: 'funktion hallo() {\n\t// Dein Code hier\n}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                detail: 'lalala',
                documentation: {
                    value: 'Eine einfache Wenn-Dann-Anweisung.',
                    supportMarkupContent: true
                },
                range: range,
                filterText: word.word,
                sortText: '0'
            },
            get_delim_sugg(),
            // {
            //     label: 'variable name',
            //     kind: monaco.languages.CompletionItemKind.Variable,
            //     insertText: 'variable name = "";',
            //     documentation: {
            //         value: 'Eine einfache Wenn-Dann-Anweisung.',
            //         supportMarkupContent: true
            //     },
            //     range: range,
            // },
            {
                label: 'wenn (bedingung)',
                kind: monaco.languages.CompletionItemKind.Keyword,
                insertText: 'wenn (${1|bedingung,lala|}) dann {\n\t${0}\n} ende',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                detail: 'lalala',
                documentation: {
                    value: 'Eine einfache Wenn-Dann-Anweisung.',
                    supportMarkupContent: true
                },
                range: range,
            },
        ]
        // console.log(word)
        // console.log(token)

        const apath_txt = model.getValue()
        let input = { word: token.triggerKind === 0 ? word.word : token.triggerCharacter, is_symbol: token.triggerKind !== 0 }
        // let input = { word: word.word, is_symbol: token.triggerKind !== 0 }
        // console.log(xxx)
        
        suggestions = 
            get_suggs(input, apath_txt, position, range)
        
        return { suggestions }
    },
}

/** deprecated */
function get_delim_sugg(line_text, sort_text, filter_text) {

    // const line_text = 'line_text'
    // const sort_text = 'sort_text'
    return {
        label: `----------------- ${line_text} -----------------`, // Visuelle Linie mit Text
        detail: '',
        // kind: monaco.languages.CompletionItemKind.User, // Oder Kind.Unit, Kind.Keyword, etc.
        insertText: '', // Nichts einfügen
        sortText: `${sort_text}`, // Am Ende sortieren, oder 'aaaa' für den Anfang
        // command: {
        //     id: '', // Leerer Befehl oder ein benutzerdefinierter Befehl
        //     title: ''
        // },
        documentation: 'Dies ist ein Trenner für Kategorien von Vorschlägen.',
        filterText: 'cat'
    }
}

function get_suggs(input, apath, position, range) {

    let sugg_cnt = {i: 0}
    let editor_suggs = []

    let full_prop_match = false

    // deep control later:
    // if (input.is_symbol) {
    //     if (input.word === '.') {
            let corr = insert_string_at_pos(apath, '___apath_fake_expr___', position.lineNumber, position.column)
            // console.log('input', input)
            // console.log('range', range)
            // console.log('apath', apath)
            // console.log('corr', corr)
            try {
                window.apath_func_utils_.evaluate(
                    monaco_editors.input.getValue(), 
                    corr, 
                    monaco_editors.sfuncs.getValue(), 
                    true, 
                    $('#toggle_arrays_as_seq').prop('checked'), debug_callback
                )
                
            } catch (error) {
                if (error.name === 'ApathError') {
                    const cause = error.cause
                    if (cause.name === 'ExecutionError'
                        && cause.fail.kind === 'prop_error'
                        && cause.fail.token.includes('___apath_fake_expr___')
                        && cause.ctx_node) {

                        // if (sugg_cnt === 0) suggs.push(get_delim_sugg('properties', `${sugg_cnt++}`, input.word))

                        const keys = window.Utils_.get_keys(cause.ctx_node)
                        // console.log(keys)
                        for (const key of keys) {

                            editor_suggs.push(
                                {
                                    label: key,
                                    kind: monaco.languages.CompletionItemKind.Property,
                                    detail: 'property',
                                    documentation: {
                                        value: 'derived from input',
                                    },
                                    insertText: key,
                                    range,
                                    // filterText: input.word
                                    // filterText: key + ' ' + input.word,
                                    sortText: `${sugg_cnt.i++}`.padStart(3, '0')
                                }
                            )
                            full_prop_match = full_prop_match || (input.word === key)
                        }
                    }
                }
            }
    //     } else {
            
    //     }
    // } else {
        
    // }

    if (!full_prop_match) {

        const leading_text = string_to_pos(apath, position.lineNumber, position.column, true)

        if (containsCorrectlyBalancedQuotes(leading_text)) {

            const paren = leading_text.match('.*\\(\\s*$')
            // console.log(paren)


            window.suggestions_.get_suggestions(
                paren,
                input.is_symbol ? input.word : undefined,
                leading_text,
                $('#toggle_templ_skip_nl').prop('checked'))

                .forEach(sugg => {
                    const b = $('#toggle_correct_templ').prop('checked') ? check_syntax(insert_string_at_pos(apath, sugg.test, position.lineNumber, position.column)) : true
                    if (b) editor_suggs.push(augment_sugg(sugg, sugg_cnt))
                })
            // suggs.push(
            //     {
            //         label: 'wenn (bedingung)',
            //         kind: monaco.languages.CompletionItemKind.Keyword,
            //         insertText: 'wenn (${1:bedingung}) dann {\n\t${0}\n} ende',
            //         insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            //         detail: 'lalala',
            //         documentation: {
            //             value: 'Eine einfache Wenn-Dann-Anweisung.',
            //             supportMarkupContent: true
            //         },
            //         range: range,
            //     }
            // )
        }
    }
    return editor_suggs
}


function check_syntax(apath) {

    
    try {
        new window.Parser__.Parser().parse(apath)
        // console.log('good syntax: ', apath)
    } catch (error) {
        // console.log('bad syntax: ', apath)
        return false
    }
    return true
}

function augment_sugg(sugg, sugg_cnt) {

    // let sugg_ = structuredClone(sugg_result)

    sugg.snippet.insertTextRules = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
    sugg.snippet.sortText = `${sugg_cnt.i++}`.padStart(3, '0')
    sugg.snippet.kind = sugg.kind === 'function' ? monaco.languages.CompletionItemKind.Function : monaco.languages.CompletionItemKind.Unit
    const exa_id = sugg.exa_id
    if (exa_id) {
        const exa = basic_examples[exa_id]
        
        // sugg.snippet.label = exa.data.keyword.replaceAll('**', '')
        if (!sugg.snippet.label) sugg.snippet.label = exa_id
        if (!sugg.snippet.detail) sugg.snippet.detail = exa.data.keyword.replaceAll('**', '').replaceAll(/``( |$)/g, '').replaceAll(/\\/g, '')
        const doc = sugg.snippet.documentation
        build_doc(sugg, exa_id, exa, doc)
    }
    const ft = sugg.snippet.filterText
    sugg.snippet.filterText = 
        sugg.snippet.label + ' ' + (ft ? ft : '') 
        + ` ${window.Utils_.extract(sugg.test, /(\w+)/gm).join(' ')} `
        // deferred
        // + ' ' + [...window.suggestions_.gather_placeholder()].join(' ')

    // console.log('filterText: ', sugg.snippet.filterText)
    return sugg.snippet
}

function build_doc(sugg, exa_id, exa, doc) {

    const data = exa.data
    const wloc = window.location
    sugg.snippet.documentation = {
        value: 
//------
`${sugg.remark ? sugg.remark : data.remark}

related example (see cheat-sheet):

\`\`\`apath
${data.apath}
\`\`\`

${doc ? doc.value : ''}

`
// deferred/buggy: related example (from [cheat sheet](${wloc.protocol + '//' + wloc.host}/workbench/generated-doc/site/cheat-sheet.html#n-${exa_id.replaceAll(' ','-').replaceAll('.','-')})):
// See [grammar](${wloc.protocol + '//' + wloc.host}/workbench/generated-doc/site/language/grammar.html${exa.data.grammar}) also.

// !!!only testing:
// ${sugg.snippet.sortText}

// \`\`\`
// ${sugg.test}
// \`\`\`
//------
    }
}

$('#toggle_quick_sugg').on('change', function () {
    const b = $('#toggle_quick_sugg').prop('checked')
    monaco_editors.apath.updateOptions({ quickSuggestions: b })
})

// popups
$(function() {
    
    define_popup($('#bnt_dialog_apath_ed'), $('#dialog_apath_ed'), 0, 0)
    define_popup($('#info_img_quick_sugg'), $('#info_quick_sugg'), 0, 500)
    define_popup($('#info_img_correct_templ'), $('#info_correct_templ'), 0, 500)
    define_popup($('#info_img_templ_skip_nl'), $('#info_templ_skip_nl'), 0, 500)
})

