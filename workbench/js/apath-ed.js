
// #################################################### syntax diagnostics ######################################################################################

function reset_squigglies(params) {
    monaco.editor.setModelMarkers(monaco_editors.apath.getModel(), "owner", [])
}
function build_squigglies(apath_error) {

    const markers = []
    for (const issue of apath_error.get_issues()) {
        const loc = issue.location
        markers.push(
            {
				message: issue.message,
				severity: monaco.MarkerSeverity.Error,
				startLineNumber: loc.start.line,
				startColumn: loc.start.column,
				endLineNumber: loc.end.line,
				endColumn: loc.end.column,
            }
        )
    }
    monaco.editor.setModelMarkers(monaco_editors.apath.getModel(), "owner", markers)
}

// #################################################### completions ######################################################################################

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

/** deprecated/deferred */
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
    const leading_text = string_to_pos(apath, position.lineNumber, position.column, true)

    full_prop_match = gather_properties(apath, position, editor_suggs, range, sugg_cnt, full_prop_match, input)

    if (containsCorrectlyBalancedQuotes(leading_text)) {
        
        gather_vars(apath, position, editor_suggs, range, sugg_cnt)
        gather_funcs(apath, position, editor_suggs, range, sugg_cnt)

        if (!full_prop_match) {

            const paren = leading_text.match('.*\\(\\s*$')
            // console.log(paren)

            window.suggestions_.get_suggestions(
                paren,
                input.is_symbol ? input.word : undefined,
                leading_text,
                $('#toggle_templ_skip_nl').prop('checked'))

                .forEach(sugg => {
                    let r
                    r = replace_range_in_string(apath, sugg.test, range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn)
                    const b = no_error(r, !sugg.additional_analyse_check)
                    if (b) editor_suggs.push(augment_sugg(sugg, sugg_cnt))
                })

            if ($('#toggle_word_based_sugg').prop('checked')) gather_words(apath, editor_suggs, range, sugg_cnt)
        }
    }
    return editor_suggs
        .map(x => {
            x.filterText += ' ' + [...window.suggestions_.gather_placeholder()].join(' ')
            return x
        })
        .filter(x =>
            !(x.label.includes('___apath_fake_expr___') || x.label.includes('\u2771'))
        )
}


function no_error(r, only_syntax) {
    if (!$('#toggle_correct_templ').prop('checked')) return true
    const ac = window.apath_func_utils_.get_ast_checker(r)
    return ac !== 'parseError' && (only_syntax ? true : !ac.result.errors)
}

// adopted from gemini
function gather_words(apath, editor_suggs, range, sugg_cnt) {

    const words = apath.match(/\b\w+\b/g) || []
    const uniqueWords = [...new Set(words)]

    uniqueWords
    .filter(uniqueWord => 
        !uniqueWord.match(/^\d+|_$/)
    )
    .forEach(uniqueWord => {
        if (
            // uniqueWord.startsWith(word.word) && 
            !editor_suggs.some(s => s.label === uniqueWord
                && s.ap_sugg?.type ? s.ap_sugg.type !== 'prop' : false
            )
            // && !editor_suggs.some(s => s.ap_sugg?.type ? s.ap_sugg.type !== 'prop' : false)
        ) {
            editor_suggs.push({
                label: uniqueWord,
                kind: monaco.languages.CompletionItemKind.Text,
                insertText: uniqueWord,
                range,
                filterText: uniqueWord,
                sortText: `${sugg_cnt.i++}`.padStart(3, '0')
            })
        }
    })
}

function gather_properties(apath, position, editor_suggs, range, sugg_cnt, full_prop_match, input) {

    let corr = replace_range_in_string(apath, '___apath_fake_expr___', range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn)
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

                const keys = window.Utils_.get_keys(cause.ctx_node)
                // console.log(keys)
                // console.log('good: ', corr)
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
                            filterText: key,
                            sortText: `${sugg_cnt.i++}`.padStart(3, '0'),
                            ap_sugg: {type: 'prop'}
                        }
                    )
                    full_prop_match = full_prop_match || (input.word === key)
                }
            }
        }
    }
    return full_prop_match
}

function gather_vars(apath, position, editor_suggs, range, sugg_cnt) {

    // determining vars
    let ast_checker = window.apath_func_utils_.get_ast_checker(
        replace_range_in_string(apath, '___apath_fake_expr___', range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn)
    )
    if (ast_checker === 'parseError') return

    // handling $
    const is_pref = string_to_pos(apath, position.lineNumber, position.column, true).match('.*\\$\\s*(\\w+\\s*)?$')

    ast_checker.result.var_binds.forEach(
        var_bind => {
            const vname = var_bind.name
            let vname_ = is_pref ? vname : '$' + vname
            let corr = replace_range_in_string(apath, vname_, range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn)

            if (no_error(corr)) {
                editor_suggs.push(
                    {
                        label: '$' + vname,
                        kind: monaco.languages.CompletionItemKind.Variable,
                        detail: 'variable reference',
                        insertText: vname_,
                        range,
                        filterText: vname,
                        sortText: `${sugg_cnt.i++}`.padStart(3, '0'),
                        documentation: {
                            value: build_doc('referencing bound variable', 'variable reference', undefined)
                        }
                    }
                )
            }
            const in_ass = string_from_pos(apath, position.lineNumber, position.column, true).match('^\\s*=[^=].*')
            if (in_ass && var_bind.in_type !== 'VariableBindingParam') {
                editor_suggs.push(
                    {
                        label: vname,
                        kind: monaco.languages.CompletionItemKind.Variable,
                        detail: 'variable name',
                        insertText: vname,
                        range,
                        filterText: vname,
                        sortText: `${sugg_cnt.i++}`.padStart(3, '0'),
                        documentation: {
                            value: build_doc('within variable assignment', 'variable assignment', undefined)
                        }
                    }
                )                
            }
        }
    )
}

