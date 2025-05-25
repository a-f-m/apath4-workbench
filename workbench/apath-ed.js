const completion = {
    triggerCharacters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~ '.split(''),
    // triggerCharacters: '#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~ '.split(''),
    // triggerCharacters: ['.'],
    provideCompletionItems: (model, position, token, context) => {
        
        // const e = determ_func_expr(position)
        console.log('---')
        // console.log(e?.type)

        // if (context.triggerKind !== monaco.languages.CompletionTriggerKind.Invoke) {
        //     return
        // }
        
        const word = model.getWordUntilPosition(position)
        const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: position.column,
        }
        
        // only for short tests - overwritten by getSuggs
        let suggestions = [
            {
                label: 'funktion hallo()',
                kind: monaco.languages.CompletionItemKind.Function,
                insertText: 'funktion hallo() {\n\t// Dein Code hier\n}',
                documentation: {
                    value: 'Eine einfache Wenn-Dann-Anweisung.',
                    supportMarkupContent: true
                },
                range: range,
                filterText: word.word,
                sortText: '0'
            },
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
            // {
            //     label: 'wenn (bedingung)',
            //     kind: monaco.languages.CompletionItemKind.Keyword,
            //     insertText: 'wenn (${1:bedingung}) dann {\n\t${0}\n} ende',
            //     insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            //     detail: 'lalala',
            //     documentation: {
            //         value: 'Eine einfache Wenn-Dann-Anweisung.',
            //         supportMarkupContent: true
            //     },
            //     range: range,
            // },
        ]
        // console.log(word)
        // console.log(token)

        const apath_txt = model.getValue()
        let input = { word: token.triggerKind === 0 ? word.word : token.triggerCharacter, is_symbol: token.triggerKind !== 0 }
        // console.log(xxx)
        
        suggestions = 
            get_suggs(input, apath_txt, monaco_editors.apath.getPosition(), range)
        
        return { suggestions }
    },
}

function get_suggs(input, apath, position, range) {

    var suggs = []

    // deep control later:
    // if (input.is_symbol) {
    //     if (input.word === '.') {
            let corr = insert_string_at_pos(apath, '___apath_fake_id___', position.lineNumber, position.column)
            // console.log(corr)
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
                    if (cause.name === 'ExecutionError' && cause.fail_code === 'prop_error' && cause.ctx_node) {
                        const keys = window.Utils_.get_keys(cause.ctx_node)
                        // console.log(keys)
                        for (const key of keys) {
                            
                            suggs.push(
                                {
                                label: key,
                                kind: monaco.languages.CompletionItemKind.Property,
                                detail: 'property',
                                insertText: key,
                                range,
                                // filterText: input.word
                                }
                        )           
                        }
                    }
                }
            }
    //     } else {
            
    //     }
    // } else {
        
    // }
    return suggs
}

$(function () {
    $('#dialog_apath_ed').dialog({
        autoOpen: false,
        closeText: 'hide',
        // resizable: false,
        // draggable: false,
        modal: true,
        width: 255,
        // position: { my: 'left top+115', at: 'left top' },
        classes: {
            'ui-dialog': 'dia-widget'
        },
    })
})

$('#bnt_dialog_apath_ed').on('click', function () {
    $('#dialog_apath_ed').dialog('open')
})
$('#toggle_quick_sugg').on('change', function () {
    const b = $('#toggle_quick_sugg').prop('checked')
    monaco_editors.apath.updateOptions({ quickSuggestions: b })
})