function gather_funcs(apath, position, editor_suggs, range, sugg_cnt) {

    try {
        // determining funcs
        let ast_checker = window.apath_func_utils_.get_ast_checker(
                replace_range_in_string(apath, '___apath_fake_expr___', range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn)
            )
        if (ast_checker === 'parseError') return
    
        ast_checker.result.func_defs.forEach(
            fd => {

                let corr = replace_range_in_string(apath, `${fd.name}()`, range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn)

                ast_checker = window.apath_func_utils_.get_ast_checker(corr)

                if (!$('#toggle_correct_templ').prop('checked') || ast_checker !== 'parseError') {

                    const label = prep_func(fd.name, fd.params, false)
                    editor_suggs.push(
                        {
                            label,
                            kind: monaco.languages.CompletionItemKind.Function,
                            detail: 'function call',
                            insertText: prep_func(fd.name, fd.params, true),
                            range,
                            filterText: fd.name,
                            sortText: `${sugg_cnt.i++}`.padStart(3, '0'),
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: {
                                value: 'calling apath step function ' + "\n```\n" + label + "\n```\n"
                            }

                        }
                    )            
                }
            }
        )
    } catch (error) {
        // nop
        return
    }
}

function prep_func(name, params, as_placeholder) {
    let i = 0
    const s = name + '(' + params.map(x => {
        return as_placeholder ? `\${${++i}:\u2770${x}\u2771}` : x
    }).join(', ') + ')'
    return s
}

function augment_sugg(sugg, sugg_cnt) {

    sugg.snippet.insertTextRules = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
    sugg.snippet.sortText = `${sugg_cnt.i++}`.padStart(3, '0')
    sugg.snippet.kind = 
        sugg.kind === 'function' ? 
            monaco.languages.CompletionItemKind.Function
            : sugg.kind === 'variable' ? monaco.languages.CompletionItemKind.Variable : monaco.languages.CompletionItemKind.Unit
    const exa_id = sugg.exa_id
    if (exa_id) {
        const exa = basic_examples[exa_id]
        
        if (!sugg.snippet.label) sugg.snippet.label = exa_id
        if (!sugg.snippet.detail) sugg.snippet.detail = exa.data.keyword.replaceAll('**', '').replaceAll(/``( |$)/g, '').replaceAll(/\\/g, '')
        const doc = sugg.snippet.documentation
        augment_doc(sugg, exa_id, exa, doc)
    }
    const ft = sugg.snippet.filterText
    sugg.snippet.filterText = 
        sugg.snippet.label + ' ' + (ft ? ft : '') 
        + ` ${window.Utils_.extract(sugg.test, /(\w+)/gm).join(' ')} `

    return sugg.snippet
}

function augment_doc(sugg, exa_id, exa, doc) {

    const data = exa.data
    const remark = sugg.remark ? sugg.remark : data.remark
    sugg.snippet.documentation = {
        value: 
            build_doc(remark, exa_id, doc)
    }
}

$('#toggle_quick_sugg').on('change', function () {
    const b = $('#toggle_quick_sugg').prop('checked')
    monaco_editors.apath.updateOptions({ quickSuggestions: b })
})

// popups
$(function() {
    
    define_popup($('#bnt_dialog_apath_ed'), $('#dialog_apath_ed'), 0, 0)

    // define_popup($('#info_img_quick_sugg'), $('#info_quick_sugg'), 0, 500)
    // define_popup($('#info_img_correct_templ'), $('#info_correct_templ'), 0, 500)
    // define_popup($('#info_img_templ_skip_nl'), $('#info_templ_skip_nl'), 0, 500)
    // define_popup($('#info_img_word_based_sugg'), $('#info_word_based_sugg'), 0, 500)
    // define_popup($('#info_img_squigglies'), $('#info_squigglies'), 0, 500)
})

function build_doc(remark, exa_id, doc) {

    const exa = basic_examples[exa_id]
    const apath = exa.data.apath
    const wloc = window.location

    return `${remark}

related example (from [cheat sheet](${wloc.protocol + '//' + wloc.host}${path_wo_last(wloc.pathname)}/generated-doc/site/cheat-sheet.html#n-${exa_id.replaceAll(' ', '-').replaceAll('.', '-')})):

\`\`\`apath
${apath}
\`\`\`

See [grammar](${wloc.protocol + '//' + wloc.host}${path_wo_last(wloc.pathname)}/generated-doc/site/language/grammar.html${exa.data.grammar}) also.

${doc ? doc.value : ''}

`
// deferred/buggy: related example (from [cheat sheet](${wloc.protocol + '//' + wloc.host}/workbench/generated-doc/site/cheat-sheet.html#n-${exa_id.replaceAll(' ','-').replaceAll('.','-')})):
// See [grammar](${wloc.protocol + '//' + wloc.host}/workbench/generated-doc/site/language/grammar.html${exa.data.grammar}) also.

// \`\`\`json
// ${JSON.stringify(wloc, null, 3)}
// \`\`\`

// !!!only testing:
// ${sugg.snippet.sortText}

// \`\`\`
// ${sugg.test}
// \`\`\`
//------
}

